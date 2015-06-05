'use strict';
var CSON, app_id, base, baseParameter, base_url, config, currencies, currency_list, cwd, data, data_dir, datestamp, day, descriptions, dimension, fact, isSubscriber, logger, output, plan, rates, request, symbols;

logger = require('../../lib/logger').Logger;

output = require('../../lib/data').Data;

request = require("../../lib/http").Http;

require('sugar');

cwd = process.env.PWD || process.cwd();

CSON = require('cson');

config = CSON.parseCSONFile(cwd + "/config.workshop.cson");

data_dir = cwd + "/" + config.cloud.open_exchange_rates.data_path;

day = Date.create(config.cloud.open_exchange_rates["for"]);

datestamp = day.format('{yyyy}-{MM}-{dd}');

base_url = "http://openexchangerates.org";

app_id = config.cloud.open_exchange_rates.app_id;

currency_list = config.cloud.open_exchange_rates.currencies;

base = config.cloud.open_exchange_rates.base;

plan = config.cloud.open_exchange_rates.subscription;

isSubscriber = plan !== "free";

symbols = "";

currencies = request.getObject(base_url + "/currencies.json");

if (currency_list.length > 0) {
  currency_list.union([base]);
  currencies = Object.select(currencies, currency_list);
}

baseParameter = "";

if (isSubscriber) {
  baseParameter = "&base=" + base;
}

descriptions = Object.values(currencies);

dimension = Object.keys(currencies).map(function(code, index) {
  return {
    code: code,
    description: descriptions[index]
  };
});

output.toCsv(data_dir + "/" + datestamp + "_currencies.csv", dimension);

console.log(base_url + "/api/historical/" + datestamp + ".json?app_id=" + app_id + baseParameter);

data = request.getObject(base_url + "/api/historical/" + datestamp + ".json?app_id=" + app_id + baseParameter);

rates = Object.values(data.rates);

if (currency_list.length === 0) {
  currency_list = Object.keys(data.rates);
}

console.log(currency_list);

console.log(data.rates);

fact = currency_list.map(function(code) {
  var output_rate;
  if ((base === "USD") || isSubscriber) {
    output_rate = data.rates[code];
  } else {
    output_rate = data.rates[base] / data.rates[code];
  }
  return {
    date: datestamp,
    date_sid: parseInt(day.format('{yyyy}{MM}{dd}')),
    code: code,
    rate: output_rate
  };
});

output.toCsv(data_dir + "/" + datestamp + "_rates.csv", fact);
