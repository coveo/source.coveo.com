---
layout: post

title: "Adding server-side scripting"
#subtitle: ""

excerpt: "How I've added server-side scripting to Coveo's Search API component."

author:
  name: Martin Laporte
  bio: Team Lead, JS UI
  twitter: martinlaporte
  image: mlaporte.jpg
---

Recently, I've spent some time adding support for server-side scripts in Coveo's Search API component. In a Coveo setup, the Search API provides the backend through which our JS UI framework executes queries on the index, using REST requests. Queries go through what we call the Query Pipeline. The Query Pipeline provides various ways to alter the query before it's finally sent to the index server, and now offers scriptable extension points where you can implement complex custom logic when needed.

## Choosing a script language

I had many choices of languages I could support. The Search API runs on the JVM, so I could simply load additional jars. But that requires compilation, and I wanted something users can simply edit, save and reload to test. Some kind of script language would work better. The Java ecosystem offers many options (Jython, JRuby, Groovy, several JavaScript runtimes, etc.). In the end, I settled on JavaScript, mainly because working with the JS UI already requires JS skills.

There are several options for running JavaScript code on the JVM. At the time I started working on that, Java 8 was not yet released and thus the standard way to go was to use the Rhino engine that comes standard with the JDK (vs the new Nashorn engine in Java 8). So I started with Rhino.

Pretty quickly I had the basics working: a query pipeline folder could contain a main.js file that would be loaded at initialization, and to which I could expose ways to interact with the query pipeline when queries are executed. Whenever the JavaScript code changes, it's automatically reloaded so that the next query uses the latest code.

I could now do stuff like this:

{% highlight javascript %}
Coveo.onResolveIdentity(function (authenticated) {
  var windowsDomainUser = new UserId();
  windowsDomainUser.user = 'DOMAIN\\someone';
  windowsDomainUser.provider = 'Active Directory';
  return authenticated.concat(windowsDomainUser);
});
{% endhighlight %}

This code adds an additional identity to use when executing the query. <code>Coveo.onResolveIdentity</code> is a method I implemented on the Scala Search API code. It gets passed some kind of handle to the JavaScript function, and later on I'm able to call this and collect the result (with lots of marshalling).

## Runtime libraries

I was pretty happy at this point, and then I started thinking: "How do I allow the JavaScript code to perform more sophisticated stuff, like reading files, calling stuff over the network, etc?" Code running under Rhino does have access to the Java libraries in the classpath, but it felt weird using Java libs in JavaScript. People won't be expecting that.

Another option was to provide 100% custom APIs for performing the common tasks. This would require quite a large amount of work, would be completely specific to our environment, and I'd also need to document all this. Hmm. Honestly, I prefer writing code.

Then Greg on my team mentionned it'd be nice if we could make use of libs from NodeJS. As a matter of fact, I had previously investigated whether I could somehow embed the real NodeJS runtime inside my process, but it turns out it's not quite possible yet (Node being essentially a single threaded system). It's also not very convenient to call Node as an child process --- I wanted to be able to expose a Java object and have my script code call its methods. So Node was out. But then Greg asked, isn't there some Java implementation of Node, like there is for Python, Ruby, etc?

Well, it turns out, there is.

The <a href="http://nodyn.io">Nodyn</a> project aims to implement a NodeJS runtime on the JVM. It's being built by some nice folks working for Red Hat. It hasn't reached its first release yet, but they already have quite a lot of the core APIs working. Also, they support using packages from NPM, so any of those that doesn't use stuff that isn't implemented yet should work fine.

But there was one problem: they don't use Rhino. Instead, they use the <a href="http://dynjs.org/">DynJS</a> JavaScript runtime (built by the same folks). So before I could try using Nodyn in my stuff, I had to port all my JS runtime code to work with DynJS. In the end, it wasn't very hard, and in fact, I find the DynJS API to be much nicer than Rhino's, so even without Nodyn the switch was a plus.

Then, from there loading the Nodyn environment into my JS environment was very easy:

{% highlight scala %}
runtime.global.defineGlobalProperty("__dirname", System.getProperty("user.dir"))
runtime.global.defineGlobalProperty("__filename", "v1")
val nodeJs = classOf[org.projectodd.nodyn.Main].getClassLoader.getResourceAsStream("node.js")
runtime.dynJs.newRunner().withSource(new InputStreamReader(nodeJs)).evaluate()
{% endhighlight %}

That's it. Well, of course I've added a Maven dependency to the Nodyn lib. But then I only need to arrange for the embedded <code>node.js</code> file to execute whenever I'm initializing a JavaScript context and then I'm good to go. Suddenly, I could do stuff like this in my JS code and everything would just work:

{% highlight javascript %}
Coveo.registerQueryExtension('stock', function (query, callback) {
  http.request('http://d.yimg.com/autoc.finance.yahoo.com/autoc?callback=YAHOO.Finance.SymbolSuggest.ssCallback&amp;query=goog', function (res) {
    var json = '';
    res.on('data', function (chunk) {
      json += chunk;
    });

    res.on('end', function () {
      var data = eval(('' + json).replace('YAHOO.Finance.SymbolSuggest.ssCallback', '')); // Very secure, please do that at home kids.

      var tickers = _.map(data.ResultSet.Result, function (result) {
        return result.symbol;
      });

      console.log(tickers);
    });
  }).end();
});
{% endhighlight %}

