# fogbugz

###

Fogbugz uses an XML API, which means it needs some special handling compared to most APIs, which use JSON.

###

'use strict'




# 
logger = require('../../lib/logger').Logger
request = require('../../lib/http').Http
require "sugar"
convert = require('../../lib/convert').Convert
fs = require('fs')
cwd = process.env.PWD || process.cwd()
CSON = require('cson')
configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
config = configuration.cloud.fogbugz
output = require('../../lib/data').Data

xmlParse = require('xml2js').parseString
request = require("../../lib/http").Http


# current version requires credentials written to cwd containing fogbugz credentials
# todo - rewrite this using synchronous http

###
{"name":"response","childs":[{"name":"error","attrib":{"code":"1"},"childs":["Incorrect password or username"]}]}
<?xml version="1.0" encoding="UTF-8"?><response><error code="1"><![CDATA[Incorrect password or username]]></error></response>

{"name":"response","childs":[{"name":"token","childs":["tokenvalue"]}]}
<?xml version="1.0" encoding="UTF-8"?><response><token><![CDATA[tokenvalue]]></token></response>


###
#console.log config

baseUrl = ""
loginUrl = "https://#{config.host}/api.asp?cmd=logon&email=#{config.username}&password=#{config.password}"


loginAttempt = request.get loginUrl



xmlParse loginAttempt, (err, data)->
  if err?
    logger.error "Login attempt connection failure"
  else
    response = data.response
    
    if response.error?
      logger.error "Fogbugz reported an error: #{response.error.first()._}"
    else
      if response.token?
        token = response.token.first()
        logger.info "Logged in to Fogbugz"

        baseUrl = "https://#{config.host}/api.asp?token=#{token}"


        # List projects


        # projectsXml = 
        logger.info "Getting projects list"
        output.toRaw "#{config.data_path}/projects.xml", request.get("#{baseUrl}&cmd=listProjects&fIncludeDeleted=1")
        logger.info "Getting filters list"
        # List filters
        output.toRaw "#{config.data_path}/areas.xml", request.get("#{baseUrl}&cmd=listFilters")



        # todo:

        # find the filter in the config 

        # cmd=setCurrentFilter&sFilter=402
        # followed by...
        # cmd=search

        logger.info "Getting areas"
        # List nondeleted areas
        output.toRaw "#{config.data_path}/areas.xml", request.get("#{baseUrl}&cmd=listAreas")

        logger.info "Getting categories"
        # List categories
        output.toRaw "#{config.data_path}/categories.xml", request.get("#{baseUrl}&cmd=listCategories")

        logger.info "Getting people"
        # List nondeleted areas
        output.toRaw "#{config.data_path}/people.xml", request.get("#{baseUrl}&cmd=listPeople&fIncludeDeleted=1&fIncludeCommunity=1&fIncludeVirtual=1")

        logger.info "Getting categories"
        # List statuses
        output.toRaw "#{config.data_path}/categories.xml", request.get("#{baseUrl}&cmd=listStatuses")        

        logger.info "Getting fix fors"
        # List fixfors
        output.toRaw "#{config.data_path}/fixfors.xml", request.get("#{baseUrl}&cmd=listFixFors&fIncludeDeleted=1&fIncludeReallyDeleted=1")       

        logger.info "Getting statuses"
        # List statuses
        output.toRaw "#{config.data_path}/statuses.xml", request.get("#{baseUrl}&cmd=listStatuses")        

        logger.info "Getting wikis"

        # List wikis
        output.toRaw "#{config.data_path}/wikis.xml", request.get("#{baseUrl}&cmd=listWikis")        

        logger.info "Getting snippets"
        # List snipets
        output.toRaw "#{config.data_path}/snippets.xml", request.get("#{baseUrl}&cmd=listSnippets")        


        # logoff token:

        logoutXml = request.get "http://#{config.host}/api.asp?cmd=logoff&token=#{token}"
        # should yield an empty response
        logger.info "Logged out of Fogbugz"
        # 

      else
        logger.error "Fogbugz didn't return a token on the login attempt"
        return


#loginObject = request.getXml loginUrl
#console.log JSON.stringify(loginObject)
#if login?
#  token = login.token

#else
#  logger.error "ERROR TRYING LOGIN"

###
attributes = [
  "ixBug"
  "ixBugParent"
  "ixBugChildren"
  "ixProject"
  "fOpen"
  "sProject"
  "ixArea"
  "sArea"
  "sTitle"
  "sStatus"
  "ixPersonAssignedTo"
  "sPersonAssignedTo"
  "sEmailAssignedTo"
  "ixPersonOpenedBy"
  "ixPersonResolvedBy"
  "ixPersonClosedBy"
  "ixPersonLastEditedBy"
  "ixStatus"
  "ixBugDuplicates"
  "ixBugOriginal"
  "sStatus"
  "ixPriority"
  "sPriority"
  "ixFixFor"
  "sFixFor"
  "dtFixFor"
  "sVersion"
  "sComputer"
  "hrsOrigEst"
  "hrsCurrEst"
  "hrsElapsed"
  "c"
  "sCategory"
  "dtOpened"
  "dtResolved"
  "dtClosed"
  "ixBugEventLatest"
  "dtLastUpdated"
  "dtDue"
  "dtLastView"
  "ixRelatedBugs"
  "dtLastOccurrence"
]

fogbugz.logon()
.then (filters) ->
  #console.log "filters"
  #console.log filters
  #console.log "setCurrentFilter 4"
  fogbugz.setCurrentFilter(4)
  #return fogbugz.listFilters()
.then ()->
  console.log "search"


  return fogbugz.search("", attributes, 1000)
.then (cases)->

  output = convert.arrayToCsv(cases, attributes)
  console.log output
  day = Date.create()

  datestamp = day.format('{yyyy}-{MM}-{dd}')
  targetPath = "#{data_dir}/#{datestamp}_cases.csv"

  fs.writeFileSync(targetPath, output)
###