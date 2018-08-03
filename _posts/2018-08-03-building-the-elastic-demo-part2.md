---
layout: post

title: "The Elastic Search Demo, Part 2: Build the UI"

tags: [Index Extensions, Query Extensions, JS UI custom components, Push API]

author:
  name: Wim Nijmeijer
  bio: Technical Evangelist
  image: 20180514/wim.jpg
---

_This post is the second part on how we built our Elastic Search demo. You can read the previous post [The Elastic Search Demo, Part 1: Build the Index](https://source.coveo.com/2018/05/01/building-the-elastic-demo/) on how we got the content inside our index._

## Use case 
- Build a demo on top of [Coveo for Elasticsearch](https://elastic.coveodemo.com/demo) to show what you can do with the platform. 
- Use public content that everybody is familiar with. 
- Build it in 2-4 weeks time.

![RL1]({{ site.baseurl }}/images/20180514/intro.png)

<!-- more -->

## Building the UI
Out of the box, Coveo offers the [Coveo Javascript Framework](https://docs.coveo.com/en/375) for building the UI. It offers a ton of components which you can simply drag and drop using an [Interface Editor](https://www.coveo.com/go?dest=cloudhelp&lcid=9&context=230). Using the editor you can quickly design the basic layout of your UI, create search interfaces, add facets, and you are ready to go for a basic search experience. Since we wanted to have very specific result templates, completely tailored to the search audience, we needed some additional configuration directly into the HTML/JS files.

### Result templates
For almost all the content types we had indexed we wanted to have more dedicated [result templates](https://docs.coveo.com/en/413), than offered out of the box. The Movie result template is probably the most complicated one. It uses a couple of custom controls and custom formatting.
Coveo offers out of the box different [result layouts](https://docs.coveo.com/en/360) (eg. list, card, and table). 

For each layout, different result templates can be configured.
The Coveo Javascript framework will pick the first template where the condition is met. If none of the conditions are met and there is NO default template, then nothing is shown.

The Movie database result template looked like:
``` html
<script id="Movie" class="result-template" type="text/html" data-layout="list" data-field-mytype="Movie">
	<div class="coveo-result-frame movie">
    <span class="CoveoMyBackground" data-show-poster="true"></span>
    <div class="result-float-right role-based-text-color">
      <span class="CoveoFieldValue" data-field="@date" data-helper="date"></span>
      <span class="CoveoMySentiment"></span>
      <div class="CoveoQuickview"></div>
      <div class="CoveoFieldValue" data-field="@myvoteaverage" data-text-caption="★" style="display:block"></div>
      <div class="CoveoFieldValue" data-field="@mysentimentvalue"></div>
      <div class="CoveoFieldValue" data-field="@myprofitvalue" data-text-caption="Profit (x100M):" style="display:block"></div>
      <div class="CoveoFieldValue" data-field="@mypopularity" data-text-caption="Popularity:" data-helper="currency" data-helper-options-decimals="0" data-helper-options-symbol=" " style="display:block"></div>
      <div class="CoveoMyFeatured"></div>
      <div class="CoveoMyART"></div>
    </div>
    <a class="CoveoResultLink"></a>

    <div class="CoveoExcerpt"></div>

    <div class="CoveoMyDetailsAndRelated">
      <table class="CoveoFieldTable coveo-details related-content Details query-done" data-allow-minimization="false">
        <tr data-field="@source" data-caption="Source"></tr>
        <tr data-field="@mystatus" data-caption="Status"></tr>
        <tr data-field="@mycountries" data--caption="Production Countries"></tr>
        <tr data-field="@mygenre" data-caption="Genres"></tr>
        <tr data-field="@myrelatedartist" data-caption="Soundtrack (artists)" data-split-values="true"></tr>
        <tr data-field="@myrelatedsongs" data-caption="Soundtrack (songs)"></tr>
      </table>
    </div>

    <div class="CoveoMyResultsRelated youtube"
      data-result-template-id="YouTubeVideoList"
      data-name="Videos"
      data-normal-caption="Videos"
      data-title-caption="Related videos (based upon title)"
      data-expanded-caption="Hide Related Youtube Videos"
      data-no-results-caption="No related videos found"
      data-query='@title="[FIELD1]" @filetype=YoutubeVideo'
      data-key-check='@filetype;YoutubeVideo'
      data-expanded-comment="Show YouTube videos which title contains '[FIELD1]'"
      data-extra-boost=false
      data-fields="title"
      data-partial-match=false
      data-number-Of-Results=5
      data-help='#ResultHelpYoutube'>
    </div>

    <div class="CoveoMyResultsRelated music"
      data-result-template-id="Music"
      data-name="Music"
      data-normal-caption="Music"
      data-title-caption="Related music (based upon related songs and related artists)"
      data-expanded-caption="Hide Related Music"
      data-no-results-caption="No related music found"
      data-query='@myrelatedsongs=("[FIELD1]") @myrelatedartist=("[FIELD2]") @source=Music $qre(expression: &#39;soundtrack&#39;,modifier:&#39;300&#39;, isConstant:&#39;true&#39;)'
      data-key-check='@source;Music'
      data-expanded-comment="Show Music with Related Songs/Artists of: [FIELD1] and [FIELD2]"
      data-extra-boost=false
      data-fields="myrelatedsongs;myrelatedartist"
      data-filter-field="@myalbum"
      data-partial-match=false
      data-number-Of-Results=5
      data-help='#ResultHelpMusic'>
    </div>
  </div>

</script>
```

And will show in the interface like:
![RL1]({{ site.baseurl }}/images/20180514/RL1.png)

Lots of the components inside the resulttemplate are out of the box (```CoveoFieldValue```, ```CoveoExcerpt```, ```CoveoResultLink```), others (```CoveoMyBackground```, ```CoveoMyResultsRelated```) are custom made.

## Custom controls
You can use [Typescript](https://docs.coveo.com/en/361) to create custom controls, or you can simply embed them within your HTML/[Javascript](https://docs.coveo.com/en/305) files. That is what we have used for the demo. A few of the components will be discussed in detail. You can always view them in our [demo](https://elastic.coveodemo.com/demo/page.js).

### CoveoMyBackground
The first custom control we built was ```CoveoMyBackground```. It offers a custom background based upon a reference to the images we gathered during the indexing process. It also used the color gradient (from the Indexing Pipeline Extension) to create a gradient color.
![RL5]({{ site.baseurl }}/images/20180514/RL5.png)
``` javascript
export class MyBackground extends Coveo.Component {
  constructor(element, options, bindings, result) {
    super(element, MyBackground.ID);
    this.result = result;
    this.element = element;
    this.options = Coveo.ComponentOptions.initComponentOptions(element, MyBackground, options);
    if (this.options.showPoster) {
      this.addImage();
    }
    let colors = result.raw.mycolors;
    if (colors) {
      this.addColors(colors);
    } else {
      this.addTopBorder(element);
    }
  }

  addImage() {
    let url = this.result.raw.myimage;
    let imagesPerTypeMap = {
      Movie: `//image.tmdb.org/t/p/w185_and_h278_bestv2/${url}`,
      Music: `//lastfm-img2.akamaized.net/i/u/174s/${url}`,
      Concert: `//images.sk-static.com/images/media/profile_images/artists/${url}/large_avatar`,
      People: `//image.tmdb.org/t/p/w138_and_h175_face${url}`,
      'Movie People': `//image.tmdb.org/t/p/w138_and_h175_face${url}`
    };

    let imageUrl = imagesPerTypeMap[this.result.raw.mytype];
    if (imageUrl && !url) {
      // right type (Movie, Music, Concert) but a specific image wasn't set.
      imageUrl = '//elastic.coveodemo.com/icons/noimage-nofill.png';
    }
    $(this.element)
    .closest('.coveo-result-frame')
    .css('background-image', `url(${imageUrl})`)
    .on('click', e => {
        $(e.target)
        .find('.CoveoQuickview')
        .coveo('open');
    });
  }

  addColors(colors) {
    colors = colors.split(' ');
    if (colors.length) {
      let i = 0;
      // make sure we have at least 5 colors, by repeating previous colors when array is short.
      while (colors.length < 5) {
        colors.push(colors[i++]);
      }
      colors = colors.map((c, idx) => {
        let trans = 0.05;
        if (this.options.showPoster) {
          trans = 0.2;
        }

        let t = ((5 - idx) * trans).toFixed(2);
        return c.replace('(', 'rgba(').replace(')', `,${t})`); // add transparency
      });

      let gradient = `linear-gradient(to right, ${colors[0]}, ${colors[1]}), radial-gradient(circle, ${colors[2]}, ${colors[3]}, ${
        colors[4]
      })`;

      this.addTopBorder(this.element, gradient);
    }
  }

  /**
   * Sets the baackground gradient on a border
   * @param {domElement} element
   * @param {string?} gradient (optional) CSS for background's gradient
   */
  addTopBorder(element, gradient) {
    let backgroundGradient = gradient || 'linear-gradient(45deg, rgba(193,193,193,0.35) 0%,rgba(0,0,0,0) 100%)'; // gradient or default.
    $(element)
      .closest('.CoveoResult')
      .prepend('<div class="TopBorder"></div>')
      .css('background', backgroundGradient);
  }
}

MyBackground.ID = 'MyBackground';
MyBackground.options = {
  showPoster: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false }),
  showUser: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false })
};
Coveo.Initialization.registerAutoCreateComponent(MyBackground);
```

### CoveoMyART
Custom control ```CoveoMyART```, shows a 'Featured' label on the result when the result is promoted by our Machine Learning [ART](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=183).
``` javascript

