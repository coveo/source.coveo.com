---
layout: post

title: "CoveoMap: Building a custom Coveo Component"

tags: [Map, Geospatial search, Custom Analytics Events, TypeScript Components, Push API]

author:
  name: Vincent Bernard
  bio: Solution Architect
  image: vbernard.png
---

Maps are awesome. A good map will react to users' current context and will provide relevant information. Since maps are great at visualizing relevance, the Coveo for Sitecore product team decided to experiment with that concept. While exploring the concept, several use cases related to customer requests have emerged. This article will serve as a guide for these specific cases while remaining primarily focused on geospatial research.

## On The Menu 
- Geospatial Search
- Persistent Queries
- Custom TypeScript Coveo Components
- Push-API
- Advanced Relevance Tuning 


![CoveoMap]({{ site.baseurl }}/images/2018-08-01/CoveoMap.png)

<!-- more -->

# Project Timeline
The project, including this article, was achieved in one month, with all contributors working part-time on the code base. If a project requires this kind of component, a realistic timeline needs to consider:

- Expertise in Coveo JavaScript Search Framework
- Expertise in Google Map APIs (or any other third-party map provider)
- Expertise in TypeScript
- Expertise in Coveo Relevance
![Project Timeline]({{ site.baseurl }}/images/2018-08-01/ProjectTimeline.png)

### High Level Solution
The solution is quite simple from a technological point of view. The CoveoMap front-end is run locally using all the tools provided by the Coveo search-ui-seed project. A 30-day free trial is used for the Coveo Cloud Organization. A folder with all the JSON files is crawled locally using a Python crawler script.

![Project Architecture]({{ site.baseurl }}/images/2018-08-01/ProjectArchitecture.png)

Some extra steps would be required to incorporate the component in a CMS framework such as Coveo for Sitecore, however, most of the work required to make a relevant map is documented in this article.

# Indexing
A realistic data set was the first requirement for CoveoMap. Real street addresses, with exact latitude and longitude, are indeed the base of any good geospatial search. A user also needs to be able to search (and filter) results based on city names, regions, or any other useful information available on the results. To mock the data, we used a dataset of Australian Addresses, freely available,  to which was added fields generated using "Mockaroo", an online mockup tool. The items were pushed to Coveo using the Push-API.

### Items
An item in CoveoMap is displayed  on the map, and for the relevant markers, on the result list. Here is a close view of a result template:

![Result Template]({{ site.baseurl }}/images/2018-08-01/ResultTemplate.png)

Here is the basic structure of the items in Coveo Map:

| Field | Type | Required? |
| ------|------|:-----------:|
| URI | Unique identifier used in the Plaform. Usually correspond to the item URL | ✔︎ |
| uniqueId | Used by CoveoMap to link a Result with a Marker | ✔︎ |
| longitude | Decimal coordinate | ✔︎ |
| latitude | Decimal coordinate | ✔︎ |
| distance | Computed at query time, used for ranking | ✔︎ |
| businessname | A name used in the Result Template to identity the marker |   |
| city | A facet field |    |
| state | A facet field |  ︎ |
| category | Fake business categories, used as facet field |   |
| phone | To display in the result template |   |
| email | To display in the result template |   |
| rating | Used for rating and also in facets |   |

### Mapping fields in Coveo Cloud
When using the Push-API, the fields available in the JSON items will be converter to Coveo values Coveo finds a field that have the same name. Prior to indexing, one must create all the fields and select the correct attributes in Coveo Cloud Fields section.

![Mapping Fields]({{ site.baseurl }}/images/2018-08-01/MappingFields.png)

### Pushing the Content
Coveo Push-API is a type of connector available in Coveo Cloud and is commonly used to push files into Coveo Cloud, hence the name Push-API. Since the data used in this project was stored in JSON documents, the Python-Push-API was a perfect fit for the job. This small Python script loops through every JSON documents in a folder and pushes them to Coveo.

The Push-API is fast and this was largely appreciated as the data set changed and adapted during the project to make everything smooth. Processing the 2000 items took on average 4 minutes.

### Importance of Clean Data
> Clean data = cleaner code.

As mentioned in the Coveo for Sitecore Project Guide, clean data will solve most of the indexing issue. With consistent data, transformed correctly prior indexing, the development process is smoother and relevance is better. Without consistent data, result templates are not uniform, and some workaround are required in the code to handle exceptions. 

