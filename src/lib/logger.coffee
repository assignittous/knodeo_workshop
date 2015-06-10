###

# Logger

Outputs messages to the console.

###
'use strict'

chalk = require('chalk')
require 'sugar'
slack = require('node-slack')
nodemailer = require('nodemailer')
CSON = require('cson')
cwd = process.env.PWD || process.cwd()
#logger = require('../lib/logger').Logger

exports.Logger = {
  log: []
  init: ()->
    @log = []
    return this
  completed: ()->
    return @log.join("\n")
  append: (type, msg)->
    entry = "[#{Date.create().format('{HH}:{mm}:{ss}')}] #{type} #{msg}"
    @log.push chalk.stripColor(entry)
    console.log entry
  debug: (msg)->
    @append chalk.bgWhite.black(" DEBUG "), msg    
  info: (msg)->
    @append chalk.bgWhite.black(" INFO "), msg
  error: (msg)->
    @append chalk.bgRed.black(" ERROR "), msg
  warn: (msg)->
    @append chalk.bgYellow.black(" WARN "), msg
  bot: (msg)->
    @append chalk.bgGreen.white(" BOT "), msg
  shell: (msg)->
    @append chalk.bgBlue.white(" SHELL: "), ""
    console.log msg
  exec: (msg)->
    @append chalk.bgBlue.white("EXEC"), msg
  stub: (msg)->
    @append chalk.bgRed.black(" STUB "), msg
  todo: (msg)->
    @append chalk.bgRed.black(" TODO "), msg  
  file: ()->
    console.log "log to file"  
  slack: ()->
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
    console.log configuration
    hook_url = configuration.notifications.slack.webhook_url
    console.log hook_url
    session = new slack(hook_url)
    session.send 
      text: @completed()
      username: 'Knodeo Workshop Logger'
    console.log "should have sent"
  email: ()->
    that = @
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
    console.log configuration.notifications.email
    options = Object.reject(configuration.notifications.email, ['user','password','recipients'])

    transporter = nodemailer.createTransport
      service: 'gmail'
      auth:
        user: configuration.notifications.email.user
        pass: configuration.notifications.email.password
    # NB! No need to recreate the transporter object. You can use 
    # the same transporter object for all e-mails 
    # setup e-mail data with unicode symbols 
    mailOptions = 
      from: "Knodeo Notifier <#{configuration.notifications.email.password}>"
      to: configuration.notifications.email.recipients
      subject: 'Knodeo Notification'
      text: that.completed()

    # send mail with defined transport object 
    # note - gmail on port 465 doesn't work with vpns
    transporter.sendMail mailOptions, (error, info) ->
      if error
        console.log error
      else
        console.log 'Message sent: ' + info.response
      return

}.init()