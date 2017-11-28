---
layout: post
title: "Creating a Custom Randomizer Component"
tags: [coveo-search-ui, Custom Component, TypeScript, CoveoFeelingLucky]
author:
  name: Alexandre Moreau & François Lachance-Guillemette
  bio: Technical Writer and Coveo for Sitecore Developer
  image: amoreauflguillemette.jpeg
---
In our last post about [Randomizing Results from a Coveo Index](http://source.coveo.com/2017/06/20/randomizing-results-from-a-coveo-index/), we talked about how we managed to create a search page that returns random results from our index.
Following this, we wanted to have a full-fledged custom component for the sake of doing things cleanly (we love "clean" at Coveo).

This post will go in-depth about our journey to "Component-ize" our randomizer using TypeScript.

<!-- more -->

## Setting up the project

We started the project using the [search-ui-seed](https://github.com/coveo/search-ui-seed) starter, which is in [TypeScript](https://www.typescriptlang.org/).
After some quick changes to name our components, we ended up with a starter `CoveoFeelingLucky.ts` file:

```ts
import {
  Component,
  ComponentOptions,
  IComponentBindings,
  Initialization
} from 'coveo-search-ui';
export interface ICoveoFeelingLuckyOptions {}
export class CoveoFeelingLucky extends Component {
  static ID = 'FeelingLucky';
  static options: ICoveoFeelingLuckyOptions = {};
  constructor(public element: HTMLElement, public options: ICoveoFeelingLuckyOptions, public bindings: IComponentBindings) {
    super(element, CoveoFeelingLucky.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(element, CoveoFeelingLucky, options);
  }
}
Initialization.registerAutoCreateComponent(CoveoFeelingLucky);
```

The code is rather straightforward by itself. Let's jump straight into the process to add our required features.

## Adding the Toggle Button

We first needed a togglable button, so we defined the `feelingLucky` private Boolean variable, and a click event to toggle this variable. We also added a `selected` class to ensure you can set custom CSS on it while it is selected.

After all of this is done, we trigger a new query when the button is clicked.

```ts
export class CoveoFeelingLucky extends Component {
  ...
  private feelingLucky: boolean;
  constructor(public element: HTMLElement, public options: ICoveoFeelingLuckyOptions, public bindings: IComponentBindings) {
      super(element, CoveoFeelingLucky.ID, bindings);
      this.options = ComponentOptions.initComponentOptions(element, CoveoFeelingLucky, options);
      this.feelingLucky = false;
      this.element.addEventListener('click', () => this.handleClickEvent());
  }
  private handleClickEvent(): void {
    this.feelingLucky = !this.feelingLucky;
    this.element.classList.toggle('selected');
    this.searchInterface.queryController.executeQuery();
  }
  ...
  private isFeelingLucky(): boolean {
    return this.feelingLucky;
  }
}
```

Then we brought back the function mentionned in our previous blog post, but added some flexibility to it.

```ts
export class CoveoFeelingLucky extends Component {
  ...
  private applyFeelingLuckyToQueryBuilder(queryBuilder: QueryBuilder,
                                          randomField: IFieldOption,
                                          maximumRandomRange: number): void {
    const randomNumber = Math.floor(Math.random() * maximumRandomRange);
    // Create a ranking expression, shifting every randomField value to a random number, and wrapping them with the maximum range.
    // This ensures that we have different results every time.
    const rankingFunction: IRankingFunction = {
      expression: `(@${randomField} + ${randomNumber}) % ${maximumRandomRange}`,
      normalizeWeight: false,
    };
    queryBuilder.rankingFunctions.push(rankingFunction);
    // Adds @randomField to the expression to ensure the results have the required field.
    queryBuilder.advancedExpression.add(`@${randomField}`);
    // Use the empty pipeline to remove Featured Results, Automatic Ranking, and all the other pipeline features.
    queryBuilder.pipeline = '';
    queryBuilder.sortCriteria = 'relevancy';
    queryBuilder.maximumAge = 0;
  }
  ...
}
```

And then registered the `buildingQuery` event to use this new method.

```ts
export class CoveoFeelingLucky extends Component {
  ...
  constructor(public element: HTMLElement, public options: ICoveoFeelingLuckyOptions, public bindings: IComponentBindings) {
      super(element, CoveoFeelingLucky.ID, bindings);
      this.options = ComponentOptions.initComponentOptions(element, CoveoFeelingLucky, options);
      this.feelingLucky = false;
      this.element.addEventListener('click', () => this.handleClickEvent());
      this.bind.onRootElement(QueryEvents.buildingQuery, (args: IBuildingQueryEventArgs) => this.handleBuildingQuery(args));
  }
  ...
  private handleBuildingQuery(args: IBuildingQueryEventArgs): void {
    if (this.isFeelingLucky()) {
      this.applyFeelingLuckyToQueryBuilder(args.queryBuilder, "randomfield", 1000000);
    }
  }
}
```

Since the number of results can change during the `buildingQuery` event, we use the `doneBuildingQuery` event to ensure that it is executed last.

```ts
export class CoveoFeelingLucky extends Component {
  ...
  constructor(public element: HTMLElement, public options: ICoveoFeelingLuckyOptions, public bindings: IComponentBindings) {
    super(element, CoveoFeelingLucky.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(element, CoveoFeelingLucky, options);
    this.feelingLucky = false;

    this.element.addEventListener('click', () => this.handleClickEvent());

    this.bind.onRootElement(QueryEvents.buildingQuery, (args: IBuildingQueryEventArgs) => this.handleBuildingQuery(args));
    this.bind.onRootElement(QueryEvents.doneBuildingQuery, (args: IDoneBuildingQueryEventArgs) => this.handleDoneBuildingQuery(args));
  }
  ...
  private handleBuildingQuery(args: IBuildingQueryEventArgs): void {
    if (this.isFeelingLucky()) {
      this.applyFeelingLuckyToQueryBuilder(args.queryBuilder, this.options.randomField, this.options.maximumRandomRange);
    }
  }
  private handleDoneBuildingQuery(args: IDoneBuildingQueryEventArgs): void {
    if (this.isFeelingLucky()) {
      args.queryBuilder.numberOfResults = 1;
    }
  }
}
```

## Adding Other Options

We thought it would be nice to be able to easily change the text of the component, so we added the `title` option to do that.

```ts
export interface ICoveoFeelingLuckyOptions {
  title: string;
}
...
export class CoveoFeelingLucky extends Component {
  static options: ICoveoFeelingLuckyOptions = {
    title: ComponentOptions.buildStringOption()
  };
  constructor(public element: HTMLElement, public options: ICoveoFeelingLuckyOptions, public bindings: IComponentBindings) {
      super(element, CoveoFeelingLucky.ID, bindings);
      this.options = ComponentOptions.initComponentOptions(element, CoveoFeelingLucky, options);
      this.feelingLucky = false;
      this.buildDomContent();
      ...
  }
  private buildDomContent(): void {
    if (typeof(this.options.title) !== 'undefined' && this.options.title != '') {
      this.element.appendChild(this.createTitleChild());
    }
  }
  private createTitleChild(): HTMLElement {
    const title = document.createElement('span');
    title.innerHTML = this.options.title;
    return title;
  }
  ...
}
```

We also wanted to hide certain components that don't make sense when you only have one result: the pager, sort, and summary components.

To make it easily customizable, we made an option for this.

```ts
export interface ICoveoFeelingLuckyOptions {
  title: string;
  classesToHide: string[];
  hiddenComponentClass: string;
}
...
export class CoveoFeelingLucky extends Component {
  static options: ICoveoFeelingLuckyOptions = {
    title: ComponentOptions.buildStringOption(),
    classesToHide: ComponentOptions.buildListOption<string>({
      defaultValue: ['CoveoPager', 'coveo-sort-section', 'coveo-summary-section']
    }),
    hiddenComponentClass: ComponentOptions.buildStringOption({
      defaultValue: 'hiddenFeelingLucky'
    }),
  };
  ...
  private handleClickEvent(): void {
    this.feelingLucky = !this.feelingLucky;
    this.element.classList.toggle('selected');
    this.hideElementsWithClassesToHide();
    this.searchInterface.queryController.executeQuery();
  }
  private hideElementsWithClassesToHide(): void {
    const selector = this.options.classesToHide
                                 .map(classToHide => `.${classToHide}`)
                                 .join(', ');
    const elements = this.root.querySelectorAll(selector);
    for (let i = 0, length = elements.length; i < length; i++) {
      elements[i].classList.toggle(this.options.hiddenComponentClass);
    }
  }
  ...
}
```

Our three personalizable options for the actual randomizer would then look like this.

```ts
export interface ICoveoFeelingLuckyOptions {
  ...
  randomField: IFieldOption;
  maximumRandomRange: number;
  numberOfResults: number;
}
export class CoveoFeelingLucky extends Component {
  static options: ICoveoFeelingLuckyOptions = {
    ...
    randomField: ComponentOptions.buildFieldOption({
      defaultValue: 'randomfield'
    }),
    maximumRandomRange: ComponentOptions.buildNumberOption({
      defaultValue: 1000000
    }),
    numberOfResults: ComponentOptions.buildNumberOption({
      defaultValue: 1
    })
  };
  ...
  private handleBuildingQuery(args: IBuildingQueryEventArgs): void {
    if (this.isFeelingLucky()) {
      this.applyFeelingLuckyToQueryBuilder(args.queryBuilder, this.options.randomField, this.options.maximumRandomRange);
    }
  }
  ...
  private handleDoneBuildingQuery(args: IDoneBuildingQueryEventArgs): void {
    if (this.isFeelingLucky()) {
      args.queryBuilder.numberOfResults = this.options.numberOfResults;
    }
  }
  ...
}
```

## Result

The result of this whole code allows us to define a component that will automatically be created within a `CoveoSearchInterface`.
With this new component, you can now simply add the following tag in your search page and get a togglable "I'm Feeling Lucky" button.

```html
<a class="CoveoFeelingLucky"
   data-title="I'm feeling lucky!"
   data-random-field="myrandomfield"></a>
```

Here is the result when inserted after a `CoveoSearchBox` component:

![CoveoFeelingLucky](/images/2017-11-28-feeling-lucky-component/CoveoFeelingLucky.png)

All of the options defined in the component are configurable using the easy-to-use `data-` attributes, just like any other [coveo-search-ui](https://coveo.github.io/search-ui/) component.

This makes for a very flexible component that can easily be configured just by looking at the markup.

Click the following links to download the component source files: [CoveoFeelingLucky.ts](https://gist.github.com/francoislg/f3f174f88f49d8043aa09199490ce030) and [CoveoFeelingLucky.css](https://gist.github.com/francoislg/b58dd2230c98bb10278c683554e7f352)

In our next blog post, we will cover how to add unit tests to this component using the `coveo-search-ui-tests` framework.