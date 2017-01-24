---
layout: post

title: "Applying Site Search Best Practices using Sitecore Part 3"
tags: [Sitecore, Coveo for Sitecore, Site Search Best Practices Series]

author:
  name: Simon Langevin
  bio:  Coveo for Sitecore Solution Architect
  image: slangevin.png
---

This is the third installment on my journey to cover all the best practices listed in the [Best Practices for Site Search](http://www.coveo.com/en/resources/ebooks-white-papers/best-practices-for-site-search) eBook.

If you missed the previous post:

[Part 1](http://source.coveo.com/2016/12/07/applying-site-search-best-practices-using-sitecore/)
<br>
[Part 2]()

<!-- more -->

## Search Driven Content Pages

![Listing Pages](/images/SiteSearchBestPractices/listingpages.png)

Search driven content pages, or listing pages, are result lists usually not offering a free text search box. The pages themselves will tend to focus on a limited type of content compared to a standard search result page.

On a technical side, a search driven content page is simply a Coveo Search View rendering with several options removed.

### 9. Use search to drive your listing pages

Let's start by building the search driven listing page. You will firs start with the standard Coveo Search View rendering and use the [properties](https://developers.coveo.com/x/PgHvAQ) of the component to remove what you might not need.
The Layout section will give you a large amount of options, so here is what I removed in the screenshot above:

* Display the main search box
* Display query duration
* Display query summary
* Display the tabs sections

This will result in a fairly simple result page without the option for your users to search using free text queries.

If you followed the part 1 of this series of blogs, you might have removed the search box already to use a global one in the header. 
Just make sure that the id of the search page use for listing is not the one being reference as an external component, since it will bind the search box to your listing page.

For the styling, well a listing page is a good example of results without the need for an excerpt, which I covered in Part 2 section 8. Simply use the underscore.js templates to provide the style you want like you would do with a standard search page.

Finally, the scope. I have not yet covered the ways to filter the query scope so far, but this is an important part of any search solutions.
A query scope is simply a set of filtering expressions to focus on a part of the results. Security is not a part of the query scope, which means that you should not filters to hide content from certain users. 
Instead, Coveo does a permission mapping at the index level, but this is another subject which I would not cover here, but if you want to learn more on security, read this [article](https://onlinehelp.coveo.com/en/cloud/security_identities.htm).

The filtering expressions can be added programmaticaly or using the Sitecore rule engine if you have an Enterprise edition. In the example above, the listing page is only showing content from the Team Member template in Sitecore. The template is a field in Sitecore and can be used for filtering. 

Here is an example using the Sitecore rule engine directly in the properties of the component (ranking editor of the Enterprise edition):

![Ranking Editor](/images/SiteSearchBestPractices/ruleenginefilter.png)

And a example through JavaScript code directly in a copy of the SearchView.cshtml file:

```js
Coveo.$('#@Model.Id')
// We hook ourselves to the bildingQuery event, so all the component exists, but the query has not yet been sent to the index.
.on(Coveo.QueryEvents.buildingQuery, function(e, args) {
  // We add a filter expression to display only items that are using the Team Member template.
  args.queryBuilder.advancedExpression.add('@(Model.ToCoveoFieldName("_templatename")) == "Team Member"'); 
})
// Then we pursue the initialization
.coveoForSitecore('init', CoveoForSitecore.componentsOptions);
```

A full step by step guide for the ranking editor is available [here](https://developers.coveo.com/x/q4EKAg), and for the JavaScript approach [here](https://developers.coveo.com/x/WADvAQ).

The above will make sure that our page is only listing content from our selected template. The query syntax used is unique to Coveo, you can find the full guide [here](https://onlinehelp.coveo.com/en/ces/7.0/user/coveo_query_syntax_reference.htm).

As a summary, we created a listing pafe by using the default Coveo Search View rendering and then cuztomizing the properties, the style and the scope, but not the logic underneath.
Which means that facets, sorts and every other feature of a Coveo search result component can still be used. It also means that everything happening on your page will be tracked by Coveo Usage Analytics and can be used to power Coveo Reveal ART and Reveal Recommendations if you use Coveo Cloud.
Your static listing page will then start to learn, and can reorder the listing based on what is the most popular.

### 10. Offer facets to filter and navigate search-driven content

I mentioned above that using the Coveo for Sitecore Search View rendering to drive your listing pages will allow you to use several placeholders to add more advanced controls such as sorts, facets and tabs. 
This means that adding a facet to a listing page is as easy as adding it to any search result pages. The step by step guide can be found [here](https://developers.coveo.com/x/0QDvAQ).

These facets are dynamic so their value will adapt to the filters set on the page. They also come with several [properties](https://developers.coveo.com/x/fwDvAQ) which can be set directly from the Experience Editor. 

Manually setting the properties can be a lot of work if you have multiple listing pages. To speed up this process, use parameter items.
I briefly mentioned parameters items in the first part of this series of blogs. In brief, you can create parameters items which inherit from the CoveoModule templates. 
These items will contain preset options which you can use at a data-source when creating the item.

![Parameter Select](/images/SiteSearchBestPractices/parameterselect.png)

This way you can fine tune your facets and use them across your entire site without repeating the steps on each listing page.

### 11. Leverage all the "Contextual Clues" you can

I mentioned above that you can use a bit of JavaScript code to filter results based on certain conditions. You can obviously use this logic within any conditions set by your code. 
For example, a company selling desktop and mobile wallpapers might want to filter or boost images which fits the screen of the visitor:

```js
Coveo.$('#@Model.Id')
.on(Coveo.QueryEvents.buildingQuery, function(e, args) {
  var pageWidth = window.innerWidth;
  if(pageWidth < 600){
    // If the page width is smaller than 600 pixels, only show mobile wallpaper.
    args.queryBuilder.advancedExpression.add('@(Model.ToCoveoFieldName("Product Category")) == "Mobile"'); 
    // Or boost instead of filtering.
    args.queryBuilder.advancedExpression.add("$qre(expression:'@(Model.ToCoveoFieldName("Product Category")) == \"Mobile\"', modifier:'60')");
  }
  else {
    // If the page width is larger than 600 pixels, only show dekstop wallpaper.
    args.queryBuilder.advancedExpression.add('@(Model.ToCoveoFieldName("Product Category")) == "Desktop"'); 
    // Or boost instead of filtering.
    args.queryBuilder.advancedExpression.add("$qre(expression:'@(Model.ToCoveoFieldName("Product Category")) == \"Desktop\"', modifier:'60')");
  } 
})
.coveoForSitecore('init', CoveoForSitecore.componentsOptions);
```

I introduced a new concept in the code snippet above; boosting. Boosting is done using [Query Ranking Expressions (QRE)](https://developers.coveo.com/x/eIGfAQ) which will accept a condition and a modifier. 
The condition is using the same field query syntax used to define the query scope. The modifier is an integer which will tell the index by how much this result should be boosted. The number can be negative does not have any limits.
I recommend setting it between ```-100``` and ```100``` since larger numbers will simply override basic relevance. Ranking management is a rich topic which I will not fully cover in this post, but you can read more about it [here](https://onlinehelp.coveo.com/en/ces/7.0/administrator/index_ranking_phases.htm).

Another great use of contextual clues is using geolocation to return the results closest to the user's location. Coveo supports [Query Functions](https://developers.coveo.com/x/XQCq) which allows you to generate a new field at query time based on the result of a mathematical operation.
Here is an example of a query function to retrieve the distance between to points using the JavaScript [dist function](http://processingjs.org/reference/dist_/):

```js
// The values are hardcoded; simply replace them with your logic to retrieve the location of the user.
var refLat = "37.77919";
var refLng = "-122.41914";
// Used for value in meters.
var radius = "10000"; 
  
Coveo.$('#@Model.Id')
.on(Coveo.QueryEvents.buildingQuery, function(e, args) {
  // For this Query Funciton to work, you need to have a longitude and latitude field on your items.
  // If the latitude and longitude fields are Sitecore fields, use the ToCoveoFieldName helper.
  var geoQuery = "$qf(function:'dist(@latitude,@longitude," + refLat + "," + refLng + ")', fieldName: 'distance') @distance<" + radius;
  if (args && args.queryBuilder) {
    // This is the filter, remember that you could also use a Query Ranking Expression to boost instead of filter.
    args.queryBuilder.advancedExpression.add(geoQuery);
  }
})
.coveoForSitecore('init', CoveoForSitecore.componentsOptions);  
```

This code sample was taken from this [help page](https://developers.coveo.com/x/CYGfAQ).

### 12. Personalize with the Sitecore xDB

Sitecore xDB gives you the opportunity to categorize your user (Patterns) and your content (Profiles). If this is done properly, you can change the experience of your users and give more priority to content more relevant to them.

To change the experience, [rendering personalization](https://doc.sitecore.net/sitecore_experience_platform/digital_marketing/personalization/walkthrough_personalizing_components) can be used on all Coveo for Sitecore components.
For example, I might use the same interface to show products and support documentation on these products. I created a pattern for propects and one for existing clients. 
The users will have a pattern assign to him/her when he/she sign in or visit a content with a certain profile card. 
Once the pattern is assigned to the user, you can use personalization on the component directly from the Experience Editor. 
You can then modify the behavior of the component using parameters items, or simply hide the component as shown on this screenshot:

![Personalization](/images/SiteSearchBestPractices/personalization.png)

Back to the example of prospects and existing clients, you might use this to show a specific facet or tab only for existing users with advanced preferences related to the product.

As for the results themselves, you can use the same logic I detailed in the previous version to boost or filter content based on the pattern of the current user.
You can also filter content based on the profile card associated to this content. In order to do this, you will first need to index Analytics fields by adding the indexAnalyticsFields element to the Coveo.SearchProvider.Custom.config and setting it to true.
For more information on this element, please refer to this [guide](https://developers.coveo.com/x/jwHvAQ).

Once you have the Analytics fields indexed, you can use them in any filtering or boosting rules, or if you have the Enterprise Edition, use [Automatic Boosting](https://developers.coveo.com/x/CQDvAQ).
Automatic boosting will map profile cards and user patterns in order to provide content matching the pattern of the user.

Here are two example of the same page showing different content for two different user patterns.

![Developer Profile](/images/SiteSearchBestPractices/developerprofile.png)

![Marketer Profile](/images/SiteSearchBestPractices/marketerprofile.png)

This is it folks, remember that a listing page is nothing more than a search result page with a custom style, scope and set of features. This means that everything about context and Sitecore xDB can be used on a standard search result page.