---
layout: post

title: "Why it is the time to reevaluate your digital workplace strategy"

tags: [workplace,remote,culture]

author:
  name: Alexandra Rioux
  bio: Solution Architect
  twitter: alexandrarioux1
  image: ariouxphoto.png
---
Following the increase in the severity of the COVID-19 outbreak, a lot of us will be working from home in the hope to reduce the spread of the virus. 

Working for home has its perks but also some disadvantages. One of them can be the feeling of missing out on some important information. Luckily enough, Coveo has already built a solution to solve this problem: an internal knowledge base.

Our internal knowledge base is indexed with content coming from a variety of sources such as our website, Jira, Confluence, etc. Whether our colleagues are sitting next to each other or thousands of miles apart, our solution gives us access to all the information we need.
<!-- more -->

*What are some benefits of an internal knowledge base?*

#### Accelerate productivity
I am not able to imagine working at Coveo without our internal search. On a daily basis, I am constantly looking for answers about our product.  Each time I have a question, I know where to go since all valuable content has been indexed on one search page. Coveo Cloud is built for unifying and securing content from any repositories in the Coveo Index.  It uses connectors to transfer documents into the index. Not having this would require me to go to multiple sites before finding an answer. 

![Unified Search Architecture](/source.coveo.com/images/2020-04-22-workplace-strategy/UnifiedCoveoSearch1.png)

Obviously, we use Coveo to bring relevance to our internal search. Our internal knowledge base leverages multiple features, one of them being custom context. Coveo will consider the user department when returning results, ensuring we are presented with information relevant to our job. To do so, your search interface must send custom contextual information (e.g., user role) along with each query it executes and each Coveo Usage Analytics event it logs. 

For more information on custom context: [Understanding Custom Context](https://docs.coveo.com/en/2081/coveo-machine-learning/understanding-custom-context)

#### Get to know your colleagues
My colleague previously wrote a blog post on the best practices regarding people search. If you have not already read it, follow this link and go read it ASAP: [6 Tips To Help You Design A Good People Search Experience](https://source.coveo.com/2020/02/11/6-tips-people-search/)

One of the challenges that comes with remote employees and growing organizations, is the ability to keep track of new-hires. Each month, we hire a dozen new employees. You can easily imagine that knowing who to contact when you need something can be challenging. This is why your intranet needs to contain a People search section.

Here is an overview of the people search section of our Intranet: 
![Intranet interface](/source.coveo.com/images/2020-04-22-workplace-strategy/CC-Search.png)

Each result template contains important information such as an employee work title, manager name, office location, and contact information. We even customize the template depending on the office location.

When clicking on a result, we are able to provide an overview of the person’s team and what they have been working on. 
![Employee Activity Overview](/source.coveo.com/images/2020-04-22-workplace-strategy/janetView.png)

For more detailed information on how the people page was made, you should read my other colleague blog post here: [Building an Intranet People Search](https://source.coveo.com/2019/03/19/people-page/)

#### Prevent knowledge loss

Wasn’t a JIRA made for this issue? No idea, the person who was responsible for the project left the company.

Knowledge loss affects all businesses. When employees leave a company, they leave with a high amount of knowledge that is not always properly transferred to other employees. This can be quite costly.

A good way to prevent this is to implement an intranet, helping to remove information silos. Obviously, for this to work, employees must be responsible for documenting what they are doing.  However, if employees are already doing this, the next step is to make sure that people can easily find the desired information.

### *How to measure the success of an internal knowledge base?*
To measure the effectiveness of your workplace solution, you will want to create dashboards that will allow you to fully understand the behavior of your employees. 

#### Adoption trend
There are multiple ways to evaluate the success of your intranet. One of the most important metrics to look at is the unique visitor trend. Is it going up? If not, you need to understand why user adoption is going down.

![User Adoption Report](/source.coveo.com/images/2020-04-22-workplace-strategy/UV.png)

You could get more insights by looking at the unique visits per department. You might find out that certain departments are not using the intranet as much as their colleagues. This might be a sign that the intranet is missing a certain feature (e.g., a sales pipeline tab for your sales team). 

![Departement Adoption Report](/source.coveo.com/images/2020-04-22-workplace-strategy/departementUsage.png)

When looking at this dashboard, you might think that department E is underusing the internal knowledge base, however you need to consider the number of employees and calculate the ratio. 

Once again, to create this type of report, you will need to understand how custom contexts work before being able to send the information to Coveo. 

#### Search metrics

If you are familiar with Coveo analytics, you might have used the average click rank to evaluate the success of a Coveo implementation. 

This metric represents the average position of opened items in a search result list. Ideally, this metric is between 1 and 4. To improve the overall performance, make sure that you have implemented the ART model and are tracking all click events.

![Average Click Rank Report](/source.coveo.com/images/2020-04-22-workplace-strategy/ACR.png)

The second search metric that we always look at is the click-through rate. This metric represents the percentage of search events that led to at least one click event; the higher the value the better.  Ideally, you want your click-through rate to be above 50%.

![Click-Through Report](/source.coveo.com/images/2020-04-22-workplace-strategy/VCT.png)

Once again, to improve the overall performance, make sure that you have implemented the ART model and are tracking all click events. 

These are only a few ways to measure the overall adoption. Don’t hesitate to be creative when creative UA reports!