Yay! No need to provide calls to perform everything. Customers can simply use stock Node APIs or use packages from NPM. My empty sandbox suddently had thousands of libraries available.

## Handling callbacks

One thing about Node, it never blocks threads. Well, mostly. That's why it scales so well. So, pretty much all code written for Node uses callbacks for about everything. This means I had to handle that as well on my code.

In my first implementation, when a JS function returned, it was expected that the return value was definitive and fully computed. It made it impossible to use Node APIs that use callbacks to signal that an async operation (like an HTTP request) completed.

Right now, the implementation for the Search API's REST service doesn't use an async model. This means a thread is allocated to each request and is kept in use until the processing is finished. I want to change that at some point, but for now any remote call will simply block the thread.

I needed a way for my main request thread to block if the JS code I've invoked is executing some asynchronous process. Also, I wanted to keep support for synchronous usage (e.g. returning a value directly), because that's often just simpler and simple is good.

To address this, I arranged for all my calls to JS code to go through a single call point that would check the function being invoked from Scala code. If the function has one more formal parameter than what's expected (based on the params I'm passing it), I assume the additional parameter is a callback, and I pass it a special object. Then, if the function doesn't return anything meaningful (e.g. <code>undefined</code>), I block the main request thread until the callback has been called, or if a specific timeout expires.

Here's the code (well, part of it):

{% highlight scala %}
def call(runtime: JsRuntime, function: JSFunction, theThis: JSFunction, args: Seq[Object]): Object = {
  runtime.executeInEventLoopThread(defaultTimeout)(cb =&gt; {
    // If the function takes one more parameter than what we've been provided, assume
    // it's a callback and enable waiting on it. Looks like a hack, but hey why not?
    val jsCallback = if (function.getFormalParameters.length &gt; args.length) {
      Some(new JsCallback(runtime.global, cb))
    } else {
      None
    }

    val result = runtime.context.call(function, theThis, args :+ jsCallback.getOrElse(Types.UNDEFINED): _*)

    result match {
      case Types.UNDEFINED if jsCallback.isDefined =&gt;
      // When a function returns undefined, we assume it'll call the callback
      // function that was provided to it automatically. There is no need to
      // wait in this thread because executeInEventLoop will do that for us.
      case other =&gt;
        // Otherwise, when a function returns a value we call the callback ourselves
        cb(Right(other))
    }
  })
}
{% endhighlight %}

Under the hood, Nodyn uses <a href="http://vertx.io/">Vert.x</a> for providing event loops usable for async operation (among many other things). So, every time I make a JS call, I arrange for it to happen in a Vert.x event loop. Per design, all subsequent callbacks are invoked in the same event loop (e.g. no parallel execution). So I only have to wait in my main request thread for the result to be available.

## Using NPM packages

At this point I started showing this to some coworkers and PS guys (professional services consultants). One of those conveniently had a need to override some stuff based on data retrieved from a SOAP service ಠ_ಠ, and he was willing to beta test my stuff. There are many libs in NPM to call SOAP services, and in the end it boils down to making an HTTP request somewhere. Should be a piece of cake, right? I mean, I did that at least *once*.

Well, not so fast here cowboy.

As I said previously, Nodyn hasn't reached a first release yet, and this means there are some rough corners. In particular, it had issues with the <a href="https://www.npmjs.org/package/request">request</a> NPM package, which the SOAP library used under the hood. I had to fix a couple of glitches in the Nodyn and DynJS code to get the package to work as expected. I've submitted those changes to the maintainers, and the fixes are now merged in the official code.

A more annoying thing was that request seems to access undocumented fields of Node's HTTP request, which for obvious reason aren't present in Nodyn's implementation. For now I worked around this by "enhancing" the Nodyn objects with some stubs (this only when running in my environment, since it's too ugly for a pull request). Still, I'd like to find a better solution to this. The Nodyn devs are currently rewritting the HTTP stack directly on top of Netty, so I'll wait a little and then check if there's something better to do.

**UPDATE:** I just learned that the Nodyn devs switched to a different approach for implementing Node's core APIs. Instead of replicating the user facing APIs with their own implementation, they now only implement the native APIs from which Node's JS runtime depends. This means they are now using Node's own JS code as-is, effectively eliminating this family of issues once and for all. Great!

With those changes, I was able to build a client from the service's WSDL and use it to call some methods. The only problem remaining is performance: the parser that processes the WSDL runs pretty slowly on DynJS. Right now I'm not using the JIT feature of the interpreter, because I had a weird error when I tried it, so that might explain the performance issue.

In any cases, I've seen mentions that Nodyn might also support Nashorn as a JS engine in the future, which should take care of performance issues if I can't get DynJS to run faster. Also, the problem really happens when CPU intensive work is being done in JavaScript, which often ain't the case anyway.

Of course, I expect other issues to appear with other NPM packages. I'll try to address those as they come. Still, what's already working is a pretty interesting addition.
