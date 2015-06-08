request = require('sync-request')
parseString = require('xml2js').parseString
xmlLite = require("node-xml-lite")

require 'sugar'

exports.Http =

  objectify: (response)->
    body = response.body.toString('utf8')
    obj = JSON.parse(body)
    #console.log JSON.stringify(obj,null,' ')
    return obj


  xmlIterator: (object)->

    Object.keys(object).each (key)->
      if key == "childs"
        # handle nested children
      else


  objectifyXml: (response)->
    body = response.body.toString('utf8')
    console.log body
    object = xmlLite.parseString(body)
    return object



  get: (url, options)->
    response = request "get", url, options
    return response.body.toString('utf8')


  getObject: (url, options, attribute)->
    response = request "get", url, options
    that = @
    if attribute?
      return that.objectify(response[attribute])
    else
      return that.objectify(response)

  getXml: (url, options, attribute)->
    response = request "get", url, options
    body = response.body.toString('utf8')
    that = @
    outputObject = {}
    callback = ()->
      return that.outputObject


    parseString body, (err, result)->
      if err?
        console.log "XMLJS ERROR"
        return
      else
        that.outputObject = result
        callback()


    #parseString = require)'xml2js')
    
    #return @objectifyXml(response)

    #if attribute?
    #  return that.objectifyXml(response[attribute])
    #else
    #  return that.objectifyXml(response)

