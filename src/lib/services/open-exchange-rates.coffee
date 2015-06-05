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
app_id = config.cloud.open_exchange_rates.app_id
day = Date.create()
datestamp = day.format('{yyyy}-{MM}-{dd}')
base_url = "http://openexchangerates.org"




# get currency list

currencies = request.getObject "#{base_url}/currencies.json"

descriptions = Object.values(currencies)

dimension = Object.keys(currencies).map (code, index)->
  return {
    code: code
    description: descriptions[index]
  }


output.toCsv "#{data_dir}/#{datestamp}_currencies.csv", dimension
  

# get the rates
 
data = request.getObject "#{base_url}/api/historical/#{datestamp}.json?app_id=#{app_id}"

rates = Object.values(data.rates)  

fact = Object.keys(data.rates).map (code, index)->
  return { 
    date:  datestamp
    date_sid: parseInt(day.format('{yyyy}{MM}{dd}'))
    code: code
    rate: rates[index]
  }
output.toCsv "#{data_dir}/#{datestamp}_rates.csv", fact

