---
layout: post

title: "Intranet People page"
tags: [JS UI, JS UI custom components, Push Api, Query Events]

author:
  name: Jerome Devost
  bio: Software Developer, Coveo Labs
  image: jdevost.png
---

Our company is rapidly growing and fast moving. It can be a challenge to keep track of newcomers or what our colleagues are working on.
We created a _People page_ showing recent contributions by someone and it became quite a useful tool for new employees to learn about their new co-workers.


![My Activities summary](/images/201901-people-page/activity-summary.png)

<!-- more -->

The page shows a list of recent contributions by an employee, her team members, her partial organization chart, her active projects, and recent contributions from her team. You can use this page to see her area of expertise within the company.

The People page is still a Coveo Search page with the same great features like Security. You won't see _secret projects_ from other members here if you don't have access to these projects yourself.


## The Data

Our People page is feed from our Corporate index. Naturally, the first step is to get the data into our index.

We are indexing our Active Directory with our own [crawler](https://github.com/coveo-labs/active-directory-crawler) and populating a [Push Api](https://docs.coveo.com/en/78) source we call _Employees_.

For each people, we get their basic information (name, email) and their reporting structure (their manager and their direct reports).

We also have multiple other sources in our Corporate index: Salesforce, JIRA, Discourse, Google Drive, Internal Documentation, Online Help, etc.
Most sources have their own fields describing who created what and who modified it.
To reduce complexity at query time, we normalized the fields using common field names for all sources to identify who worked on a document. We call them `@authors` for document creators and `@contributors` for whom modified the document (that one is a multi-value field).

For example:

Our _Jira_ source maps  `author.emailaddress` to `@authors` and `fields.assignee.emailaddress & fields.comment.comments.author.emailaddress` to `@contributors`.
![JIRA mappings](/images/201901-people-page/mappings-jira.png)

Our _Google Drive_ source maps `author` to `@authors` and `lastmodifyingyser.emailaddress, coveo.owner.email & coveo.comments.authors` to `@contributors`.
![Google Drive mappings](/images/201901-people-page/mappings-google.png)


To create the Employee page below (taken from [our intranet demo](https://labs.coveodemo.com/demo-intranet)), we are using a few more tricks:
- GroupBy/Facets for the bar charts, with Query Event
- Browser cache for Basic Employee info
- Search Interface and Result templates.

![Employee summary](/images/201901-people-page/employee-summary.png)

## Getting contributions

Using the fields we mapped in the Indexing phase, we are getting the contributions of a person using the following query. Since some systems only identified people using their full names.
```text
q: @authors==("Alex_Winter@elasticdemo.com", "Alex Winter") OR @contributors==("Alex_Winter@elasticdemo.com", "Alex Winter")
aq: @date>="today-30d"
groupBy: [
  {"field":"@source","injectionDepth":1000},
  {"field":"@jiprojectname","injectionDepth":1000},
  {"field":"@discusscoveocategoryname","injectionDepth":1000},
  {"field":"@confspacename","injectionDepth":1000},
  {"field":"@objecttype","injectionDepth":1000}
]
```

And we do the same query for the team, expanding all team members :
```text
q: @authors==("Patrick_Kong@elasticdemo.com", "Patrick Kong", "James_Arama@coveo.com", "James Arama", "Walter_Sittler@coveo.com", "Walter Sittler") OR @contributors==("Patrick_Kong@elasticdemo.com", "Patrick Kong", "James_Arama@coveo.com", "James Arama", "Walter_Sittler@coveo.com", "Walter Sittler")
```


## Facets as bar charts

![Facet as bar chart](/images/201901-people-page/bar-chart.png)

In search responses, the facets information is stored in the JSON as `groupBy`. It's an array of `field` and their `values` to show in the facets, along with the count for each value as `numberOfResults`. For example:

```json
[{
  "field": "@source",
  "values": [
    { "value": "PeopleMovie", "numberOfResults": 28 },
    { "value": "Movies", "numberOfResults": 28 },
    { "value": "Youtube Speedbit", "numberOfResults": 1 },
    { "value": "Sharepoint", "numberOfResults": 1 },
    { "value": "People", "numberOfResults": 1 },
    { "value": "Doc FitBit", "numberOfResults": 1 }
  ]
}, {
  "field": "@myjob",
  "values": [
    { "value": "Acting", "numberOfResults": 13 },
    { "value": "Director", "numberOfResults": 10 },
    { "value": "Writer", "numberOfResults": 3 },
    { "value": "Producer", "numberOfResults": 2 }
  ]
}, {
  "field": "@myrole",
  "values": [
    { "value": "Director", "numberOfResults": 11 },
    { "value": "Writer", "numberOfResults": 3 },
    { "value": "Himself", "numberOfResults": 3 },
    { "value": "Producer", "numberOfResults": 2 },
    { "value": "Bill S. Preston", "numberOfResults": 2 },
    { "value": "Schatzi Greenspace", "numberOfResults": 1 },
    { "value": "Marko", "numberOfResults": 1 }
  ]
}]
```

Each value becomes one bar in the chart, and is represented using this HTML code:
```html
<div class="userpage-stats-item">
  <div class="userpage-stats-label" title="Acting">Acting</div>
  <svg width="200" height="20" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="10" x2="160" data-value="13" data-max="13" y2="10" stroke-width="10" stroke="#F58020"></line>
    <text x="170" y="15" fill="#F58020">13</text>
  </svg>
</div>
```

We use a Query Event (`querySuccess`) to process the results into the bar charts:
```javascript

// handler for the search response, will call generateStatsSection for each categories
// the generated HTML will update a DOM node (id="userpage-stats") already present in the page.
let onSuccess = function(e, args) {
  let groupByResults = args.results.groupByResults;
  if (groupByResults.length) {
    let barChartsHtml = [
      generateStatsForSection('Sources', groupByResults[0].values),
      generateStatsForSection('Jobs', groupByResults[1].values),
      generateStatsForSection('Characters', groupByResults[2].values)
    ];

    $('#userpage-stats')
      .empty()
      .html( barChartsHtml.join('') );
  }
};

let generateStatsForSection = function(name, results) {
  // calculate the maximun value for this section, to get relative sizes for the bars.
  const max = Math.max(...(results.map(v => v.numberOfResults)));

  // Creates an array of bars (in HTML code)
  let aHtml = results.map( (v, idx) => {
      const color = COLORS[idx % COLORS.length]; // we use a prefined array of colors, in which we cycle through
      const xPos = Math.min(160, (160 * v.numberOfResults) / max); // Max value will be set at 160px

      // HTML+SVG code for a bar, using JavaScript's template literals.
      return `<div class="userpage-stats-item">
          <div class="userpage-stats-label" title="${e(v.value)}">${e(v.value)}</div>
          <svg width="200" height="20" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="10" x2="${xPos}" data-value="${v.numberOfResults}" data-max="${max}" y2="10" stroke-width="10" stroke="${color}"></line>
            <text x="${xPos + 10}" y="15" fill="${color}">${v.numberOfResults}</text>
          </svg>
        </div>`;
    });

  // return generated html for all bars in this section
  return aHtml.join('\n');
};

// set up the Query Event
Coveo.$$(root).on('querySuccess', onSuccess);

```

> Tip: you can use inline _SVG_ to generate other types of visualizations, or use third party libraries like D3 with the results numbers from groupBy.

## Optimizations using Browser cache

We are building the Team section and the org chart dynamically, on the client side (browser). To keep it simple we are fetching one user at a time, and its manager if it has one, then the manager's manager, and so on.

While being quite simple to use, it would be inefficient to redo the same queries for the same members when _browsing the org chart_. We use the Browsers session storage to make it more efficient. We will fetch one member information only once per _web session_, and that is perfect for this case. This way we get the efficiency of doing one request only per member, and we don't have to manage the cache ourselves, the browsers do it and the members cache stays fresh.


<img alt="Team contributions" src="../images/201901-people-page/team-contributions.png" width="75%">

<img alt="Org chart" src="../images/201901-people-page/org-chart.png" width="20%" style="vertical-align: top">

We use JavaScript promise to get the User (member) info. We first check if the members in the cache (sessionStorage is a key-value map), and if not, we query for it, store it then return it.

Here's the code to get the user info:

```javascript
/**
 * This function checks the browser's (session) storage for the user info, using its email as the key.
 * If necessary, the function will query Coveo for the info and cache it before returning.
 * @param userEmail {string} email of the user to get
 * @returns {Promise}
 */
getUserInfo(userEmail) {
  const key = `@email=="${userEmail}"`;

  // check storage using email query as key
  let user = sessionStorage.getItem(key);
  if (user) {
    // found user info in storage, parse it and return
    return Promise.resolve(JSON.parse(user));
  }

  const myQueryBuilder = new Coveo.QueryBuilder();
  myQueryBuilder.expression.add(key); // query using user email
  myQueryBuilder.expression.addFieldExpression('@filetype', '==', ['activedirperson']); // limit results to Active Directory

  const coveoSearchEnpoint = Coveo.SearchEndpoint.endpoints['default'];
  const searchPromise = coveoSearchEnpoint.search(myQueryBuilder.build());
  searchPromise.then(queryResults => {
    // validate result before saving it in browser's session storage
    let results = queryResults.results;
    let user = null;
    if (results && results.length) {
      user = results[0].raw;
      if (userEmail === user.email) {
        sessionStorage.setItem(key, JSON.stringify(user)); // user is valid. Save it in session storage.
      } else {
        console.error(`WRONG user; userEmail "${userEmail}" (used as key) doesn't match the returned user.email "${user.email}". `);
      }
    }
    return user;
  });

  return searchPromise;
}
```

Now, putting it all together in a Class to create an Org chart:

```javascript

class OrgChart {

  getUserInfo(user) {
    // see above
  }

  getUsersInfo(users) {
    if (users) {
      return Promise.all(
        users.map(workemail => {
          return this.getUserInfo(`@workemail=="${workemail}"`);
        })
      );
    }
    return Promise.resolve([]);
  }

  showOrg(userEmail) {
    this.getUserInfo(userEmail).then(userJson=>{
      // get all managers
      this.getUserInfo(userJson.managers).then(managersJson => {
        // get all direct reports
        this.getUserInfo(userJson.directreports).then(directReportsJson  => {
          // show the user in the page.
          this.renderOrg(userJson, managersJson, directReportsJson);
        })
      })
    })
  }

  renderOrg(user, managers, directReports) {
    // Create your own layout for your Company
  }

}
```


## Conclusion

We saw that a Search page can be useful without a search input box but as an aggregator of useful content for one _topic_ (in this case an Employee).

We used a few tricks from the Coveo platform like Query Events and Facets to create different visualizations and we still have the piece of mind from Coveo's support of secured content that sensitive information won't be surfaced to the wrong user.

Using the same approach, many applications such as a Landing/Welcome page for an Intranet or Products pages can be created using Coveo the platform.

