---
layout: post

title: "Building a resource locator"

tags: [Index Extensions, Query Extensions, JS UI custom components, Geocoding, Google Maps]

author:
  name: Wim Nijmeijer
  bio: Sales Engineer
  image: Wim3.png
---

_This is the first blog post of a new serie entitled “Build it with Coveo”. The serie will present innovative use cases for the Coveo Platform, always including full code samples._

Coveo customers use the platform in a multitude of ways. Many in the consulting, resource management business often ask us if our search technology could help them better match resources and project.

## Use case: 
What if you want to find the best peer/employee with knowledge around “Artificial Intelligence”? Moreover, what if you need to add constraints such as “available for the next two months”?
![RL1]({{ site.baseurl }}/images/ResourceLocator/RL1.png)

## Typical approach/solution:
When using a search engine, your default behavior will be to organize your search journey as follow:

* First search in your Resume database/repository for people with “Artificial Intelligence” in their resume
* Once suitable individuals are identified, you’ll look up their locations
* Once you know the locations, check in the HR database if they are working on a project in the next 2 months
It is very time consuming and arguably not very efficient. You can do better! How can we improve this whole journey? Easy: build an index containing all the data you need and surface it into a Resource Locator interface everybody can use.

## What do you need?
Before you start building a UI, you need to have (at least part of) the following data available. The data you need is:

* People records (are they in Active Directory, or in a Database?). 
* For each Person you need an ID to identify them (like an employee unique ID)).
* Resumes. The metadata of the resume should mention the unique employee ID.
* Availability database. When is a person available should be stored in here (typically HR-IS systems, ERP, etc.).
Since you’ll probably want to geocode the cities so you can display everything nicely on a map, you’ll need a database with cities and/or zip codes (and their Latitude/Longitude).

<!-- more -->

# Phase A. Getting the content into our index

You first need to make sure that we get the content into a single index. Coveo provides connectors to index most of the data wherever it comes from (database, salesforce, sitemaps, custom repository using the push API, etc.). 

