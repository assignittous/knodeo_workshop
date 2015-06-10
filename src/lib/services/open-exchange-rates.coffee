# # elt-oxr

# Get exchange rates from openexchangerates.org

'use strict'

logger = require('../../lib/logger').Logger
output = require('../../lib/data').Data
request = require("../../lib/http").Http
require('sugar')


cwd = process.env.PWD || process.cwd()
CSON = require('cson')
config = CSON.parseCSONFile("#{cwd}/config.workshop.cson")


data_dir = "#{cwd}/#{config.cloud.open_exchange_rates.data_path}"


day = Date.create(config.cloud.open_exchange_rates.for)

datestamp = day.format('{yyyy}-{MM}-{dd}')
base_url = "http://openexchangerates.org"

app_id = config.cloud.open_exchange_rates.app_id
currency_list = config.cloud.open_exchange_rates.currencies
base =  config.cloud.open_exchange_rates.base || "USD"
plan = config.cloud.open_exchange_rates.subscription || "free"
isSubscriber = (plan != "free")

# get currency list
symbols = ""

# currency list support requires an enterprise subscription

# Note this url doesn't take parameters
logger.info "#{base_url}/currencies.json"
currencies = request.getObject "#{base_url}/currencies.json"

if currency_list.length > 0
  currency_list.union [base]
  currencies = Object.select currencies, currency_list

baseParameter = ""
if isSubscriber
  baseParameter = "&base=#{base}"

descriptions = Object.values(currencies)

dimension = Object.keys(currencies).map (code, index)->

  return {
    code: code
    description: descriptions[index]
  }


output.toCsv "#{data_dir}/#{datestamp}_currencies.csv", dimension


# get the rates
logger.info  "#{base_url}/api/historical/#{datestamp}.json?app_id=#{app_id}#{baseParameter}"
data = request.getObject "#{base_url}/api/historical/#{datestamp}.json?app_id=#{app_id}#{baseParameter}"


rates = Object.values(data.rates)  

if currency_list.length == 0
  currency_list = Object.keys(data.rates)

#console.log currency_list
#console.log data.rates
fact = currency_list.map (code)->
  # the default rate for free accounts is USD
  if (base == "USD") || isSubscriber
    output_rate = data.rates[code]
  else
    output_rate = data.rates[base] / data.rates[code]

  return { 
    date:  datestamp
    date_sid: parseInt(day.format('{yyyy}{MM}{dd}'))
    code: code
    rate: output_rate
  }

output.toCsv "#{data_dir}/#{datestamp}_rates.csv", fact

logger.slack()
logger.email()

