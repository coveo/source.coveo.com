---
layout: post

title: "Who is Who and What They Do"
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

## The Data

Our People page is feed from our Corporate index. Naturally, the first step is to get the data into our index.

We are indexing our Active Directory with our own [crawler](https://github.com/coveo-labs/active-directory-crawler) and populating a [Push Api](https://docs.coveo.com/en/78) source we call _Employees_.

For each people, we get their basic information (name, email) and their reporting structure (their manager and their direct reports).

We also have multiple other sources in our Corporate index: Salesforce, JIRA, Discourse, Google Drive, Internal Documentation, Online Help, etc.
Most sources have their own fields describing who created what and who modified it.
To reduce complexity at query time, we use common fields for all sources to identify who worked on a document. We call them `@authors` (document creators) and `@contributors` (who modified the document, can be multiple people).

Most sources have their versions of authors and contributors and use different field names and identifiers for users. We add a mapping to each source to populate the fields `@authors` and `@contributors`.

For example:

The _Jira_ source uses  `author.emailaddress` for `@authors` and `fields.assignee.emailaddress & fields.comment.comments.author.emailaddress` for `@contributors`.
![JIRA mappings](/images/201901-people-page/mappings-jira.png)

The _Google Drive_ source uses `author` for `@authors` and `lastmodifyingyser.emailaddress, coveo.owner.email & coveo.comments.authors` for `@contributors`.
![Google Drive mappings](/images/201901-people-page/mappings-google.png)


To create this Employee page (taken from [our intranet demo](https://labs.coveodemo.com/demo-intranet)), we are using a few tricks:
- Browser cache for Basic Employee info
- GroupBy/Facets for the bar charts, with Query Event
- Search Interface and Result templates.

![Employee summary](/images/201901-people-page/employee-summary.png)

This is what we generate for the bar using the `numberOfResults` in the `groupBy` response:

JSON:
```json
[{
  "field": "@source",
  "values": [{
    "value": "Youtube Movietrailers",
    "numberOfResults": 471
  }, {
    "value": "PeopleMovie",
    "numberOfResults": 28
  }, {
    "value": "Movies",
    "numberOfResults": 28
  }, {
    "value": "Youtube Speedbit",
    "numberOfResults": 1
  }, {
    "value": "Sharepoint",
    "numberOfResults": 1
  }, {
    "value": "People",
    "numberOfResults": 1
  }, {
    "value": "Doc FitBit",
    "numberOfResults": 1
  }]
}, {
  "field": "@myjob",
  "values": [{
    "value": "Acting",
    "numberOfResults": 13
  }, {
    "value": "Director",
    "numberOfResults": 10
  }, {
    "value": "Writer",
    "numberOfResults": 3
  }, {
    "value": "Producer",
    "numberOfResults": 2
  }]
}, {
  "field": "@myrole",
  "values": [{
    "value": "Director",
    "numberOfResults": 11
  }, {
    "value": "Writer",
    "numberOfResults": 3
  }, {
    "value": "Himself",
    "numberOfResults": 3
  }, {
    "value": "Producer",
    "numberOfResults": 2
  }, {
    "value": "Bill S. Preston",
    "numberOfResults": 2
  }, {
    "value": "Schatzi Greenspace",
    "numberOfResults": 1
  }, {
    "value": "Marko",
    "numberOfResults": 1
  }]
}]
```

```html
<div class="userpage-stats-item">
  <div class="userpage-stats-label" title="Acting">Acting</div>
  <svg width="200" height="20" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="10" x2="160" data-value="13" data-max="13" y2="10" stroke-width="10" stroke="#F58020"></line>
    <text x="170" y="15" fill="#F58020">13</text>
  </svg>
</div>
```

We use this code to generate it:
```javascript
generateStatsSection(name, results) {
  const max = Math.max(...(results.map(v => v.numberOfResults)));
  let colorIdx = 0;
  let aHtml = results.map(v => {
      const color = COLORS[colorIdx++ % COLORS.length]; // we use a prefined array of colors, in which we cycle through
      const xPos = Math.min(160, (160 * v.numberOfResults) / max); // Max value will be set at 160px

      // html for a bar
      return `<div class="userpage-stats-item">
          <div class="userpage-stats-label" title="${e(v.value)}">${e(v.value)}</div>
          <svg width="200" height="20" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="10" x2="${xPos}" data-value="${v.numberOfResults}" data-max="${max}" y2="10" stroke-width="10" stroke="${color}"></line>
            <text x="${xPos + 10}" y="15" fill="${color}">${v.numberOfResults}</text>
          </svg>
        </div>`;
    });

  // return generated html
  return aHtml.join('\n');
}
```

> Tip: you can use inline _SVG_ to generate other types of visualizations, or use third party libraries like D3 with the results numbers from groupBy.

The query is:
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

and for the team:
```text
q: @authors==("Partrick_Kong@elasticdemo.com", "Partrick Kong", "James_Arama@coveo.com", "James Arama", "Walter_Sittler@coveo.com", "Walter Sittler") OR @contributors==("Partrick_Kong@elasticdemo.com", "Partrick Kong", "James_Arama@coveo.com", "James Arama", "Walter_Sittler@coveo.com", "Walter Sittler")
```

## Brower cache

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

then

```javascript


```



## Conclusion

- Using Query Events and groupBy results you can create visualisations.
- Security is applied - no worries
- Can be used on a Welcome page


