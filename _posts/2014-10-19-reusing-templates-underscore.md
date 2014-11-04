---
layout: post

title: "Reusing templates with UnderscoreJS"
tags: [Templating, UnderscoreJS]

author:
  name: Vincent Séguin
  bio: Team Lead, Coveo for Sitecore
  twitter: VincentSeguin
  image: vseguin.jpg
---

UnderscoreJS is probably one of my favorite template engines. I've been working with Mustache or Handlebars, and they just don't offer the same flexibility as Underscore. Even more, we've been using this framework extensively in our JavaScript UI Framework, always delivering great results.

<!-- more -->

It may happen that you want to render multiple templates in a single page. For instance, let's say that we'd like to have a page displaying multiple search results categories : Products, Downloads etc.

## Defining our templates

Let's start by creating our first Underscore template for the Products section. It basically just renders a list of products with their pictures and name. There's also a section that will be used to display more/less results.

{% highlight jsp %}
<div id="productsContainer" >
   <script class="productsTemplate" type="text/x-underscore-template" >
   <% if (results.results.length > 0) { %>
       <h2>Products</h2>
       <span class="showMoreResults">Show more results in Products</span>
       <span class="showLessResults">Show fewer results in Products</span>
       <div class="resultsContainer">
           <div class="results">
               <% _.each(results.results, function(result, index) { %>
                       <div class="productElement">
                           <img src='<%= result.raw.@Html.Coveo().ToCoveoFieldName("imageurl", false)%>'/>
                           <div class="productText">
                               <a class="clickableUri" href="<%= result.clickUri %>">
                                   <span><%= result.title %></span>
                               </a>
                           </div>
                       </div>
               <% }); %>
           </div>
       </div>
   <% } %>
   </script>
</div>
{% endhighlight %}

PS : Don't mind the "ToCoveoFieldName" syntax, this is coming from a Coveo for Sitecore example.

We then need to compile and render our template with results. In a <script> tag at the beginning of our HTML file, we'll simply compile our template in a variable.

{% highlight javascript %}
var productsTemplate = _.template($("script.productsTemplate").html());
{% endhighlight %}

Obviously, if we want the whole thing to actually do something, we'll need to render our template with relevant results. Let's perform a query directly on the REST endpoint to get our results from the CES index. In this example, the productsQuery/numberOfResults are parameters passed to this function, it could be anything.

{% highlight javascript %}
Coveo.Rest.SearchEndpoint.endpoints['default'].search({
    q: productsQuery,
    numberOfResults: numberOfResults
}).done(function (results) {
    if (results.results.length > 0) {
        $("#productsContainer").append(template({results: results}));
    }
});
{% endhighlight %}

This will actually output the resulting HTML in the page. You may notice that i'm using the results object, which actually contains the <a href="https://developers.coveo.com/display/SearchREST/Query+Results">Query Results</a> object returned by the REST endpoint. So the whole thing work, and we have products and rainbows displayed in our page. SUDDENLY, someone asks us to display another section, based on Downloads this time. Alright! Let's create another template.

{% highlight jsp %}
<div id="downloadsContainer" class="searchContainer">
  <script class="downloadsTemplate" type="text/x-underscore-template" >
      <% if (results.results.length >= 0) { %>
          <h2>Downloads</h2>
          <span class="showMoreResults">Show more results in Downloads</span>
          <span class="showLessResults">Show fewer results in Downloads</span>
          <div class="results">
         <% _.each(results.results, function(result) { %>
              <div class="downloadsElement">
                  <div class="downloadsInformations">
                      <a class="clickableUri" href="<%= result.clickUri %>">
                          <%= result.title %>
                      </a>
                      <div>
                          <span class="downloadsSize"><%= result.raw.@Html.Coveo().ToCoveoFieldName("size", false)%>kB</span> 
                          <span class="downloadsExtension"><%= result.raw.@Html.Coveo().ToCoveoFieldName("extension", false)%></span>
                      </div>
                  </div>
              </div>
          <% }); %>
         </div>
      <% } %>
  </script>
</div>
{% endhighlight %}

This time, we're outputting slightly different informations : we have a link, as well as the file size and the file extension. Just like we did before for the Products, we need to compile and then render our template. We'll extract our query in an utility function, since we don't want to repeat code, don't we?

