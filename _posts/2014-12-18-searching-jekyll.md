---
layout: post

title: "Searching Jekyll"

tags: [JavaScript Search Framework, Web Pages Connector, Jekyll]

author:
  name: Carl Bolduc
  bio: Coveo for Sitecore Support Team Leader
  twitter: carlbolduc
  image: carlbolduc.jpg
---

This blog is powered by [Jekyll](http://jekyllrb.com/), a static site generator. There is no database, nothing to search against, the site is simply composed of a few HTML pages referencing each other. Being search experts, we can leverage Coveo to add powerful search to [Jekyll](http://jekyllrb.com/).

<!-- more -->

## Indexing the content

Since we are dealing with a structured site containing static HTML pages, our [Web Pages Connector](http://onlinehelp.coveo.com/en/ces/7.0/administrator/web_pages_connector.htm) will get the job done.

![](/images/BlogTechSource.png) 

In addition to creating a new Web Pages Connector [source](http://onlinehelp.coveo.com/en/ces/7.0/User/what_is_an_index_source.htm) to index the blog, we created a [custom field](http://onlinehelp.coveo.com/en/ces/7.0/Administrator/adding_or_modifying_custom_fields.htm) to have facetted tags on the search result page.

![](/images/TagsFacet.png)

## "Installing" the Coveo JavaScript Search Framework in Jekyll

The [JavaScript Search Framework](https://developers.coveo.com/display/public/JsSearch/Home) is simply a zip file containing image, css and JavaScript files. For this straightforward integration, we added the following files to the [Jekyll](http://jekyllrb.com/) folder structure:

- `css/CoveoFullSearch.css`
- `js/CoveoJsSearch.WithDependencies.min.js`
- `js/d3.min.js`
- `images/sprites.png`
- `images/wait.gif`
- `images/wait_circle_small.gif`
- `images/wait_facet.gif`
- `images/wait_facet_search.gif`


## Adding the search page

Each [Jekyll](http://jekyllrb.com/) page is rendered using a layout, we have two:

- base
- post

We created a new page at the root of the site: `search.html`

This page is using the base layout, just like the home page, and contains the following:

{% highlight jsp %}

---
layout: base
---

<article class="container">
  <div id="search" class="CoveoSearchInterface" data-enable-history="true">
    <span class="CoveoAnalytics" data-search-hub="Blog" data-token="16aa3ce3-d77a-4c25-97a2-18be59347d9e" data-user="coveokmua@coveo.com" />
      <div class="coveo-tab-section">
        <a class="CoveoTab"
          data-id="Blog"
          data-caption="Blog"
          data-icon="coveo-sprites-documentType-all-content"
        data-expression='@syssource==BlogTech'></a>
      </div>
      <div class="coveo-results-section">
        <div class="coveo-facet-column">
          <div data-tab="Blog">
            <div class="CoveoFacet" data-title="Author" data-field="@sysauthor" data-show-icon="true"></div>
          </div>
          <div class="CoveoFacet" data-title="Tags" data-field="@tags" data-is-multi-value-field="true"></div>
        </div>
        <div class="coveo-results-column">
          <div class="CoveoShareQuery"></div>
          <div class="CoveoPreferencesPanel">
            <div class="CoveoResultsPreferences"></div>
            <div class="CoveoResultsFiltersPreferences"></div>
          </div>
          <div class="CoveoBreadcrumb"></div>
          <div class="coveo-results-header">
            <div class="coveo-summary-section">
              <span class="CoveoQuerySummary"></span>
              <span class="CoveoQueryDuration"></span>
            </div>
            <div class="coveo-sort-section">
              <span class="CoveoSort" data-sort-criteria="relevancy">Relevance</span>
              <span class="CoveoSort" data-sort-criteria="date descending,date ascending">Date</span>
            </div>
            <div class='coveo-clear'></div>
          </div>
          <div class="CoveoHiddenQuery"></div>
          <div class="CoveoDidYouMean"></div>
          <div class="CoveoErrorReport" data-pop-up='false'></div>
          <div class="CoveoResultList" data-wait-animation="fade">
            <script id="Default" type="text/x-underscore-template">
              <%= fromFileTypeToIcon(obj) %>
              <div class="coveo-date"><%-dateTime(raw.sysdate)%></div>
              <div class="coveo-title">
              <a class="CoveoResultLink" target="_blank"><%=title?highlight(title, titleHighlights):clickUri%></a>
              <%= loadTemplate("DefaultQuickView") %>
              </div>
              <div class="coveo-excerpt">
              <%=highlight(excerpt, excerptHighlights)%>
              </div>
              <div class="CoveoPrintableUri"></div>
              <table class="CoveoFieldTable">
              <tr data-field="@sysauthor" data-caption="Author"></tr>
              </table>
            </script>
            <script id="DefaultQuickView" type="text/x-underscore-template">
              <div class="CoveoQuickView" data-title="<%= attrEncode(fromFileTypeToIcon(obj) + title) %>" data-fixed="true" data-template-id="DefaultQuickViewContent">
              </div>
            </script>
            <script id="DefaultQuickViewContent" type="text/x-underscore-template">
              <div class="coveo-quick-view-header">
              <table class="CoveoFieldTable">
              <tr data-field="@sysdate" data-caption="Date" data-helper="dateTime"></tr>
              <tr data-field="@objecttype" data-caption="Type"></tr>
              </table>
              </div>
              <div class="CoveoQuickViewDocument"></div>
            </script>
            <script class="result-template" type="text/x-underscore-template">
              <%=
              loadTemplates({
              'Default' : 'default'
              })
              %>
            </script>
          </div>
          <div class="CoveoPager"></div>
        </div>
      </div>
      <div style="clear:both;"></div>
    </div>
  </article>

{% endhighlight %}

The code above results in a simple search page with two facets:

- Author (out of the box, no custom field is needed)
- Tags (based on the tags custom field we created earlier)

![](/images/AuthorTagsFacets.png)

## Searching from anywhere on the blog

We wanted to have a search box on every page. We proceeded to change our two layout files to include the following HTML element in the header:

{% highlight html %}
<div id="searchBox" class="CoveoSearchBox" data-activate-omnibox="true"></div>
{% endhighlight %}

For the search box and the search page to work, the [JavaScript Search Framework](https://developers.coveo.com/display/public/JsSearch/Home) resources must be included in all the pages of the blog. These two lines were also added to the base and post layouts:

{% highlight html %}
{{ "{% include _search.html " }}%}
<link rel="stylesheet" href="/css/CoveoFullSearch.css" />
{% endhighlight %}

As you can see, we created the `_search.html` file in the `_includes` [Jekyll](http://jekyllrb.com/) folder to centralize the JavaScript dependencies, here is what it contains:

{% highlight html %}
<script src="/js/d3.min.js"></script>
<script src="/js/CoveoJsSearch.WithDependencies.min.js"></script>
<script type="text/javascript">
  $(function () {
    Coveo.Rest.SearchEndpoint.endpoints["default"] = new Coveo.Rest.SearchEndpoint({
      restUri: 'https://developers.coveo.com/coveorest/search',
      anonymous: true
    });
    if (document.location.pathname !== "/search/") {
      $('#searchBox').coveo('initSearchBox', '/search');
    } else if (document.location.pathname == "/search/" ) {
      var mySearchBox = $("#searchBox");
      $("#search").coveo("init", {
        externalComponents : [mySearchBox]
      })        
    }
  });
</script>
{% endhighlight %}

## Externalizing the search box

With the Search Endpoint configured in our `_search.html` file, the search page was already working. However, we had two problems:

- the search interface was initiated two times
- the search box was only working on the search page itself

To avoid the double init problem, we added logic to prevent the standalone search box from initializing in the search page. If we are not on the search page, we initialize the search box directly and give it the path of our search page, i.e. `/search`:

{% highlight javascript %}
if (document.location.pathname !== "/search/") {
  $('#searchBox').coveo('initSearchBox', '/search');
}
{% endhighlight %}

If however we are on the search page, we pass the `mySearchBox` variable as an `externalComponents` to the search page:

{% highlight javascript %}
else if (document.location.pathname == "/search/" ) {
  var mySearchBox = $("#searchBox");
  $("#search").coveo("init", {
    externalComponents : [mySearchBox]
  })
}
{% endhighlight %}
 
You can learn more about the Standalone Search Box possibilities in [our documentation](https://developers.coveo.com/display/public/JsSearch/Standalone+Search+Box).

And that's how you integrate search in [Jekyll](http://jekyllrb.com/) using the [JavaScript Search Framework](https://developers.coveo.com/display/public/JsSearch/Home).
