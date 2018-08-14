---
layout: post

title: "CoveoMap: Building a custom Coveo Component"

tags: [Map, Geospatial search, Custom Analytics Events, TypeScript Components, Push API]

author:
  name: Vincent Bernard & David Auclair
  bio: Solution Architect & Product Analyst
  image: vbernard_dauclair.png
---

Maps are awesome. A good map implementation reacts to user's current context and provides relevant information. Since maps are great at visualizing relevance, the Coveo for Sitecore product team decided to experiment with that concept. While exploring the concept, several use cases related to customer requests have emerged. This article will serve as a guide for these specific cases while remaining primarily focused on geospatial research.

Before we start, you can refer to the code [here](https://github.com/davaucl/CoveoMap), and have a look at the live map [here](https://coveo-map.herokuapp.com/)

## On The Menu 
- Geospatial Search
- Persistent Queries
- Custom TypeScript Coveo Components
- Push API
- Advanced Relevance Tuning 


![CoveoMap]({{ site.baseurl }}/images/2018-08-01/CoveoMap.png)

<!-- more -->

## Project Timeline
The project, including this article, was achieved in one month, with all contributors working part-time on the code base. This kind of implementation requires some expertise. You will need to consider the following when building your project timeline.

- Expertise in Coveo JavaScript Search Framework
- Expertise in Google Map APIs (or any other third-party map provider)
- Expertise in TypeScript
- Expertise in Coveo Relevance
![Project Timeline]({{ site.baseurl }}/images/2018-08-01/ProjectTimeline.png)

### High Level Solution
The solution is quite simple from a technological point of view. The CoveoMap front-end is run locally using all the tools provided by the Coveo [search-ui-seed project](https://github.com/coveo/search-ui-seed). A 30-day free trial is used for the Coveo Cloud Organization. A folder with all the JSON files is crawled locally using a Python crawler script to populate our cloud organization.

![Project Architecture]({{ site.baseurl }}/images/2018-08-01/ProjectArchitecture.png)

Some extra steps would be required to incorporate the component in a CMS framework such as Coveo for Sitecore. However, most of the work required to make a relevant map is documented in this article.

## Indexing
A realistic data set was the first requirement for CoveoMap. Real street addresses, with exact latitude and longitude, are indeed the base of any good geospatial search. A user also needs to be able to search (and filter) results based on city name, region, or any other useful information available on the results. To mock the data, we used a dataset of Australian addresses, available online for free, to which was added fields generated using [Mockaroo](https://mockaroo.com/), an online mockup tool. The items were then pushed to Coveo using the Push API.

### Items
Upon page loading, all of the indexed items are displayed on the CoveoMap as red markers. After the first query is performed, the result list will be updated displaying only the most relevant items. The map will display the same items as the list as blue markers, and the less relevant with lighter red markers.

Here is a close view of a result template:

![Result Template]({{ site.baseurl }}/images/2018-08-01/ResultTemplate.png)

Here is the basic structure of the items in Coveo Map:

| Field | Type | Required? |
| ------|------|:-----------:|
| URI | Unique identifier used in the Coveo Platform. Usually correspond to the item URL | ✔︎ |
| uniqueId | Used by CoveoMap to link a Result with a Marker | ✔︎ |
| longitude | Decimal coordinate | ✔︎ |
| latitude | Decimal coordinate | ✔︎ |
| distance | Field created in the cloud empty by default but will receive its data at query time and will be used for ranking. | ✔︎ |
| businessname | A name used in the Result Template to identity the marker |   |
| city | A facet field |    |
| state | A facet field |  ︎ |
| category | Fake business categories, used as facet field |   |
| phone | To display in the result template |   |
| email | To display in the result template |   |
| rating | Used for rating in the context of restaurants or shop. It is used as a facet |   |

### Mapping fields in Coveo Cloud
Prior to indexing, you must create all the fields and select the correct attributes in Coveo Cloud Fields section. When using the Push API, the fields available in the JSON items will be converted to Coveo values. Coveo will find the previously created field that has the same name as the JSON item field, and map them together.

![Mapping Fields]({{ site.baseurl }}/images/2018-08-01/MappingFields.png)

### Pushing the Content
The Coveo Push API is a type of connector available in Coveo Cloud and is commonly used to push files into Coveo Cloud, hence the name Push API. Since the data used in this project was stored in JSON documents, the [Python-Pusher](https://github.com/coveo/samples/tree/master/push-api/python-pusher) was a perfect fit for the job. This small Python script loops through every JSON documents in a folder and pushes them to Coveo Cloud.

The Push API is fast, which was appreciated as the data set kept evolving during the project. Processing the 2000 items took on average 4 minutes.

### Importance of Clean Data
> Clean data = cleaner code.

As mentioned in the [Coveo for Sitecore Project Guide](https://docs.coveo.com/en/517/coveo-for-sitecore-v4/coveo-for-sitecore-project-guide), clean data will solve most of the indexing issue. With consistent data, transformed correctly prior to indexing, the development process is smoother and relevance is better. Without consistent data, result templates are not uniform and some workaround are required in the code to handle exceptions. 

## UX
### Designing Relevance
Relevance on a map is a bit different from a regular list. The distance between the users' current point of view and the items in the result set need to be considered in the ranking algorithm. Different behaviour are observed from users when interacting with a map. Users are often looking for information near them, but can also gather information for an upcoming trip, reducing the relative importance of the distance between their current physical location and the result set.

### How Many Results Should Be Returned
Users need to have enough data to work with. If the only rendered items are returned by the index, the user might be missing on some point of interest filtered out by the query. To compensate for this weakness, CoveoMap is handling two different kind of results:

- Relevant markers, based on the user query (represented in blue markers)
- Background markers, always displayed for reference (represented in light red markers)

This is really interesting in an estate context. If someone is looking to buy a house in a certain area and searches for this specific area, only the returned results would be displayed on the map. We want to avoid this as we think this same user might also be interested in a house right next to the specified area. The same idea applies to searching by price.

![Marker Type]({{ site.baseurl }}/images/2018-08-01/MarkerType.png)

### Leveraging Persistent Queries

CoveoMap overlays relevant markers over background markers. The project uses persistent query to populate background markers and reduce incidence on query consumption. This feature helps implementing query intensive components that are not relevance based.

To do so, we use a separate Query Pipeline, called "persistent", to tag all the queries done in this pipeline as persistent. 

### Front-End Components
To help the user navigate through results, the CoveoMap component is inserted alongside other Coveo components such as Query Suggest, Facets, Result Templates, and Results per Page. 

![Front-End Component]({{ site.baseurl }}/images/2018-08-01/ComponentCollection.PNG)


## Implementing Relevance
Making the indexed items relevant is quite different in this project since there's almost no data to search against. We had to use different strategies to bring relevance and achieved it by combining distance, ratings, and popularity. Query Functions compute the distance and Ranking Functions modify the ranking dynamically.


### Distance from the center of the map
The relation between the user and markers is used as a dynamic input in the ranking algorithm. Items near the user will score higher than the ones further away. The following formula is used to add to the score:

` y = 300 - @distance^0.72 `

![Distance function]({{ site.baseurl }}/images/2018-08-01/Distance.png)


### Ratings
Ratings help quickstart the ranking algorithm prior to machine learning. Once enough users interact with the CoveoMap, analytics will collect behavioural data and feed it to the Coveo Automatic Relevance Tuning (ART) model. The rating system used in this project have values ranging from 0.1 to 5.0. We used a linear expression to add to the score.

` y = (@ratings) * 5 `

![Rating function]({{ site.baseurl }}/images/2018-08-01/Ratings.png)


### Relation to city names
The relevance of the markers need to be overridable by a query stating the name of another city.

![Ranking Expression]({{ site.baseurl }}/images/2018-08-01/RankingExpression.png)

### Date
By default, Coveo ranks recent documents higher than older ones. This, while being useful in website search, has no use in our case. The relative weight of the indexed date has been turned down to 0 in Coveo Ranking Weight.

![Ranking Weight]({{ site.baseurl }}/images/2018-08-01/RankingWeight.png)


## Implementation

### Coveo Custom Component (Seed UI Project)
The project uses TypeScript, just like the [Coveo JavaScript Search Framework](https://github.com/coveo/search-ui). This approach, used in advanced Coveo implementations, allows you to extend the Coveo framework and integrate third party libraries like Google Map.

The Coveo JavaScript Search Framework team developed a template project called [search-ui-seed](https://github.com/coveo/search-ui-seed). This project walks developers through a typical Hello World example, explaining how to extend the framework.

### Coveo Cloud Organization
Like any Coveo project, the Coveo Cloud Organization is the backend. In this project, we used the Push API connector along with some minor configuration in the fields section and the query pipeline section.

### Analytics
Since Coveo Machine Learning uses analytics events to work, basic events have been implemented in CoveoMap. The Coveo JavaScript Search Framework, with the CoveoAnalytics component, will send searches, facets clicks, and other events to Coveo Cloud.

### Ranking Inspector
Fine-tuning relevance can be achieved using the Relevance Inspector. It was very useful to see which results were affected by our changes as we were adjusting the value of the different ranking expression. Add `#debug=true` to the page URL to enable this feature.

![Ranking Inspector]({{ site.baseurl }}/images/2018-08-01/RankingInspector.png)

### Coveo Search Box Query Syntax
One of the Coveo JavaScript Search Framework feature, [Coveo Query Syntax](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=357), allows a user to experiment directly in the search box. Here is an example of the distance test conducted at the beginning of the project. This feature can be enabled by adding this data-attribute to the CoveoSearchbox component: `data-enable-query-syntax="true"`.

![Ranking Inspector]({{ site.baseurl }}/images/2018-08-01/QuerySyntax.png)

## Go have fun with it
The [code for the CoveoMap](https://github.com/davaucl/CoveoMap) has been documented thoroughly. You can have a look at it, fork it, have fun, and explore more possibilities. Once you fork the open source project you will have to put in your own Google maps API key and a Cloud organization key. We also made all the fake data available in the same project. You can try the Python-Pusher and use the same data as we did.
