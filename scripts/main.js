/*global window,riot,reqwest,console */
"use strict";

console.log((function notSoNiceMultilineHack(){
// ,adPPYba,  ,adPPYba,  8b       d8  ,adPPYba,  ,adPPYba,
// a8"     "" a8"     "8a `8b     d8' a8P_____88 a8"     "8a
// 8b         8b       d8  `8b   d8'  8PP""""""" 8b       d8
// "8a,   ,aa "8a,   ,a8"   `8b,d8'   "8b,   ,aa "8a,   ,a8"
// `"Ybbd8"'  `"YbbdP"'      "8"      `"Ybbd8"'  `"YbbdP"'
//
//
// Hi fella,
//
// Want to have so fun and smash your head at solving nice search problems ?
// Join Coveo and become part of a team of passionate creators that like to
// hurts their heads againts hard problems.
//
// Visit http://careers.coveo.com/ to learn about working at Coveo
// about and our openings.
}).toString().split("\n").slice(1, -1)
.map(function(line){return line.replace(/\/\/ */i, "")}).join("\n"));


// Private Storage
var _githubUser = "coveo";
var _stats = {
  repositories: 0,
  size: 0,
  openIssues: 0,
  languages: {},
};
var _repositories = [];

function getRepositories(){ return _repositories; }
function getStats(){ return _stats; }

// UI Setup
var _projectsTags;
var _globalStatsTags;
var _langStatsTags;

function _updateTags(tags){
  if(tags){tags.forEach(function(tag){ tag.update(); }); }
}

function updateProjects(){ _updateTags(_projectsTags); }
function updateStats(){ _updateTags(_globalStatsTags); _updateTags(_langStatsTags); }

// Global Object (for debugging or fiddling around)
var CoveoOpenSource = {
  githubUser: _githubUser,
  stats: _stats,
  getRepositories: getRepositories,
  getStats: getStats
};

window.CoveoOpenSource = CoveoOpenSource;


riot.compile(function() {
  _projectsTags = riot.mount("projects");
  _globalStatsTags = riot.mount("globalstats");
  _langStatsTags = riot.mount("langstats");
});


function githubRepositories(githubUser){
  return reqwest({
    url: "https://api.github.com/users/" + githubUser + "/repos?type=public&sort=updated",
    type: "json"
  });
}

function githubRepositoryPunchCard(githubUser, repository){
  return reqwest({
    url: "https://api.github.com/repos/" + githubUser + "/" + repository + "/stats/punch_card",
    type: "json"
  });
}
function githubRepositoryLanguages(githubUser, repository){
  return reqwest({
    url: "https://api.github.com/repos/" + githubUser + "/" + repository + "/languages",
    type: "json"
  });
}


function addBytesToLanguage(language, bytes){
  if(!_stats.languages[language]){
    _stats.languages[language] = 0;
  }

  _stats.languages[language] += bytes;
}


// Let's query github and update the UI :)
githubRepositories(_githubUser)
.then(function(repos){

  // Save in our repo store
  repos.filter(function(repo){return !repo.fork; }).forEach(function(repo){
    _repositories.push(repo);
    _stats.repositories++;
    _stats.size += repo.size;
    _stats.openIssues += repo.open_issues_count;

    githubRepositoryLanguages(_githubUser, repo.name).then(function(languages){
      repo.languages = languages;

      Object.keys(languages).forEach(function(language){
        addBytesToLanguage(language, languages[language]);
      });
      updateStats();
      updateProjects(); // update ui
    });
  });
  // Query

  _repositories.forEach(function(repo){
    githubRepositoryPunchCard("coveo", repo.name).then(function(punchcard){
      repo.punchcard = punchcard;
      updateProjects(); // update ui
    });
  });
});
