---
layout: post

title: "How to leverage Hosted search pages API to ease UI integration"

tags: [hosted search page, UI integration, search pages api]

author:
  name: Anthony Chouan
  bio: Solution Specialist
  image: achouan.jpg
---
[JSUI](https://docs.coveo.com/en/361/javascript-search-framework/javascript-search-framework-tutorials) lets you build visually rich, full-featured search interfaces. Thanks to the [Hosted Search Pages](https://docs.coveo.com/en/1656/build-a-search-ui/manage-hosted-search-pages), Coveo platform users (even the ones with no programming skills) can discover their content with the WYSIWIG [Interface Editor](https://docs.coveo.com/en/1852/build-a-search-ui/use-the-interface-editor). All the resources used to setup a Hosted search page are now available through the Search Pages API, how can we benefit from this API and ease our JSUI integrations?

<!-- more -->

## Limits of the usual approach

At Coveo Professional Services, the JSUI integration in our client environments can be painful. Here are a few key points to illustrate: 

- Code is packaged before deployment, Javascript and CSS are easily bundled, yet we still need to make sure it ends up in the header of our client pages.
- Ideally the HTML would be handled in a separate file on the client system, the reality is that it is common that our HTML must be appended to an existing client file, which is adding some merge operations.
- The deployment process can be done by our team if we get some proper access, but client may also handle it. We usually have access to a Dev environement but it is not systematic. A cloud solution access is usually easy to handle, but if we need a VPN access the problems begin to arise.
- Quite often, the client Web technology forces us to ramp up on systems we don't know (and no, it is not necessarily a good opportunity to learn something new). 
- Finally, like our R&D teams, we like the benefits of Continuous deployment, but we rarely have the opportunity to enjoy it.

Even for clients who integrate JSUI by themselves, it is usually coupled to their own Web application putting UI Integration and deployments at risk ! Ideally, the Coveo integration would be a one time job and require minimum code. Now let's see how client UI and JSUI development can be decoupled.

## Hosted Search Pages API

Recently, [Search Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search Pages#/) has been improved, it now lets us download all the resources required to load a search page.

## Hosted Search page component with Sitecore

Sitecore product team were the first to jump on the occasion to leverage the Search Page API upgrade. They have added a [Sitecore server side component](https://docs.coveo.com/en/3257/coveo-for-sitecore-v5/integrate-a-coveo-platform-search-page-in-a-sitecore-item) that renders an HTML component, then Coveo for Sitecore bundled Javascript handles the code logic to fetch Coveo API. [^1]

## VueJS use case

On of our client has decided to move to Sitecore and we had to deliver 5 search interfaces in 5 weeks. They decided to go with Sitecore JSS and the VueJS library. As VueJS is not supported yet with C4SC OOTB package[^2], the solution has been to guide the client to implement VueJS code logic to implement a similar logic to the OOTB C4SC component.

## Hosted Search page Web component

After I presented this client internally, our fiend at PS, Jean-François Allaire, decided to invest some time to develop a more generic solution by using a [Web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components). Source code can be found here : [https://github.com/Coveo-Turbo/hosted-search-page](https://github.com/Coveo-Turbo/hosted-search-page).
Jean-François implemented it with [Wind River](https://www.windriver.com/result#t=All&sort=relevancy).

Then very little code is needed to integrate our search page and PS team has all the control over the Hosted Search page.

Add the JS package in the header:
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
var COVEO_ORG_ID = 'windriversystemsproductionwo0u9w38';
var COVEO_SEARCH_PAGE_API_KEY = 'xxb0f5e421-e03e-4ac1-9ec5-3b6110ace49e';

var hostedGlobalSearchBox = document.getElementById('globalSearchBox');
if (hostedGlobalSearchBox) {
	hostedGlobalSearchBox.configure({
		orgId: COVEO_ORG_ID,
		apiKey: COVEO_SEARCH_PAGE_API_KEY,
		pageId: '7f94366f-f006-4c31-8520-a831088f755a'
	});
}

var hostedSearchBox = document.getElementById('searchBox');
if (hostedSearchBox) {
	hostedSearchBox.configure({
		orgId: COVEO_ORG_ID,
		apiKey: COVEO_SEARCH_PAGE_API_KEY,
		pageId: 'ba7d9308-6d12-4603-b879-ebc79720c3fd'
	});
}

var hostedSearchPage = document.getElementById('searchPage');
if (hostedSearchPage) {
	hostedSearchPage.configure({
		orgId: COVEO_ORG_ID,
		apiKey: COVEO_SEARCH_PAGE_API_KEY,
		pageId: 'ff2893fe-85e4-454e-9e40-fa55fe1b9be6',
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
For professional services, this approach is a big win. Add to this the coveo-turbo initiative, you can start building search pages locally and push them to the platform in a matter of seconds thanks to the [coveo-turbo CLI](https://coveo-turbo.github.io/docs/CLI-reference.html#deploy-a-page-to-the-coveo-platform). JS and CSS customizations are supported as they are injected inline between script and style tags. 

We recommend to use bundled [coveo-turbo custom components](https://coveo-turbo.github.io/#components) as much as possible to keep the inline header script as light as possible. 

#### Client concerns to consider before going forward with this approach:
- Is client ok with the fact that Javascript code is on Coveo side (let them know that JSUI will still run client side but a delay to download the scripts is added)?
- Even if the Coveo API is responsive enough for most of our cases, for commerce clients for example that have a lot of visits, stress tests should be run. 
- Ideally, Coveo product team will provide this feature OOTB and the endpoint will be CDN driven (VS API call).
- Deployment process can be done from the source code (locally or build server -> nice way to get Continous Deployment right?). Snapshot resources also lets you package and deploy search pages. Copy paste the DOM from the editor will not be enough as the header is skipped in the editor.
- If client uses a SPA framework, same as for regular JSUI integration, you will have do defer the initialization based on the framework events

[^1]:In order to support Sitecore JSS (headless approach), an [NPM](https://www.npmjs.com/package/coveoforsitecore-jss/v/0.1.39 ) library has been developed.  
[^2]: Last time I checked, Sitecore JSS had to be implemented with React to support Hosted Search Page functionalities (Sitecore JSS also offers VueJS and Angular)