In this example I am using 3 “Push sources” to get the content we want inside the index. 
For more info on Coveo’s Push API: [Push API](https://developers.coveo.com/display/public/CloudPlatform/Push+API+Reference)

We have one challenge: our People records do not contain the Lat/Lon for the location and the availability data. We could of course gather that before we push the content, but we can also use an “Indexing Pipeline Extension” which can be called before each record is added to the Coveo index.
For more info: [Extensions](https://onlinehelp.coveo.com/en/cloud/extensions.htm) and [Extension API](https://developers.coveo.com/display/public/CloudPlatform/Extension+API+Reference).

The steps involved for enriching the data are:

* Step 1. Getting the [Lat/Lon] for a Zipcode/City from a DynamoDB database (hosted on AWS) - don’t worry: if you are an Azure fan, you can refactor the code
* Step 2. Getting the [Availability] for a person from a DynamoDB database (hosted on AWS)
* Step 3. Getting an image for the person and add it to the thumbnail of the search result

Extensions can also log data, which can be retrieved later, but I found it easier to log the results into an index field (called [myerr]), so I can use the Coveo Content Browser to examine the progress/debugging of my script.
![RL2]({{ site.baseurl }}/images/ResourceLocator/RL2.png)

## Step 1. Getting the [Lat/Lon] for a Zipcode/City from a DynamoDB database
From the internet I got two files, one containing US Zip codes and one with the World cities coordinates. 
For example: 
US Zip codes found here [Zip Codes](https://gist.github.com/erichurst/7882666)
World cities: [World Cities](http://simplemaps.com/data/world-cities)
and a Python script to easily import txt/csv files into a DynamoDB: [Script](http://justprogrammng.blogspot.nl/2016/08/python-script-to-move-records-from-csv.html).

Next, you load all that data into a DynamoDB database (using the above script) and, bam, you are ready with the geocoding part!
![RL3]({{ site.baseurl }}/images/ResourceLocator/RL3.png)

Now, you need to add that information to your people records. Each record in the directory contains a field called ‘locationzip’ or similar which we need to assign to a Coveo Field. In your Cloud Organization configuration [See](https://onlinehelp.coveo.com/en/cloud/fields.htm), add a brand new field called ‘myzip’ and assign the value %[locationzip] to it in the Person content source:
![RL4]({{ site.baseurl }}/images/ResourceLocator/RL4.png)

Note: In the Coveo Indexing Pipeline Extension you could use the metadata from the document directly or the mappings defined above. So in our case you could get the %[myzip] or directly the %[locationzip] fields. Mapping fields is only necessary if you want to display the field in the UI, use the field as a Facet, or use the field as a relevancy booster.

You also need to create the following fields using the technique above:
mylat2 (Decimal), mylon2 (Decimal), myusername (String), myrownr (String). 

Next up: the Indexing Pipeline Extension script.
Extension scripts are created in Python and the following libraries are available by default: requests, boto3, pymongo, msgpack-python and pytz.
For more information: [Document API Ref](https://developers.coveo.com/display/public/CloudPlatform/Document+Object+Python+API+Reference). 

To create the script: [Extensions](https://onlinehelp.coveo.com/en/cloud/extensions.htm).
Make sure to check the boxes only for the type of content you really need (this will save valuable execution time):
![RL5]({{ site.baseurl }}/images/ResourceLocator/RL5.png)

For example, only select [Original File] if you want to change the original document.
For this use case, you do not need to modify any of the original content, so none of the checkboxes are needed.

Our script does the following:

1. Gets the metadata field (myzip or locationzip)
![RL6]({{ site.baseurl }}/images/ResourceLocator/RL6.png)

2. Builds up a connection to Dynamo DB and our Table
![RL7]({{ site.baseurl }}/images/ResourceLocator/RL7.png)

3. Executes the query (note: primary key’s in Dynamo DB are case sensitive)
![RL8]({{ site.baseurl }}/images/ResourceLocator/RL8.png)

4. Retrieves the results and store them into our fields (mylat2, mylon2)
![RL9]({{ site.baseurl }}/images/ResourceLocator/RL9.png)

**Important:** a script has a maximum execution time of 5 seconds. It is possible to add multiple scripts, they will be executed in the order you add them to the source. If the above takes too much time, you could create 3 seperate scripts to do the work (which will result in a 15 seconds execution time).

Later, when the content is indexed, you can check in the [Content Browser](https://onlinehelp.coveo.com/en/cloud/content_browser.htm) that the field [myerr] is popuated.
Like: 
```
myerr Start;Zip:19103;Execute query with city 19110;Getting lat 39.952896
```

## Step 2. Getting the [Availability] for a person from a DynamoDB database
The next step in your Extension script is to get the Availability of a person. Normally that information would be stored in a HR database. 

You could again get that data from a Dynamo DB database which could be updated daily from the original database/repository. The only information you need in your database is: Username/userid and the dates when the employees are available (or not available). Most important is that your Coveo field contains the dates when a person IS available. 

In this scenario the end result of the script is a field called [mydateavail] which is filled with values like:
```
20170601;20170602;20170603;20170604;20170605;20170606;20170607;20170608;20170609;20170610;20170611;20170612;20170613;20170614;20170615;20170616;20170617;20170618;20170619;20170620;20170621;20170622
```
## Step 3. Getting an image for the person and add it to the thumbnail of the search result
Indexing Pipeline Extensions have access to all content, they can read permissions, update permissions, have access to all the fields and to the content preview. Your current People record does not contain a thumbnail image to be shown when someone searches for a colleague or resource. The images are stored on a webserver with a naming convention [username.jpg]. 
The extension script can download them, and store them in the datastream for the thumbnail.
![RL10]({{ site.baseurl }}/images/ResourceLocator/RL10.png)

Now that the script is ready, you need to assign it to your source. I first created the source ([See]( https://onlinehelp.coveo.com/en/cloud/add_edit_push_source.htm).

For now we need to manually embed a reference to the Extension into the JSON of our source:
To do so: take note of the Indexing Pipeline Extension ID from the extensions page:
![RL11]({{ site.baseurl }}/images/ResourceLocator/RL11.png)
Goto your source, and hit ‘Edit JSON’.
Scroll completely down and enter the above ID as:
![RL12]({{ site.baseurl }}/images/ResourceLocator/RL12.png)

You are now all set! You can start building up your index, check logs and start working on your search interface.

# Phase B. Building a People Locator Search interface.
The data is in our index, time to start building a search interface for it. These are our requirements:

* Step 1. Search in People, People Resume’s and Additional information records, but only show People records.
* Step 2. Show the related records found for the current Person record. 
* Step 3. Take the selected availability dates into consideration and show them at the result level.
* Step 4. Provide a Google map to show the location of the people found and enable the map to be used as a filter.
* Step 5. Enable to click on a person on the map to show detailed information in a “side panel”, inside the “side panel” execute a proximity search (to find people within 50 miles)
The beauty of the Coveo Search Interfaces is that they are very flexible, all events can be intercepted and changed.

## Step 1. Search in People, People Resume’s and Additional information records, but only show People records.
Our search interface should only show People records, but should search within the Resume and Additional records at the same time. Looks complicated, but this is part of Coveo’s capabilities. To do this, we need to add additional logic to our query. We do that by adding an event on the ‘buildingQuery’ event [See](https://developers.coveo.com/display/public/JsSearchV1/Events), but only when our ‘People’ interface is active.
``` javascript
Coveo.$('#search').on("buildingQuery", function (e, args) {
	    //Only activate on people search interface
		if (Coveo.$('.CoveoSearchInterface').coveo('state', 't') == 'People') {
		}
	});
```
The query which we want to add is what we call a nested query. A nested query is essentially an outer join to another query. The requirement here is that our key-field must be a faceted value. In our case the field [myusername] is used and defined as a facet.
Before we can change our query, we first need to take the basic and advanced expressions from the current query.
``` javascript
var basicExpression = args.queryBuilder.expression.build();
var completeQuery = (typeof basicExpression === 'undefined') ? "" : "" + basicExpression + "";
var advancedExpression = args.queryBuilder.advancedExpression.build();
var advancedQuery = (typeof advancedExpression === 'undefined') ? "" : "(" + advancedExpression + ")";
```
The completeQuery variable now contains the text entered in the search box, the advancedQuery parameter contains the facets and/or selection from the map.

The nested query will look like:
```
@mylat2 @syssource=WimPeople @myusername=[[@myusername] @syssource=(WimPeopleAdd,WimPeopleResume)   (" + completeQuery + ")] " + advancedQuery
```
This means:
The nested query is the part between the []. In our example this translates in: 

* Search in the sources WimPeopleAdd and WimPeopleResume for the text entered in the search box but
* Report back the keyfield [@myusername]. 
* The usernames returned by the nested query will be used in the full query.

A practical example:
If I search for “Artificial Intelligence”. Our nested query will look like:
```
@mylat2 @syssource=WimPeople @myusername=[[@myusername] @syssource=(WimPeopleAdd,WimPeopleResume) (Artificial Intelligence)]
```

In addition, our nested query we also want to search the regular People records. The above nested query should be added as a disjunction expression (essentially an OR).

Putting all the pieces together will result in:
``` javascript
	Coveo.$('#search').on("buildingQuery", function (e, args) {
	    //Only activate on people search interface
		if (Coveo.$('.CoveoSearchInterface').coveo('state', 't') == 'People') {
			
			//We also want to add a nested query against the resume's
			// add the disjunction query to get all comments, attachments and tickets matching the query
			var basicExpression = args.queryBuilder.expression.build();
			var completeQuery = (typeof basicExpression === 'undefined') ? "" : "" + basicExpression + "";
			var advancedExpression = args.queryBuilder.advancedExpression.build();
			var advancedQuery = (typeof advancedExpression === 'undefined') ? "" : "(" + advancedExpression + ")";

			if (completeQuery != "") {
				//Be aware: in the nested queries the first key and the foreign key needs to be facets
				args.queryBuilder.disjunctionExpression.add("@mylat2 @syssource=WimPeople @myusername=[[@myusername] @syssource=(WimPeopleAdd,WimPeopleResume)   " + completeQuery + "] " + advancedQuery);
			}
		}
	});

```

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