/**
 * ART result
 * Is triggered when ART (Machine Learning) is kicking in
 */
export class MyART extends Coveo.Component {
  constructor(element, options, bindings, result) {
    super(element, MyART.ID);
    if (result.isRecommendation) {
      const badge = this.getBadge();
      const resultFrame = $$(this.element).closest('.coveo-result-frame');
      $$(resultFrame).prepend(badge.el);
    }
  }

  getBadge() {
    const container = this.getBadgeContainer();
    const highlight = this.getBadgeHighlight();
    const text = this.getBadgeText();
    highlight.append(text.el);

    container.append(highlight.el);
    return container;
  }

  getBadgeContainer() {
    const container = $$('div', {
      className: 'custom-coveo-badge'
    });
    container.el.style.position = 'relative';
    return container;
  }

  getBadgeText() {
    const text = $$(
      'div',
      {
        className: 'mytextART'
      },
      'ML Boost'
    );
    return text;
  }

  getBadgeHighlight() {
    const highlight = $$('div', {
      className: 'coveo-result-highlight coveo-custom-ART'
    });

    return highlight;
  }
}

MyART.ID = 'MyART';
Coveo.Initialization.registerAutoCreateComponent(MyART);
```

### CoveoMyResultsRelated
One of my favorites: ```CoveoMyResultsRelated```. It shows (based upon a user action) an additional result list. The current result is used as the context. For example, we wanted to show a tab with related YouTube videos on the current result based on the title of the movie. 
![RL4]({{ site.baseurl }}/images/20180514/RL4.png)

We configured the Custom control by setting the properties:
``` html
<div class="CoveoMyResultsRelated youtube"
     data-result-template-id="YouTubeVideoList"
     data-name="Videos"
     data-normal-caption="Videos"
     data-title-caption="Related videos (based upon title)"
     data-expanded-caption="Hide Related Youtube Videos"
     data-no-results-caption="No related videos found"
     data-query='@title="[FIELD1]" @filetype=YoutubeVideo'
     data-key-check='@filetype;YoutubeVideo'
     data-expanded-comment="Show YouTube videos which title contains '[FIELD1]'"
     data-extra-boost=false
     data-fields="title"
     data-partial-match=false
     data-number-Of-Results=5
     data-help='#ResultHelpYoutube'>
