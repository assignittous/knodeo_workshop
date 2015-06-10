# configuration.coffee


CSON = require('cson')
cwd = process.env.PWD || process.cwd()

exports.Configuration = {

  current: {}

  # Load config file

  cwd: ()->
    process.env.PWD || process.cwd()

  load: ()->
    @current = CSON.parseCSONFile("#{cwd}/config.workshop.cson")

  # Upgrade config file

  upgrade: ()->


  environment: (env)->
    return env || @current.defaults.environment

  database: (database)->
    return database || @current.defaults.database


}