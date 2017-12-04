---
layout: post
title: "Testing a TypeScript Custom Component"
tags: [coveo-search-ui, Custom Component, TypeScript, CoveoFeelingLucky]
author:
  name: François Lachance-Guillemette
  bio: Coveo for Sitecore Developer
  image: flguillemette.jpg
---
Now that we have [created a custom component](http://source.coveo.com/2017/11/30/randomizer-as-a-component/), we want to test its interactions with the Coveo JavaScript Search Framework.

This post offers a deep dive into the Custom Coveo JavaScript component testing world.

<!-- more -->

## Understanding the coveo-search-ui-tests library

Our last project started with the [search-ui-seed](https://github.com/coveo/search-ui-seed) starter project, which is written in [TypeScript](https://www.typescriptlang.org/).

This starter project references the [coveo-search-ui-tests](https://github.com/coveo/search-ui-tests), which is a simple library used to initialize environment variables that match the Coveo JavaScript Search Framework behavior.

It uses the [jasmine](https://jasmine.github.io/) framework for testing, so this article will use jasmine too. However, other frameworks should also work.

We already have a test file for the `HelloWorld` component in the `tests/ui` folder. Duplicate the `HelloWorld.spec.ts` file, and name it `CoveoFeelingLucky.spec.ts`.

Replace some names in this file, scrap the code that does not belong to the `CoveoFeelingLucky` component, and you should end up with something that looks similar to this:

```ts
import { CoveoFeelingLucky, ICoveoFeelingLuckyOptions } from '../../src/ui/CoveoFeelingLucky';
import { Mock, Fake, Simulate } from 'coveo-search-ui-tests';
import { $$, InitializationEvents, QueryEvents, IBuildingQueryEventArgs } from 'coveo-search-ui';

describe('CoveoFeelingLucky', () => {
    let feelingLucky: Mock.IBasicComponentSetup<CoveoFeelingLucky>;

    beforeEach(() => {
        feelingLucky = Mock.basicComponentSetup<CoveoFeelingLucky>(CoveoFeelingLucky);
    });

    afterEach(() => {
        // Safe-guard to ensure that you don't use `feelingLucky` inbetween tests.
        feelingLucky = null;
    });

    // Remove this after you have validated that tests from this file are run.
    it('should work', () => {
        // Run fast if this test fails.
        expect(true).toBe(true);
    });
});
```

We have added a simple test to ensure that the tests are run. Execute the `npm run test` command (defined in the `coveo-search-ui-seed`'s `package.json` file) and validate that your test is executed (and passing 🙏).

`Mock.basicComponentSetup<CoveoFeelingLucky>(CoveoFeelingLucky);` is a utility that creates the given component with a mocked environment. `feelingLucky` is now an object that has two properties: `cmp` and `env`.

`cmp` should be used when you want to interact with the component.

`env` should be used when you want to interact with the environment.

## Our first tests

Let's start with a very simple test. We want to ensure that the component is `disabled` by default.

```ts
it('should be disabled on initialization', () => {
    expect(feelingLucky.cmp.getCurrentState()).toBe(false);
});
```

Now, the main functionality of this component is to add a random query ranking function and pick the first result out of the query. We should at least validate that we set the number of results:

```ts
describe('when active and with the default options', () => {
    beforeEach(() => {
        feelingLucky.cmp.toggle();
    });

    it('should set in the query builder the number of results to 1', () => {
        const result = Simulate.query(feelingLucky.env);

        expect(result.queryBuilder.numberOfResults).toBe(1);
    });
});
```

The first part in the `beforeEach` block activates the component. We will reuse this block when we want the component to be active; As you have guessed, testing a disabled components has some limitations.

`Simulate.query` is a very useful helper from the `coveo-search-ui-tests` library that simulates [the whole query event stack](https://developers.coveo.com/x/bYGfAQ#Events-QueryEvents), similar to when a user enters a new query in the search box.

It returns an object containing the results of the complete event flow, which is very useful to validate that some attributes have changed.

We have proof that our component, when enabled, modifies the number of results.

Even more important, we also want to be sure that the component does *not* override the number of results when disabled. That would be disastrous.

```ts
describe('when disabled', () => {
    const originalNumberOfResults = 240;
    let queryBuilder;

    beforeEach(() => {
        queryBuilder = new QueryBuilder();
        queryBuilder.numberOfResults = originalNumberOfResults;
    });

    it('should not update the number of results', () => {
        const result = Simulate.query(feelingLucky.env, {
            queryBuilder: queryBuilder
        });

        expect(result.queryBuilder.numberOfResults).toBe(originalNumberOfResults);
    });
});
```

In this example, we provided our own query builder. This simulates an existing environment that has already configured the query builder.

We now have basic testing and can safely explore into more dangerous fields\*.

<sub><sup>\*aforementioned fields are not actually dangerous.</sup></sub>

## Testing the component options

We want to set the `randomField` to some specific value and test that my new, (arguably) better name is used instead of the (arguably) ugly default one.

So, let's validate this with the `aq` part of the query.

```ts
describe('when active and setting the randomfield option', () => {
    const someRandomField = 'heyimrandom';

    beforeEach(() => {
        const options: ICoveoFeelingLuckyOptions = {
            title: null,
            classesToHide: null,
            hiddenComponentClass: null,
            maximumRandomRange: null,
            numberOfResults: null,
            randomField: someRandomField
        };
        feelingLucky = Mock.optionsComponentSetup<CoveoFeelingLucky, ICoveoFeelingLuckyOptions>(CoveoFeelingLucky, options);
        feelingLucky.cmp.toggle();
    });

    it('should set the random field in the advanced expression', () => {
        const result = Simulate.query(feelingLucky.env);

        expect(result.queryBuilder.advancedExpression.build()).toContain(`@${someRandomField}`);
    });
});
```

The first difference is that we use another initialization method: `Mock.optionsComponentSetup<CoveoFeelingLucky, ICoveoFeelingLuckyOptions>(CoveoFeelingLucky, options);`.

This method is the same as `basicComponentSetup` but ensures that you pass the correct options type as a second argument, and type safety is always better! Kudos to TypeScript for type-safing my tests! 👏

We could also validate that we have a query ranking function that defines this random field:

```ts
it('should add the random field in the ranking function expression', () => {
    const result = Simulate.query(feelingLucky.env);

    expect(result.queryBuilder.rankingFunctions[0].expression).toContain(`@${someRandomField}`);
});
```

We could test the other options, but they would be tested similarly and would be redundant. Let's skip to another fun part.

## Core features testing

Our component is a button, so it would be very useful to validate that it gets activated when the button is clicked:

```ts
describe('when clicking on the button', () => {
    it('should toggle the state', () => {
        $$(feelingLucky.cmp.element).trigger('click');

        expect(feelingLucky.cmp.getCurrentState()).toBe(true);
    });
});
```

Here, to trigger a click event, we use the `$$` library from `coveo-search-ui`, which is a lightweight DOM manipulation library. It might look like `jQuery`, but really, it is not. Refer to the [DOM class](https://coveo.github.io/search-ui/classes/dom.html) documentation if you want an extensive list of features for this small library.

We could also check that toggling the state triggered a query. We can do that by overriding the method that we want to validate:

```ts
it('should execute a new query', () => {
    const executeQueryHandler = jasmine.createSpy('executeQueryHandler');
    feelingLucky.env.queryController.executeQuery = executeQueryHandler;

    $$(feelingLucky.cmp.element).trigger('click');

    expect(executeQueryHandler).toHaveBeenCalledTimes(1);
});
```

Remember how this is a randomizer? We should check that the ranking changes between queries:

```ts
it('should return different ranking function expressions for each query', () => {
    const firstQueryResult = Simulate.query(feelingLucky.env);
    const secondQueryResult = Simulate.query(feelingLucky.env);

    const firstExpression = firstQueryResult.queryBuilder.rankingFunctions[0].expression;
    const secondExpression = secondQueryResult.queryBuilder.rankingFunctions[0].expression;

    expect(firstExpression).not.toBe(secondExpression);
});
```

See that we can simulate two queries and compare them? Pretty useful!

## Wrapping it up

There are many more things that we could test, like:

* Validating the other attributes.
* Validating that specified components are hidden when the randomizer is active and displayed when the randomizer is deactivated.
* Other possibilities, only limited by human creativity.

The tests in this post cover many scenarios that you might come across when you want to test your own components, so the rest will be left as an "exercise to the reader" <sup>tm</sup>.

In the next and final installment, we will integrate this component in the Coveo for Sitecore Hive Framework.