# UX
### Designing Relevance
Relevance on a map is a bit different from a regular list. The distance between the users' current point of view and the items in the result set need to be considered in the ranking algorithm, but some corner cases needs to be handled. Different behaviour are observed from users when interacting with a map. A user is often looking for information near him, but he can also gather information for an upcoming trip, reducing the relative importance of the distance between his current physical location and the result set.

### How Many Results Should Be Returned
Users need to have enough data to work with. If the map render only items returned by the index, the user might miss some points of interest filtered out by the query. To compensate for this weakness, CoveoMap is handling two different kind of results:

- Relevant markers, based on the user query (represented in blue markers)
- Background markers, always displayed for reference (represented in red markers)

![Marker Type]({{ site.baseurl }}/images/2018-08-01/MarkerType.png)

### Leveraging Persistent Queries

CoveoMap is overlays relevant markers over background markers. To reduce incidence on query consumption, the CoveoMap project uses persistent query to populate background markers. This feature helps implementing query intensives components that are not based on relevance.

To do so, we use a separate Query Pipeline, called "persistent", to inject in the query the 

### Front-End Components
To help the user navigate in the results, the CoveoMap component is inserted alongside other Coveo components such as Query Suggest, Facets, Result Templates and Results per Page. 


# Implementing Relevance
Making the indexed items relevant is quite different in this project since there's almost no data to search against. We used

In this project, relevance as been achieved by combining distance, ratings and popularity. Query Functions are computing the distance, and Ranking Functions are modifying the ranking dynamically.

### Distance from the center of the map
The relation between the user and markers is used as a dynamic input in the ranking algorithm. Items near the user will be score higher the the ones further. The following formula is used:

` y = 300 - @distance^0.72 `

![Distance function]({{ site.baseurl }}/images/2018-08-01/Distance.png)


### Ratings
Ratings helps quickstart the ranking algorithm prior to machine learning. Once enough users interacts with the CoveoMap, analytics will collect behavioral data, feeding the Coveo Automatic Relevance Tuning (ART) model. The rating system used in this project have values from 0.1 to 5.0, so we used a more linear expression.

` y = (@ratings) * 5 `

![Rating function]({{ site.baseurl }}/images/2018-08-01/Ratings.png)


### Relation to City names
The relevance of the markers still  needs to be overridable by a query stating the name of another city.

![Ranking Expression]({{ site.baseurl }}/images/2018-08-01/RankingExpression.png)

### Date
By default, Coveo ranks recent documents higher than older ones. This, while useful in website search, has no meaning in our use case. The relative weight of the indexed date has been turned down to 0 in Coveo Ranking Weight.

![Ranking Weight]({{ site.baseurl }}/images/2018-08-01/RankingWeight.png)


# Implementation

### Coveo Custom Component (Seed UI Project)
The project uses TypeScript,  just like the Coveo JavaScript Search Framework.  This approach, used in advanced Coveo implementation, allows to extend the Coveo framework and integrate third party libraries like Google Map. 
The Coveo JavaScript Search Framework team developed a template project called search-ui-seed. This project will walk developers through a typical Hello World example, explaining how to extend the framework.
The CoveoMap code has been documented thoroughly.

### Coveo Cloud Organization
As with any Coveo project, the Coveo Cloud Organization is the backend. In this project, we used the Push-API connector along with some minor configuration in the fields section, and in the query pipeline section.

### Analytics
Since Coveo ML uses analytic events to work, basic events have been implemented in CoveoMap. The Coveo JavaScript Framework, with the CoveoAnalytic component, will send searches, facets clicks, and other event to Coveo Cloud. We needed 

### Ranking Inspector
Fine-tuning relevance can be achieved using the Relevance Inspector. Add `#debug=true` tp the page URL to enable this  feature.

![Ranking Inspector]({{ site.baseurl }}/images/2018-08-01/RankingInspector.png)

### Coveo Search Box Query Syntax
One of the Coveo JavaScript Search Interface features, the query syntax, allow user to experiment with Coveo Query Syntax directly in the search box. Here is an example of the distance tests conducted at the beginning of the project. This feature can be enabled by adding this snipper to the CoveoSearchBox component : `data-enable-query-syntax="true"`.

![Ranking Inspector]({{ site.baseurl }}/images/2018-08-01/QuerySyntax.png)