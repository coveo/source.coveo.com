---
layout: post

title: "Taming the Coveo Usage analytics platform and Coveo Reveal"
tags: [Usage Analytics, Cloud, Reveal]

author:
  name: Jean Christophe Dumont
  bio:  Coveo for Sitecore Client Executive
  image: jcdumont.png
---


One of my responsibilities, as a client executive for our Coveo for Sitecore user-base, is to help our clients optimize the value of their Coveo deployment, by leveraging all the features offered by our platform. 
I have unfortunately seen too many examples of customers exploiting only the search mechanisms of Coveo, passing by the opportunity to ramp up their experience from Advanced Enterprise Search to actual relevance and insight provider. A few ingredients can act as catalysts for this transition, among others, the Usage Analytics platform and our machine-learning solution, Reveal. This blog post relates the story of a real Coveo for Sitecore Cloud client, which we will conveniently call Client X, starting their journey towards automated, highly relevant content.

<!-- more -->

After the completion of their implementation project, client X had several questions on what to do next, namely with the UA platform and Reveal. Here are some of the questions that were asked throughout our discussions. 

## How can I get started with the Usage Analytics?
	
It is important to know that all our Coveo clients can benefit from the Usage Analytics platform, whether their index is hosted locally or in the Cloud. The only thing to consider is the recency of their environment, as some dated installations of Coveo may require an upgrade in order to be compatible with the platform. 
The first step would be to check with the Support desk or your assigned Client Executive if a Cloud organization was generated to host the data gathered by the platform. Once completed, simply validate that the data is indeed crawled in your live environment. Accessing the platform after a few days should already indicate user activity after only 15 minutes. 
The reports section should normally contain a Summary report, including all the basic information on the queries performed through Coveo, results presented, click-through, click rank, etc.

![Reports Menu](/images/TamingUA/Reports.png)
![Summary Dashboard](/images/TamingUA/SummaryDashboard.png)
 
## Can you clarify what all these metrics refer to?

Coveo provides a lot of information in the UA platform, but mastering the data presented requires an understanding of certain concepts which may seem fuzzy at first. Here is a quick guide explaining some of these concepts: 
* Click-through: number of queries resulting in a click on a result
* Click rank: the rank of the result clicked by the user. An example for this could be that a user clicked on the second result presented for after a specific query, which would mean that the click rank for this result is 2.
* Queries without results: queries performed which didn’t returned any result
* Queries without clicks: queries performed which didn’t result in a click on a result
* Content gaps: a knowledge gap between the information requested by a pool of user and the documentation available and findable in the index.
* Queries with low relevance: a combination of the number of times the queries was performed and its average result in terms of click-through and click-rank. Basically a list providing to analysts their priorities in terms of content management. A number between 0 and 1 is assigned to every low relevance query, where 0 is the lowest relevance and 1 represents perfect relevance. 

![Content Gaps](/images/TamingUA/ContentGaps.png)

Obviously, much information is made available to anyone managing Usage Analytics, as all the dashboards and tables provided are modular, customizable to each client’s needs. You may even use custom events for maximum personalization. 
After a 1 hour call with client X, our team presented a tour of the platform, explaining the purpose of each dashboard and the top indicators to look for. The reality is that after explaining the concepts detailed above, the autonomy of the client had already drastically improved compared to their level of comfort before the call.

## Is Reveal enabled, and if so what is its impact so far?

Reveal is always a big value driver for any discussion with our clients, especially with the Marketing folks. In a nutshell, when presented with a machine-learning solution able to understand the Usage Analytics data and automatically modify the relevance of several search functions without any human input, the positive impact Reveal can have on content management and overall enhancement of the user experience goes without saying. 
That being said, Client X was still uncertain of the actual impact Reveal had in THEIR environment, understandably so. Reveal doesn’t drastically change the output of the queries performed upon activation, at least not immediately. Reveal feeds on the data gathered by the Usage Analytics platform, and detects trends before being able to have a positive impact on the search output. We estimate at approximately 3 months (variable depending on the volume of activity with Coveo) the time required for Reveal to have an optimal impact on query suggestion, result relevance, and item recommendation. Nonetheless, Client X’s question remained. 

The first step to validate the impact of Reveal is to confirm the activation of this feature through the creation of a Reveal model in a Pipeline. This step is fairly simple, as one can confirm in a glimpse if a model using Reveal is enabled or not, as visible on image A and B. Simply go under the **Pipeline** section of the **Search** tab, and click on whichever pipeline is currently used to see if Reveal is activated or not, and which features it powers.

![Pipeline with Reveal](/images/TamingUA/PipelineWithReveal.png)

However, the second question is a bit trickier, not because of the difficulty of the analysis, but because it does require a bit of testing. Analyzing the impact of Reveal on your search experience requires the usage of a feature called A/B testing. This function allows a Coveo administrator to set up two separate pipelines, with a different set of parameters, to experiment what works best.
Some may want to use different thesauri, others might want to see if the boosting rules set in place actually enhance or deteriorate the search experience. In this case, what interests us is to compare what kind of impact Reveal has on click-through, click rank, and overall relevance of the results.
 
![A/B Testing Menu](/images/TamingUA/ABTestingMenu.png)
![A/B Testing Active](/images/TamingUA/ABTestingActive.png)

To have a clear representation of this impact, we suggested our client X to set up two pipelines, one with Reveal, one without, and compare the results after a bit more than two weeks of test. It is also interesting to point out that the client could decide the proportion of traffic going on each pipeline. After finalizing the dashboards helping us visualize this experiment, the results were clear: better average click rank (average click rank improved by 1), better click through (8% difference), and fewer content gaps for the pipeline using the Reveal model. Needless to say, we recommended sending 100% of the traffic on the pipeline using Reveal as soon as possible. 

## In conclusion…

Search isn’t an appliance anymore: it’s a two-way communication channel between you and your users. Being able to provide relevant content is already a big step towards an integrated search experience, but being able to tune this experience based on user behavior is quickly becoming a key value driver for Coveo. The Usage Analytics platform is definitely a great way to start your journey towards relevance, and Reveal is the key towards the automation of this process.

Communicate with us to learn more on how we can help you get started on this thrilling path!