</div>
```
In the above example we specified the ```data-query``` to be executed as '@title="[FIELD1]" @filetype=YoutubeVideo'. The ```data-fields``` (in this case title) was used to fill up the [FIELD1] in the query. So only when the end user clicked a button would the query be executed. That was the first behavior of the component. 

We changed the layout to use tabs on results, which could look unprofessional. For each result, someone would see four different tabs. When they selected one, they may have received a 'No results' message. Bad user experience!
We added an additional check inside the ```CoveoMyDetailsAndRelated``` component. It will execute a query with the ```data-key-check``` field. If the key with the value is not present in the data, the associated tab is hidden. A much better user-experience. However, be aware: if 10 results are displayed, you will perform an additional 10 queries.
``` javascript
//***************************
  //composeQuery
  //  Creates a new query for the checkQuery function
  //***************************
  composeQuery(result, dataset) {
    let newquery = dataset.query;
    let a = dataset.fields.split(';');
    let allfieldsmissing = true;
    for (i = 0; i < a.length; i++) {
      let fieldcontent = result.raw[a[i]];
      if (fieldcontent) {
        allfieldsmissing = false;
        fieldcontent = '' + fieldcontent; //make sure it's a string
        //Seems that if you format the field in the UI, it gets the formatted value
        fieldcontent = fieldcontent.replace(/[;()]/g, ' ');
        //Comma's must be replaced by ","
        fieldcontent = fieldcontent.replace(/,/g, '","');
        //In Elastic the : means a field query
        newquery = newquery.replace('[FIELD' + (i + 1) + ']', fieldcontent.replace(':', ' '));
      } else {
        newquery = newquery.replace('[FIELD' + (i + 1) + ']', '');
      }
    }
    //ugly but for now fine, you would normally do this in a IPE or just before indexing.
    newquery = newquery.replace('movie script - Screenplays for You', '');
    return newquery;
  }

  //***************************
  //checkQuery
  //  Checks the query for all the relatedTabs. Based upon the groupby fields the tab will be made visible or not
  //***************************
  checkQuery(fields, query, partial, dataset) {
    let queryBuilder = new Coveo.QueryBuilder();
    queryBuilder.locale = GetBindings().queryController.lastQueryBuilder.locale;
    queryBuilder.pipeline = 'default';
    queryBuilder.searchHub = 'CheckTabs';
    queryBuilder.enableDebug = false;
    queryBuilder.enableQuerySyntax = true;
    queryBuilder.enableDuplicateFiltering = false;
    queryBuilder.excerptLength = 200;

    queryBuilder.timezone = GetBindings().queryController.lastQueryBuilder.timezone;
    queryBuilder.numberOfResults = 0;
    queryBuilder.groupByRequests = fields;

    queryBuilder.expression.add(query);
    if (partial === 'true') {
      queryBuilder.enablePartialMatch = true;
      queryBuilder.partialMatchKeywords = 4;
      queryBuilder.partialMatchThreshold = '50%';
    }
    GetBindings()
      .queryController.getEndpoint()
      .search(queryBuilder.build())
      .done(function(data) {
        dataset.forEach(f => {
          if (f.dataset.partialMatch === partial && f.dataset.keyCheck) {
            //Check if we have the key in the result, if so enable the tab else disable it
            let value = f.dataset.keyCheck.split(';')[1];
            let found = false;
            data.groupByResults.forEach(res => {
              res.values.forEach(groupval => {
                if (groupval.value.toLowerCase() === value.toLowerCase()) {
                  //We have it
                  found = true;
                }
              });
            });
            let $newTab = $('.RelatedTab[data-name="' + f.tab + '"]', f.parent);
            if (found) {
              $newTab.show();
            } else {
              $newTab.hide();
            }
          }
        });
      });
  }

  doWeHaveIt(tocheck, value) {
    let wehaveit = false;
    $.each(tocheck, function(index, obj) {
      if (obj.field === value) {
        wehaveit = true;
      }
    });
    return wehaveit;
  }

  //***************************
  //  checkQueries
  //  builds up the total query to execute for the relatedTabs
  //***************************
  checkQueries(queries) {
    // Partial match queries
    let checkQueriesWithPartialMatch = partialMatch => {
      let fields = [];
      let query = [];

      queries.forEach(f => {
        if (f.dataset.partialMatch === partialMatch && f.dataset.keyCheck) {
          // Build a single query with an OR on all queries
          // The key will be used to check if we have results
          // Add keyfield to fields to retrieve
          let field = f.dataset.keyCheck.split(';')[0];
          if (!this.doWeHaveIt(fields, field)) {
            fields.push({ field, sortCriteria: 'nosort' });
          }
          query.push('(' + this.composeQuery(f.result, f.dataset) + ')');
        }
      });
      if (query.length) {
        this.checkQuery(fields, query.join(' OR '), partialMatch, queries);
      }
    };

    checkQueriesWithPartialMatch('true');
    checkQueriesWithPartialMatch('false');
  }
