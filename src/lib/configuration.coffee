# configuration.coffee


CSON = require('cson')
cwd = process.env.PWD || process.cwd()

exports.Configuration = {

  current: {}

  # Load config file

  cwd: ()->
    process.env.PWD || process.cwd()

  load: ()->
    @current = CSON.parseCSONFile("#{@cwd()}/config.workshop.cson")

  init: ()->
    @load()
    return @
  # Upgrade config file

  upgrade: ()->


  # return environment
  environment: (env)->
    return env || @current.defaults.environment

  # return database
  database: (database)->
    return database || @current.defaults.database


  # ## Cloud SErvice related stuff

  # configs for a cloud service
  forService: (service)->
    return @current.cloud[service.replace(/-/g,'_')]

  # data directory for a cloud service
  dataDirectoryForService: (service)->
    return "#{@cwd()}/#{@current.cloud[service.replace(/-/g,'_')].data_path}"

  doSlackForService: (service)->
    return false

  doEmailForService: (service)->
    return false

}.init()