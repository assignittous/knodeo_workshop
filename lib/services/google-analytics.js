'use strict';
var analytics, config, data_dir, google, jwtClient, logger, output, serviceConfig, thisService;

require('sugar');

config = require("../../lib/configuration").Configuration;

logger = require('../../lib/logger').Logger;

output = require('../../lib/data').Data;

google = require('googleapis');

analytics = google.analytics('v3');

thisService = "google-analytics";

serviceConfig = config.forService(thisService);

data_dir = config.dataDirectoryForService(thisService);

jwtClient = new google.auth.JWT(serviceConfig.service_email, serviceConfig.pem_path, null, ['https://www.googleapis.com/auth/analytics.readonly']);

jwtClient.authorize(function(err, tokens) {
  var options;
  if (err) {
    console.log("jwtClient.authorize ERR");
    console.log(err);
  } else {
    options = {
      auth: jwtClient,
      ids: serviceConfig.profiles,
      'start-date': Date.create(serviceConfig.start_date).format("{yyyy}-{MM}-{dd}"),
      'end-date': Date.create(serviceConfig.end_date).format("{yyyy}-{MM}-{dd}"),
      dimensions: serviceConfig.dimensions.join(','),
      metrics: serviceConfig.metrics.join(',')
    };
    return analytics.data.ga.get(options, function(err, response) {
      var attributes, data, datestamp, day;
      if (err != null) {
        console.log(err);
      } else {
        console.log(response);
        attributes = response.columnHeaders.map(function(header) {
          return header.name.replace(/ga:/g, '');
        });
        data = response.rows.map(function(entry) {
          var record;
          record = {};
          attributes.each(function(attribute, index) {
            return record[attribute] = entry[index];
          });
          return record;
        });
        day = Date.create('yesterday');
        datestamp = day.format('{yyyy}-{MM}-{dd}');
        output.toCsv(data_dir + "/" + datestamp + ".csv", data);
      }
    });
  }
});
