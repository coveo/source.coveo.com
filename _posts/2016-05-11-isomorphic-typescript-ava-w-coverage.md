---
layout: post

title: "Isomorphic TypeScript, fetch, promises, ava and coverage"

tags:
  - TypeScript
  - ava
  - code coverage
  - isomorphic

author:
  name: Pierre-Alexandre
  bio: Experimentation admiral (analytics & distributed systems)
  twitter: pastjean
  imageURL: https://avatars.githubusercontent.com/u/140675
---

Writing an API client in JavaScript is a lot of work, you have to write one for
Node.js and one for the browser. I found out a way to have both on the same
codebase with the same API, all that with only changes to the build scripts.
 It's called isomorphic code, and doing it with modern TypeScript isn't easy,
but it's achievable.

<!-- more -->

TypeScript brings lots of advantages to the JavaScript world with almost mandatory
typings. But TypeScript code is transpiled, and to play well with other libraries
that aren't originally written in TypeScript needs manually written type
definition and some hacks to play well with other external tools, like code
coverage and test frameworks.

# Isomorphic

Isomorphic is a trendy word with a nice soul behind, that means sharing some code
between frontend and backend with minor or no changes. Since TypeScript can be compiled
to JavaScript, it can run on Node.js and in the browser. An API client sharing the
same code could be written with the same code everywhere.

I want my API client to fetch resources using the same simple call everywhere.

```js
const client = new coveoanalytics.analytics.Client({ token : 'YOUR-TOKEN'})
// Send your event
client.sendCustomEvent({
  eventType: "dog";
  eventValue: "Hello! Yes! This is Dog!";
});
```

All this without having 2 codebases.

## Window, fetch and promises

Let's fix the main difference between Node.js and the browser.

Getting data from the browser is done using an `XMLHttpRequest` or using the new
`fetch` API that is defined on the global object `window`.

```js
fetch('http://localhost:80/').then( (res) => {
  // Do stuff with the response
})
```

In Node.js:

```js
var http = require('http');
http.get({
  hostname: 'localhost',
  port: 80,
  path: '/'
}, (res) => {
  // Do stuff with response
})
```

First things first, the fetch API is nice, simple and returns promises. But fetch
isn't defined in all browsers and is not even part of Node.js standard libraries.
Promises aren't defined in all browsers.

Fortunately there are nice libraries for both of these cases. Let's use them.

```sh
npm install --save es6-promises isomorphic-fetch
```

But wait, don't go too fast! You are in TypeScript you need the type definition
if you don't want to put the `any` type everywhere. Again in the console:

```sh
npm install --save-dev typings
typings install --save --ambient isomorphic-fetch es6-promise
```

Typings is a nice tool to find type definitions and it contains the type
definition of most popular JavaScript library.

Now let's handle the 2 cases, in the browser and in Node.js.

### Node.js

Since `fetch` is defined on the global object and promises are natively
implemented in Node.js. Just tell the people using your library to inject
`isomorphic-fetch` in their Node.js application.

Compile using `tsc` with a tsconfig.json

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "outDir": "dist",
        "declaration": true,
        "noImplicitAny": true,
        "removeComments": true,
        "sourceMap": true
    },
    "files": [
      "... your files"
      "typings/main.d.ts"
    ]
}
```

With a Node.js entrypoint like this `index.ts` script:

```js
import * as analytics from './analytics';
import * as SimpleAnalytics from './simpleanalytics';
import * as history from './history';
import * as donottrack from './donottrack';
export {
    analytics,
    donottrack,
    history,
    SimpleAnalytics
}
```

Then build it with `tsc`. If you don't have it installed globally, you can use
the `npm bin` executable `$(npm bin)/tsc`

### Browser

The browser is a special case. Not everyone is using a web bundler, and I wanted
to provide a library that could be bootstrapped like Google Analytics, so I needed
my own bundle. When people don't use a module bundler, you have to expose your
library via a global object.

We'll bundle our library with Webpack, and inject the promises and fetch libraries in it.
We'll also provide an entrypoint that will export variable to the global window object.

First the entrypoint:

```js
import * as entrypoint from './index';
global.ourlibentrypoint = entrypoint
```

Then the webpack configuration

```sh
npm install --save-dev webpack ts-loader exports-loader
```

```js
var webpack = require("webpack");

