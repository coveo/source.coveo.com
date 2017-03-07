---
layout: post

title: "Building a resource locator"

tags: [Index Extensions, Query Extensions, JS UI custom components, Geocoding, Google Maps]

author:
  name: Wim Nijmeijer
  bio: Sales Engineer
  image: Wim3.png
---

*This is the first blog post of a new serie entitled “Build it with Coveo”. The serie will present innovative use cases for the Coveo Platform, always including full code samples.*

Coveo customers use the platform in a multitude of ways. Many in the consulting, resource management business often ask us if our search technology could help them better match resources and project.

Use case: 
What if you want to find the best peer/employee with knowledge around “Artificial Intelligence”? Moreover, what if you need to add constraints such as “available for the next two months”?
![image]({{ site.baseurl }}/images/ResourceLocator/RL1.png)

Typical approach/solution:
When using a search engine, your default behavior will be to organize your search journey as follow:
* First search in your Resume database/repository for people with “Artificial Intelligence” in their resume
* Once suitable individuals are identified, you’ll look up their locations
* Once you know the locations, check in the HR database if they are working on a project in the next 2 months
It is very time consuming and arguably not very efficient. You can do better! How can we improve this whole journey? Easy: build an index containing all the data you need and surface it into a Resource Locator interface everybody can use.

What do you need?
Before you start building a UI, you need to have (at least part of) the following data available. The data you need is:
* People records (are they in Active Directory, or in a Database?). 
* For each Person you need an ID to identify them (like an employee unique ID)).
* Resumes. The metadata of the resume should mention the unique employee ID.
* Availability database. When is a person available should be stored in here (typically HR-IS systems, ERP, etc.).
Since you’ll probably want to geocode the cities so you can display everything nicely on a map, you’ll need a database with cities and/or zip codes (and their Latitude/Longitude).

<!-- more -->

## The brainstorm

We’ve wanted to do a challenge involving artificial intelligence for a long time. With a smaller team working on Blitz this year, we had to leverage existing projects to make it on time. We already knew [Scalatron](https://scalatron.github.io/), [Berlin AI](http://www.berlin-ai.com/), but our search allowed us to find a bunch of interesting projects, including [Vindinium](http://vindinium.org/), which turned out to be most compelling one. It covered most of our requirements: it was [open source](https://github.com/ornicar/vindinium), customizable, [worked with most programming languages](http://vindinium.org/starters) and had many available starter kits.

![image]({{ site.baseurl }}/images/blitz2016/finals.jpg)

## Changes to Vindinium

Vindinium out of the box was a great skeleton for our contest. However, it was missing some features in order to be Blitz ready. First, the way bots usually start Vindinium matches is by joining a queue. As soon as 4 bots are ready, the match starts. This was not an acceptable solution for us, as we needed to have a tournament bracket and we didn’t want participants to join a match that they weren’t supposed to. In order to do that, we added API calls to list, create, join, delete, and start games. We also added an administrator API key that was required to invoke these calls so meddling students wouldn’t create games. This allowed us to create games, send the game id to the appropriate teams, let them join, and start the game at our leisure. We even added a Slack integration to our UI that would automatically send an invite with the game id to teams whenever a game they were expected to join was created.

Another thing we wanted to do was to prevent open source Vindinium bots from working. This ensured that lazy students wouldn’t simply copy a Github project, and  thus dominate all other teams. Consequently, we modified most constants such as the cost of visiting a tavern, the life provided by a tavern, and the damage done by hero's hits. We also added spikes, a new type of tile. Spikes can be passed through just like air but they deal damage to your hero.

These changes allowed us to easily manage the Vindinium server (through our custom UI) and created a fun and diverse environment for the participants. Spikes added a surprisingly nice complexity to the game and led to some interesting pathfinding strategies.

We also learned a lot while coding the challenge, this year we tackled with Scala, Akka, MongoDB, AWS, NodeJS, React, and TypeScript.

![image]({{ site.baseurl }}/images/blitz2016/tv.png)

## The contenders

This year we made a roll call to our amazing colleagues to see if they were interested in also participating to Blitz. Needless to say, it took about 10 minutes to build two complete teams. We made sure the Coveo teams didn’t know about the challenge. They needed to be good, they represent Coveo! Luckily for us, the two Coveo teams finished first and second. Congrats to Brute Force It (Alexandre, Frédéric, Vincent, Pierre-Alexandre) and WOW BLITZ AWSOME (Mathieu, Charles, Denis, Jean-Philippe).

![image]({{ site.baseurl }}/images/blitz2016/coveoteams.png)

## The winners

Since the first and second places were taken by the Coveo teams (which couldn't win the prizes), team *Comeo* (François Chantal, Olivier Précourt, and Samuel Thériault-Hall) got first prize and each member won a GoPro. Team *int elligence;* (Guillaume Chevalier, Nicolas Tremblay, Raphaël Gaudreault, and Jean-Benoît Harvey) members each got a Best Buy gift card for its second position. Kudos to those two teams!

![image]({{ site.baseurl }}/images/blitz2016/winners.png)

## Wrap up

We finished the day by having each team explaining the algorithms used to solve the challenge, grabbed a cold beer and a slice of pizza, and discussed with students. We’ve listed some solutions on the [Coveo Blitz 2016 GitHub account](https://github.com/coveoblitz2016). Send us your solution if yours isn’t listed! Also, be sure to check out the [Vindinium subreddit](https://www.reddit.com/r/vindinium) for great AI solutions.

We hope you’ve enjoyed your day as much as we did and hope to see you next year for another awesome challenge. Be sure to take a look at the [video](https://youtu.be/MDVV4v82vz4), the [photo album](https://goo.gl/photos/qMLEorRdrejnjpx79) by [Nick Pelletier](https://twitter.com/habanhero), and read more about [past challenges](https://search.coveo.com/#q=blitz&sort=relevancy&f:sourceFacet=[Web%20-%20TechBlog]&f:languageFacet=[English]&f:platformFacet:not=[Coveo%20Platform%206.5]).

<iframe width="560" height="315" src="https://www.youtube.com/embed/MDVV4v82vz4" frameborder="0" allowfullscreen></iframe>
