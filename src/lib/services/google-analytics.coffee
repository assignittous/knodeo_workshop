# google_analytics.coffee

'use strict'
require('sugar')

config = require("../../lib/configuration").Configuration
logger = require('../../lib/logger').Logger
output = require('../../lib/data').Data


google = require('googleapis')
analytics = google.analytics('v3')

thisService = "google-analytics"
serviceConfig = config.forService thisService
data_dir = config.dataDirectoryForService thisService 

# todo

# error check - max dimensions = 7
# error check - max metrics = 10

jwtClient = new google.auth.JWT(
  serviceConfig.service_email,
  serviceConfig.pem_path,
  null,
  ['https://www.googleapis.com/auth/analytics.readonly'])

jwtClient.authorize (err, tokens)->
  if err
    console.log "jwtClient.authorize ERR"
    console.log err
    return
  else
    options = 
      auth: jwtClient
      ids: serviceConfig.profiles
      'start-date': Date.create(serviceConfig.start_date).format("{yyyy}-{MM}-{dd}")
      'end-date': Date.create(serviceConfig.end_date).format("{yyyy}-{MM}-{dd}")
      dimensions: serviceConfig.dimensions.join(',')
      metrics: serviceConfig.metrics.join(',')

    analytics.data.ga.get  options, (err, response)->
      if err?
        console.log err
      else
        console.log response

        attributes = response.columnHeaders.map (header)->
          return header.name.replace(/ga:/g,'')

        #console.log Object.keys(response)
        
        data = response.rows.map (entry)->
          record = {}

          attributes.each (attribute, index)->
            record[attribute] = entry[index]
          return record
        

        day = Date.create('yesterday')

        datestamp = day.format('{yyyy}-{MM}-{dd}')

        output.toCsv "#{data_dir}/#{datestamp}.csv", data
      return
