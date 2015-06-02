# google_analytics.coffee


'use strict'

logger = require('../../lib/logger.coffee').Logger
shell = require('../../lib/shell.coffee').Shell
convert = require('../../lib/convert.coffee').Convert
GA = require('googleanalytics')
fs = require('fs')
require('sugar')


CSON = require('cson')
configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")

# max 7
dimensions = [
  "userType"
  "date"
  "country"
  "metro"
  "fullReferrer"
  "deviceCategory"
  "hostname"
].map (o)->
  return "ga:" + o




# max 10
metrics = [
  "users"
  "newUsers"
  "sessions"
  "bounceRate"
  "avgSessionDuration"
  "uniquePageviews"
  "users"
  "newUsers"
  "avgTimeOnPage"
  #"pageLoadTime"
  #"avgPageLoadTime"
  #"avgDomContentLoadedTime"
].map (o)->
  return "ga:" + o





config =
  user: configuration.cloud.google_analytics.user
  password: configuration.cloud.google_analytics.password
options = 
  ids: configuration.cloud.google_analytics.profile
  'start-date': '2015-01-01'
  'end-date': '2015-05-25'
  dimensions: dimensions.join(',')
  metrics: metrics.join(',')
  #sort: '-ga:pagePath'
ga = new GA.GA(config)
ga.login (err, token) ->

  ga.get options, (err, entries) ->
    if err?
      console.log "ERR:"
      console.log err
    else
      output = entries.map (entry)->

        #output = {}
        item = Object.merge entry.dimensions.first(), entry.metrics.first()

        # rekey

        keys = Object.keys(item)
        record = {}
        keys.each (key)->
          record[key.replace(/ga:/g,'')] = item[key]


        return record


      output = convert.arrayToCsv(output)
      console.log output
      day = Date.create('yesterday')

      datestamp = day.format('{yyyy}-{MM}-{dd}')
      targetPath = "data/google_analytics/#{datestamp}.csv"

      fs.writeFileSync(targetPath, output)
    return
  return
