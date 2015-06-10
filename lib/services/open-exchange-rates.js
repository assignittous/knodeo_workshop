'use strict';
var app_id, base, baseParameter, base_url, config, currencies, currency_list, data, data_dir, datestamp, day, descriptions, dimension, fact, isSubscriber, logger, output, plan, rates, request, serviceConfig, symbols, thisService;

require('sugar');

config = require("../../lib/configuration").Configuration;

logger = require('../../lib/logger').Logger;

output = require('../../lib/data').Data;

request = require("../../lib/http").Http;

thisService = "open-exchange-rates";

serviceConfig = config.forService(thisService);

data_dir = config.dataDirectoryForService(thisService);

day = Date.create(serviceConfig["for"]);

datestamp = day.format('{yyyy}-{MM}-{dd}');

base_url = "http://openexchangerates.org";

app_id = serviceConfig.app_id;

currency_list = serviceConfig.currencies;

base = serviceConfig.base || "USD";

plan = serviceConfig.subscription || "free";

isSubscriber = plan !== "free";

symbols = "";

logger.info(base_url + "/currencies.json");

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

logger.info(base_url + "/api/historical/" + datestamp + ".json?app_id=" + app_id + baseParameter);

data = request.getObject(base_url + "/api/historical/" + datestamp + ".json?app_id=" + app_id + baseParameter);

rates = Object.values(data.rates);

if (currency_list.length === 0) {
  currency_list = Object.keys(data.rates);
}

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

if (config.doSlackForService(thisService)) {
  logger.slack();
}

if (config.doEmailForService(thisService)) {
  logger.email();
}
