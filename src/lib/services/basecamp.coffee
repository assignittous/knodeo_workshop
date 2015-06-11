# basecamp.coffee

'use strict'
require('sugar')


config = require("../../lib/configuration").Configuration
logger = require('../../lib/logger').Logger
output = require('../../lib/data').Data
request = require("../../lib/http").Http

thisService = "basecamp"
serviceConfig = config.forService thisService
data_dir = config.dataDirectoryForService thisService 


#cwd = process.env.PWD || process.cwd()
#CSON = require('cson')
#config = CSON.parseCSONFile("#{cwd}/config.workshop.cson")


#logger = require('../../lib/logger').Logger
#convert = require('../../lib/convert').Convert
##fs = require('fs')
#request = require('sync-request')



day = Date.create()

datestamp = day.format('{yyyy}-{MM}-{dd}')
# start with clients  
baseUrl = "https://basecamp.com/#{serviceConfig.app_id}/api/v1/"
basecampRequest = (path)->
  path = path.replace baseUrl, '' # handle links from objects
  response = request "get", "#{baseUrl}/#{path}",
    headers: 
      "User-Agent": "DataWarehouseETL (#{serviceConfig.email})"
      "Authorization" : "Basic #{new Buffer("#{serviceConfig.email}:#{serviceConfig.password}").toString('base64')}"      
  body = response.body.toString('utf8')
  return JSON.parse(body)


projects = basecampRequest "projects.json"




project_accesses = []
project_attachments = []
project_calendars = []
project_documents = []
project_forwards = []
project_topics = []
project_todolists = []


if projects.length > 0
  output.toCsv "#{data_dir}/#{datestamp}_projects.csv", projects, serviceConfig.attributes.projects

  projects.each (item)->

    project = basecampRequest "projects/#{item.id}.json"

    # todo - for the children, add creator info
    # attachments


    attachments =  baecampRequest project.attachments.url
    attachments.each (attachment)->
      attachment_stub = { project_id: project.id }
      project_attachments.push Object.merge(attachment_stub, Object.select(attachment, [
        "id"
        "name"
        "byte_size"
        "content_type"
        "created_at"
        "updated_at"
        "private"
        "trashed"
        "app_url"
        "thumbnail_url"
      ]))

    calendars = basecampRequest project.calendar_events.url
    calendars.each (calendar)->
      calendar_stub = { project_id: project.id }

      #  "creator"
      #   "id"
      #   "name"
      #   "avatar_url"
      #   "fullsize_avatar_url"
   




      project_calendars.push Object.merge(calendar_stub, Object.select(calendar, [
        "id"
        "created_at"
        "updated_at"
        "summary"
        "description"
        "private"
        "trashed"
        "all_day"
        "starts_at"
        "ends_at"
        "remind_at"
        "url"
        "app_url"
        "comments_count"
      ]))
  




    documents =  basecampRequest project.documents.url

    documents.each (document)->
      document_stub = { project_id: project.id }
      
      #"creator"
      # "id"
      # "name"
      # "avatar_url"
      # "fullsize_avatar_url"
      




      project_documents.push Object.merge(document_stub, Object.select(document, [
        "id"
        "title"
        "private"
        "trashed"
        "created_at"
        "updated_at"
        "url"
        "app_url"
      ]))



    topics =  basecampRequest project.topics.url

    topics.each (topic)->
      topic_stub = { project_id: project.id }
      
      #"topicable"
      # "id"
      # "type"
      # "url"
      # "app_url"
      




      project_topics.push Object.merge(topic_stub, Object.select(topic, [
        "id"
        "title"
        "excerpt"
        "private"
        "trashed"
        "created_at"
        "updated_at"
        "attachments"
      ]))


    todolists =  basecampRequest project.todolists.url

    todolists.each (todolist)->
      todolist_stub = { project_id: project.id }
      
      #"creator"
      # "id"
      # "type"
      # "url"
      # "app_url"
      




      project_todolists.push Object.merge(todolist_stub, Object.select(todolist, [
        "id"
        "name"
        "description"
        "created_at"
        "updated_at"
        "completed"
        "position"
        "private"
        "trashed"
        "url"
        "app_url"
        "remaining_count"
        "completed_count"
      ]))




  # projects done, write child files


  if project_attachments.length > 0
    output.toCsv "#{data_dir}/#{datestamp}_project_attachments.csv", project_attachments
  if project_calendars.length > 0
    output.toCsv "#{data_dir}/#{datestamp}_project_calendars.csv", project_calendars
  if project_documents.length > 0
    output.toCsv "#{data_dir}/#{datestamp}_project_documents.csv", project_documents
  if project_topics.length > 0
    output.toCsv "#{data_dir}/#{datestamp}_project_topics.csv", project_topics
  if project_todolists.length > 0
    output.toCsv "#{data_dir}/#{datestamp}_project_todolists.csv", project_todolists



people = basecampRequest "people.json"

if people.length > 0
  output.toCsv "#{data_dir}/#{datestamp}_people.csv", people, serviceConfig.attributes.people
  people_events = []
  people_todos = []


  people.each (item)->

    person = basecampRequest "people/#{item.id}.json"

    # events
    ###
    res = request "get", person.events.url,
      headers: headers

    events =  dataize(res)

    events.each (event)->
      event_stub = { person_id: item.id }
      
      #"eventable"
      # "id"
      # "type"
      # "url"
      # "app_url"
      #"bucket"
      # "type"
      # "id"
      # "name"
      # "color"
      # "url"
      # "app_url"
      #"attachments"

      people_events.push Object.merge(event_stub, Object.select(event, [
        "id"
        "created_at"
        "updated_at"
        "private"
        "summary"
        "action"
        "target"
        "url"
        "html_url"
        "excerpt"
        "raw_excerpt"
      ]))

    ###

    # todos
    
    ###
    res = request "get", person.assigned_todos.url,
      headers: headers

    todolists =  dataize(res)

    todolists.each (todo)->
      todo_stub = { person_id: item.id }
      
      #"creator"
      # "id"
      # "type"
      # "url"
      # "app_url"
      




      people_todos.push Object.merge(todo_stub, Object.select(todo, [
        "id"
        "name"
        "description"
        "created_at"
        "updated_at"
        "completed"
        "position"
        "private"
        "trashed"
        "url"
        "app_url"
        "remaining_count"
        "completed_count"
      ]))

  ###

  if people_events.length > 0
    output.toCsv "#{data_dir}/#{datestamp}_people_events.csv", people_events
  #if people_todos.length > 0
  #  output.toCsv "#{data_dir}/#{datestamp}_people_todos.csv", people_todos



    # accesses - skip

#"accesses": {

#"forwards": {

#"topics": {

#"todolists": {

  #console.log JSON.stringify(res, null, ' ')
  #buf = new Buffer(res.body.length)
  #console.log buf.toString('ascii')

