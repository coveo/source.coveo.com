---
layout: post

title: "Improving Large Site Search Relevance Part 1: Introducing Scoped Search"

tags: [Scope, Search, UX, Best Practices]

author:
  name: Charles-Erick Bélanger-Gagnon
  bio: UX Designer, Products
  twitter: CharlesErickBG
  image: cebelanger.jpg
---

![People searching through lots of items]({{ site.baseurl }}/images/2019-07-11-scoped-search-introduction/anthony-martino-335460-unsplash.jpg)
<figcaption>Photo by <a href="https://unsplash.com/@amartino20" target="_blank">Anthony Martino</a> on <a href="https://unsplash.com/" target="_blank">Unsplash</a></figcaption>

It is safe to say that most web users have taken advantage (or been victim) of scoped search at least once in their life, be that deliberate or not. According to the <a href="https://www.nngroup.com/articles/scoped-search/" target="_blank">Nielsen Norman Group</a>, scoped search refers to the principle that “**allows users to limit their search to a section or type of content [...] instead of searching everything in one go.**” <sup>1</sup>.

<!-- more -->

If you have ever used a **drop-down list linked to the search field** on a website, consulted scope information displayed **within the autocomplete suggestions**, clicked **tabs**, or even checked **top-level facets** in the search engine results page (SERP), then you have most probably experienced scoped search. If not, it might as well be because it happened automatically according to your search terms and you just did not notice it.

We often see scoped search on big websites (like Amazon) while on smaller websites that's rarely the case. 

Well, that’s no coincidence. 

Let’s take a look at why.

---

<small class="muted">This article is an overview of a powerful strategy to increase search results relevance called scoped search. Its purpose is to introduce scoped search and set the stage for upcoming posts that will address various aspects of scope search implementation.</small>  

---

![Search box]({{ site.baseurl }}/images/2019-07-11-scoped-search-introduction/search-box-amazon-01.png)
<figcaption>Search box, with scope selection drop-down menu on the left, set to search in all departments</figcaption>

![Scope list]({{ site.baseurl }}/images/2019-07-11-scoped-search-introduction/scope-selection-amazon-01.png)
<figcaption>All available search scopes on Amazon’s website</figcaption>

<p class="text-center">
  <img 
    src="/images/2019-07-11-scoped-search-introduction/autocomplete-walmart.png"
    alt="Search Box"
  />
</p>
<figcaption>Autocomplete suggestions for the keyword “brush” on Walmart’s website, including scope in colored italic text</figcaption>

## When Is it Useful

On large websites with lots of products or content, being able to search within a specific category **can help find what we are looking for faster**, as it filters out a big bunch of irrelevant search results right off the bat. 

Since specific terms can refer to various objects within different categories, unscoped search can lead to result lists that are filled with irrelevant content on the first result pages. This is exactly what happens when customers, in need of a brush to clean their BBQ and enjoy the first hot summer day that we get here in Quebec City (and they are pretty rare), searches for it using the keyword "brush" on the Walmart website.

![Product list]({{ site.baseurl }}/images/2019-07-11-scoped-search-introduction/result-list-walmart-01.jpg)
<figcaption>Tough Brush found on the 8th search results list page, due to the absence of scope selection on Walmart’s website, using the keyword “brush”</figcaption>

<span id="large-catalogs">On smaller websites though, scoped search tends to generate narrow or even empty search result lists, which adds unnecessary steps and effort to get what we want. This is why scoped search should **only be implemented on websites with large and diverse catalogs** <sup>3</sup>.</span> 

On sites with smaller catalogs, the use of filter facets that can be selected when in the search results page, after the initial search, is often enough to provide a good search experience.

## How Do People Use It

<a href="https://baymard.com/" target="blank">Studies</a> show that the vast majority of users do not use scoped search for their first search <sup>2</sup>. 

They only use it once they’ve figured out that the system has not “understood” their previous query. In other words, users will search, then realize that the results don’t meet their needs, and finally try to find a way to clarify and narrow their search. This is where scoped search usually comes into play.

If at all, they will therefore use scoped search **for their subsequent searches, not the first one**. 

Keeping that in mind is really important because it means that **scoped search usually happens after a failed attempt**. In other words there already is friction in the user’s journey when this feature is used, which makes good implementation even more important. 

## The Impact of Bad Implementation

The most common implementation mistakes that I have seen throughout the years, in relation to scoped search, are mostly centered around three aspects:

1. Information architecture and naming
1. User interface
1. System behavior  

More precisely, businesses tend to **map content categorization on internal structures** and/or non-user-friendly wording. They also use **wrong or incomplete sets of user interfaces** and interaction patterns (such as a scope search dropdown list too discreet or too far from the search box) to deliver scoped search and implement system behaviors and algorithms that **do not cover the full use cases spectrum** (such as automatic scoping done under the hood at an inappropriate moment or without the user noticing it).

The risk about implementing scoped search is that it has somewhat of a thankless role in the search ecosystem. If it does not help users, it can be the determining factor that makes them leave the site. On the other hand, if it manages to solve the user’s problem, scoped search becomes the savior of the situation and generates a high level of trust and satisfaction. 

![User journey]({{ site.baseurl }}/images/2019-07-11-scoped-search-introduction/new-data-services-UO-QYR28hS0-unsplash.jpg) 
<figcaption class="">Photo by <a href="https://unsplash.com/@new_data_services" target="_blank">NEW DATA SERVICES</a> on <a href="https://unsplash.com/" target="_blank">Unsplash</a></figcaption>


As with most bad implementations, bad scoped search can **confuse users and add friction** to their journey towards the goal they have in mind. More specifically, it can lead users to **think that the website does not have the information or item that they are looking for**, which in turn is likely to lead to site abandonment <sup>4</sup>. 

The need that led them to the website in the first place still being unanswered, they are then very **likely to go to a competitor**. 

## Final Thought

If your website has a **lot of content and a large variety of categories**, you should consider implementing scoped search. 

When well implemented, scoped search can **help your users find what they are looking for faster** and acts as a guide for users trying to find their way through all of your website’s content. However, bad scoped search implementation **can have disastrous consequences**, such as losing potential clients to a competitor.

<span id="to-consider">To provide a good research experience through scoped search, the following aspects should be taken into account:</span>

1. The **information architecture** behind the content categorization.
1. The **user interface (UI)** that makes the category in which the search is performed visible and suggests alternative categories to users while allowing them to modify the targeted category as needed.
1. The **behavior of the system** that will assign a default category and may or may not activate a category based on the performed search (which is precisely what the <a href="https://docs.coveo.com/en/1671/coveo-machine-learning/coveo-machine-learning-features#dynamic-navigation-experience-dne-feature" target="_blank">Coveo Dynamic Navigation Experience feature</a> allows you to do, by the way).

If you are considering implementing scoped search for your website, wait for my next posts in which I will dive deeper into **how to implement scoped search the right way**.


---

> <h2 class="h3">Key Takeaways</h2>
>
> 1. <a href="#large-catalogs">Only use scoped search for websites with large and diverse catalogs.</a>
> 1. <a href="#to-consider">For good scoped search implementation, make sure to take into account the information architecture behind your categorization, user interfaces that have to be involved as well as the behavior of the system.</a> 

---

<h2 class="h3">References</h2>

<small>1, 2 SHERWIN, K. (2015). Scoped Search: Dangerous, but Sometimes Useful. Nielsen Norman Group. Retrieved from https://www.nngroup.com/articles/scoped-search/</small>

<small>3, 4 BAYMARD (2019). #339: How to Design the Search Scope Selector. Baymard Institute. Retrieved from https://baymard.com/</small>

---