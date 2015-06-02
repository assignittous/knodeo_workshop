# asana.coffee



'use strict'

logger = require('../../lib/logger').Logger

convert = require('../../lib/convert').Convert
fs = require('fs')
asana = require('asana')

cwd = process.env.PWD || process.cwd()
CSON = require('cson')


# todo: redo this with http sync requests

day = Date.create()

configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
key = configuration.cloud.asana.key


datestamp = day.format('{yyyy}-{MM}-{dd}')


client = asana.Client.create().useBasicAuth(key)  


user_workspaces = []



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
