---
layout: post

title: "Coveo and the Lightning Web Components framework"
tags: [Salesforce, Lightning Web Components, LWC, Framework]

author:
  name: Etienne Rocheleau & Andre Theriault & Jeremie Robert & Louis Bompart
  bio: Software Developers
  twitter: 
  image: 

---

In 2018, Salesforce introduced a new programming model for building Lightning components (Lightning components are the building blocks used to create applications within Salesforce). This new framework was designed with respect to the new web standards in order to allow web developers to keep using the knowledge they have acquired over the years outside of Salesforce. This new building model is alligned with the Web Components standard from the World Wide Web Consortium (W3C) and is using native browser features and language such as pure HTML and JavaScript. This blog post will document our team's experience with this new framework to build the Coveo for Salesforce integration using Lightning Web Components (LWC).

<!-- more -->

## What is this Lightning Web Component thing?

Lightning Web Component includes two concepts in its name.

The **Lightning** part of the *Lightning Web Components*. Lightning is a Salesforce related term which defines their UI or front-end applicative framework (by opposition to "Classic" or "Visualforce"). 

Second, **Web Components** are the result of three technologies that, when used in combination, allow you to define custom and reusable web elements. It leverages *Custom elements* which allows you to define custom web elements in JavaScript and some behaviour which in turn can be rendered in a web browser. These custom elements also use the *Shadow DOM* which is an encapsulation of the DOM tree attached to a specific element. This is used to separate features and behaviour of your element from other parts of the document. And finally, Web Components use the `<template>` and `<slot>` elements that allow you to write markup that is not displayed in your page but can be reused where you want in your page.

So if you put the two together, you get Web Components that can interact with Salesforce, either to access data or to be part of their application rendering loop. Which means Salesforce has made available this new bleeding edge web technology (Web Components) and allowed it to communicate very easily with Salesforce (Lightning).

## Meet the team

Before jumping on our experience with LWC, here are the members of our team that took part in the original exploration of this new framework.

### Jeremie Robert

> At Coveo for over a year, I am constantly working at better integrating Coveo with the Salesforce platform. Using Salesforce technologies (Apex, Visualforce, Aura, and now LWC) and other web technologies (ES6, TypeScript, CSS, and SASS) I build solutions that can be personalized by our clients and that respect the highest standards in terms of quality.

### Louis Bompart

