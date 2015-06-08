
/*

Fogbugz uses an XML API, which means it needs some special handling compared to most APIs, which use JSON.
 */
'use strict';
var CSON, config, configuration, convert, cwd, data_dir, fs, logger, loginAttempt, loginUrl, request, xmlParse;

logger = require('../../lib/logger').Logger;

request = require('../../lib/http').Http;

require("sugar");

convert = require('../../lib/convert').Convert;

fs = require('fs');

cwd = process.env.PWD || process.cwd();

CSON = require('cson');

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

config = configuration.cloud.fogbugz;

data_dir = cwd + "/" + configuration.cloud.fogbugz.data_path;

xmlParse = require('xml2js').parseString;

request = require("../../lib/http").Http;


/*
{"name":"response","childs":[{"name":"error","attrib":{"code":"1"},"childs":["Incorrect password or username"]}]}
<?xml version="1.0" encoding="UTF-8"?><response><error code="1"><![CDATA[Incorrect password or username]]></error></response>

{"name":"response","childs":[{"name":"token","childs":["tokenvalue"]}]}
<?xml version="1.0" encoding="UTF-8"?><response><token><![CDATA[tokenvalue]]></token></response>
 */

loginUrl = "http://" + config.host + "/api.asp?cmd=logon&email=" + config.username + "&password=" + config.password;

loginAttempt = request.get(loginUrl);

xmlParse(loginAttempt, function(err, data) {
  var response, token;
  if (err != null) {
    return logger.error("Login attempt connection failure");
  } else {
    response = data.response;
    if (response.error != null) {
      return logger.error("Fogbugz reported an error: " + (response.error.first()._));
    } else {
      console.log(JSON.stringify(response));
      if (response.token != null) {
        return token = response.token.first();
      } else {
        logger.error("Fogbugz didn't return a token on the login attempt");
      }
    }
  }
});


/*
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
 */
