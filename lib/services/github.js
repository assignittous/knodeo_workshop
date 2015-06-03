'use strict';
var CSON, Github, attributes, configuration, convert, currentRepo, cwd, data_dir, datestamp, day, fs, github, logger, request, user;

logger = require('../../lib/logger').Logger;

convert = require('../../lib/convert').Convert;

fs = require('fs');

Github = require('github-api');

request = require('sync-request');

cwd = process.env.PWD || process.cwd();

CSON = require('cson');

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

data_dir = cwd + "/" + configuration.cloud.github.data_path;

day = Date.create();

datestamp = day.format('{yyyy}-{MM}-{dd}');

github = new Github({
  token: configuration.cloud.github.token,
  auth: "oauth"
});

user = github.getUser();

attributes = {
  repo: ["id", "name", "full_name", "private", "html_url", "description", "fork", "url", "created_at", "updated_at", "pushed_at", "git_url", "ssh_url", "clone_url", "svn_url", "homepage", "size", "stargazers_count", "watchers_count", "language", "has_issues", "has_downloads", "has_wiki", "has_pages", "forks_count", "mirror_url", "open_issues_count", "forks", "open_issues", "watchers", "default_branch"]

  /*
    "owner"
     "login"
       "id"
       "avatar_url"
       "gravatar_id"
       "url"
       "html_url"
       "followers_url"
       "following_url"
       "gists_url"
       "starred_url"
       "subscriptions_url"
       "organizations_url"
       "repos_url"
       "events_url"
       "received_events_url"
       "type"
       "site_admin"
    "permissions"
      "admin"
      "push"
      "pull"
   */
};


/*
user.repos (err, repos)->
  if err?
    console.log "ERROR"
    console.log err
  else
     * console.log repos

    if repos.length > 0
      #console.log JSON.stringify(repos,null," ")
      fs.writeFileSync("#{data_dir}/#{datestamp}_repos.csv", convert.arrayToCsv(repos, attributes.repo))     

      repos.each (repo)->
        elements = repo.full_name.split('/')
        user = elements[0]
        repoName = elements[1]

        currentRepo = github.getRepo(user,repoName)


        currentRepo.listTags (err, tags)->
          console.log tags


        #currentRepo.listPulls (err, pulls)->
         *  console.log pulls

        currentRepo.getCommits {since: "2008-01-01"}, (err, commits)->
          console.log "Got #{commits.length} for repo: #{repo.full_name} since 2008-01-01"
          #console.log commits
 */

currentRepo = github.getRepo('assignit', 'pi_app');

currentRepo.show(function(err, repo) {
  return fs.writeFileSync(data_dir + "/" + datestamp + "_repos.csv", convert.arrayToCsv([repo], attributes.repo));
});

currentRepo.listTags(function(err, tags) {
  return console.log(tags);
});
