---
layout: post

title: "React + Flux & Coveo !== undefined"

tags:
  - React
  - Flux
  - Coveo
  - Search
  - UX
  - Interface

author:
  name: Pierre-Alexandre
  bio: Demo Engineer - I glue things together using bytes
  twitter: pastjean
  imageURL: https://avatars.githubusercontent.com/u/140675
---

[vanillajs]: http://vanilla-js.com/
[react]: https://facebook.github.io/react/
[jsx]: https://facebook.github.io/react/docs/jsx-in-depth.html
[flux]: http://facebook.github.io/flux/
[reacttips]: http://aeflash.com/2015-02/react-tips-and-best-practices.html

[yeoman]: http://yeoman.io/
[yeomangenerator]: https://github.com/banderson/generator-flux-react

[marionette]: http://marionettejs.com/

[githubrepo]: https://github.com/pastjean/react-flux-coveo-experiments
[learnes6]: https://babeljs.io/docs/learn-es6/

React and Flux are evolving technologies and using them with Coveo was a
no brainer for me to get started on them. Here is my take on creating a searchable
dashboard with those technologies.

The code of the demo is available on [Github][githubrepo]

<!-- more -->

## Another JS Framework, another Day

JavaScript is an evolving language and new JavaScript frameworks are born and die everyday (if you are a purist there is always [VanillaJS][vanillajs] available for you).

As an experiment, I wanted to build an interface to Coveo's  search engine around [React][react] web application framework. While learning [React][react], I went all-in and used [Flux][flux], a simple web application architecture popularized at the same time as React, which is somewhat different from the traditionnal MVC pattern libraries like [Backbone / Marionette][marionette].

This project also got me to experiment with other technologies like SVG icons, instead of plain or font icons, and also with the new FlexBox. I also leaned towards ECMAScript 6 for this project and the new features coming in are game-changing (template string, classes, const, arrow function).

_For more information about ES6 [look at the new features][learnes6]_

## The dashboard

So let's try to build a searchable dashboard from what we can get out of our
sample documents put together in our`sampledocumentation` org.

I used the [Yeoman][yeoman] generator [generator-flux-react][yeomangenerator] to
bootstrap a React template application.

## React

React is an interesting technology initially developped by Facebook and then released about a year ago into the wild.


It provides a virtual DOM (document object model), a JavaScript representation of the DOM which we can manipulate freely. What React does under the hood is that when a components `render` method is called, it perfoms a diff between the previous render Virtual DOM and the new one, and then only modifies the real browser DOM.

React also provides a nice extension to JavaScript called [JSX][jsx] which really eases the use of React. Using [JSX][jsx] is like using html directly into JavaScript.

Here is an example of what JSX can do:

    var Nav;
    // Input (JSX):
    var app = <Nav color="blue" />;
    // Output (JS):
    var app = React.createElement(Nav, {color:"blue"});


The main elements of React are components which are somewhat like views (in the MVC pattern). They are virtual representations of DOM components with their own `state`, `properties` (which can also be event handlers) and `lifecycle`.

For more information about React, see [their website][react]. If you want some React help, there is a nice [chrome dev tool addon](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi). Many users have experimented with React and a lot of information is available on the web. I found [this page][reacttips] which is a nice wrap-up of tips and tricks about React.

## Flux Architecture

What better way to describe flux than what the projects website tells us?

> Flux is the application architecture that Facebook uses for building
> client-side web applications. It complements React's composable view
> components by utilizing a unidirectional data flow. It's more of a pattern
> rather than a formal framework, and you can start using Flux immediately
> without a lot of new code.
> [http://facebook.github.io/flux](http://facebook.github.io/flux)

The notable thing about flux is the one-way flow of information, which is quite simpler than the MVC model. Of course. you can still use MVC with React, but I decided to use the whole package to form an opinion about it.

### The flux architecture

The flux architecture is simple and easy to implement.

![Flux architecture diagram](/images/fluxdiagram.svg)

- Views: (basically those are react components)
  - controller-view: The view that handles state
  - Other views: Those are more like components and gets passed parameters by properties
- Stores: The 'M' in MVC,
- Dispatcher: An event dispatcher that receives `Actions` and passes them to
    stores
- Actions/ActionCreators: Actions are the event objects  of Flux, some utility functions
    called `ActionCreators` are built to help the publishing of those events

So it works like this :

- Stores subscribes to dispatcher and listens on certain events
- Views subscribes to stores and update their state based on the stores state
- Views/Stores or other things trigger actions and the flow starts,
  `Action -> Dispatcher -> Stores -> View`

[The flux documentation][flux] is extensive and there are a lot of example
out there to help you get started with this new architecture of building a web
application.

## The demo

Here are the most notable things that were built :

*Stores:*

- QueryStore : Stores the query and makes the call to the Coveo Search API
- FacetStore : Stores the different queried facets
- ResultStore : Stores results returned
- CategoryStore : Stores results IDs by some category (a field in the result).
    It is used in the CategoryResultList to display the results from a new
    perspective.

*Components/Views*:

- App : The main application state, a view-controller in React's terms. Subscribes
    to stores and updates the underlying
- SearchField: A nice expendable searchbox (bypasses the HTML `input` element fixed
    width)
- Stats : A simple sparkline bargraph that is built from a facet
- CategoryResultList : A result list that displays results grouped by some field
    the CategoryStore helps this list.

![demo screenshot](/images/reactfluxcoveodemo.jpg)

Hope you'll like reading/seeing the code that's out there in that demo!

The code of the demo is available on [Github][githubrepo]

Writing this article helped me understand React & Flux much more. I had to revisit the documentation, which is really helpful, and this made me see and understand what I had missed or what was still foggy from my previous visits.