```

For the full code of the component see our [demo](https://elastic.coveodemo.com/demo/page.js).

## Styling the UI with custom CSS
The search interface rendered out of the box looks already quite useful. In our case we wanted to change them to our own branding. Everything can be overruled using CSS rules (see [Styling the Coveo Javascript Search Framework](https://docs.coveo.com/en/423)). Always create your own custom CSS files, and never overwrite the ones provided by Coveo out of the box.

Our resulttemplate is formatted like:
``` css
.coveo-results-column {
  .coveo-list-layout .coveo-result-frame {
      padding: 10px;
      background: #FFFFFF;
      border-radius: 2px;
      background-repeat: no-repeat;
      
      &.movie {
          padding-left: 200px;
          min-height: 278px;
          background-size: 185px auto !important;
      }
      &.people {
          padding-left: 200px;
          min-height: 278px;
          background-size: 138px auto  !important;
          background-position: 20px 20px !important;
      }
      &.default {
          padding-left: 1px;
          min-height: 278px;
      }
      &.music {
          padding-left: 200px;
          min-height: 190px;
          background-size: 174px auto  !important;
      }
      &.concert {
          padding-left: 200px;
          min-height: 160px;
          background-size: 160px auto  !important;
      }
      &.no-image {
          padding-left: 10px;
      }
  }
}
```

## Personalization
More and more we see requests coming in around personalization, which is one of the reasons why we added it to our demo. In our case we had two profiles: Movie Fan and a Movie Producer. Each had its own color schema and its own relevancy rules. Using the profiles we could not only change the UI styling, but we also added specific relevancy rules. In a normal scenario this would come from all kinds of systems: for example department/country from Active Directory or information from a userprofile in Salesforce or Sharepoint.

With Coveo you can use the ```$qre``` syntax to start boosting results with your preferences to a higher position (see [Coveo Cloud Query Syntax](https://www.coveo.com/go?dest=cloudhelp&lcid=9&context=357)).
``` javascript
//Create a usermap with help and booster information.
const usersMap = {
  Producer: {
    sel: "Producer",
    activeTab: "Movies",
    booster: "$qre(expression: \'@mytype=Movie\',modifier:\'1600\', isConstant:\'true\') $qre(expression: \'@mygenre=Documentaries @mytype=Movie\',modifier:\'400\', isConstant:\'true\')  $qre(expression: \'@mygenre=Rock @mytype=Music\',modifier:\'-420\', isConstant:\'true\') $qre(expression: \'@myprofitvalue<=5\',modifier:\'-800\', isConstant:\'true\') $qre(expression: \'@myprofitvalue>100\',modifier:\'200\', isConstant:\'true\') ",
    musicbooster: " $qre(expression: \'@mygenre=Rock @mytype=Music\',modifier:\'-500\', isConstant:\'true\')",
  },
  Anonymous: {
    sel: "Anonymous",
    activeTab: "Movies",
    booster: "$qre(expression: \'@mytype=Movie\',modifier:\'1600\', isConstant:\'true\') $qre(expression: \'@mytype=Review\',modifier:\'-1200\', isConstant:\'true\') $qre(expression: \'@mypopularity<15\', modifier:\'-800\', isConstant:\'true\') $qre(expression: \'@mypopularity>15\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>250\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>500\', modifier:\'200\', isConstant:\'true\')",
    musicbooster: "",
  }
};
```

The above will change in the future when we will support rankingfunctions. Then, the whole set of ```@mypopularity``` expressions will be replaced by a single decay function.

## UI, tips, and tricks
Here are some tips and tricks that we developed over our implementation, and which could help you during yours.

### Adding context
In order to use context like a ```userRole``` we added [context](https://docs.coveo.com/en/399) to our Queries using the following code:
``` javascript
$('#search').on("buildingQuery", function (e, args) {
	//A custom context is added so we can react on it in Query Pipelines and Analytics
	args.queryBuilder.addContext({
		"userRole": userIdToAdd.sel
	});
});
```
All [events](https://docs.coveo.com/en/417) in Coveo can be adjusted to fit to your needs.

### Adding a Relevancy boost when a user profile is selected
When a user profile is selected we wanted to set the [hiddenQuery](https://docs.coveo.com/en/3/ui-api-reference/coveo-javascript-search-framework-api-reference#hiddenquery-component) so it changes the relevancy based upon what was set for the current profile. In this case: ```hd``` means the description provided to the user (in the breadcrumb section), ```hq``` is the actual hidden query.
``` javascript
$('#search').on("buildingQuery", function (e, args) {
	//Set the proper pipeline
	args.queryBuilder.pipeline = (MLactive ? 'ML' : 'default');

	if (userBoost) {
		Coveo.$('.CoveoSearchInterface').coveo('state', 'hd', userHelp.split('<BR>')[0]);
		Coveo.$('.CoveoSearchInterface').coveo('state', 'hq', userBoost);
		userBoost = "";
	}
});
```

### Getting a proper access token from a Lambda function
As mentioned before, you should not use public API keys inside your code. We created a Lambda function for the retrieval of our Access Token.
The Lambda function:
``` javascript
'use strict';
const https = require('https');

