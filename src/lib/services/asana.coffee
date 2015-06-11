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






baseUrl = "https://app.asana.com/api/1.0/"

# todo: redo this with http sync requests


headers =
  "Authorization" : "Basic #{new Buffer("#{serviceConfig.key}:").toString('base64')}"


day = Date.create()
datestamp = day.format('{yyyy}-{MM}-{dd}')



workspaces = request "get", "#{baseUrl}/workspaces",
  headers: headers

console.log workspaces



#user_workspaces = []


###
workspaces_projects_finished = ()->
  console.log "projects done, start doing tasks"
workspace_array = []
project_counter = {}

workspaces_projects_done = 0

client.workspaces.findAll().then (response)->
  #console.log response  
  console.log "WORKSPACES"
  console.log response.data
  workspaces = response.data
  workspace_array = workspaces
  
  return workspaces
.then (workspaces)->
  console.log "find users by workspace"
  workspaces.each (workspace)->
    
    client.users.findByWorkspace(workspace.id).then (response)->
      console.log workspace.name
      console.log response

      return

  return workspaces
###