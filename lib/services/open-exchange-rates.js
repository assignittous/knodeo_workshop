'use strict';
var CSON, app_id, base_url, codes, config, currencies, cwd, data, data_dir, datestamp, day, descriptions, dimension, exchange_rates, fact, logger, output, rates, request, url;

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

dimension = [];

currencies = request.getObject(base_url + "/currencies.json");

codes = Object.keys(currencies);

descriptions = Object.values(currencies);

codes.each(function(code, index) {
  return dimension.push({
    code: code,
    description: descriptions[index]
  });
});

output.toCsv(data_dir + "/" + datestamp + "_currencies.csv", dimension);

url = base_url + "/api/historical/" + datestamp + ".json?app_id=" + app_id;

data = request.getObject(url);

fact = [];

rates = data.rates;

codes = Object.keys(rates);

exchange_rates = Object.values(rates);

codes.each(function(code, index) {
  return fact.push({
    date: datestamp,
    date_sid: parseInt(day.format('{yyyy}{MM}{dd}')),
    code: code,
    rate: exchange_rates[index]
  });
});

output.toCsv(data_dir + "/" + datestamp + "_rates.csv", fact);
