'use strict';
var asanaRequest, baseUrl, config, data_dir, datestamp, day, logger, output, projects, projects_file, request, serviceConfig, thisService;

require('sugar');

config = require("../../lib/configuration").Configuration;

logger = require('../../lib/logger').Logger;

output = require('../../lib/data').Data;

request = require("../../lib/http").Http;

thisService = "asana";

serviceConfig = config.forService(thisService);

data_dir = config.dataDirectoryForService(thisService);

baseUrl = "https://app.asana.com/api/1.0";

asanaRequest = function(path, params) {
  var morePages, options, outputData, req;
  morePages = true;
  outputData = [];
  options = {
    limit: 100
  };
  req = request.get(baseUrl + "/" + path + "?" + (Object.toQueryString(options)), {
    headers: {
      "Authorization": "Basic " + (new Buffer(serviceConfig.key + ":").toString('base64'))
    }
  });
  return JSON.parse(req).data;
};

day = Date.create();

datestamp = day.format('{yyyy}-{MM}-{dd}');

console.log(baseUrl + "/workspaces");


/*

workspaces = asanaRequest "#{baseUrl}/workspaces"

output.toCsv "#{data_dir}/#{datestamp}_workspaces.csv", workspaces
 */

projects = asanaRequest("projects");

output.toCsv(data_dir + "/" + datestamp + "_projects.csv", projects);

projects_file = [];

projects.each(function(project) {
  var data, projectUrl, taskUrl, tasks;
  console.log("project: " + project.name);
  projectUrl = "projects/" + project.id;
  data = asanaRequest(projectUrl);
  console.log(data);
  taskUrl = "projects/" + project.id + "/tasks";
  return tasks = asanaRequest(taskUrl);
});
