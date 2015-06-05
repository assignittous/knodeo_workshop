# configuration.coffee


CSON = require('cson')
cwd = process.env.PWD || process.cwd()

exports.Configuration = {

  current: {}

  # Load config file

  load: ()->
    @current = CSON.parseCSONFile("#{cwd}/config.workshop.cson")

  # Upgrade config file

  upgrade: ()->




}