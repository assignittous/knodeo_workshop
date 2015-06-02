# fogbugz


'use strict'

logger = require('../../lib/logger').Logger

convert = require('../../lib/convert').Convert
fs = require('fs')
cwd = process.env.PWD || process.cwd()
CSON = require('cson')
configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
config = configuration.cloud.fogbugz
data_dir = "#{cwd}/#{configuration.cloud.fogbugz.data_path}"

# current version requires credentials written to cwd containing fogbugz credentials
# todo - rewrite this using synchronous http

fogbugz = require('fogbugz')

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