const TOKENS = {
  'platformdemoelastic3zlf3f2p': '-IMPERSONATE-TOKEN-'
};

const ROLES = {
  Director: 'director@coveo.com',
  Producer: 'producer@coveo.com',
  Rock: 'rock@coveo.com'
};


let getUsers = (role) => {
  let provider = 'Email Security Provider';
  let users = [{
    name: '*@*',
    provider,
    type: 'Group'
  }];

  let name = ROLES[role];
  if (name) {
    users.push({
      name,
      provider,
      type: 'User',
    });
  }
  return users;
};


// Return an object {token, userIds?} if input is valid, otherwise returns null.
let validateInput = (event) => {
  try {
    let body = JSON.parse(event.body),
      token = TOKENS[body.org],
      userIds = getUsers(body.role);

    if (token && userIds) {
      return { token, userIds };
    }
  }
  catch (e) {
    console.log('Invalid input: ', e);
  }
  return null;
};


let requestToken = (inputParams, callback) => {
  // the post options
  let options = {
    host: 'platform.cloud.coveo.com',
    path: '/rest/search/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + inputParams.token,
    }
  };

  let req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
      callback(res);
      return;
    }
    let body = '';
    res.on('data', chunk => {body += chunk;});
    res.on('end', () => {
      let response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
          'Access-Control-Allow-Origin': '*',
        },
        body,
        isBase64Encoded: false
      };

      // success
      callback(null, response);
    });
  });
  req.on('error', (e) => {
    console.error('HTTP error: ' + e.message);
    callback({
      statusCode: 500,
      headers: {},
      body: '{"message":"server error"}',
      isBase64Encoded: false
    });
  });

  let usersPayload = {
    userIds: inputParams.userIds
  };
  req.write(JSON.stringify(usersPayload));
  req.end();

};

