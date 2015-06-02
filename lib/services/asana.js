'use strict';
var CSON, asana, client, configuration, convert, cwd, datestamp, day, fs, key, logger, project_counter, user_workspaces, workspace_array, workspaces_projects_done, workspaces_projects_finished;

logger = require('../../lib/logger').Logger;

convert = require('../../lib/convert').Convert;

fs = require('fs');

asana = require('asana');

cwd = process.env.PWD || process.cwd();

CSON = require('cson');

day = Date.create();

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

key = configuration.cloud.asana.key;

datestamp = day.format('{yyyy}-{MM}-{dd}');

client = asana.Client.create().useBasicAuth(key);

user_workspaces = [];

workspaces_projects_finished = function() {
  return console.log("projects done, start doing tasks");
};

workspace_array = [];

project_counter = {};

workspaces_projects_done = 0;

client.workspaces.findAll().then(function(response) {
  var workspaces;
  console.log("WORKSPACES");
  console.log(response.data);
  workspaces = response.data;
  workspace_array = workspaces;
  return workspaces;
}).then(function(workspaces) {
  console.log("find users by workspace");
  workspaces.each(function(workspace) {
    return client.users.findByWorkspace(workspace.id).then(function(response) {
      console.log(workspace.name);
      console.log(response);
    });
  });
  return workspaces;
});
