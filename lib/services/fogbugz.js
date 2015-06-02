'use strict';
var CSON, attributes, config, configuration, convert, cwd, data_dir, fogbugz, fs, logger;

logger = require('../../lib/logger').Logger;

convert = require('../../lib/convert').Convert;

fs = require('fs');

cwd = process.env.PWD || process.cwd();

CSON = require('cson');

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

config = configuration.cloud.fogbugz;

data_dir = cwd + "/" + configuration.cloud.fogbugz.data_path;

fogbugz = require('fogbugz');

attributes = ["ixBug", "ixBugParent", "ixBugChildren", "ixProject", "fOpen", "sProject", "ixArea", "sArea", "sTitle", "sStatus", "ixPersonAssignedTo", "sPersonAssignedTo", "sEmailAssignedTo", "ixPersonOpenedBy", "ixPersonResolvedBy", "ixPersonClosedBy", "ixPersonLastEditedBy", "ixStatus", "ixBugDuplicates", "ixBugOriginal", "sStatus", "ixPriority", "sPriority", "ixFixFor", "sFixFor", "dtFixFor", "sVersion", "sComputer", "hrsOrigEst", "hrsCurrEst", "hrsElapsed", "c", "sCategory", "dtOpened", "dtResolved", "dtClosed", "ixBugEventLatest", "dtLastUpdated", "dtDue", "dtLastView", "ixRelatedBugs", "dtLastOccurrence"];

fogbugz.logon().then(function(filters) {
  return fogbugz.setCurrentFilter(4);
}).then(function() {
  console.log("search");
  return fogbugz.search("", attributes, 1000);
}).then(function(cases) {
  var datestamp, day, output, targetPath;
  output = convert.arrayToCsv(cases, attributes);
  console.log(output);
  day = Date.create();
  datestamp = day.format('{yyyy}-{MM}-{dd}');
  targetPath = data_dir + "/" + datestamp + "_cases.csv";
  return fs.writeFileSync(targetPath, output);
});
