---
layout: post

title: "6 Tips To Help You Design A Good People Search Experience"

tags: [people search, ux]

author:
  name: Alexandre Moreau
  bio: Solution Architect
  twitter: amoreaucoveo
  image: amoreauCoveo.jpg
---

As a Solution Architect, I recently had to help design and evaluate quite a few different people search pages, both public (e.g., lawyer or doctor search), or in intranet environments (e.g., employee directory).

Doing so many people search implementations one after the other really made me think about the different ways in which searching for people is different than searching for documents or products.

This article will focus on the public people search pages, and how to best design them.

Do note that most of these tips are specifically tailored to Coveo. However, the same principles can be applied with different search providers, though the exact way to achieve this might be more complex.

<!-- more -->

## What Is A Public People Search Page?

A public people search page is a search page designed to let people — usually clients — either find someone specific, or find someone based on their needs. 

Usually, the result page itself will contain the contact information for that person (either phone number or email address), some tags to indicate their areas of expertise, as well as a link to access their full profile.

The page will also usually feature filtering mechanisms to help people refine their requests. It's also likely that the person's location will be taken into account during the query, to rank the people closest to the end user higher in the result list.

## How Is It Different Than Document or Web Page Search?

One of the most important distinctions in my opinion is that a people search page has to answer to two different audiences: the external users searching for someone on the page, and the people on the page themselves, who might directly benefit from being ranked higher in the search results. Keeping the balance between these two audiences is key to designing a good people search experience.

Another important difference is that the people search page will usually have a result template with most of, if not all of the relevant information on the result templates. This means that, a lot of times, there is no need to click on the results, as the information you need (e.g., phone number or email address) is already available directly from the page.

Without clicks, Coveo Machine Learning cannot know that the user's query was successful, and will thus not learn from that event as it is an unsuccessful one.

Now, I am definitely not advising that you should hide this kind of relevant information from the result templates to force the users to click on the results — on the contrary; we want end users to find what they are looking for as quickly as they can. But you do need to keep in mind that Machine Learning is not going to be as effective here as it would be on your other search pages.

## How Do You Design The Experience?

Keeping in mind the differences stated previously, here is how you design a search experience for a people search page:

### 1. Use Card Layouts With Big Pictures

In a classic document-oriented search page, you usually want to have the result in a list, with descriptions (or excerpts) that run on and highlight the relevant sections of the document based on the user's query.

However, a people search page should show the end users the picture of the person they are searching in a grid, not in a list.

This allows the users that know who they are looking for to more easily scan the result page. The excerpt component is also less relevant in this scenario, as it is less likely that people will search for details of the person's profile, as opposed to searching for their name or for their areas of expertise.


### 2. Sort In Alphabetical Order By Default; Switch To Relevance When There Is A Query

When searching for people, users expect to see a directory in alphabetical order (usually by last name). This is especially expected of the people on the page, who are likely to want to understand the exact reasons why their profile is ranked where it is.

Usually, Coveo recommends that you sort results by **Relevance** by default. However, it can be hard to explain to the people on your search page why their profile is not in the top results, as it can be hard to explain why a result is considered more relevant (especially when you add Machine Learning in the equation).

For this reason, it is reasonable to say that sorting by alphabetical order is the best way to go.

That being said, when the end users is searching using a query, they want to have the most relevant results first. For this reason, it is a good idea to implement logic that switches the sort option based on whether the user has performed a query.

While Coveo does not have an out-of-the-box component to do this, you can change the sort parameter at query time, by intercepting the query (see [Query Events](https://docs.coveo.com/en/417/javascript-search-framework/javascript-search-framework-events#query-events)), and changing the [Coveo State](https://docs.coveo.com/en/344/javascript-search-framework/javascript-search-framework-state) parameter to reflect this change.

### 3. Turn Off Automatic Relevance Tuning

The Coveo Machine Learning Automatic Relevance Tuning model is a machine learning model that allows results to be reranked or injected based on previous user's interactions. While this is a boon for finding products or documents, it isn't the best experience when activated on a people search page.

For this reason, it's better to not implement ART for your people search pages.

### 4. Taking Geolocation Into Account

This recommendation does not apply to all use cases, but can be extremely beneficial in other cases.

When a user is searching for someone, it is likely that they are looking for someone within their area. While an oncologist from three states away might be a good fit for your user, it's more likely they will prefer to meet with an oncologist from the town closest to them.

For this reason, you will likely want to implement a way to boost the people that are within their area, or to use a function to decide how many points to add.

Coveo supports both of these options, using [Ranking Functions](https://docs.coveo.com/en/1448/cloud-v2-developers/ranking-functions). The exact function you will want to integrate depends on your specific use case, as well as the data you are working with.

### 5. Consider Mixing Field Suggestions and Query Suggestions

Coveo offers a few ways to suggest queries to end users. We usually recommend using only Machine Learning Query Suggestions, as it learns from end user interactions and continually improves to present the most relevant suggestions to the users. However, there exists another — more static — way of suggesting queries: field suggestions.

By implementing field suggestions, you can suggest the names of the people on the page as the user is typing. I believe people search pages are better suited for field suggesitons because, for a significant portion of your audience, your users are looking for a specific person. Enabling field suggestions thus allows a form of autocomplete to their queries without requiring previous users to have already searched for those people and clicked on their profiles.

However, you usually have another significant portion of your audience that are not searching for specific people. For this reason, you should also enable query suggestions.

Thankfully, both mechanisms can coexist, by enabling both simply options. The default behaviour is that the query suggestions (those powered by Machine Learning) will be at the top of the suggestion list, while suggestions based on the field value will follow, usually marked by a title to distinguish them.

For more information on both of those functionalities, see [Providing Search Box Suggestions](https://docs.coveo.com/en/340/javascript-search-framework/providing-search-box-suggestions).

### 6. Add Thesaurus Rules For Hypocorisms

Hypocorisms — or nicknames — are not automatically understood by Coveo. This means that searching for "Mike" will not return all Michael's in your index — it will only return people with Mike in their names or descriptions.

To solve this, you are encouraged to add thesaurus rules in your Coveo Cloud organization (see [Adding and Managing Query Pipeline Thesaurus Ryles](https://docs.coveo.com/en/1738/cloud-v2-administrators/adding-and-managing-query-pipeline-thesaurus-rules)).

Another option would be to have people with common nicknames add it to their description. This would allow Coveo to return that person when people search for the nickname. However, their ranking would not be as high, which can lead to reduced visibility for those people.

All in all, the thesaurus solution is the best way to implement this functionality.

## Conclusion

Implementing a people search page is a bit different from implementing your run-of-the-mill document or web page search. However, while a few things are different, the same general relevance principles apply.

Next time you are looking to implement a public page to search for people, keep those recommendations in mind, and you should end up with a search experience that is more relevant and well adapted to your end users.