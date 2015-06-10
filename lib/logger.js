
/*

 * Logger

Outputs messages to the console.
 */
'use strict';
var CSON, chalk, cwd, nodemailer, slack;

chalk = require('chalk');

require('sugar');

slack = require('node-slack');

nodemailer = require('nodemailer');

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

exports.Logger = {
  log: [],
  init: function() {
    this.log = [];
    return this;
  },
  completed: function() {
    return this.log.join("\n");
  },
  append: function(type, msg) {
    var entry;
    entry = "[" + (Date.create().format('{HH}:{mm}:{ss}')) + "] " + type + " " + msg;
    this.log.push(chalk.stripColor(entry));
    return console.log(entry);
  },
  debug: function(msg) {
    return this.append(chalk.bgWhite.black(" DEBUG "), msg);
  },
  info: function(msg) {
    return this.append(chalk.bgWhite.black(" INFO "), msg);
  },
  error: function(msg) {
    return this.append(chalk.bgRed.black(" ERROR "), msg);
  },
  warn: function(msg) {
    return this.append(chalk.bgYellow.black(" WARN "), msg);
  },
  bot: function(msg) {
    return this.append(chalk.bgGreen.white(" BOT "), msg);
  },
  shell: function(msg) {
    this.append(chalk.bgBlue.white(" SHELL: "), "");
    return console.log(msg);
  },
  exec: function(msg) {
    return this.append(chalk.bgBlue.white("EXEC"), msg);
  },
  stub: function(msg) {
    return this.append(chalk.bgRed.black(" STUB "), msg);
  },
  todo: function(msg) {
    return this.append(chalk.bgRed.black(" TODO "), msg);
  },
  file: function() {
    return console.log("log to file");
  },
  slack: function() {
    var configuration, hook_url, session;
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    console.log(configuration);
    hook_url = configuration.notifications.slack.webhook_url;
    console.log(hook_url);
    session = new slack(hook_url);
    session.send({
      text: this.completed(),
      username: 'Knodeo Workshop Logger'
    });
    return console.log("should have sent");
  },
  email: function() {
    var configuration, mailOptions, options, that, transporter;
    that = this;
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    console.log(configuration.notifications.email);
    options = Object.reject(configuration.notifications.email, ['user', 'password', 'recipients']);
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configuration.notifications.email.user,
        pass: configuration.notifications.email.password
      }
    });
    mailOptions = {
      from: "Knodeo Notifier <" + configuration.notifications.email.password + ">",
      to: configuration.notifications.email.recipients,
      subject: 'Knodeo Notification',
      text: that.completed()
    };
    return transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  }
}.init();
