---
layout: post
title: "Randomizing Results from a Coveo Index"
tags: [Index Extensions, Query Extensions, coveo-search-ui, Custom Component]
author:
  name: Alexandre Moreau & François Lachance-Guillemette
  bio: Technical Writer and Coveo for Sitecore Developer
  image: amoreauflguillemette.jpeg
---

After reading the title of this post, you were probably wondering the same thing everyone asked us while working on this project:

***Why?***

And you would be right. Why would we want to remove Coveo's most useful features: Machine Learning, sorting, and automatically-tuned relevancy?

There are 4 reasons:

* For fun
* To try to get _different results_ each time you execute a query
* To test what we could achieve with the current infrastructure and tools
* But yeah, mostly for fun

This post will cover the road we had to walk to achieve such results.

<!-- more -->

## Context

Our first tests for this component came in August 2016, during a Coveo Hackathon, when we had the idea to use the Coveo index and UI to solve a problem many gamers like us have faced before: find the right game to play in the mountain of games we own.

Like a lot of gamers, we own different games of different genres on different platforms, and we don't always feel like playing the same genre on the same platform over and over again. Our idea was to index those games and create a search interface that could return a random game from our index.

We had a few criteria that our search page had to satisfy:

* Index metadata alongside the items and store it in fields
* Be able to filter according to those fields
* Return only one result per query
* Return a different, random result every time a search is performed, even when the query is the same

Thankfully, a normal out-of-the-box Coveo index allowed us to achieve the first three criteria very easily. However, that last one needed a bit more customization.

As an index built for _Enterprise_ search, the Coveo index is made to be relevant, not random.

During the course of the hackathon, we were however able to make our search page work and behave in the way we wanted it to. It was a great learning experience for the both of us, allowing us to touch aspects of Coveo we don't usually touch in our day-to-day lives. But, as is the case with too many hackathon projects, we let the project sleep in folders on our hard drives, accumulating digital dust. As fun as the project was, we didn't think any of our customers would want to use it.

But then, [this post](https://answers.coveo.com/questions/9226/how-to-add-a-random-number-to-ranking-weights.html) on [answers.coveo.com](https://answers.coveo.com) happened, and we knew we were not the only ones that wanted randomized results. That was when we decided to dust off the project and build it better so that we could share with the world the way we did it.

## Introducing a random field on items

First, we had to find a way to change the ranking based on a randomized value. Since the [Query Function](https://developers.coveo.com/x/XQCq) extensions does not allow the `rand()` operator, we had to find another clever way to handle this.

We though we could use the new [Indexing Pipeline Extensions](https://developers.coveo.com/x/uQIvAg) and its Python libraries to add a field that would be different for all documents.

We added a new field in our organization and coveniently named it `randomfield`. The field need to be the `Long` type; more information will come on that later.

We picked an arbitrarily large number (1000000) and injected that number value in a pretty simple extension:

```py
import random
randomValue = random.randint(1, 1000000)
document.add_meta_data({ 'randomfield': randomValue })
```

We then needed to apply that extension to every source to be included in the random results. These steps are subject to change, so we suggest you take a look at the documentation on [Applying an Indexing Pipeline Extension to a Source with the API](https://developers.coveo.com/x/IQMvAg).

## Adding a ranking function client-side

To leverage this random field, we used a Query Function that is used to "wrap" the results around and give a different ranking each time.

```js
let searchInterface = document.getElementById("mysearchinterface");
searchInterface.addEventListener(Coveo.QueryEvents.buildingQuery, function(args) {
  setFeelingLuckyInQueryBuilder(args.queryBuilder);
});

function setFeelingLuckyInQueryBuilder(queryBuilder): void {
  // Create a ranking expression, shifting every randomField value to a random number, and wrapping them with the maximum range.
  // This ensures that we have different results every time.
  let rankingFunction = {
    expression: "(@randomField + " + randomNumber + ") % 1000000",
    normalizeWeight: false,
  };
  queryBuilder.rankingFunctions.push(rankingFunction);

  // Adds @randomField to the expression to ensure the results have the required field.
  queryBuilder.advancedExpression.add("@randomField");

  // Use the empty pipeline to remove Featured Results, Automatic Ranking, and all the other pipeline features.
  queryBuilder.pipeline = '';
  queryBuilder.sortCriteria = 'relevancy';
  queryBuilder.maximumAge = 0;
  queryBuilder.numberOfResults = 1;
}
```

This code adds a ranking function that injects a random seed. The trick here is the modulo (`%`) operator. 

Since we know all the results are contained within 0 and 1000000, we are effectively changing the result that _will be boosted the most_ and bringing it up to the top.

We set the index to only return one result, so once the result with the best boosting is found, that result is returned. This is lightning-fast on a Coveo Cloud index, and has no impact whatsover.

## Caveats

We know this is far from a perfectly random solution. Here are some problems we know about.

### Even distribution

The largest issue is that the results are not evenly distributed.

If we happen to be unlucky, two random values might be too close to each other when the extension is executed in a way that the first result of the two is less likely to be picked by our ranking function.

However, this problem is mitigated if your items are constantly changing, since the value will be recomputed every time an item is reindexed or the index is rebuilt.

### More than one result

If you set more than one result and randomly get the same first result, the second result will also be the same second result.

In other words, our randomizer is _deterministic_. If you get the same seed twice, you will get the same results twice. 

It appears more random simply because we are only showing one result.

## Room for improvement

The previous code snippet gets us our randomizer, but there are a couple of features that we wanted to have:

* Add a togglable button to enable/disable the feature.
* Allow the button to be easily personalized
* Allow the button to be put anywhere in the page.
* Hide the sections that don't matter any more, like sorts, number of results, and so on when the button is selected.

This is why we turned to a custom `coveo-search-ui` component, which we will cover in our next blog post.
