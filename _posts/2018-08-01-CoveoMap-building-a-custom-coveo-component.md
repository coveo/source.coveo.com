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

![Project Timeline]({{ site.baseurl }}/images/2018-08-01/ProjectTimeline.png)


|lo |lo |