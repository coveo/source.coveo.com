---
layout: post

title: "Beyond ranking expressions"

tags: [relevance,ranking expressions,analytics,query pipeline]

author:
  name: Alexandra Rioux
  bio: Solution Architect
  twitter: alexandrarioux1
  image: ariouxphoto.png
---

Being able to return relevant results is one of the key qualities of a successful site search. But it's not something you can just turn a switch on. Relevance is a result of multiple factors: strong data to feed machine learning models, an intuitive UI, and multiple custom rules depending on your audience.

This blog article will showcase how you can improve your usage of ranking expressions to the next level.

<!-- more -->

When thinking about possible custom rules, you might already be familiar with the concept of the thesaurus, featured results, or even ranking expressions. One of the most direct ways you can influence relevance in your search solution is by designing and using query ranking expressions (QREs).

[Ranking expression](https://docs.coveo.com/en/2777/coveo-solutions/using-query-ranking-expressions) rules are especially useful when you need to enforce specific or temporary business rules which Coveo ML could otherwise hardly deduce from natural end-user behavior. 

By default, the index computes a unique ranking score for each query result item based on various standard factors such as the modification date. A QRE allows you to further increase (or reduce) the ranking score of a specific subset of query result items by a fixed amount (see [Understanding Search Result Ranking](https://docs.coveo.com/en/1624/cloud-v2-administrators/understanding-search-result-ranking))

In my example, I want to demonstrate how you can boost results based on the number of likes a video has received. Keep in mind that the process is similar for a commerce use-case where you might want to boost items that have received multiple reviews, or in a workplace use-case where you might want to favor Discourse posts that received multiple answers.

## Search page without any rules

Here is my page without any custom rules:

![Search result page without any rules]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/NatGeo-NoRules.png)

I want my results to be influenced by a rule that considers the number of likes per video, but I do not want it to have a too strong influence on results

## Adding ranking expressions

With a ranking expression, I would be able to boost videos that received multiple likes. However, it would require me to create multiple rules since I want to treat videos that received 50 likes differently than videos that received 1000 likes. 

![Ranking expressions in query pipeline]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/RankingExpressions.png)

Because of this and the possible range of likes a video can receive, it might be a better idea to use a query ranking function.

## Dynamic boosting

A [query ranking function (QRF)](https://docs.coveo.com/en/237/) is a mathematical expression evaluated against each item returned by a query, and whose potentially normalized output is added to the ranking score of the current item.

You could create a rule by simply leveraging the number of likes:

![Ranking expressions in query pipeline]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/QRFLinear.png)

Despite that this rule is functional, it is far from optimal. A video that contains 65,468 likes would have an additional boost of 65468 points, making other ranking factors pointless. As we see in the image below, despite not having any search keyword in the title or being recent, I have two videos appearing at the top simply because they received a lot of likes. 

![Ranking expressions in query pipeline]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/Linearboostingscore.png)

## Soften the boost

When creating my rule, I need to figure out a way to soften my boost, since the value of `ytlikecount` field has a wide range. This can be solved by adding a logarithmic function with the following formula:

![Ranking expressions in query pipeline]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/QRFLogfunction.png)

The formula starts with `$qrf`. The $qrf injects a query ranking function in the query, effectively creating a custom ranking algorithm for that query. 

You then have expression:`log(@ytlikecount)*20`. Logarithmic functions are the inverse of exponential functions. This is why it is important to add this function when a field contains a wide range of numbers.

![Ranking expressions in query pipeline]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/LOGChart.png)

Finally, you can also see the `normalizeWeight` parameter at the end of the equation. The default value is `false`. Unless you want to completely override the index ranking and use the results of this query ranking function directly to boost the ranking scores of query results, you should always set this to `true`. In this case, we do not want to completely override the index ranking, which is why we keep the value to `false`. 

![Ranking expressions in query pipeline]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/QRFFilter.png)

Once this rule is implemented, I will see the following results for the same query:

![Ranking expressions in query pipeline]({{ site.baseurl }}/images/2020-08-25-beyond-ranking-expressions/NatGeo-Rule.png)

## Taking it further

We are able to notice that we are getting the same first 5 results, but the ranking of each result is different. This tells us that our new rule is slightly impacting results without taking over other factors affecting relevance. 

Creating rules can be a bit confusing at first. This is why I recommend becoming familiar with the various concepts. Make sure to read this section of our documentation to help you understand: [Standard Query Extensions](https://docs.coveo.com/en/1462/cloud-v2-developers/standard-query-extensions)

