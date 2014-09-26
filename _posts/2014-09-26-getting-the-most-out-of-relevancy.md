---
layout: post

title: "Getting the most out of relevancy"
#subtitle: "Part 1"


author:
  name: Karel Mpungi
  bio: Product Expert, Advanced Enterprise Search Platform
  image: kmpungi.jpg
---

You probably wondered how come a result is coming first and not the other when performing a query. Why the search result is ranked in a certain way and what can you do about it?

## How to check your ranking:

The best way to check your ranking is to enable the ranking information.

To enable the ranking information, just perform the query: “enablerankinginformation”

This will add to the result page some information about the ranking weights given to the documents (under Details - Ranking weights).

_Before enabling the ranking information:_

![Before enabling the ranking information]({{ site.baseurl }}/images/BeforeEnablingTheRankingInformation.png)

_After enabling the ranking information:_

![After enabling the ranking information]({{ site.baseurl }}/images/AfterEnablingTheRankingInformation.png)

6634 is the total from all the weight under ranking weights tab. Do not include the “100”, these are not ranking weights but percentage. These percentages are used by Coveo engineers for debugging purpose.

## Example

If you look at the total weight, you’ll realize that the first document listed is the one with the higher weight.

![Ranking Total Weight]({{ site.baseurl }}/images/RankingTotalWeight.png)

Notes:

- These information are only available for the user which have enabled the ranking information
- Enabling the ranking information uses a lot of additional memory in the ranking phase, so it should only be enabled temporary for analyzing ranking problem. To quit the ranking information mode, just perform the query: “disablerankinginformation”

## Relevance ranking steps:

Relevance ranking has phases, each of them working on the documents sorted by the preceding phase.

1. First phase is performed on all documents, and tries to weight the query terms (is a term in the title, in the summary, in the concepts, etc).
2. The second phase is performed on a maximum of 50,000 documents, and weights the date and quality of the documents.

    A phase has been inserted between the second and the third, and was named the Collaborative Ratings phase. This phase takes collaborative ratings information into account.

3. The third phase is more computing intensive, the goal here is to weight terms while taking their number of occurrences into account.
4. The last phase, which has no name, is the phase where we compute the adjacency between the query terms, giving more weight to documents having the terms close together.

As usual, every application comes with a default setting, and most of the time users can modify those settings so the ranking will match their own preferences.

The ranking process is not an exception to that rule. Coveo comes with many features that will help you achieve your goal.

In the next topics, I’ll provide you with detailed information on some of the features that you can use to personalize or customize the way your documents should be ranked.
