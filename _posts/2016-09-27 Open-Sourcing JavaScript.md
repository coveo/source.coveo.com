---
layout: post

title: "Open-Sourcing the Coveo JavaScript Search Framework"
tags: [JavaScript, SearchFramework, Open-Source, Search UI]

author:
  name: Alexandre Moreau
  bio:  Technical Writer
  image: amoreauCoveo.png
---

In July 2016, the Coveo Search UI, also known as the Coveo JavaScript Search Framework, became open-source. This means that, from now on, anyone will be able to go on GitHub, take the Coveo Search UI, and modify the code itself to adapt it to their own needs.
<!-- more -->

Although it is called the JavaScript Search Framework, the code is written using [TypeScript](http://www.typescriptlang.org/). The TypeScript code is then compiled into JavaScript, which allows us to modify our code base without the fear of breaking the framework.

##Why open-sourcing it?

As Coveo continues to grow, we have more and more partners that need to implement our Search UI in a website, and tweak it in different ways to fit their needs.

Before open-sourcing the code, our partners had to do some serious code-gymnastics to bypass certain sections of the Search Framework and implement their own features.

We improved the flexibility and usability of the framework, and by open-sourcing it, we are giving our advanced Coveo partners a means to take their implementation to the next level by allowing them to take the code and play with it to their heart’s content.

##What’s different with the open-source version?

We did not decide to simply open-source the code; we modified it to make it more user friendly for anyone who wants to join in.

###Improved documentation

Before the open-source version, the JavaScript Search Framework documentation had to be updated by hand every time there was a modification in the code. While the people at Coveo are keenly aware of the importance of good documentation, it still happened from time to time that certain features were added, removed, or modified without the documentation reflecting this change.

From now on, the documentation is generated using [TypeDoc](https://github.com/TypeStrong/typedoc/), which means that the documentation is made from comments left in the code. To access the current documentation, see the [Coveo Search UI documentation](https://coveo.github.io/search-ui/).

This way, it is much easier for developers to remember to update the documentation when adding new features or modifying existing ones.

This also means that anyone playing with the open-source code is able to see the documentation right next to the component code without having to refer to an external website.

Furthermore, the TypeDoc generated documentation can be easily implemented directly in the UI components, such as the [JavaScript Search Interface Editor](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=230). This way, the component can be used even by people who are not familiar with coding.

###Removed internal jQuery dependencies

The old JavaScript Search Framework was dependent on the jQuery library. However, because a plethora of other packages also use this library, the potential for conflicts between the Coveo Search Framework and other packages was high.

With the new Search UI, we removed our dependency on that library, while still continuing to support it. This way, other packages or features that use the jQuery library will still work in the Coveo Search Framework, while also lowering the risk of potential conflict.

###Update the way the project is built

We started using [TypeScript](http://www.typescriptlang.org/) at a really early stage in the project, nearly 3 years ago, since version 0.4. Since then, the “correct” way to set up a TypeScript project has evolved tremendously.

We made extensive use of [triple-slash directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) to instruct the typescript compiler how to bundle the project.

While this method served us well at the beginning of the project, it has serious drawback. The main one is that the project becomes monolithic and cannot be easily customized to include or exclude certains components.

We modified our project to instead use ES6 CommonJS modules and [webpack](https://webpack.github.io/) in order to have a much more flexible bundle. Technically speaking, specifying any entry point in the project results in a coherent bundle that executes correctly at run time.

This also brought some development perks, such as a [webpack dev server](https://webpack.github.io/docs/webpack-dev-server.html), which makes developing with the Search UI much more enjoyable.

##Can people contribute to the project?

We would love for people to contribute to our Search UI project! Simply make a Pull Request, and a feature or improvement that you coded could be added to the Coveo Search Framework.

This not only makes our developers aware of your implementations, but it also makes every other project you work on that much easier to start.

Coveo is very open to new ideas and features, and would love to hear from what you think should be improved. We await your pull request in our [GitHub Project](https://github.com/coveo/search-ui), and we hope that you enjoy the new Coveo Search Framework!
