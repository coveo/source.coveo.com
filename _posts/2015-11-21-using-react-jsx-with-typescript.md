---
layout: post

title: "Using React JSX with TypeScript"

tags: [React, JSX, TypeScript, tsd, DefinitelyTyped]

author:
  name: William Fortin
  bio: JavaScript Ninja, Cloud
  twitter: willyfortin
  image: wfortin.jpeg
---

In the last months, we [experienced with React](http://source.coveo.com/2015/08/21/dreamforce-session-explorer/) and we enjoyed it a lot. As you may know, all Coveo's web applications are built using TypeScript, so with the release of [TypeScript 1.6 announcing support for React JSX](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#typescript-16) syntax, we were stoked!

<!-- more -->

In this article, i'll introduce you on how to start a new project using TypeScript, JSX and React and show you some tools we use to simplify our development.

## Initial setup with npm

First we'll setup our project with `npm init`. For this project we need node, typescript, tsd, and react. Let's install them:
```
npm install typescript -g
npm install tsd -g

npm install react --save
```

First, let's make sure we have TypeScript compiler 1.6 or later:
```
./node_modules/typescript/bin/tsc --version
```
You should see an output similar to:
```
message TS6029: Version 1.6.2
```

## TypeScript definitions with tsd

We're almost ready to start coding, but we'll need the React definitions. We already installed [tsd](http://definitelytyped.org/tsd/) which is a package manager to search and install TypeScript definition files directly from the community driven [DefinitelyTyped](https://github.com/DefinitelyTyped) repository. It will allow us to download the latest definitions for React and other libraries. Like we did with npm, we need to initialize a tsd project by running :
```
tsd init
```

This will create a `tsd.json` file (similar to a `package.json` but refering to our TypeScript definitions), a `typings/` folder to store the definitions and a `tsd.d.ts` referencing all our downloaded definitions.

We can now install the needed definitions:
```
tsd install react-global --save
```
This downloads the definitions to our `typings` folder, saves the commit hash to the `tsd.json` and updates the `tsd.d.ts`.

Our `tsd.json` should contain something like :

{% highlight javascript %}
"installed": {
  "react/react.d.ts": {
    "commit": "16134c168d021351acb1673ee9659644fc58c424"
  },
  {
    //....
  }
{% endhighlight %}


And the `tsd.d.ts` should contain:

{% highlight javascript %}
/// <reference path="react/react-dom.d.ts" />
/// <reference path="react/react.d.ts" />
/// <reference path="react/react-addons-create-fragment.d.ts" />
/// <reference path="react/react-addons-css-transition-group.d.ts" />
/// <reference path="react/react-addons-linked-state-mixin.d.ts" />
/// <reference path="react/react-addons-perf.d.ts" />
/// <reference path="react/react-addons-pure-render-mixin.d.ts" />
/// <reference path="react/react-addons-test-utils.d.ts" />
/// <reference path="react/react-addons-transition-group.d.ts" />
/// <reference path="react/react-addons-update.d.ts" />
/// <reference path="react/react-global.d.ts" />
{% endhighlight %}

## Let's code

Create a file named `HelloWorld.tsx`. Notice the `.tsx` extension, this is needed for TypeScript to enable JSX syntax support.

{% highlight javascript %}
/// <reference path="./typings/tsd.d.ts" />

class HelloWorld extends React.Component<any, any> {
  render() {
    return <div>Hello world!</div>
  }
}
{% endhighlight %}

We first reference to our TypeScript definitions that we setup in the previous step. We then `import` React module using the ES6 module import syntax. And we declare our first component using react!

## Compiling to JavaScript

TypeScript 1.6 has a new flag to enable JSX support, we need to enable it. Compile `HelloWorld.tsx` to JS by running:
```
tsc --jsx react --module commonjs HelloWorld.tsx
```

This will produce `HelloWorld.js`

But, you might not want to remember all those flags, let's save our compiler configuration to a `tsconfing.json`. The `tsconfig.json` file specifies the root files and the compiler options required to compile the project. For more details refer to the [official documentation](https://github.com/Microsoft/typescript/wiki/tsconfig.json)

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
    "HelloWorld.tsx"
  ]
}
{% endhighlight %}

We can now run `tsc` in our project folder to produce the same result.

## Finishing touches
Let's explore a little deeper on how to render our `HelloWorld` component and pass typed `props`.


Let's improve our HelloWorld component by adding `firstname` and `lastname` props and typing them with an `interface`. Then, let's render it! This will allow us to be notified at compile time if a `prop` is missing or is the wrong type!

{% highlight javascript %}
/// <reference path="./typings/tsd.d.ts" />

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

React.render(<HelloWorld
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

> Note that i've intentionally left [wepback](http://webpack.github.io/docs/) out of this tutorial to keep it short but as you project grows to more than one file, a module loader will be necessary.
