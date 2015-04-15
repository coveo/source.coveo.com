/*global window,riot,reqwest */
"use strict";
// console.log
// _.-~-.
// 7''  Q..\
// _7         (_
// _7  _/    _q.  /
// _7 . ___  /VVvv-'_                                            .
// 7/ / /~- \_\\      '-._     .-'                      /       //
// ./ ( /-~-/||'=.__  '::. '-~'' {             ___   /  //     ./{
// V   V-~-~| ||   __''_   ':::.   ''~-~.___.-'' _/  // / {_   /  {  /
// VV/-~-~-|/ \ .'__'. '.    '::                     _ _ _        ''.
// / /~~~~||VVV/ /  \ )  \        _ __ ___   ___ ___(_) | | __ _   .::'
// / (~-~-~\\.-' /    \'   \::::. | '_ ` _ \ / _ \_  / | | |/ _` | :::'
// /..\    /..\__/      '     '::: | | | | | | (_) / /| | | | (_| | ::'
// vVVv    vVVv                 ': |_| |_| |_|\___/___|_|_|_|\__,_| ''
//
// Hi there, nice to meet you!
//
// Interested in having a direct impact on hundreds of millions of users? Join
// Mozilla, and become part of a global community that’s helping to build a
// brighter future for the Web.
//
// Visit https://careers.mozilla.org to learn about our current job openings.
// Visit https://www.mozilla.org/contribute for more ways to get involved and
// help support Mozilla.


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
