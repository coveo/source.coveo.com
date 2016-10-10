---
layout: post
title: Push API Basics (Java edition)
tags:
  - Java
  - Push API
author:
  name: Chad Johnson
  bio: Platform Evangelist
  image: cjohnson.jpg
published: true
---

Hello!  I am excited to be writing my first post for the Coveo Technology blog. Before I dive in to the Push API, I thought I would very briefly share my background and an explanation of the Coveo Platform Evangelist role.  

Before joining Coveo, I was a professional services consultant for 16 years, specializing in application integration, content management and enterprise search. Content management and enterprise search were like chocolate and peanut butter. <!-- more --> I would help corporations convert paper-based processes into shiny, new digital workflows that  could easily generate hundreds of thousands of new documents per month.  Without a way to search and locate documents quickly, these systems would be useless. While most content management systems included a built-in search engine, they were often underpowered and incapable of combining content from multiple repositories, especially from different vendors.  The application integration experience was my secret weapon; by using third-party search engines and developing connectors into each application, I could provide a universal search experience across the entire system.  

Over the years, I build these types of digital workflow systems for law firms, distribution companies, airlines, manufacturers, retailers and more.  The one thing they all had in common was the critical need to search for content.  And that brings me to my role at Coveo.  As the Platform Evangelist, I will act as a bridge between the software company and the customers, helping them discover, design and implement Coveo Cloud solutions for searching their enterprise systems.

There are a lot of potential Step 1's to empower our customers and partners to build these types of solutions.  I might be biased by my past experience, but the mechanism for indexing custom content sources seems like a fine place to start.  And with the Coveo Cloud Platform being a cloud-based search engine, it might not be immediately obviously how to accomplish this safely and efficiently  

## A Space Elevator for Your Content (i.e. Push API)



Testing a change ![Hello](http://www.test.com/mypicture.jpg).  In July 2016, the Coveo Search UI, also known as the Coveo JavaScript Search Framework, became open-source. This means that, from now on, anyone will be able to go on GitHub, take the Coveo Search UI, and modify the code itself to adapt it to their own needs.
<!-- more -->

Although it is called the JavaScript Search Framework, the code is written using [TypeScript](http://www.typescriptlang.org/). The TypeScript code is then compiled into JavaScript, which allows us to modify our code base without the fear of breaking the framework.

## Why open-sourcing it?

As Coveo continues to grow, we have more and more partners that need to implement our Search UI in a website, and tweak it in different ways to fit their needs.

Before open-sourcing the code, our partners had to do some serious code-gymnastics to bypass certain sections of the Search Framework and implement their own features.

We improved the flexibility and usability of the framework, and by open-sourcing it, we are giving our advanced Coveo partners a means to take their implementation to the next level by allowing them to take the code and play with it to their heart’s content.

## What’s different with the open-source version?

We did not decide to simply open-source the code; we modified it to make it more user friendly for anyone who wants to join in.

### Improved documentation

Before the open-source version, the JavaScript Search Framework documentation had to be updated by hand every time there was a modification in the code. While the people at Coveo are keenly aware of the importance of good documentation, it still happened from time to time that certain features were added, removed, or modified without the documentation reflecting this change.

From now on, the documentation is generated using [TypeDoc](https://github.com/TypeStrong/typedoc/), which means that the documentation is made from comments left in the code. To access the current documentation, see the [Coveo Search UI documentation](https://coveo.github.io/search-ui/).

This way, it is much easier for developers to remember to update the documentation when adding new features or modifying existing ones.

This also means that anyone playing with the open-source code is able to see the documentation right next to the component code without having to refer to an external website.

Furthermore, the TypeDoc generated documentation can be easily implemented directly in the UI components, such as the [JavaScript Search Interface Editor](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=230). This way, the components can be used even by people who are not familiar with coding.

### Removed internal jQuery dependencies

The old JavaScript Search Framework was dependent on the jQuery library. However, because a plethora of other packages also use this library, the potential for conflicts between the Coveo Search Framework and other packages was high.

With the new Search UI, we removed our dependency on that library, while still continuing to support it. This way, other packages or features that use the jQuery library will still work in the Coveo Search Framework, while also lowering the risk of potential conflict.

### Update the way the project is built

We started using [TypeScript](http://www.typescriptlang.org/) at a really early stage in the project, nearly 3 years ago, in the JavaScript Search Framework version 0.4. Since then, the “correct” way to set up a TypeScript project has evolved tremendously.

We made extensive use of [triple-slash directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) to instruct the typescript compiler how to bundle the project.

While this method served us well at the beginning of the project, it has serious drawback. The main one is that the project becomes monolithic and cannot be easily customized to include or exclude certains components.

We modified our project to instead use ES6 CommonJS modules and [webpack](https://webpack.github.io/) in order to have a much more flexible bundle. Technically speaking, specifying any entry point in the project results in a coherent bundle that executes correctly at run time.

This also brought some development perks, such as a [webpack dev server](https://webpack.github.io/docs/webpack-dev-server.html), which makes developing with the Search UI much more enjoyable.

## Can people contribute to the project?

We would love for people to contribute to our Search UI project! Simply make a Pull Request, and a feature or improvement that you coded could be added to the Coveo Search Framework.

This not only makes our developers aware of your implementations, but it also makes your other projects that much easier to start.

Coveo is very open to new ideas and features, and would love to hear from what you think should be improved. We await your pull requests in our [GitHub Project](https://github.com/coveo/search-ui), and we hope that you enjoy the new Coveo Search Framework!
