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

## Project Timeline
The project, including this article, was achieved in one month, with all contributors working part-time on the code base. If a project requires this kind of component, a realistic timeline needs to consider:

- Expertise in Coveo JavaScript Search Framework
- Expertise in Google Map APIs (or any other third-party map provider)
- Expertise in TypeScript
- Expertise in Coveo Relevance
![Project Timeline]({{ site.baseurl }}/images/2018-08-01/ProjectTimeline.png)

## High Level Solution
The solution is quite simple from a technological point of view. The CoveoMap front-end is run locally using all the tools provided by the Coveo search-ui-seed project. A 30-day free trial is used for the Coveo Cloud Organization. A folder with all the JSON files is crawled locally using a Python crawler script.

![Project Architecture]({{ site.baseurl }}/images/2018-08-01/{ProjectArchitecture.png)

Some extra steps would be required to incorporate the component in a CMS framework such as Coveo for Sitecore, however, most of the work required to make a relevant map is documented in this article.