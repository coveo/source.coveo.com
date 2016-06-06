---
layout: post

title: "Using React JSX with TypeScript"

tags: [React, JSX, TypeScript, DefinitelyTyped, typings]

author:
  name: William Fortin
  bio: JavaScript Ninja, Cloud
  twitter: willyfortin
  image: wfortin.jpeg
---

In the last months, we [experienced with React](http://source.coveo.com/2015/08/21/dreamforce-session-explorer/) and we enjoyed it a lot. As you may know, all Coveo's web applications are built using TypeScript, so with the release of [TypeScript 1.6 announcing support for React JSX](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#typescript-16) syntax, we were stoked!

<!-- more -->

In this article, I'll introduce you on how to start a new project using TypeScript, JSX and React and show you some tools we use to simplify our development.

## Initial setup with npm

First we'll setup our project with `npm init`. For this project we need node, typescript, typings, and react. Let's install them:

{% highlight javascript %}
npm install typescript -g
npm install typings -g

npm install react --save
{% endhighlight %}

Second, let's make sure we have TypeScript compiler 1.6 or later:

{% highlight javascript %}
tsc --version
{% endhighlight %}

You should see an output similar to:

{% highlight javascript %}
message TS6029: Version 1.6.2
{% endhighlight %}

## TypeScript definitions with "typings"

We're almost ready to start coding, but we'll need the React definitions. We already installed [typings](https://github.com/typings/typings) which is a package manager to search and install TypeScript definition files directly from the [community driven repositories](https://github.com/typings/typings#sources). Most definitions are from DefinitelyTyped. [DefinitelyTyped is a great project and we try to contribute](https://github.com/coveo/DefinitelyTyped) as much as we can. It will allow us to download the latest definitions for React and other libraries. Like we did with npm, we need to initialize a "typings" project by running :

{% highlight javascript %}
typings init
{% endhighlight %}

This will create a `typings.json` file (similar to a `package.json` but refering to our TypeScript definitions), a `typings/` folder to store the definitions and a `index.d.ts` referencing all our downloaded definitions.

We can now install the needed definitions:

{% highlight javascript %}
typings install dt~react --global --save
typings install dt~react-dom --global --save
typings install dt~react-addons-create-fragment --global --save
typings install dt~react-addons-css-transition-group --global --save
typings install dt~react-addons-linked-state-mixin --global --save
typings install dt~react-addons-perf --global --save
typings install dt~react-addons-pure-render-mixin --global --save
typings install dt~react-addons-test-utils --global --save
typings install dt~react-addons-transition-group --global --save
typings install dt~react-addons-update --global --save
typings install dt~react-global --global --save
{% endhighlight %}

This downloads the definitions to our `typings` folder, saves the commit hash to the `typings.json` and updates the `typings/index.d.ts`.

Our `typings.json` should contain something like :

{% highlight javascript %}
{
  "globalDependencies": {
    "react-global": "registry:dt/react-global#0.14.0+20160316155526"
  }
}
{% endhighlight %}

And the `typings/index.d.ts` should contain:

{% highlight javascript %}
/// <reference path="globals/react-addons-create-fragment/index.d.ts" />
/// <reference path="globals/react-addons-css-transition-group/index.d.ts" />
/// <reference path="globals/react-addons-linked-state-mixin/index.d.ts" />
/// <reference path="globals/react-addons-perf/index.d.ts" />
/// <reference path="globals/react-addons-pure-render-mixin/index.d.ts" />
/// <reference path="globals/react-addons-test-utils/index.d.ts" />
/// <reference path="globals/react-addons-transition-group/index.d.ts" />
/// <reference path="globals/react-addons-update/index.d.ts" />
/// <reference path="globals/react-dom/index.d.ts" />
/// <reference path="globals/react-global/index.d.ts" />
/// <reference path="globals/react/index.d.ts" />
{% endhighlight %}

## Let's code

Create a file named `HelloWorld.tsx`. Notice the `.tsx` extension, this is needed for TypeScript to enable JSX syntax support.

{% highlight javascript %}
/// <reference path="./typings/index.d.ts" />

class HelloWorld extends React.Component<any, any> {
  render() {
    return <div>Hello world!</div>
  }
}
{% endhighlight %}

We first reference to our TypeScript definitions that we setup in the previous step. We then `import` React module using the ES6 module import syntax and then, we declare our first component using react!

## Compiling to JavaScript

TypeScript 1.6 has a new flag to enable JSX support, we need to enable it. Compile `HelloWorld.tsx` to JS by running:
```
tsc --jsx react --module commonjs HelloWorld.tsx
```

This will produce `HelloWorld.js`

But, you might not want to remember all those flags, let's save our compiler configuration to a `tsconfig.json`. The `tsconfig.json` file specifies the root files and the compiler options required to compile the project. For more details refer to the [official documentation](https://github.com/Microsoft/typescript/wiki/tsconfig.json).

{% highlight javascript %}
{
  "compilerOptions": {
    "jsx": "react",
    "module": "commonjs",
    "noImplicitAny": false,
    "removeComments": true,
    "preserveConstEnums": true,
    "outDir": "dist",
    "sourceMap": true,
    "target": "ES5"
  },
  "files": [
    "./typings/index.d.ts",
    "HelloWorld.tsx"
  ]
}
{% endhighlight %}

We can now run `tsc` in our project folder to produce the same result. Notice that we include the `typings/index.d.ts` file, so we won't need to reference it in all our files.

## Finishing touches
Let's explore a little deeper on how to render our `HelloWorld` component and pass typed `props`.


Let's improve our HelloWorld component by adding `firstname` and `lastname` props and typing them with an `interface`. Then, let's render it! This will allow us to be notified at compile time if a `prop` is missing or is the wrong type!

{% highlight javascript %}
/// <reference path="./typings/index.d.ts" />

class HelloWorldProps {
  public firstname: string;
  public lastname: string;
}

class HelloWorld extends React.Component<HelloWorldProps, any> {
  render() {
    return <div>
      Hello {this.props.firstname} {this.props.lastname}!
    </div>
  }
}

ReactDOM.render(<HelloWorld
    firstname="John"
    lastname="Smith"/>,
  document.getElementById('app'));
{% endhighlight %}

Compile once again with `tsc`. Then let's finish by importing everything in an `index.html` file:

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>React TypeScript Demo</title>
  </head>
  <body>
    <div id="app"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-dom.js"></script>
    <script src="HelloWorld.js"></script>
  </body>
</html>
{% endhighlight %}

Open `index.html` in your browser and you should see
```
Hello John Smith!
```

That's it! You've created your first TypeScript React project. Hope you enjoy developing with it as much as we do!

> Note that i've intentionally left [webpack](http://webpack.github.io/docs/) out of this tutorial to keep it short but as your project grows to more than one file, a module loader will be necessary.
