---
layout: post

title: "5 reasons why you're not reaching full relevancy"

tags: [Analytics, Machine Learning, Relevancy]

author:
  name: Alexandra Rioux
  bio: Solution Architect
  twitter: alexandrarioux1
  image: ariouxphoto.png
---

As I'm sure you're aware, businesses use a ton of software in their day to day operations. It can become overwhelming for employees to learn and master a new technology. This blog post will help you understand the basics behind Coveo and the relevance that Coveo can bring for you.
 
If you are reading this blog post, you are probably going to use Coveo at work. Maybe you are the business administrator who is looking for ways to improve your current implementation or you are the project manager who wants to make sure that you did not forget anything major before going live. 
 
Coveo is a powerful tool, but to be able to unleash its power you need to implement it right. That is why we've compiled some helpful tips to improve your Coveo implementation, no matter your skill level.

<!-- more -->

## #1-You do not have the proper architecture. 

If you're just starting out, it's a ~~good idea~~ mandatory to invest time in designing the architecture of your Coveo search project. This helps you understand how relevance is achieved. 

Before you begin implementing Coveo, brainstorm on what are the various search experiences you want to offer to your users and what is the purpose of each of them. Each search experience should be identified and well documented.This will help you translate them in query pipelines and search hubs. To help you do so, I would suggest reading [Designing an Architecture for Multiple Search Experiences](https://docs.coveo.com/en/2941/coveo-solutions/designing-an-architecture-for-many-search-experiences) from our documentation.

For current implementations, we invite you to [log in to the platform](https://platform.cloud.coveo.com/) and [view the consumption dashboard](https://docs.coveo.com/en/1855/cloud-v2-administrators/using-the-search-consumption-dashboard). If over 10% of queries are not attached to a search hub (displayed as None in the dashboard), we invite you to contact our support team to help you investigate the origin of those queries.

## #2-You're not tracking analytics

You might have created a Query suggestion model and might already be sending a lot of queries, but are wondering why you still do not have query suggestions. One common error that we see in customer implementations is **untracked usage analytics** which included **search events** and **click events**. Both events are essential in order for a query to be considered as successful. A search event is created when the end user interacts with the search interface in a way that triggers a query to the Search API. Click events are triggered when the end user clicks on, or preview a result. The reason why machine learning needs both events is because machine learning will use click events to understand which results are getting some interest from end user for a specific search event.

There are many reasons why usage analytics are not being tracked. In most cases, the [CoveoAnalytics](https://coveo.github.io/search-ui/components/analytics.html) component is missing.  And if you are a Sitecore customer, you will want to use the [Coveo For Sitecore Analytics](https://docs.coveo.com/en/2186/coveo-for-sitecore-v5/coveo-for-sitecore-analytics) component instead.

If you do have the component but are asking yourself why you aren't tracking clicks, this is probably due to the absence of the [CoveoResultLink](https://coveo.github.io/search-ui/components/resultlink.html) component. This automatically transforms a search result title into a clickable link pointing to the original item.

Yes. Sometimes you are only one component away from relevance.

## #3-You forgot to add machine learning.

Machine learning is like a golden ticket to turn your search page into a relevance engine. 

![Alt Text](https://media.giphy.com/media/VlZ2gfjYNxdVS/giphy.gif)

Coveo offers four machine learning models. Every implementation should at least have the **Query Suggestions** (QS) model and the **Automatic Relevance Tuning** (ART) model.

The reason why we recommend having these two models is that they are simple to implement and they represent the needs and expectations of visitors.

QS provides visitors with relevant query completion suggestions based on previous successful queries. Visitors are familiar with this behavior because Google provides a similar experience. Plus, visitors tend to use query suggestions since it makes it faster for them to complete a query.

As for ART,  this machine learning feature can optimize search results relevance based on user search behavior. The top result is no longer the last item that was added to the website but the most relevant result for a certain query. With ART, visitors no longer need to scroll down to the bottom of the page or worse, go to the second page to find their answer. 

## #4-Typos are not being corrected

Typos. It happens to the best of us. 
 
Doing a search on Google with a typo? No problem. Google will correct my query. BUT, not all search engines are able to handle typos correctly. 
 
To avoid frustrating experiences regarding typos, Coveo has a [Query Correction Feature](https://docs.coveo.com/en/1810/cloud-v2-administrators/query-correction-feature) (or [DidYouMean](https://coveo.github.io/search-ui/components/didyoumean.html)) that you should add in your implementation. This feature allows users to make typos in their queries and still find the results they are looking for. Please note that in order for the query correction feature to function, items need to have a body, since it is based on a word corrector lexicon.

![IMAGE](/images/querycorection.png)
**So make sure to add and enable the DidYouMean component!**

## #5-Facets and other sorting options

Lastly, building a relevant search experience includes a lot of design. Even with the finest machine learning technology, a relevant search page needs to be well designed if you want users to interact with your content. 
 
In order to ensure that users find the desired content, add some sorting options to the search result page. Facets are a popular search interface component that users love since they already know how to use them. This allows them to refine the queries and not get overwhelmed by the search results

**So, that’s it?**
 
For this article? Yes. But there are numerous ways to improve your search page. We invite you to look at the [Coveo Cloud Project Guide](https://docs.coveo.com/en/2648/coveo-solutions/coveo-cloud-project-guide) from our documentation and to contact your Customer Success Manager if you have additional questions.




