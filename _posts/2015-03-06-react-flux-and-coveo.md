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

React and Flux are quite evolving technologies and using them with Coveo was a
no brainer for me to get started on them. Here is my take on creating a searchable
dashboard with theses.

The code of the demo is available on [Github][githubrepo]

<!-- more -->

## Another JS Framework, another Day

Javascript is quite an evolving language and new javascript frameworks are
given birth and die everyday (if you are a purist there is always
[VanillaJS][vanillajs] available for you).

As an experiment, I wanted to build an interface to Coveo's search engine while
learning the [React][react] framework by Facebook and using a simple web
application architecture which was popularized at the same time as React named [Flux][flux] which is somewhat different from the traditionnal MVC pattern libraries like [Backbone / Marionette][marionette]

This project also got me to experiment with other technologies like SVG icons, instead of plain icons or font icons and also with the new FlexBox. I also leaned towards ECMAScript 6 for this project and the new features coming in are quite nice.

## The dashboard

So let's try to build a searchable dashboard from what we can get out of our
sample documents putted together in our`sampledocumentation` org.

I used the [Yeoman][yeoman] generator [generator-flux-react][yeomangenerator] to
bootstrap a React template application.

## React

React is an interesting technology developped initially by Facebook then released
about one year ago in the wild.

It provides a virtual DOM (document object model), a javascript representation of the DOM which we can manipulate freely. What React does under the hood is that when a
component's `render` method is called it does a diff of the previous render Virtual DOM and the new one and then only modifies the real browser DOM.

React also provides a nice extension to javascript called [JSX](jsx) which really
eases the use of React. JSX is like inputing some html templates directly into your
javascript.

Here is an example of what JSX would do:

    var Nav;
    // Input (JSX):
    var app = <Nav color="blue" />;
    // Output (JS):
    var app = React.createElement(Nav, {color:"blue"});


The main elements of React are components which are kinda like views (in the MVC
  pattern). They are virtual representation of DOM components with their own
   `state`, `properties` (which can also be event handlers) and `lifecycle`


For more information about React see [their website][react]. If you want some
React help there is a nice [chrome dev tool addon](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi). A lot of user have experimented with React and much information
is available on the web, I found [nice tips here][reacttips].

## Flux Architecture

one way flow of information which is quite simpler than the MVC model

- Views:
  - controller-view
  - Other views
- Stores:
- Dispatcher:
- Actions/ActionCreators:

![Flux architecture diagram](/images/fluxdiagram.svg)

Views subcribe to changes on Stores and publish actions

[The flux documentation][flux] is quite extensive and there are a lot of example
out there to help you get started with this new architecture of building a web
application.

## The demo

### Some flux architecture detail

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


The code of the demo is available on [Github][githubrepo]

![demo screenshot](/images/reactfluxcoveodemo.jpg)

Hope you'll like reading/seeing the code that's out there in that demo!

Writing this article helped me much in understanding React & Flux more. I had to
revisit the documentation sites which are really explanatory and this made me
see and understand what I had missed or that was still foggy from my previous
visits.
