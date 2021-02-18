---
layout: post

title: "How to leverage Hosted search pages API to ease UI integration"

tags: [hosted search page, UI integration, search pages api, coveo-turbo]

author:
  name: Anthony Chouan
  bio: Solution Specialist
  image: achouan.jpg
---
The [Coveo JavaScript Search Framework](https://docs.coveo.com/en/361/javascript-search-framework/javascript-search-framework-tutorials), also known as the JSUI, lets you build visually rich, full-featured search interfaces. Thanks to the [Hosted Search Pages](https://docs.coveo.com/en/1656/build-a-search-ui/manage-hosted-search-pages) and the WYSIWIG [Interface Editor](https://docs.coveo.com/en/1852/build-a-search-ui/use-the-interface-editor) Coveo platform users (even the ones with no programming skills) can discover their content easily. All the resources used to set up a Hosted search page are now available through the Search Pages API, how can we benefit from this API and ease our JSUI integrations?

<!-- more -->

## Limits of the usual approach

At Coveo Professional Services, the JSUI integration in our client environments can be painful. Here are a few key points to illustrate: 

- Code is packaged before deployment, JavaScript and CSS are easily bundled, yet we still need to make sure it ends up between the HTML head element of our client pages.
- Ideally, the HTML would be handled in a separate file on the client system, the reality is that it is common that our HTML must be appended to an existing client file, which is adding some merge operations.
- The deployment process will vary from one client to another. It can be done within a few minutes for some client and for others it will take days.
- Quite often, the client Web technology forces us to ramp up on systems we don't know (and no, it is not necessarily a good opportunity to learn something new). 
- Finally, like our R&D teams, we like the benefits of Continuous deployment, but we rarely have the opportunity to enjoy it.

Even for clients who integrate JSUI by themselves, it is usually coupled to their own Web application putting UI Integration and deployments at risk! Ideally, the Coveo integration would be a one time job and require minimum code. Now let's see how client UI and JSUI development can be decoupled.

## Hosted Search Pages API

Recently, [Search Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search Pages#/) has been improved, it now lets us download all the resources required to load a search page.

![Sitecore Hosted Search page Editor]({{ site.baseurl }}/images/2021-02-15-leverage-hosted-search-pages/1852-DragAndDroppingComponentsExample.gif)


## Sitecore Hosted Search page component

The Coveo for Sitecore product team were the first to jump on the occasion to leverage the Search Page API upgrade. They have added a [Sitecore server side component](https://docs.coveo.com/en/3257/coveo-for-sitecore-v5/integrate-a-coveo-platform-search-page-in-a-sitecore-item) that renders an HTML component, then the JavaScript bundled in Coveo for Sitecore handles the code logic to fetch Coveo API. [^1]

![Sitecore Hosted Search page component]({{ site.baseurl }}/images/2021-02-15-leverage-hosted-search-pages/SitecoreHostedSearchPage.png)

For more details on how to implement this solution, have a look at this great article from Hugo Santos [Coveo for Sitecore – Cloud Hosted Search Page, The Fastest Way of Creating a Sitecore Search Interface Ever](https://hls-consulting.com/2020/06/24/coveo-for-sitecore-cloud-hosted-search-page-the-fastest-way-of-creating-a-sitecore-search-interface-ever/).

## VueJS use case

Our client OsiSoft decided to move their [public Website](https://www.osisoft.com/) to Sitecore, we had short time (5 weeks) to deliver 5 search interfaces. They decided to go with Sitecore JSS and the VueJS library. As VueJS is not supported yet with C4SC OOTB package[^2], the solution has been to guide the client to implement VueJS code logic to implement a similar logic to the OOTB C4SC component.

## Hosted Search page Web Component

After I presented OsiSoft implementation internally, Jean-François Allaire from PS decided to invest some time to develop a more generic solution by using a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components). Source code can be found here : [https://github.com/Coveo-Turbo/hosted-search-page](https://github.com/Coveo-Turbo/hosted-search-page).
It has been implemented for [Wind River](https://www.windriver.com/result#t=All&sort=relevancy).

Very few code is needed to integrate our search page and we have all the control over the Hosted Search page.

Add a reference to the JS package between the HTML head element:
```html
<script src="https://unpkg.com/@coveops/hosted-search-page@latest/dist/index.min.js"></script>
```
The Web Components that will render the search interface, its searchBox and a standalone searchBox: 
```html
<hosted-search-page id="searchPage"></hosted-search-page>

<hosted-search-page id="searchBox"></hosted-search-page></div>

<hosted-search-page id="globalSearchBox"></hosted-search-page>
```

Code initialization (note the custom event CoveoScriptLoaded instead of page load): 

```javascript
var COVEO_ORG_ID = '**************************';
var COVEO_SEARCH_PAGE_API_KEY = '**********-****-****-****-************';

var hostedGlobalSearchBox = document.getElementById('globalSearchBox');
if (hostedGlobalSearchBox) {
	hostedGlobalSearchBox.configure({
		orgId: COVEO_ORG_ID,
		apiKey: COVEO_SEARCH_PAGE_API_KEY,
		pageId: '**********-****-****-****-************'
	});
}

var hostedSearchBox = document.getElementById('searchBox');
if (hostedSearchBox) {
	hostedSearchBox.configure({
		orgId: COVEO_ORG_ID,
		apiKey: COVEO_SEARCH_PAGE_API_KEY,
		pageId: '**********-****-****-****-************'
	});
}

var hostedSearchPage = document.getElementById('searchPage');
if (hostedSearchPage) {
	hostedSearchPage.configure({
		orgId: COVEO_ORG_ID,
		apiKey: COVEO_SEARCH_PAGE_API_KEY,
		pageId: '**********-****-****-****-************',
		htmlOnly: true
	});
}

document.addEventListener('CoveoScriptsLoaded', function () {

	var globalSearchbox = hostedGlobalSearchBox.searchPage.querySelector('.CoveoSearchInterface');

	if (coveoToken && coveoToken.token) {
		Coveo.SearchEndpoint.configureCloudV2Endpoint(COVEO_ORG_ID, coveoToken.token);
		if (Coveo.WindriverHelper.isSearchPage()) { 
			var search = hostedSearchPage.searchPage.querySelector('.CoveoSearchInterface');
			var searchbox = hostedSearchBox.searchPage.querySelector('.CoveoSearchInterface');
			Coveo.init(search, {
				externalComponents: [
					globalSearchbox,
					searchbox
				]
			});
		} else {
			Coveo.initSearchbox(globalSearchbox, '/result', {});
		}
	}
});
```

## Conclusion:
Timewise, this approach is a big win. Add to this the use of [coveo-turbo](https://coveo-turbo.github.io/), you can start building search pages locally and push them to the platform in a matter of seconds, as explained [here](https://coveo-turbo.github.io/docs/CLI-reference.html#deploy-a-page-to-the-coveo-platform). JS and CSS customizations are supported as they are injected inline between script and style tags. 

It is recommendeded to use bundled coveo-turbo [custom components](https://coveo-turbo.github.io/#components) as much as possible to keep the inline header script as light as possible. 

#### Client concerns to consider before going forward with this approach:
- Is the client okay with the fact that JavaScript code is on Coveo side (let them know that JSUI will still run client side but a delay to download the scripts is added)?
- Even if the Coveo API is responsive enough for most of our cases, stress tests should be run, especially for commerce clients that have a lot of visits. 
- Deployment process can be done from the source code (locally or build server -> nice way to get Continous Deployment right?). Snapshot resources also lets you package and deploy search pages. Copy paste the DOM from the editor will not be enough as the header is skipped in the editor.
- If client uses a SPA framework, same as for regular JSUI integration, you will have do defer the initialization based on the framework events

[^1]:In order to support Sitecore JSS (headless approach), an [NPM](https://www.npmjs.com/package/coveoforsitecore-jss/v/0.1.39 ) library has been developed.  
[^2]: Last time I checked, Sitecore JSS had to be implemented with React to support Hosted Search Page functionalities (Sitecore JSS also offers VueJS and Angular)
