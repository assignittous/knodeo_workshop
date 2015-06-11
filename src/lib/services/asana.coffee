# asana.coffee

'use strict'
require('sugar')

config = require("../../lib/configuration").Configuration
logger = require('../../lib/logger').Logger
output = require('../../lib/data').Data
request = require("../../lib/http").Http

thisService = "asana"
serviceConfig = config.forService thisService
data_dir = config.dataDirectoryForService thisService 


baseUrl = "https://app.asana.com/api/1.0"

asanaRequest = (url)->


  req = request.get url, 
    headers:
      "Authorization" : "Basic #{new Buffer("#{serviceConfig.key}:").toString('base64')}"
  return JSON.parse(req).data



# todo: redo this with http sync requests




day = Date.create()
datestamp = day.format('{yyyy}-{MM}-{dd}')


console.log "#{baseUrl}/workspaces"

###

workspaces = asanaRequest "#{baseUrl}/workspaces"

output.toCsv "#{data_dir}/#{datestamp}_workspaces.csv", workspaces

###

projects = asanaRequest "#{baseUrl}/projects"

output.toCsv "#{data_dir}/#{datestamp}_projects.csv", projects

projects_file = []

projects.each (project)->
  console.log "project: #{project.name}"
  projectUrl = "#{baseUrl}/projects/#{project.id}"
  data = asanaRequest projectUrl
  console.log data

  # todo -t ransform the projects before writing them



  # get tasks
  # add field parameter to get everything
  taskUrl = "#{baseUrl}/projects/#{project.id}/tasks"
  tasks = asanaRequest taskUrl

  #tasks.each (task)->
  #  console.log task

    # attachments

  # stories


# tags


# users

###
# This has questionable value
workspaces.each (workspace)->
  workspaceUrl = "#{baseUrl}/workspaces/#{workspace.id}"
  data = asanaRequest workspaceUrl
  console.log data