exports.handler = (event, context, callback) => {
  let inputParams = validateInput(event);
  if (inputParams) {
    requestToken(inputParams, callback);
  }
  else {
    callback(null, {
      statusCode: 400,
      headers: {},
      body: '{"message": "Invalid request body"}',
      isBase64Encoded: false
    });
  }

};
```
And in our Javascript file, we fetched the token:
``` javascript
//On Load...

  //We set default values
  Coveo.Analytics.options.endpoint.defaultValue = 'https://usageanalytics.coveo.com';
  Coveo.Analytics.options.searchHub.defaultValue = 'Movie';
  Coveo.Analytics.options.organization.defaultValue = ORG_ID;
  Coveo.Analytics.options.pipeline = 'ML';

  //Retrieve the access token
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://5qgxnbkr4f.execute-api.us-east-1.amazonaws.com/prod');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = ()=>{
    let token = JSON.parse(xhr.response).token;
    //Set it for both the interface as the analytics token
    Coveo.SearchEndpoint.endpoints['default'].options.accessToken = token;
    Coveo.Analytics.options.token.defaultValue = token;
    //Init our Components
    Coveo.init(document.querySelector('#search'));
    //And the recommendation component
    Coveo.initRecommendation(document.querySelector('#MyRecommendationsMusic'));
  };
  xhr.send(JSON.stringify({
    org: ORG_ID,
    role: userIdToAdd.sel
  }));
```

### Reacting on 'popular queries', manually execute a query
We added (for demo purposes) a couple of popular queries to the UI. This would execute a query directly. When you execute a new query by code you also need to add the proper analytics events! We used the following code to do that:
``` javascript
export class MyPopularQueries extends Coveo.Component {
  constructor(element) {
    super(element, MyPopularQueries.ID);
    ['Jungle Book', 'Fast Racing', 'Upcoming', 'Playing now', 'Suprise me', 'History Museum'].forEach(value => {
      const link = this.buildLink(value);
      Coveo.$$(this.element).append(link.el);
    });
  }

  buildLink(value) {
    const link = Coveo.$$('a', { href: '#' }, value);
    link.on('click', e => {
      e.preventDefault();
      this.changeQuery(value);
    });

    return link;
  }

  changeQuery(query) {
    Coveo.state(this.root, 'q', query);
    const customEventCause = { name: 'searchboxSubmit', type: 'search box' };
    Coveo.logSearchEvent(this.root, customEventCause, {});
    Coveo.executeQuery(this.root);
  }
}

MyPopularQueries.ID = 'MyPopularQueries';
Coveo.Initialization.registerAutoCreateComponent(MyPopularQueries);
```

### Add additional (missing or cleaning) metadata fields to our retrieved results
We wanted to enrich the result set with our own result fields (on rendering time). In our case a default field ```collection``` was missing in our data. So we added it to our results. 
``` javascript
$('#search').on("preprocessResults", (e, args) => {
  //We want to add an additional field (if it is missing) to the results
  ((args && args.results && args.results.results) || []).forEach(r=>{
    r.raw.collection = (r.raw.collection || 'default');
  });
});
```

### Setting the culture
Providing a UI in several languages is very user friendly. We did it in our [Partner demo](https://elastic.coveodemo.com/demo-partners). We first provided the translation of your custom strings:
``` javascript
//Setting the translation for the custom strings, which would not be in the out-of-the-box translation set
String.toLocaleString({
  "es-es": {
    "Movies, Scripts and Music": "Películas, guiones y música",       
    "All Content": "Todo el contenido",
    "Type": "Tipo",
    "Genre": "Género",
    "Artist (Soundtrack)": "Artista (Banda sonora)",
  },
  "nl": {
    "Movies, Scripts and Music": "Films, script en Muziek",       
    "All Content": "Alles",
    "Type": "Type",
    "Genre": "Genre",
    "Artist (Soundtrack)": "Artiest (soundtrack)",
  },
  "fr": {
    "Movies, Scripts and Music": "Films, Scripts et Musique",       
    "All Content": "Tout le contenu",
    "Type": "Type",
    "Genre": "Genre",
    "Artist (Soundtrack)": "Artist (soundtrack)",
  }
});
```
Then we set the locale and culture to the selected one:
``` javascript
//Setting the locale based upon es-es, nl, fr, en
Globalize.cultureSelector = id;
String["locale"] = id;
//Reload the window
window.location.reload();
```

### Get query suggestions on our landing page
In our [Partner demo](https://elastic.coveodemo.com/demo-partners) we provided a landing page with popular queries. Based upon the ```userRole``` the [querySuggestions](https://developers.coveo.com/x/iQGwAQ) will be retrieved by our api:
``` javascript
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function handleQuerySuggestResponse(response) {
  let queries = response.completions || [];
  queries = queries.map(q => toTitleCase(q.expression));

  Coveo.load('MyPopularQueries').then(MyPopularQueries => {
    return new MyPopularQueries(document.getElementById('PopularQueries'), { queries }, GetBindings());
  });
}

