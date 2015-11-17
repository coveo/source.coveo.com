---
layout: post

title: "Coveo JavaScript UI for Newcomers"
#subtitle: "Let's get started with the installation of the newest Coveo interface"


author:
  name: Karel Mpungi
  bio: Product Expert, Advanced Enterprise Search Platform
  image: kmpungi.jpg
---
The new Coveo JS UI has been available for a while now. How about getting off to the right start? Well you’re at the right place, here is a tutorial on how to configure and use the new Coveo JS UI.

## Step # 1: Installing the Coveo Search API

The Coveo Platform 7 comes with the Coveo Search API, a web service offering a REST interface that is used by other Coveo products such as the Coveo JavaScript Search interfaces to send query and receive search results from a Coveo unified index. 
The Coveo Search API REST endpoint can also be used by custom applications (see [REST Search API Home](https://developers.coveo.com/display/public/SearchREST/REST+Search+API+Home)).

![Coveo Rest Basic Diagram]({{ site.baseurl }}/images/JSUI101/CoveoRestBasicDiagram.png)

As shown in the following diagram, the Coveo Search API acts as is a bridge between the front-end search interfaces or applications and a Coveo Enterprise Search (CES) instance maintaining a unified index on the back-end. 
You can install the Coveo Search API on a server of your choice such as on the Coveo Master server (where Coveo Enterprise Search is installed), on a front-end server (where the Coveo JavaScript Search search is served from), or any other server. 
Once installed, the Coveo Search API runs as a Windows service.

When your deployment includes one or more Coveo JavaScript Search interfaces, you must install and configure a Coveo Search API.

Follow the instructions described [here](https://onlinehelp.coveo.com/en/ces/7.0/administrator/installing_the_coveo_search_api.htm) in order to install the Coveo Search API. Then you’ll be asked to [customize and start the Coveo Search API](https://onlinehelp.coveo.com/en/ces/7.0/administrator/customizing_and_starting_the_coveo_search_api.htm).

Here is an example of a working "config.yml" file:

![Config YML Example]({{ site.baseurl }}/images/JSUI101/ConfigYMLExample.png)

Once you started the “Coveo Search API” service, you can validate that the service is accessible from various computers:

	a.	Using a browser, access the URL in the following format:
	
	"http://[REST_API_SERVER]:[port]/rest/search"
	![Rest URL Example]({{ site.baseurl }}/images/JSUI101/RestURLExample.png)
	
	b.	Validate that the REST API JSON response appears in the browser
	![Rest API JSON]({{ site.baseurl }}/images/JSUI101/RestAPIJSON.png)
	
## Step # 2: Creating the JS UI search page

Now that your Coveo Search API is well configured and up and running, you can now create your Coveo search interface in JavaScript.

	1.	Using a browser, access the URL in the following format: "http://[REST_API_SERVER]:[port]"

![Coveo JS Landing Page]({{ site.baseurl }}/images/JSUI101/CoveoJSLandingPage.png)
	
	2.	Click on "CLICK HERE TO START"

![Coveo JS Authentication]({{ site.baseurl }}/images/JSUI101/CoveoJSAuthentication.png)
	
	3.	Type your username and password, then click on connect, you’ll get the message below:

![Coveo JS Loading]({{ site.baseurl }}/images/JSUI101/CoveoJSLoading.png)
	
	4.	On the “CREATE A SEARCH PAGE” window, you can click on “CREATE PAGE” if you just want to only use the “All Content” search interface, or you can click on “MORE TABS” in order to add more search interfaces.

![Create A Search Page]({{ site.baseurl }}/images/JSUI101/CreateASearchPage.png)
	
	5.	By clicking on “MORE TABS”, you’ll see the out of the box search interfaces available
	
![Available Search Interfaces]({{ site.baseurl }}/images/JSUI101/AvailableSearchInterfaces.png)
	
	6.	Click on the ones that you want to add into your search page. As an example, let’s click on "People", "Email" and "SharePoint"
	
![Selected Interfaces]({{ site.baseurl }}/images/JSUI101/SelectedInterfaces.png)
	
	7.	Click on “CREATE PAGE”, you’ll get the message below:
	
![Creating]({{ site.baseurl }}/images/JSUI101/Creating.png)
	
	Here is your Coveo JavaScript search page:
	
![Search Page Final]({{ site.baseurl }}/images/JSUI101/SearchPageFinal.png)
	
You are good to go! But do not stop there, there is so much more to do with it! [Start here] (https://developers.coveo.com/display/public/JsSearchV1/JavaScript+Search+Framework+V1+Home)