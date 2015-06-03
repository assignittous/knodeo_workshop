#!/usr/bin/env node
var config, help, init, liquibase, noOp, pkg, program, result, scriptella, services, subcommand;

require('sugar');

services = require("../bin/services.json");

pkg = require('../package.json');

program = require('commander');

liquibase = require("../lib/liquibase").Liquibase;

scriptella = require("../lib/scriptella").Scriptella;

init = require("../lib/init").Init;

noOp = function() {
  return console.log("Nothing ran, couldn't understand your command");
};

program.version(pkg.version, '-v, --version');

subcommand = {};

config = program.command('config');

config.description('Create a new thing');

config.action(function() {
  return console.log("This command dumps the configuration");
});

help = program.command('help');

help.description('Create a new thing');

help.action(function() {
  return require('../lib/about');
});

subcommand.init = program.command('init');

subcommand.init.description('Initialize knodeo for the current working folder');

subcommand.init.action(function() {
  return init["do"]();
});

subcommand["new"] = program.command('new');

subcommand["new"].description('Create a new thing');

subcommand["new"].option("-d, --database [database-name]", "database name");

subcommand["new"].option("-m, --migration [migration_name]", "migration name");

subcommand["new"].option("-s, --script [script_name]", "script name");

subcommand["new"].option("-f, --for-database [database-name]", "database name");

subcommand["new"].option("-r, --using-recipe [recipe_name]", "recipe_name");

subcommand["new"].action(function() {
  if (subcommand["new"].migration != null) {
    liquibase.migration["new"](subcommand["new"].migration, subcommand["new"].forDatabase, subcommand["new"].usingRecipe);
  }
  if (subcommand["new"].script != null) {
    console.log("Create a new scriptella " + subcommand["new"].script);
  }
  if (subcommand["new"].database != null) {
    return liquibase.database["new"](subcommand["new"].database, subcommand["new"].usingRecipe);
  }
});

subcommand.run = program.command('run');

subcommand.run.unknownOption = noOp;

subcommand.run.description('Create a new thing');

subcommand.run.option("-m, --migration", "migration");

subcommand.run.option("-m, --rollback", "rollback");

subcommand.run.option("-d, --for-database", "database name");

subcommand.run.option("-s, --script [script_name]", "script name");

subcommand.run.option("-e, --environment [environment]", "environment");

subcommand.run.option("-c, --count [count]", "count");

subcommand.run.option("--sql", "show sql");

subcommand.run.action(function() {
  var options;
  if (subcommand.run.migration != null) {
    options = {
      count: subcommand.run.count,
      sql: subcommand.run.sql
    };
    liquibase.migration.run(subcommand.run.forDatabase, subcommand.run.environment, options);
  }
  if (subcommand.run.script != null) {
    return console.log("new script! " + subcommand.run.script);
  }
});

subcommand.get = program.command('get');

subcommand.get.unknownOption = noOp;

subcommand.get.description('Create a new thing');

subcommand.get.option("-f, --from [service_name]", "service name");

subcommand.get.action(function() {
  if (services.any(subcommand.get.from)) {
    console.log("Get data from " + subcommand.get.from);
    console.log("../lib/services/" + subcommand.get.from);
    return require("../lib/services/" + subcommand.get.from);
  } else {
    return console.log("The service '" + subcommand.get.from + "' isn't supported by this version of Knodeo Workshop");
  }
});

subcommand.validate = program.command('validate');

subcommand.validate.unknownOption = noOp;

subcommand.validate.description('Create a new thing');

subcommand.validate.option("-d, --database", "database name");

subcommand.validate.action(function() {
  return liquibase.database.validate(subcommand.validate.database, subcommand.validate.environment);
});

subcommand.reverseEngineer = program.command('reverse-engineer');

subcommand.reverseEngineer.unknownOption = noOp;

subcommand.reverseEngineer.description('Create a new thing');

subcommand.reverseEngineer.option("-d, --database", "database name");

subcommand.reverseEngineer.option("-e, --environment [environment]", "environment");

subcommand.reverseEngineer.action(function() {
  return liquibase.database.reverseEngineer(subcommand.reverseEngineer.database, subcommand.reverseEngineer.environment);
});

subcommand.documentDatabase = "";

subcommand.rebuildDatabase = "";

subcommand.resetDatabase = "";

subcommand.tagDatabase = "";

subcommand.syncDatabase = "";

subcommand.migrationStatus = program.command('migration-status');

subcommand.migrationStatus.unknownOption = noOp;

subcommand.migrationStatus.description('Create a new thing');

subcommand.migrationStatus.option("-d, --database", "database name");

subcommand.migrationStatus.action(function() {
  return liquibase.migration.status(subcommand.migrationStatus.database, subcommand.migrationStatus.environment);
});

result = program.parse(process.argv);


/*
Object.keys(result).each (key) ->
  if !['commands', 'options'].any(key)
    console.log ""
    console.log "KEY: " + key
    console.log ""

    console.log result[key]
 */


/*
if result.args?
  if result.args.length == 0
    require('../lib/about')
 */
