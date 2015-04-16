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
// Want to have so fun and smash your head at solving nice problems ?
// Visit http://careers.coveo.com/ to learn about working at Coveo
// and see our openings.
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

function proxyRepositories(){
  return reqwest({
    url: "https://coveogithubioproxy.coveodemo.com/repositories",
    type: "json"
  });
}

function addBytesToLanguage(language, bytes){
  if(!_stats.languages[language]){
    _stats.languages[language] = 0;
  }

  _stats.languages[language] += bytes;
}

// Let's query our github proxy and update the UI :)
proxyRepositories().then(function(repos){
  // Sort by updated
  // We want only !forks sorted by last updated

  repos = repos.filter(function(repo){ return !repo.fork; })
               .sort(function(a, b){return (new Date(a.updated_at)).valueOf() - (new Date(b.updated_at)).valueOf(); })
               .reverse()
               .forEach(function(repo){
                 _repositories.push(repo);

                 _stats.repositories ++;
                 _stats.size += repo.size;
                 _stats.openIssues += repo.open_issues_count;


                 Object.keys(repo.languages).forEach(function(language){
                   addBytesToLanguage(language, repo.languages[language])
                 });
               });
  updateProjects();
  updateStats();
});