function getQuerySuggest(profile) {
  var token = Coveo.SearchEndpoint.endpoints['default'].options.accessToken;
  var url =
    'https://platform.cloud.coveo.com/rest/search/v2/querySuggest?' +
    'access_token=' +
    token +
    '&language=en' +
    ' &pipeline=MLIntranet' +
    '&context={"userrole": "' +
    profile +
    '"}' +
    '&searchHub=Intranet';

  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function() {
    handleQuerySuggestResponse(JSON.parse(this.responseText));
  });
  xhr.open('GET', url);
  xhr.send();
}
```

### Setting customData on our Analytics Events
In our Search Analytics dashboard we wanted to report if a recommended result was being clicked. The below values should first be added as Dimensions in the Coveo Cloud Administration Console (see [Dimensions](https://support.coveo.com/s/article/ka132000000LMYcAAO/2096)).
``` javascript
$('#search').on('changeAnalyticsCustomData', function (e, args) {
  //We want to inject custom Data into each Analytics call
  args.metaObject.user = userIdToAdd.name;
  args.metaObject.role = userIdToAdd.sel;
  if (args.resultData!=undefined)
  {
    //The below values are first added as Dimensions in the Administration Console
    args.metaObject.c_istop = args.resultData.isTopResult;
    args.metaObject.c_isrecommended =  args.resultData.isRecommendation;
  }
});
```

### Sending a custom Analytics event
We wanted to track if end-users where clicking on the 'Expand to' links in the ResultsRelated component. For that to work, we needed to send a custom event to our Analytics API.
``` javascript
expandQuery() {
  Coveo.$('.CoveoFacet').coveo('reset');
  Coveo.$('#search').coveo('state', 'hd', this.expandedComment);
  Coveo.$('#search').coveo('state', 'hq', this.expandquery);
  Coveo.$('#search').coveo('state', 'q', '');
  //If you manually trigger a query, you always must add your own Analytics event
  var customEventCause = { name: 'expand ' + this.options.name, type: 'search box' };
  Coveo.$('#search').coveo('logSearchEvent', customEventCause, {});
  Coveo.$('#search').coveo('executeQuery');
}

```

### Adding an advanced search
One of our requirements was an advanced search feature. End-users then could easily change the results to their preferences. First we added the needed preferences to the HTML page:
``` html
<div class="CoveoPreferencesPanel">
  <fieldset class="coveo-form-group">
    <span class="coveo-form-group-label">Personalize results</span>
    <div class="perso-menu-content">
      <div class="perso-menu-item Filter">
        <label>
        <input class="user-personalisation-option" id="b1" name="choice-personalize" type="radio" value="choice-personalize-b1" />
            Filter Action movies
        </label>
      </div>
      <div class="perso-menu-item Boost">
        <label>
        <input class="user-personalisation-option" id="b2" name="choice-personalize" type="radio" value="choice-personalize-b2" />
        Boost Action and Willis movies
        </label>
      </div>
      <div class="perso-menu-item Boost">
        <label>
        <input class="user-personalisation-option" id="b3" name="choice-personalize" type="radio" value="choice-personalize-b3" />
        Boost Comedy lower
        </label>
      </div>
      <div class="perso-menu-item Boost">
        <label>
        <input class="user-personalisation-option" id="b4" name="choice-personalize" type="radio" value="choice-personalize-b4" />
        Ignore Title for ranking
        </label>
      </div>
      <div class="perso-menu-item Standard">
        <label>
        <input class="user-personalisation-option" id="standard" name="choice-personalize" type="radio" value="choice-personalize-nothing"/>
        Standard search
        </label>
      </div>
    </div>
  </fieldset>

  <div class="CoveoResultsPreferences"></div>
  <div class="CoveoResultsFiltersPreferences"></div>
</div>
```
With additional code in our JS:
``` javascript
//***************************
//setSearchParams
//  Executed when the 'advancedsearch' is activated
//***************************
let persoFilter = "standard";
function setSearchParams() {
  let detail = '';

  let queries = {
    b1: `@mygenre=Action`,
    b2: `($qre(expression: '@mygenre=Action',modifier:'220')) ($qre(expression: '@mypeople=Willis',modifier:'220', isConstant:'true'))`,
    b3: `($qre(expression: '@mygenre=Comedy',modifier:'-200', isConstant:'true'))`,
    b4: `$weight(name:'Title', value:'0')`,
  };

  let query = queries[persoFilter] || '';
  if (query) {
    let $elem = $('#' + persoFilter).prop('checked', true);
    detail = $elem.closest('label').text();
  }
  else {
    $('#standard').prop("checked", true);
  }
  //Set the hiddenQuery parameters
  $('#search').coveo('state', 'hd', detail);
  $('#search').coveo('state', 'hq', query);
}

//On Load...

  //If the Advanced search is changed we need to trigger the change
  $('.user-personalisation-option').change(function () {
    persoFilter = $(this).attr('id');
    setSearchParams();
    //Set analytics event
    var customEventCause = {name: 'changePreferences', type:'search box'};
    $('#search').coveo('logSearchEvent', customEventCause, {});
    $('#search').coveo('executeQuery');
  });
