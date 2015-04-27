---
layout: post

title: "Sandboxing JavaScript Execution in Java"

author:
  name: Martin Laporte
  bio: Team Lead, JS UI
  twitter: martinlaporte
  image: mlaporte.jpg
---

The [Query Pipeline](https://developers.coveo.com/display/SearchREST/Managing+the+Query+Execution+Pipeline) on a Coveo index can be extended using JavaScript code running on the server. This has many benefits, but allowing arbitrary code to run in a server process opens the possibility for an admin to bring the server down in many creative ways. To protect against this we added functionality to the JS interpreter we're using ([DynJS](https://github.com/dynjs/dynjs)) to prevent Bad Things from happening.

<!-- more -->

There are three ways external code running in a process can cause harm:

* Using APIs to damage the server process or underlying server
* Using an excessive amount of CPU
* Allocating an excessive amount of memory

## Blocking Access to APIs

At the core, JavaScript doesn't provide any API that might be used for nefarious purposes. For example, there is no way to access the filesystem, or perform network requests. Still, JS interpreters in the Java world typically allow JS code to access any Java class present in the class path, and DynJS is no exception.

For example, JS code can use a Java object like this:

{% highlight javascript %}
var foo = new java.util.ArrayList();
{% endhighlight %}

What we did is add a configuration option for DynJS to prevent it from exposing any Java package or object except the ones standard in JavaScript, plus any API that is explicitly exposed by the hosting application (which we assume are "safe").

This shows how to set the option when creating a `DynJS` runtime object:

{% highlight java %}
Config config = new Config(getClass.getClassLoader());
config.setSandbox(true);
DynJS dynJs = new DynJS(config);
{% endhighlight %}

Pretty simple, right? It was simple to implement too. Here's how it works:

{% highlight java %}
if (!runtime.getConfig().isSandbox()) {
    defineGlobalProperty("Packages", new JavaPackage(this, null), true );
    defineGlobalProperty("java",     new JavaPackage(this, "java"), true);
    defineGlobalProperty("javax",    new JavaPackage(this, "javax"), true);
    defineGlobalProperty("org",      new JavaPackage(this, "org"), true);
    defineGlobalProperty("com",      new JavaPackage(this, "com"), true);
    defineGlobalProperty("io",       new JavaPackage(this, "io"), true);

    defineGlobalProperty("System",   System.class, true);
}
{% endhighlight %}

We simply prevent any public symbol from being registered that would allow code to "escape" the sandbox. Without those, it can only reference stock JavaScript APIs.

## Restricting CPU and Memory Usage

Calling JavaScript code from a server process is done in a blocking manner, which means that the call only returns when the code has finished executing. If that code decides to loop forever... well it helps with the heating bill, I guess.

To address that we need a way to stop script execution if it takes too long. But even that is not enough: the JS code might sometimes block on long-running network calls, for example, so strictly checking the time taken might block legitimate operations. What we want is a way to monitor the actual CPU time used.

Turns out this is pretty easy to do. The `ThreadMXBean` object exposed by the JVM provides methods to check the total amount of CPU time used by a thread. By reading the value just before script execution starts and then periodically checking the value during execution, it's possible to detect when the script code has exceeded a pre-determined CPU quota. When this happens, an exception is thrown to inform the caller of the situation.

So, how do we arrange to periodically check the CPU quota? We need to have this check performed at some place where the JavaScript interpreter must pass no matter what kind of infinite loop it's in. In this case I've chosen to do that in the `interpret` method of `BlockStatement`, which is essentially when any scope like a loop or condition or function body is entered. There we call `checkResourceUsage` from `ExecutionContext`, which will relay the call if resource quotas are being enforced.

Here is how we check that the CPU quota hasn't been exceeded:

{% highlight java %}
private void checkCpuTime() {
    long current = readCpuTime(threadId);
    long delta = current - lastCpuTime;
    lastCpuTime = current;

    if (cpuTime.addAndGet(-delta) < 0) {
        throw new ExceededResourcesException("CPU usage has exceeded the allowed quota");
    }
}
{% endhighlight %}

A similar technique is used to monitor heap allocations. The same `ThreadMXBean` object also exposes metrics about how many bytes were allocated by the current thread (including memory that is no longer referenced, but's that OK). By checking this metric in the exact same way as for CPU, we can detect whenever the thread has exceeded the allowed memory quota and put an end to it's processing.

NOTE: The call reporting memory allocation for a thread is not available on all JVMs, but works well enough on Hotspot and I expect others are implementing it as well. Trying to use memory quota on a JVM without the proper support would result in an `UnsupportedOperationException`.

To run JS code with quota checks, you need to run the code using the `ExecutionContext` returned by `createResourceQuotaExecutionObject` on an existing `ExecutionContext`. It is possible to invoke several blocks of code using the same quotas. The total consumed resources by all script executions will be used to check the quotas.

{% highlight java %}
context.createResourceQuotaExecutionObject(new ResourceQuota(cpuQuota, memoryQuota));
{% endhighlight %}

## What about Nashorn?

[Nashorn](http://openjdk.java.net/projects/nashorn/) is the new JS interpreter bundled with Java 8. It has good performance and is certainly more robust, but I still haven't figured out a way to implement proper CPU and memory quotas in that engine, mainly because I haven't yet find a place where I can regularly check if quotas have been exceeded (I haven't tried very hard though). I might write a new post when/if I succeed in that endeavour.

## Trying it out

The changes we've made to DynJS are available [publicly on GitHub](https://github.com/Coveo/dynjs/tree/resource-quotas). We also submitted a [pull request](https://github.com/dynjs/dynjs/pull/154) but it hasn't been merged yet.