module.exports = {
    entry: "./src/browser.ts",
    output: {
        path: "./dist/",
        filename: "bundle.js"
    },
        devtool: 'source-map',
        resolve: {
        extensions: ['', '.ts'],
        root: __dirname
    },
    module: {
        loaders: [{test: /\.ts$/, loader: 'ts-loader'}]
    },
    plugins:[
        // The injection is done here
        new webpack.ProvidePlugin({
            'Promise': 'es6-promise',
            'fetch': 'exports?self.fetch!whatwg-fetch'
        }),
        new webpack.optimize.UglifyJsPlugin()
    ],
    ts: {
        compilerOptions: {
            // We already emit declarations in our normal compilation step
            // not needed here
            declaration: false,
        }
    }
}
```

Cook your bundle with `webpack`! The `dist/bundle.js` file can now be included
in your `html`.

# Tests

For sanity, let's add tests to our library. We'll use [Ava](https://github.com/sindresorhus/ava) from the prolific
[sindresorhus](https://github.com/sindresorhus) which is a modern testing library for JavaScript. Happily it comes with its own `d.ts` bundled so no
need of `typings` for that one.

The setup is simple.

```sh
npm install --save-dev ava
```

A different tsconfig.json is needed for tests. So here is `tsconfig.test.json`:

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "outDir": "dist_test",
        "declaration": false,
        "noImplicitAny": true,
        "removeComments": true,
        // Inline source map are required by nyc the coverage tool
        // to correctly map to good files.
        "inlineSourceMap": true
    },
    "files": [
        "... your test files",
        "test/lib.d.ts",
        "typings/main.d.ts"
    ]
}
```

Some libs forgets type definitions. In my case I had to add a special `lib.d.ts`
for tests.

`test/lib.d.ts`:

```js
interface IteratorResult<T> {
    done: boolean;
    value?: T;
}

interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}
```

To enable extended babel support in ava, you have to require babel-register in AVA.
You can do this in the `package.json` file by adding an `ava` key.

```
"ava": {
  "require": [
    "babel-register" ] }
```

Tests can be run with `tsc -p tsconfig.test.json && ava \"**/*test.js\"`

## Coverage

Adding coverage was simple, AVA runs tests in different process so you need to
 have a coverage runner that supports this. [nyc](https://github.com/bcoe/nyc)
 does that task for you.

```sh
npm install --save-dev nyc
```

You'll have to create a file which includes all your TypeScript files, so nyc
and ava are aware of all the TypeScript available. I created a fake test that
loads the Node.js entrypoint. That tests is always green.

```js
import test from 'ava';
import * as coveoanalytics from '../src/index';

test('coverage', t => {
    const _ = coveoanalytics;
});
```

It is also nice to get code coverage in the original languague, which is
TypeScript. To do this you need to place the source maps inline. In your
tsconfig.test.json add this key `"compilerOptions"."inlineSourceMap": true`.

You can then run your tests using `tsc -p tsconfig.test.json && nyc ava \"**/*test.js\"`


## Plugging all this together.

If you followed the article without skipping part, you should be good to go,
here's a recap of the most important parts.

`package.json`:

```json
{
  ...
  // your 2 compiled entry points here
  "main": "dist/index.js",
  "browser": "dist/bundle.js",
  ...
  "scripts":{
    ...
    "build:webpack": "webpack",
    "build:tsc": "tsc",
    "build": "npm run-script lint && npm run-script build:webpack && npm run-script build:tsc",
    "test": "tsc -p tsconfig.test.json && nyc ava \"**/*test.js\"",
    ...
  },
  ...
  "dependencies":{
    ...
    "isomorphic-fetch": "2.2.1",
    ...
  },
  "devDependencies":{
    ...
    "es6-promise": "3.1.2",
    "ava": "0.14.0",
    "exports-loader": "0.6.3",
    "nyc": "6.4.4",
    "TypeScript": "1.8.10",
    "typings": "0.8.1",
    "webpack": "1.13.0"
    ...
  },
  ...
  "ava": {
    "require": [
      "babel-register"
    ]
  }
}
```

You also need:

- 1 tsconfig file for your normal builds (Webpack and Node.js)
- 1 tsconfig file for your tests
- 1 typings file to have the type definitions of isomorphic-fetch and es6-promises
- A lot of tests
- 1 Browser entrypoint (mine is named `browser.ts`)
- 1 Node entrypoint (mine is named `index.ts`)
- A `webpack.config.js` file similar to the one above

This was a tedious work to glue everything together, but it was worth it.
TypeScript is a nice transpiler bringing a lot to a large application's codebase.
It is up to date and even transpiles to ES2015 which you can then retranspile
with babel if you want more included.

If you want to see an example of what came out of it see [coveo.analytics.js](https://github.com/coveo/coveo.analytics.js)

