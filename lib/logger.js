
/*

 * Logger

Outputs messages to the console.
 */
'use strict';
var chalk;

chalk = require('chalk');

require('sugar');

exports.Logger = {
  output: function(type, msg) {
    return console.log("[" + (Date.create().format('{HH}:{mm}:{ss}')) + "] " + type + " " + msg);
  },
  info: function(msg) {
    return this.output(chalk.bgWhite.black(" INFO "), msg);
  },
  error: function(msg) {
    return this.output(chalk.bgRed.black(" ERROR "), msg);
  },
  warn: function(msg) {
    return this.output(chalk.bgYellow.black(" WARN "), msg);
  },
  bot: function(msg) {
    return this.output(chalk.bgGreen.white(" BOT "), msg);
  },
  shell: function(msg) {
    this.output(chalk.bgBlue.white(" SHELL: "), "");
    return console.log(msg);
  },
  exec: function(msg) {
    return this.output(chalk.bgBlue.white("EXEC"), msg);
  },
  stub: function(msg) {
    return this.output(chalk.bgRed.black(" STUB "), msg);
  },
  todo: function(msg) {
    return this.output(chalk.bgRed.black(" TODO "), msg);
  }
};
