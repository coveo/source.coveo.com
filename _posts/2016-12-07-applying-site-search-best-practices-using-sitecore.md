---
layout: post

title: "Applying Site Search Best Practices using Sitecore Part 1"
tags: [Sitecore, Coveo for Sitecore]

author:
  name: Simon Langevin
  bio:  Coveo for Sitecore Solution Architect
  image: slangevin.png
---

A few months ago, the Coveo for Sitecore Product and Marketing teams released a solid eBook on [Site Search Best Practices](http://www.coveo.com/en/resources/ebooks-white-papers/best-practices-for-site-search).
It is a great guide for high level planning, but when it comes to execution, there are some gaps that need to be filled.
In this series of blog posts, I will go over each of the 19 points and explain in details how to implement them properly.

I will be using Coveo for Sitecore 4.0.450 in a Sitecore 8.0 MVC environment. Take note that everything listed below can also be done in Web Forms, but will require a different syntax.

<!-- more -->

## The Search Box

![Search Box](/images/SiteSearchBestPractices/searchbox.png)

The Coveo JavaScript Search Framework contains a [SearchBox](https://coveo.github.io/search-ui/components/searchbox.html) component containing a query box (for user input), a search button, and an omnibox (used for suggestions).
Coveo for Sitecore will add this [component](https://developers.coveo.com/display/public/SitecoreV4/Search+Component+Properties) to your Sitecore solution in the form of a rendering tied to a .cshtml file found in the website Views folder.
Be aware that in order to work, you will also need to add the Search Box View Resources on every page using the search box. This [component](https://developers.coveo.com/display/public/SitecoreV4/Overview+of+CoveoSearchResources.ascx) contains the JavaScript and CSS references to run your search box.

For web forms, the same components are sublayouts tied to .ascx files.

### 1. Make it prominent

You will want to insert the search box in the header or your solution and use the same header accross the site.
Since both the search box and its resources are components, you can use simple placeholders logic and add the rendering manually or reference it through code.

#### Using a placeholder

The placeholder would look like this:

```js

@Html.Sitecore().Placeholder("search-box")
```

You can then add the Coveo Search Box renderings using the presentation details of whether:

* each item individually;
* the standard value item of the template.

![Rendering](/images/SiteSearchBestPractices/rendering.png)

As mentioned earlier, you will need both the Search Box View Resources and the Search Box View rendering. The resources need to be added before the search box; otherwise, the component will not load.
For more information on this subject, read this [article](https://developers.coveo.com/display/public/SitecoreV4/Inserting+a+Coveo+Search+Box+to+Your+Header).

#### Using a reference to the rendering

The drawback of manually adding the component is, as the name states, that you need to add it manually. 
You could instead directly reference the rendering in your header and avoid all the trouble.
This is my favorite approach since you only need to set it in the header and you are done for the entire site.

In your header, instead of adding a placeholder, you would add the following references:

```js

<!-- The resources first -->
@Html.Sitecore().Rendering("{id-of-the-search-box-resources}")
<!-- Then the search box item -->
@Html.Sitecore().Rendering("{id-of-the-search-box-view-rendering}", new { DataSource = "{parameters-item-of-the-search-box-view}" })

```

You might now wonder what the Datasource is.
All Coveo for Sitecore components have parameters templates found in the CoveoModule folder.

![Template Folder](/images/SiteSearchBestPractices/templatefolder.png)

Some of these parameters are mandatory, but their default value is empty. This means that adding the rendering without filling these parameters will simply break the component.
Modifying the standard value item of the default template is obviously not recommended. Instead, insert an item from the Coveo Search Box Parameters template and edit the settings according to your need.
The only mandatory field to change is the "Search page item"; simply point it to your search result page. Once your parameters item is completed, use its GUID as a DataSource for your rendering.

![Parameters Item](/images/SiteSearchBestPractices/parametersitem.png)

### 2. Make it mobile

The Coveo Search Box component is mobile friendly out of the box. You could still provide a few adjustments based on your environment.
Coveo for Sitecore's CSS can be found in the Coveo/css folder on the website root folder, but don't change anything there. This folder is completely replaced when you upgrade the solution, so your changes will be lost.
Instead, create your own CSS files with your custom styling.

If you feel bold and want to change the product directly, simply [clone our repo](https://github.com/coveo/search-ui) and create a pull request.

### 3. Keep it simple

#### Label it

As mentioned in best practice 1, the search box view rendering comes with a set of parameters. One of them is the	"Searchbox placeholder text." Use it to add a watermark in your search box.

#### Only one search box per page

First of all, if you followed my rendering reference approach in best practice 1 and created a search result page with the Coveo Search View Resources and Coveo Search View renderings, then your search result page will most likely break. 
This is normal since you are already including the resources for the search box in the header, and you are also adding the search interface resources for the result page.
To fix this, start by removing the Search Box View Resources when you are in a Coveo-driven page, then move the Coveo Search View Resources to the header in order for it to load before the search box.

Now that this is fixed, you will want to load only one search box. A Coveo search interface will contain a query box by default. You could simply keep this box and hide the header box on the search result page.

This is of course the simple approach, but you might want to keep the same style accross the site and keep the header box instead. The interface's search box can be removed simply by unchecking the "Display the main search box" checkbox on the [properties of the component](https://developers.coveo.com/display/public/SitecoreV4/Search+Component+Properties).

Once this is done, you will have a header search powering your search interface, but it is not perfect yet. The search box is a simple redirect to the search page, so using that search box will constantly reload your search page, which is not ideal.
The right approach is to load this search box as a component of the search result page. This was well explained in this [post](https://answers.coveo.com/questions/4830/adding-search-box-hides-the-coveo-search-sublayout), but let me go over it in details.

First of all, you will want to customize your copy (never the original!) of the SearchBoxView.cshtml file in order to add a new Boolean function detecting if the search box is on a search page:

```js
function isOnSearchPage() {
    return Coveo.$('#{idofmysearchpage}').length > 0;
}
```

The id of a Coveo Search rendering is computed randomly by default with the $GenerateUniqueId token. You can change this in the [property of the component](https://developers.coveo.com/display/public/SitecoreV4/Search+Component+Properties) itself.
Make sure to use a unique id since you want the behavior of the search box to change only on specific search pages.
You will then use this function as a condition to load the search box alone or add it as an external component of your search page. 

You can retrieve all the options of the search page components by using CoveoForSitecore.componentsOptions.
All of these components are then passed in the init method of the search page:

```js
Coveo.$(function() {
    Coveo.$('#@Model.Id').coveoForSitecore('init', CoveoForSitecore.componentsOptions);
});
```

Which means that in order to "give control" of your search page to the search box, you need to add it as a component. 
This said, the search box is included before the options are defined, so you need to extend these options from the search box.

```js
var searchOptionsForSearchBox = @(Html.Raw(Model.GetJavaScriptInitializationOptions()));
CoveoForSitecore.componentsOptions = Coveo.$.extend({}, CoveoForSitecore.componentsOptions, searchOptionsForSearchBox);
```

In the Coveo Search component, you will then also extend the options of the search box.

The end result would look like this for the SearchBoxView.cshtml:

```js
function isOnSearchPage() {
    return Coveo.$('#{idofmysearchpage}').length > 0;
}
// This additional function is used to tell the search page to retrieve the Placeholder Text and place it in the search box
function setSearchboxPlaceholderText() {
    Coveo.$('#@Model.SearchboxId').find('input.CoveoQueryBox').attr('placeholder', '@Model.SearchboxPlaceholderText');
} 

Coveo.$(function () {
    if (!isOnSearchPage()) {
        if (typeof(CoveoForSitecore) !== 'undefined') {
            var searchOptionsForSearchBox =  @(Html.Raw(Model.GetJavaScriptInitializationOptions()));
            
            CoveoForSitecore.componentsOptions = Coveo.$.extend({}, CoveoForSitecore.componentsOptions, searchOptionsForSearchBox);
            Coveo.$('#@Model.SearchboxId').coveoForSitecore('initSearchbox', CoveoForSitecore.componentsOptions);
        } else {
            Coveo.$('#@Model.SearchboxId').coveo('initSearchbox', '@Model.GetSearchPageUrl()');
        }
        setSearchboxPlaceholderText();
    } else {
        //Here you will be able to use the Coveo.$ selector later in 2017. At the moment, the framework will only accept an html element
        var searchBoxElement = document.getElementById('@Model.SearchboxId');
        // Register the search box as an external component
        var searchOptionsForSearchBox = {
            externalComponents: [searchBoxElement]
        };

        //Extend the options of the search box to include the search page
        CoveoForSitecore.componentsOptions = Coveo.$.extend({}, CoveoForSitecore.componentsOptions, searchOptionsForSearchBox);

        Coveo.$('#{idofmysearchpage}').on('afterInitialization', function () {
            setSearchboxPlaceholderText();
        });
    }
});
```

And for the SearchView.cshtml, replace the default:

```js
Coveo.$(function() {
    CoveoForSitecore.componentsOptions = @(Html.Raw(Model.GetJavaScriptInitializationOptions()));
});
```
Which simply grabs the properties of the search model, by:

```js
Coveo.$(function() {
    CoveoForSitecore.componentsOptions = Coveo.$.extend({}, @(Html.Raw(Model.GetJavaScriptInitializationOptions())), CoveoForSitecore.componentsOptions || {});
});
```
Which extends the current options by adding the search box.

If everything is done correctly, you should have a search box which behaves in two ways:

* If you are on the search page, the search box will drive the search results in an Asynchronous fashion.
* If you are on any other pages, the search box will redirect to the search result page.

### 4. Make it smart

#### Focus their cursor on search, right away

Rule of thumb, if a user starts typing without selecting anything on the page, the search box should be the one with the focus, if you are using a collapsible search box, then expand it on any keystroke.
The Search Box View rendering will take the focus by default when the [autoFocus](https://coveo.github.io/search-ui/components/querybox.html#options.autofocus) option is set to true.

#### Suggest queries and content as they type

This is a good one, type-ahead and suggestions is an absolute must to reduce input errors and guide users to the right content. Before we get too deep into this, take note that Coveo offers three types of suggestions:

* Queries: A popular search term which will launch a query when clicked.
* Result: An existing document which will open the link when clicked.
* Facets: An existing facet on the search interface which will select it when clicked.

You can see the detailed explanations for each of them [here](https://developers.coveo.com/display/public/SitecoreV4/Providing+Suggestions+using+the+Coveo+Omnibox)

IMPORTANT! Before you can use any of them on the search box, you need to replace the Search Box View Resources by a Search View Resources component, since it contains additional JS dependencies needed for suggestions.

What to use when?

The best practices would be to only offer Result Suggestions on the search box, then use query suggestions for the main search page.
The Search Box rendering comes with a default placeholder for the [Omnibox Result List](https://developers.coveo.com/display/public/SitecoreV4/Omnibox+Result+List+Component+Properties). 
You can find this component in the same rendering folder where all the other components are.

![Omnibox Result List](/images/SiteSearchBestPractices/omniboxresultlist.png)

You can add more than one component. This can be useful if you want to select results in different categories. 
If you have the Enterprise edition, simply use the filtering rules on each of them to scope the suggestions. If you don't, then you can add your expression in your copy of the OmniboxResultListView.cshtml file:

```
<span class="CoveoForSitecoreOmniboxResultList"
    .....
    data-query-expression='@myfield=="myValue"'
    ....
</span>
```

Keep in mind that providing a long list of results looks messy. Keep control of the number of results using the "Number of results" field.

For the main search page, do not provide result suggestions. Instead switch for Reveal queries suggestions. It is enabled by default; you simply need to create the [Reveal Model](https://onlinehelp.coveo.com/en/cloud/managing_reveal_query_suggestions_in_a_query_pipeline.htm#Manage_Query_Suggestions_(Coveo_Cloud_V2)) and wait a for it to learn. This can take a few weeks.

### 5. Test it

How to test the search box is up to you, but we can tell you if visitors use it or not.
Once the site is live, keep track of the usage of the search box using the [Coveo Usage Analytics](https://onlinehelp.coveo.com/en/cloud/coveo_cloud_usage_analytics.htm). Keep in mind that the Origin 3 (Referrer) [dimension](https://onlinehelp.coveo.com/en/cloud/usage_analytics_dimensions.htm), will tell you where the user was coming from; which will tell you if your search box is used or not.

Note: Coveo for Sitecore does not send the right data as an Origin 3, this is a bug which will be fixed in Q1 2017.

This is enough for now. I will cover the remaining practices in the next few weeks.
