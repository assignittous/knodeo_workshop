'use strict';
var CSON, GA, config, configuration, convert, dimensions, fs, ga, logger, metrics, options, shell;

logger = require('../../lib/logger.coffee').Logger;

shell = require('../../lib/shell.coffee').Shell;

convert = require('../../lib/convert.coffee').Convert;

GA = require('googleanalytics');

fs = require('fs');

require('sugar');

CSON = require('cson');

configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");

dimensions = ["userType", "date", "country", "metro", "fullReferrer", "deviceCategory", "hostname"].map(function(o) {
  return "ga:" + o;
});

metrics = ["users", "newUsers", "sessions", "bounceRate", "avgSessionDuration", "uniquePageviews", "users", "newUsers", "avgTimeOnPage"].map(function(o) {
  return "ga:" + o;
});

config = {
  user: configuration.cloud.google_analytics.user,
  password: configuration.cloud.google_analytics.password
};

options = {
  ids: configuration.cloud.google_analytics.profile,
  'start-date': '2015-01-01',
  'end-date': '2015-05-25',
  dimensions: dimensions.join(','),
  metrics: metrics.join(',')
};

ga = new GA.GA(config);

ga.login(function(err, token) {
  ga.get(options, function(err, entries) {
    var datestamp, day, output, targetPath;
    if (err != null) {
      console.log("ERR:");
      console.log(err);
    } else {
      output = entries.map(function(entry) {
        var item, keys, record;
        item = Object.merge(entry.dimensions.first(), entry.metrics.first());
        keys = Object.keys(item);
        record = {};
        keys.each(function(key) {
          return record[key.replace(/ga:/g, '')] = item[key];
        });
        return record;
      });
      output = convert.arrayToCsv(output);
      console.log(output);
      day = Date.create('yesterday');
      datestamp = day.format('{yyyy}-{MM}-{dd}');
      targetPath = "data/google_analytics/" + datestamp + ".csv";
      fs.writeFileSync(targetPath, output);
    }
  });
});
