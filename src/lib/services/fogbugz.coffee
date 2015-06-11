# fogbugz

###

Fogbugz uses an XML API, which means it needs some special handling compared to most APIs, which use JSON.

###

'use strict'
require "sugar"

config = require("../../lib/configuration").Configuration
logger = require('../../lib/logger').Logger
output = require('../../lib/data').Data
request = require("../../lib/http").Http

xmlParse = require('xml2js').parseString


thisService = "fogbugz"
serviceConfig = config.forService thisService
data_dir = config.dataDirectoryForService thisService 







# current version requires credentials written to cwd containing fogbugz credentials
# todo - rewrite this using synchronous http

###
{"name":"response","childs":[{"name":"error","attrib":{"code":"1"},"childs":["Incorrect password or username"]}]}
<?xml version="1.0" encoding="UTF-8"?><response><error code="1"><![CDATA[Incorrect password or username]]></error></response>

{"name":"response","childs":[{"name":"token","childs":["tokenvalue"]}]}
<?xml version="1.0" encoding="UTF-8"?><response><token><![CDATA[tokenvalue]]></token></response>


###
#console.log config

baseUrl = "https://#{serviceConfig.host}/api.asp?"
token = ""



fogbugzUrl = (options)->
  if Object.keys(options).length?
    parameterList = "&#{Object.toQueryString(options)}"
  else
    parameterList = ""
  return "#{baseUrl}?token=#{token}#{parameterList}"

writeRaw = (path, options)->

attributes = 
  cases: [
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

loginAttempt = request.get "#{baseUrl}cmd=logon&email=#{serviceConfig.username}&password=#{serviceConfig.password}"

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
        logger.info "Logged in to Fogbugz as #{serviceConfig.username}"
        logger.info "Token #{token}"

        baseUrl += "token=#{token}"


        # List projects


        # projectsXml = 
        logger.info "Getting projects list"
        console.log "#{baseUrl}&cmd=listProjects&fIncludeDeleted=1"
        output.toRaw "#{data_dir}/projects.xml", request.get("#{baseUrl}&cmd=listProjects&fIncludeDeleted=1")



        logger.info "Getting filters list"
        console.log "#{baseUrl}&cmd=listFilters"
        # List filters
        filtersXml = request.get("#{baseUrl}&cmd=listFilters")
        output.toRaw "#{data_dir}/filters.xml", filtersXml 

        # hunt for serviceConfig.filter's id

        xmlParse filtersXml, (err, obj)->
          if err?
            logger.error "Error trying to parse filters xml" 
            console.log err
          else
            logger.info "Filters xml:"
            console.log JSON.stringify(obj)

            filters = obj.response.filters.first().filter
            found = {}
            if filters.length > 0
              
              filters.map (filter)->
                found[filter._] = filter.$.sFilter

              if Object.keys(found).any serviceConfig.filter

                logger.info "Filter: #{serviceConfig.filter} Id is #{found[serviceConfig.filter]}"
                request.get("#{baseUrl}&cmd=setCurrentFilter&sFilter=#{found[serviceConfig.filter]}")
                output.toRaw "#{data_dir}/cases.xml", request.get("#{baseUrl}&cmd=search&cols=#{attributes.cases.join(',')}") 

              else
                logger.warn "Filter named #{serviceConfig.filter} in config file not found. Skipping case extraction."



        # todo:

        # find the filter in the config 

        # cmd=setCurrentFilter&sFilter=402
        # followed by...
        # cmd=search

        logger.info "Getting areas"
        # List nondeleted areas
        output.toRaw "#{data_dir}/areas.xml", request.get(fogbugzUrl({cmd: "listAreas"}) )

        logger.info "Getting categories"
        # List categories
        output.toRaw "#{data_dir}/categories.xml", request.get("#{baseUrl}&cmd=listCategories")

        # This appears to be useless, even when loggin in as the account owner, doesn't produce any recrods
        logger.info "Getting people"
        # List nondeleted areas
        output.toRaw "#{data_dir}/people.xml", request.get("#{baseUrl}&cmd=listPeople&fIncludeDeleted=1&fIncludeCommunity=1&fIncludeVirtual=1")

        logger.info "Getting categories"
        # List statuses
        output.toRaw "#{data_dir}/categories.xml", request.get("#{baseUrl}&cmd=listStatuses")        

        logger.info "Getting fix fors"
        # List fixfors
        output.toRaw "#{data_dir}/fixfors.xml", request.get("#{baseUrl}&cmd=listFixFors&fIncludeDeleted=1&fIncludeReallyDeleted=1")       

        logger.info "Getting statuses"
        # List statuses
        output.toRaw "#{data_dir}/statuses.xml", request.get("#{baseUrl}&cmd=listStatuses")        

        logger.info "Getting mailboxes"
        # List mailboxes
        output.toRaw "#{data_dir}/mailboxes.xml", request.get("#{baseUrl}&cmd=listMailboxes")        


        logger.info "Getting wikis"

        # List wikis
        output.toRaw "#{data_dir}/wikis.xml", request.get("#{baseUrl}&cmd=listWikis")        

        logger.info "Getting snippets"
        # List snipets
        output.toRaw "#{data_dir}/snippets.xml", request.get("#{baseUrl}&cmd=listSnippets")        


        # logoff token:

        logoutXml = request.get "http://#{serviceConfig.host}/api.asp?cmd=logoff&token=#{token}"
        # should yield an empty response
        logger.info "Logged out of Fogbugz"
        # 

        logger.slack()

      else
        logger.error "Fogbugz didn't return a token on the login attempt"
        return