> I've been a Software Developer at Coveo since August 2017, working mostly on the front-end side of the Salesforce integration and also the tooling associated with that project. I've started my web development learning process with [Polymer](https://www.polymer-project.org/) around early 2015 and I've been convinced of the potential of Web Components since then.

### Andre Theriault

> I've been part of the Salesforce Integration team for 4 years now as a developer. Most of my experience before that was as a backend software engineer. With Salesforce's efforts to use newer techs and up to date web standards, I learned to enjoy the frontend aspect of it all. It also got me interested in other frontend frameworks like "React" and Vue.js" and I was please to discover that Salesforce was planning to get more inline with current web standards with LWC.

### Etienne Rocheleau

> At Coveo for 4 years, my job consists of the exploration of all new technology from Salesforce. I am always looking for new ways to integrate Coveo with Salesforce to create a better experience for users. I produce a lot of demos, POCs, and prototypes as part of my exploration and I really love when people find new and interesting ways to use Coveo to solve an issue they have. I am very familiar with Salesforce technologies (Aura, Apex, Visualforce, Lightning, etc.) and outside of that, I have experience with JavaScript/TypeScript and some web frameworks such as React, Angular and others.

## Why switch to LWC when you are so involved with Aura?

We have about 3-4 years of experience with the Aura framework from Salesforce. Coveo was an early adopter of this new framework when it was announced and we jumped on the idea of creating these new Lightning components quickly. The majority of our Coveo for Salesforce integration's frontend is created using the Aura framework. So why decide to jump on this new framework when we already have a lot of experience with Aura?

> We saw an opportunity to streamline our integration and I think this was the deciding factor. We are a growing team for the Salesforce integration and after my initial exploration of the LWC framework I was convinced that it would allow for a much quicker development lifecycle, especially because we were embracing more the `sfdx` methodology at the same time. The opportunity was also there to reduce the ramp-up time for any new member of the team to learn to be productive with Salesforce technologies. Since all the development is made with mainly HTML/JavaScript, it was a lot quicker to try new things and verify the feasibility of a new feature we wanted to develop.

\- Etienne

> From a developer point of view, switching from Aura to LWC meant an access to better tools and following current web standards. We had put a lot of efforts to be able to have relatively good tests with Aura components, but with LWC it was part of the framework which in turn would mean a faster release cycle and higher product quality. To compare both, with Aura we could mainly do integration tests but we had to deploy the code to a Salesforce organization in order to test it. With LWC I knew we could do local unit tests which meant a lot quicker developement.
> 
> Also because I was already used to other web frameworks, I liked the simplicity of the boilerplate needed for LWC. Compared to Aura from a readability standpoint, LWC is better because of how the code is written. It makes the code clearer and clearer code means less mistakes.

\- Jeremie


## What did you decide to create as your first experience with LWC?

> Our Salesforce integration uses our own UI framework we have developed in house called the [Coveo Search-UI](https://github.com/coveo/search-ui). It is a collection of UI components all written in pure TypeScript that are used to build a search page. Our first component was a wrapper around this framework to integrate it within Salesforce and with LWC. This component is responsible of loading the required Static Resources and then initializing our framework.

\- Jeremie

```js
// Code simplified for the purpose of this post.
import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import SEARCH_UI from '@salesforce/resourceUrl/searchUi';

export default class SearchUi extends LightningElement {
  connectedCallback() {
    /** @type {Promise<void>} */
    this.stylesLoaded = this.loadStyles();
    /** @type {Promise<void>} */
    this.allScriptsLoaded = this.loadScripts();
  }

  loadStyles() {
    return loadStyle(this, `${SEARCH_UI}/css/CoveoFullSearchNewDesign.css`);
  }

  loadScripts() {
    // Prevent reloading of the library.
    if (window.Coveo) {
      return Promise.resolve();
    }
    return loadScript(this, `${SEARCH_UI}/js/CoveoJsSearch.js`))
      .then(() => loadScript(this, `${SEARCH_UI}/js/templates/templatesNew.js`));
  }

  renderedCallback() {
    Promise.all([this.allScriptsLoaded, this.stylesLoaded]).then(() => {
      // Everything is loaded, start the initialization of our framework.
      this.initializeSearchUI();
    });
  }
}
```

```html
<template>
  <lightning-card>
    <div class='search-ui-container' lwc:dom="manual"></div>
  </lightning-card>
</template>
```

> Above is an example of our first LWC component. It loads the CSS and JS files we need on the `connectedCallback` which is a lifecycle method that is called on component initialization by Salesforce. And then on the `renderedCallback` it initializes our framework, this method is also called by Salesforce when a component is rendered (our framework is designed to only initialize itself once). 
>
> Unfortunately, we cannot rely on some of the DOM improvements provided by the shadowDOM since we handle our own rendering loop of our components. This is done in the template file by activating `lwc:dom="manual"` on our element container. But since we are already pure JavaScript and following web design principles, it is still really fast.
>
> Having done a lot of the initial investigation on LWC, I was eager to be able to share my knowledge with the rest of the team. And let's not forget [Trailhead](https://trailhead.salesforce.com/) which offers very well built learning paths for content such as the LWC framework. It was a very good introduction to understand how this new programming model worked and integrated with Salesforce. I knew it would be easy to pick up for my teammates and that they would love working with LWC.

\- Etienne

## What was your first impression?

> First impression was to say Wow, I can actually base my code off of the MDN standards since it respects the recent web standards. I was really impressed by this because it meant all the *staying up to date* I was putting time on would be very useful with LWC. This felt like a brand new project that I could easily get started on. Compared to other emerging frameworks, there was a ton of documentation, learning paths (on [Trailhead](https://trailhead.salesforce.com/)) and examples on GitHub to find what you are looking for. I started small by doing trails on Trailhead with the GitHub repositories already setup for LWC. And I really appreciated how well all of it was integrated with [`sfdx`](https://developer.salesforce.com/tools/sfdxcli) and [VSCode](https://code.visualstudio.com/). It made it very simple to develop locally, push to a *scratch org* and test.

\- Louis

> From the original exploration of LWC, I found that it made a lot of sense to use the declarative approach from the LWC framework. It is very clear, simple and elegant the way you describe a component's *API*. 

```js
import { LightningElement, api } from 'lwc';
import myApexMethod from '@salesforce/apex/MyClassName.myMethod';

export default class MyComponent extends LightningElement {
  @api 
  publicProperty;

    
  @wire(myApexMethod, { myParam: 'myValue' })
  wireHandler({data, error}) {
    // do something.
  };
}
```
> You clearly see what is exposed publicly outside of your component. It makes it easy to use composition of components, it is similar to React, but uses the shadow DOM to process rendering and to encapsulate behavior and data. And the `@wire` decorator makes it very simple to understand clearly that you are calling Apex declaratively and letting Salesforce take care of caching the information.

\- Jeremie

## Can you go in more details on what changed compared to the way of doing things with Aura?

> With our use of LWC we also have taken a good look at our project structure that had a strong impact on our build process and automated deployment of changes. Our project's source code is organized by logical entities that we could call a *module*. For example, our AgentPanel or StandaloneSearchbox each regrouped both Salesforce specific files such as their respective Aura component but also some TypeScript code, Sass files and even Gulp tasks. So everything related to one *module* was in one folder. This forced us over time to use more and more Gulp tasks to transpile/compile/move files around to create a folder structure that respects the Salesforce expected folder structure. This Salesforce folder structure is organized instead around types, all Aura components together, all Static Resources together, etc.
> 

![Coveo SFINT folder structure]({{ site.baseurl }}/images/2019-04-15-LWC/project_structure.png)

> With the new advantages provided by `sfdx` but also the improved intellisense from the LWC framework, we now have reason enough to look at making the switch to the Salesforce folder structure instead. This new structure simplifies a lot our build process because we can remove a lot of the manual files handling with Gulp. I still feel however that more freedom with how the files are organized could go a long way to facilitate adoption of LWC by different teams because each team will have their own folder structure.
>
> Before `sfdx` we used to leverage [JSforce](https://jsforce.github.io/) to do some of the deployment, many utils function we created over the years and a custom JavaScript wrapper around `sfdx` [sfdx-js](https://www.npmjs.com/package/sfdx-js) to handle our deployment. Using this method, with every change we wanted to test, we had to deploy over 300 files with the Metadata API, it took long enough to be able to stay up to date on Hacker News in between deploys. Now with the `sfdx` folder structure, only files that have changed are redeployed which takes seconds now instead of minutes. Multiply this by the number of times we deploy per day and per the number of members of the team, it is a huge time gain.

\- Louis

> Quote from Andre about previous pain points around not using sfdx/Aura components.

## And if I understand correctly LWC allowed the team to vastly improve the automatic tests of the product?

> With the support of local unit testing with [Jest](https://jestjs.io/) of Lightning Web Components, we can now truly say that we are testing the great majority of our package. We had tests before with [Mocha](https://mochajs.org/) for all of our TypeScript components which were used by our Aura components. And we recently also started using the [Lightning Testing Service](https://github.com/forcedotcom/LightningTestingService) to test our Aura components. We also pushed it further using [Nightwatch](http://nightwatchjs.org/) for end-to-end testing. But nothing compares to the simplicity of having local running unit tests with Jest on our Lightning Web Components. Instead of having to deploy our entire code to Salesforce to test a new feature, we can now simply write and run tests locally on the components we create. Which also means all these tests can easily be automated in the context of Continuous Integration. This adds a quality layer that was much harder to have before LWC.

\- Louis

> The way unit testing is implemented with LWC forces us to scope our tests to only the component features. For example, you cannot rely on a `loadScript` to get external content and you should mock these. This helps us building better self contained components and the test that go with them. Personally, I like to keep [Jest](https://jestjs.io/) running in watch mode while I write my tests and watch the code coverage metric increase as I test more and more of the component's features and corner cases.

\- Jeremie

## What would be the lessons learned for someone who would want to start using Lightning Web Components?

> Don't try to change or implement everything at once. Just like learning a new language or framework, you want to start with a solid base and build on top of it. I would say, start with a minimum viable component, along with unit tests (around 75% code coverage) to get familiar with LWC. You can switch to the `sfdx` format later if you already have a package because this is a pretty big leap to take. You can apply the rule that new features you add should be made in LWC instead of in an Aura component and that should help you migrate. This is what we chose to do, a simple but solid base component and we will be building around it in the future knowing it is well tested.

\- Louis

> Some gotchas to take into account that had me searching for a little while:
>
> 1. As of writing this post, LWC do not allow for custom decorators, only the ones provided by Salesforce and the LWC framework. JavaScript decorators are still only a proposition to ECMAScript, but seeing the decorators offered by Salesforce makes me want to be able to create my own. For example, I would like to create a `@log({level: 'info'})` decorator to mark a method to log to the console for tracking purposes. Or one of the frequently seen usecase with LWC, `@executeOnce` could be useful too.
> 2. Be wary of the difference between `this.querySelector`, `this.template.querySelector`, and `element.shadowRoot.querySelector`. The first one is used to search the DOM in a *slot*, the second one is used to search within the body of your LWC, and the third one is used within unit tests.

\- Jeremie

> Don't be afraid to make "utils" component. LWC allows you to easily import multiple component into one so make sure your code is clean and well seperated. It also makes thing easier to test and allows you to re-use  specific part of your application in other components.

\- Andre

> It feels very natural to develop with LWC. It seems like the design decisions make sense and the integration with Salesforce's backend feels seamless. I am sure it will be easier to ramp up a new member of the team with LWC. One of the best lesson learned over the years is to *keep it simple* and LWC lets us do that. We can have clearly defined building blocks (components) that are designed to be re-used by our multiple integration points within Salesforce. Our package structure is simpler and well organized because one component regroups HTML, JavaScript and CSS. And LWC grants us enough freedom to keep most of the (Coveo Search-UI)[https://github.com/coveo/search-ui] simply as a Static Resource. And that way we can control the DOM of our search page manually while the LWC integration is in charge of the connection to Salesforce's data and API that we need to provide a great user experience.

\- Etienne

## What will the future look like for the Coveo for Salesforce integration team?

> The Coveo for Salesforce integration package grew a lot over the past years. We've obviously added a lot of new features, but with the transition from Visualforce to Aura, and now the transition to LWC, our package is full of relics. We look forward to committing more resources to LWC and phasing out more and more Visualforce bit by bit. With LWC being closer to web standards than either Visualforce and Aura, we hope to be able to grow the team even faster by bringing in more web developers into the Salesforce ecosystem. Looking back at the past years and seeing what our integration package will be like in a short time once we achieve what we are planning makes us excited to see what Salesforce will become in the future.

\- Andre

## Would you like to know more?

### Read more on [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) (MDN)

### Read more on [Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.get_started_introduction) (developer.salesforce)