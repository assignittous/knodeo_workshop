'use strict';
var CSON, app_id, base_url, config, currencies, cwd, data, data_dir, datestamp, day, descriptions, dimension, fact, logger, output, rates, request;

logger = require('../../lib/logger').Logger;

output = require('../../lib/data').Data;

request = require("../../lib/http").Http;

require('sugar');

cwd = process.env.PWD || process.cwd();

CSON = require('cson');

config = CSON.parseCSONFile(cwd + "/config.workshop.cson");

data_dir = cwd + "/" + config.cloud.open_exchange_rates.data_path;

app_id = config.cloud.open_exchange_rates.app_id;

day = Date.create();

datestamp = day.format('{yyyy}-{MM}-{dd}');

base_url = "http://openexchangerates.org";

currencies = request.getObject(base_url + "/currencies.json");

descriptions = Object.values(currencies);

dimension = Object.keys(currencies).map(function(code, index) {
  return {
    code: code,
    description: descriptions[index]
  };
});

output.toCsv(data_dir + "/" + datestamp + "_currencies.csv", dimension);

data = request.getObject(base_url + "/api/historical/" + datestamp + ".json?app_id=" + app_id);

rates = Object.values(data.rates);

fact = Object.keys(data.rates).map(function(code, index) {
  return {
    date: datestamp,
    date_sid: parseInt(day.format('{yyyy}{MM}{dd}')),
    code: code,
    rate: rates[index]
  };
});

output.toCsv(data_dir + "/" + datestamp + "_rates.csv", fact);
