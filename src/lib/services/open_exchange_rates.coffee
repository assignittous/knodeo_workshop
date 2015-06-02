# # elt-oxr

# Get exchange rates from openexchangerates.org

'use strict'

logger = require('../../lib/logger').Logger
#shell = require('../lib/shell').Shell
convert = require('../../lib/convert').Convert

request = require("../../lib/http").Http
cwd = process.env.PWD || process.cwd()
CSON = require('cson')
config = CSON.parseCSONFile("#{cwd}/config.workshop.cson")



fs = require('fs')
require('sugar')


data_dir = "#{cwd}/#{config.cloud.open_exchange_rates.data_path}"

app_id = config.cloud.open_exchange_rates.app_id


# todo

# parameters to:

# set date 
# get latest
# filter rates
 

day = Date.create()

datestamp = day.format('{yyyy}-{MM}-{dd}')



base_url = "http://openexchangerates.org"



# get currency list


dimension = []
currencies = request.getObject "#{base_url}/currencies.json"

codes = Object.keys(currencies)
descriptions = Object.values(currencies)



codes.each (code, index)->
  dimension.push 
    code: code
    description: descriptions[index]

fs.writeFileSync("#{data_dir}/#{datestamp}_currencies.csv", convert.arrayToCsv(dimension))    



# get the rates

url = "#{base_url}/api/historical/#{datestamp}.json?app_id=#{app_id}"

data = request.getObject(url)


fact = []

rates = data.rates

codes = Object.keys(rates)
exchange_rates = Object.values(rates)  



codes.each (code, index)->
  fact.push 
    date:  datestamp
    date_sid: parseInt(day.format('{yyyy}{MM}{dd}'))
    code: code
    rate: exchange_rates[index]

fs.writeFileSync("#{data_dir}/#{datestamp}_rates.csv", convert.arrayToCsv(fact))    