```

### Sending a PageView event when clicking on a URL
In a normal situation the public website or other system could sent additional ```PageView``` events to our Analytics engine. You need that if you want to use our [Recommendations](https://www.coveo.com/go?dest=cloudhelp&lcid=9&context=237) component. The ```Recommendations``` component will look at your current journey and will use our Machine Learning to start recommending articles based on other people's journeys.

In our case we simply wanted to add such an event whenever end-users clicked on the preview and/or followed the hyperlink.
``` javascript
$('#search').on('changeAnalyticsCustomData', function (e, args) {
  //Register a pageview when clicking on a result (used for Recommendations)
  // Normally this would be done by the website directly
  if (args.type === 'ClickEvent') {
    let contentType = null;
    if ((/themoviedb/).test(args.metaObject.documentURL)) {
      contentType = "Movie";
    }
    if ((/last\.fm/).test(args.metaObject.documentURL)) {
      contentType = "Music";
    }

    if (contentType) {
      let meta = args.metaObject;
      coveoua("init", Coveo.Analytics.options.token.defaultValue);
      coveoua('send', 'pageview', {
        contentIdKey: meta.contentIDKey,
        contentIdValue: meta.contentIDValue,
        contentType: contentType
      });
    }
  }
});
```

## Pushing Analytics events using the UABOT
In a normal production system the Search Analytics would work together with our Machine Learning to constantly improve the relevancy. Because of the limited use of the demo, this would not work for us. We still wanted to show our [Search Analytics Dashboards](https://www.coveo.com/go?dest=cloudhelp&lcid=9&context=238). In order to show them we would need data. That is where our [UABOT](https://github.com/coveo/uabot) comes in. Based upon a JSON configuration file it will start pushing Analytics events to our Analytics service. The Search Analytics events are used by our Machine Learning which will provide [query suggestions](https://onlinehelp.coveo.com/en/cloud/enabling_coveo_machine_learning_query_suggestions_in_a_coveo_js_search_framework_search_box.htm) and [relevancy boosting](https://www.coveo.com/go?dest=cloudhelp&lcid=9&context=166).

Our UABOT file:
``` json
{
  "searchendpoint": "https://platform.cloud.coveo.com/rest/search/",
  "analyticsendpoint": "https://usageanalytics.coveo.com/rest/v15/analytics/",
  "orgName": "platformdemoelastic3zlf3f2p",
  "pipeline": "ML",
  "searchHub": "Movie",
  "defaultOriginLevel1": "Movie",
  "defaultOriginLevel2": "default",
  "allowAnonymousVisits": true,
  "anonymousThreshold": 0.3,
  "emailSuffixes": [
    "@coveo.com"
  ],
  "timeBetweenVisits": 20,
  "timeBetweenActions": 3,
  "randomGoodQueries": [
    "red willis",
    "captain america",
    "jungle",
    "dinosaur",
    "spaceship",
    "last knight",
    "I Don't Want to Miss a Thing"
  ],
  "randomBadQueries": [
    "woopi godberg",
    "Ghostbutter",
    "Gostbuster",
    "star treq",
  ],
  "randomCustomData": [
    {
      "apiname": "context_userRole",
      "values": [
        "Anonymous",
        "Producer"
      ]
    },
    {
      "apiname": "role",
      "values": [
        "Anonymous",
        "Producer"
      ]
    },
    {
      "apiname": "c_isbot",
      "values": [
        "true"
      ]
    }
  ],
  "globalFilter": "NOT @mytype=Wikipedia",
  "scenarios": [
    {
      "name": "(G) red willis",
      "weight": 3,
      "events": [
        {
          "type": "SearchAndClick",
          "arguments": {
            "queryText": "red willis",
            "matchField": "title",
            "matchValue": "RED",
            "probability": 0.95
          }
        }
      ]
    },
    {
      "name": "QC(The Rock, 95%)",
      "weight": 1,
      "events": [
        {
          "type": "Search",
          "arguments": {
            "queryText": "The Rock",
            "goodQuery": true
          }
        },
        {
          "type": "FacetChange",
          "arguments": {
            "facetTitle": "Supporting people",
            "facetValue": "Dwayne Johnson",
            "facetField": "@mypeople"
          }
        }
      ]
    },
    {
      "name": "QC(Night at the Museum, 95%)",
      "weight": 3,
      "events": [
        {
          "type": "SearchAndClick",
          "arguments": {
            "queryText": "history museum",
            "matchField": "title",
            "matchValue": "Night at the Museum",
            "probability": 0.95
          }
        }
      ]
    }
  ]
}
```

And that is it! I hope you enjoyed it.

Special thanks to my colleague Jérôme Devost who helped me build this!
