(function(){
  "use strict";

  var githubUser = "coveo";

  function get_public_repos(){
    var h = {
      method: "GET",
      url: "https://api.github.com/users/Coveo/repos",
      params: {
        type: "public",
        sort: "updated"
      }
    };
    return [];
  }


  var repos = get_public_repos();




  var repos_with_additional_repos = repos.map(function(repo){
    // TODO: query for aditionnal info in repos

    // GET /repos/:owner/:repo/languages
    // GET /repos/:owner/:repo/stats/punch_card
    // GET /repos/:owner/:repo/stats/participation
    // GET /repos/:owner/:repo/stats/code_frequency
    // GET /repos/:owner/:repo/stats/commit_activity
  });

  var projects = {
    "coveo.analytics.js": {
      "home": "https://github.com/Coveo/analytics.js",
      "versions": {
        "latest": {
          "coveo.analytics.js": "https://s3.amazonaws.com/static.coveodemo.com/coveo.analytics.js/latest/coveo.analytics.js",
          "coveo.analytics.min.js": "https://s3.amazonaws.com/static.coveodemo.com/coveo.analytics.js/latest/coveo.analytics.min.js"
        },
        "v0.1.1": {
          "coveo.analytics.js": "https://s3.amazonaws.com/static.coveodemo.com/coveo.analytics.js/v0.1.1/coveo.analytics.js",
          "coveo.analytics.min.js": "https://s3.amazonaws.com/static.coveodemo.com/coveo.analytics.js/v0.1.1/coveo.analytics.min.js"
        },
        "v0.1.0": {
          "coveo.analytics.js": "https://s3.amazonaws.com/static.coveodemo.com/coveo.analytics.js/v0.1.0/coveo.analytics.js",
          "coveo.analytics.min.js": "https://s3.amazonaws.com/static.coveodemo.com/coveo.analytics.js/v0.1.0/coveo.analytics.min.js"
        }
      }
    }
  };

})();