{% highlight javascript %}
var productsTemplate = _.template($("script.productsTemplate").html());
var downloadsTemplate = _.template($("script.downloadsTemplate").html());

performQuery(productsQuery, numberOfResults, "#productsContainer");
performQuery(downloadsQuery, numberOfResults, "#downloadsContainer");

function performQuery(queryToPerform, numberOfResults, container) {
  Coveo.Rest.SearchEndpoint.endpoints['default'].search({
      q: queryToPerform,
      numberOfResults: numberOfResults
  }).done(function (results) {
      if (results.results.length > 0) {
          $(container).append(template({results: results}));
      }
  });
}
{% endhighlight %}

Excellent. We have Products and Downloads rendered, our customer is happy and we're riding unicorns. But we're not 100% happy. Take a look at this little piece of HTML that gets repeated :

{% highlight jsp %}
 <h2>Products</h2>
 <span class="showMoreResults">Show more results in Products</span>
 <span class="showLessResults">Show fewer results in Products</span>
{% endhighlight %}

This may seems small, but let's say we add 6 more templates in our page (that actually happened), it will get impossible to maintain. Especially if you decide to change the CSS class of one of these elements, for instance.

## Extracting a header template

My solution to our repetition problem is to create a new header template, by extracting and parametizing our little piece of markup. Our header template will use a category as parameter.

{% highlight jsp %}
<script class="headerTemplate" type="text/x-underscore-template" >
 <h2><%= category%></h2>
 <span class="showMoreResults">Show more results in <%= category%></span>
 <span class="showLessResults">Show fewer results in <%= category%></span>
</script>
{% endhighlight %}

We then need to edit our JavaScript to take this new template into account.

{% highlight javascript %}
var headerTemplate = _.template($("script.headerTemplate").html());
var productsTemplate = _.template($("script.productsTemplate").html());
var downloadsTemplate = _.template($("script.downloadsTemplate").html());

performQuery(productsQuery, numberOfResults, "#productsContainer");
performQuery(downloadsQuery, numberOfResults, "#downloadsContainer");

function performQuery(queryToPerform, numberOfResults, container) {
  Coveo.Rest.SearchEndpoint.endpoints['default'].search({
      q: queryToPerform,
      numberOfResults: numberOfResults
  }).done(function (results) {
      if (results.results.length > 0) {
          $(container).append(template({header: headerTemplate, results: results}));
      }
  });
}
{% endhighlight %}

You can see that when we append the HTML, we now pass the headerTemplate to the current template we're rendering. Last thing we need, let's edit our templates to use this new header parameter.

{% highlight jsp %}
<div id="productsContainer" >
   <script class="productsTemplate" type="text/x-underscore-template" >
   <% if (results.results.length > 0) { %>
       <%= header({category : "Products"})%>
       <div class="resultsContainer">
           <div class="results">
               <% _.each(results.results, function(result, index) { %>
                       <div class="productElement">
                           <img src='<%= result.raw.@Html.Coveo().ToCoveoFieldName("imageurl", false)%>'/>
                           <div class="productText">
                               <a class="clickableUri" href="<%= result.clickUri %>">
                                   <span><%= result.title %></span>
                               </a>
                           </div>
                       </div>
               <% }); %>
           </div>
       </div>
   <% } %>
   </script>
</div>
{% endhighlight %}

{% highlight jsp %}
<div id="downloadsContainer" class="searchContainer">
  <script class="downloadsTemplate" type="text/x-underscore-template" >
      <% if (results.results.length >= 0) { %>
          <%= header({category : "Downloads"})%>
          <div class="results">
         <% _.each(results.results, function(result) { %>
              <div class="downloadsElement">
                  <div class="downloadsInformations">
                      <a class="clickableUri" href="<%= result.clickUri %>">
                          <%= result.title %>
                      </a>
                      <div>
                          <span class="downloadsSize"><%= result.raw.@Html.Coveo().ToCoveoFieldName("size", false)%>kB</span> 
                          <span class="downloadsExtension"><%= result.raw.@Html.Coveo().ToCoveoFieldName("extension", false)%></span>
                      </div>
                  </div>
              </div>
          <% }); %>
         </div>
      <% } %>
  </script>
</div>
{% endhighlight %}

When rendering one of those templates, Underscore will render the child templates as well (just like the header template there). Much cleaner!

That's it for now! Feel free to use this trick in your projects or ask for more examples!
