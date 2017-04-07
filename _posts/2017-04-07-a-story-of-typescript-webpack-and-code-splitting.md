---
layout: post

title: "A story of TypeScript, webpack, and code splitting"

tags: [webpack, TypeScript, Code Splitting]

author:
  name: Olivier Lamothe
  bio: A JavaScript dude.
  image: olamothe.png
---

In my last blog post, I talked about how we use [webpack](https://webpack.js.org) at Coveo, to improve our development process. 

One of the most powerful feature offered by it is [code splitting](https://webpack.js.org/guides/code-splitting/).
 
I'll try to explain how we are leveraging it inside [our project](https://coveo.github.io/search-ui/), and combining it with [TypeScript](https://www.typescriptlang.org/).

<!-- more -->

## Code splitting

I would say there are 3 big performance factors when dealing with a modern web application that makes heavy use of JavaScript:

* Initial load time before the end user is able to interact with your application.     
* The rendering speed, and how much client side logic your code has to execute.
* How fast the backend can process the various requests you are hammering it with.

Code splitting is used to improve the first of those 3 points. The basic logic is relatively simple: minimize the amount of code needed for your application to "start", and progressively load more JavaScript as the user needs access to more feature while they are using your application.

In a classic scenario (and what most tutorials describe on the web), you would achieve that by serving the needed code based on the path of your application.

For example, for a `Todo` app (very original, I know), the initial load would download only the needed code for the `home` or `login` page. 

Then, once the users starts navigating to, say `/view`, you would serve the minimum amount of code needed to simply view the list of `Todo's`.

Very rarely, end users would want to access the `/edit` page, which would probably be the part of our imaginary application that would require the most amount of code to function properly. Only then would the user need to download that part of your application.

That's all very nice for a classic single page application, but we had different needs.

## What we need

What we are developing is not a single page application, but a library of multiple search page components. When someone wants to create a new search page using our library, they decide which of our components they will need, and mix and match them together to assemble their page. This is all configured by modifying the markup of their page.

So, for example, we offer a `Searchbox` component, a `Pager` component, a `ResultList` component, etc. We also offer some more "exotic" components, which are useful in their own rights, but either complex (so they need a lot of code to function), or used in some very particular deployments. A good example is the `Facet` component, which offers advanced filtering capabilities, but requires a good amount of client side code to function.

Since we do not know ahead of time which combination of component will be used in a page (as every implementation is different), we ship a single JavaScript file, containing the code for every component.

The dilemma that we face is that if someone needed a page with only a `Searchbox` and a `ResultList`, they would still download the code for the 60+ components that we offer. This means this theoretical simple search page would have more than 90% "dead code" being downloaded by every end user.

## The situation before code splitting

At a high level, our framework works by associating a well known CSS class to a component.

When the search page is initialized, we scan the markup for CSS class that we know about, and create the associated component on the DOM element.

As an example, let's take the `Searchbox` component.

First, we have the code itself for the `Searchbox` class (in TypeScript):

```typescript
// File: Searchbox.ts

import { Initialization } from './Initialization';

export class Searchbox {

   static ID = 'Searchbox';

   public constructor(element: HTMLElement, options) {
      [....]
   }
   
   public submit(): void {
      [....]
   }
   
   [... etc ...]

}

Initialization.registerComponent(Searchbox);

```

What happens when we call `Initialization.registerComponent(Searchbox)` is that, in an internal data structure, we simply associate the `Searchbox.ID` to its constructor.

So we get something like this:
 
```typescript
{
  'Searchbox' : (element: HTMLElement) => Searchbox,
  'ResultList' : (element: HTMLelement) => ResultList,
  [... repeat for all components ...]
}
```

Then, on initialization, when we scan the DOM and when we find a `div` that has the class name `CoveoSearchbox`, we call the correct constructor function with the needed parameters.

```typescript
function createComponent(element: HTMLElement, id: string) {
    const componentConstructor = Initialization.getComponent(id);
    const createdComponent = new componentConstructor(element);
    return createdComponent;
}
 
```

## Lazy loading and code splitting

What we ended up designing is, instead of associating the ID with a constructor, we want to have an ID associated with a function that returns a `Promise` of a component.

Something like this: 

```typescript
{
  'Searchbox' : () => Promise<(element: HTMLElement) => Searchbox>
}
```

To achieve that, we created a `Lazy` file for each component.

Once again, if we use `Searchbox` as an example:

```typescript
// File LazySearchbox.ts

import {LazyInitialization} from './LazyInitialization';

export const registerLazySearchbox = ()=> {
    LazyInitialization.registerLazyComponent('Searchbox', () => {
        return new Promise((resolve, reject) => {
        
            // require.ensure is a function exposed by webpack.
            // when the project is being compiled, webpack will statically analyze your code and find those function call
            // This tells webpack to create a "chunk" and "split" your code to create a breakpoint on the './Searchbox.ts' file.
            
            require.ensure(['./Searchbox'], () => {
                const loaded = require('./Searchbox.ts')['Searchbox'];
                resolve(loaded);
            }, 'Searchbox'); // This tells webpack to name that chunk "Searchbox" instead of a random hash generated by webpack.
        });
    });
}

```

When the `LazySearchbox` file gets compiled, it creates a new JavaScript file called `Searchbox.js`. This is what the webpack terminology calls a "chunk". It will be created right next to our main "chunk", or entry point (which is `CoveoJsSearch.js` in our case).

The `Searchbox.js` file will contain all the code needed for the `Searchbox` component to function properly, while the `CoveoJsSearch.js` file will only contain the needed code to download the `Searchbox` component.

Now, when we scan the DOM and find a `div` that matches `Searchbox`, we need to do something like this:

```typescript
function createComponent(element: HTMLElement, id: string) {
    return Initialization.getLazyComponent(id).then((componentConstructor)=> {
       const createdComponent = new componentConstructor(element);
       return createdComponent;
    });
}
```

Only when we call the `getLazyComponent` function does it download the associated component JavaScript file. A component is also only downloaded once. This means that even if the search page has 10 `Searchbox`, we will still only download it a single time.
Since we only need to compile a minimum amount of code for each component (only the function returning the `Promise` for each component), we can cut down the resulting JavaScript code needed to start the application by a large amount.

## Webpack config

In our entry point, we only reference the `LazySearchbox` file, and not the actual implementation of the `Searchbox`. Otherwise, the `Searchbox` implementation would get compiled and included in the main "chunk" (which we want to contain as little code as possible, if you remember).

Here's what the `webpack.config.js` file ends up looking like:

```js
// File webpack.config.js

module.exports = {
    entry: {
        'CoveoJsSearch': ['./src/Index.ts']
    },
    output: {
        path: path.resolve('./bin/js'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        libraryTarget: 'umd',
        library: 'Coveo'
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [{
                loader: 'ts-loader'
            }]
        }]
    }
}
```

And the `Index.ts` file:

```typescript
// File Index.ts

// Core represent the minimum amount of JavaScript needed to be able to "init" the search page.
// This should be as little code as possible, depending on your application
export * from './Core';

import {registerLazySearchbox} from './ui/LazySearchbox.ts'
registerLazySearchbox();

[... repeat for all components ...]
```

## Conclusion

The page load time will now linearly increase with the page complexity, where simple search pages that uses the most simple components will be faster than very complex ones. The performance gain is also much more substantial if the user has a slow internet connection, or a less powerful device to parse the JavaScript code (a mobile device, for example).

We are still not done with our tinkering, as there are a lot of further optimization and benchmark that we need to perform. But so far, we have been very pleased with the results we can see during our development process. 
