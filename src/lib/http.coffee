request = require('sync-request')

require 'sugar'

exports.Http =

  objectify: (response)->
    body = response.body.toString('utf8')
    obj = JSON.parse(body)
    #console.log JSON.stringify(obj,null,' ')
    return obj


  getObject: (url, options, attribute)->
    response = request "get", url, options
    that = @
    if attribute?
      return that.objectify(response[attribute])
    else
      return that.objectify(response)

