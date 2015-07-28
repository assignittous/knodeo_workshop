#!/usr/bin/env node
var config, configuration, cwd, help, init, liquibase, logger, noOp, pkg, program, result, scriptella, services, subcommand, utils;

require('sugar');

services = require("./services.json");

pkg = require('./package.json');

program = require('commander');

utils = require('aitutils').aitutils;

logger = utils.logger;

liquibase = require("./lib/liquibase").Liquibase;

scriptella = require("./lib/scriptella").Scriptella;

init = require("./lib/init").Init;

configuration = require("./lib/configuration").Configuration;

cwd = process.env.PWD || process.cwd();

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
  return init.all();
});

subcommand["new"] = program.command('new');

subcommand["new"].description('Create a new thing');

subcommand["new"].option("-d, --database [database-name]", "database name");

subcommand["new"].option("-m, --migration [migration_name]", "migration name");

subcommand["new"].option("-s, --script [script_name]", "script name");

subcommand["new"].option("-f, --for-database [database-name]", "database name");

subcommand["new"].option("-g, --script-group [script_name]", "script group");

subcommand["new"].option("-r, --using-recipe [recipe_name]", "recipe_name");

subcommand["new"].action(function() {
  if (subcommand["new"].migration != null) {
    liquibase.migration(subcommand["new"].migration, subcommand["new"].forDatabase, subcommand["new"].usingRecipe);
  }
  if (subcommand["new"].script != null) {
    if (subcommand["new"].script === true) {
      logger.error("No script name was provided");
      logger.info("The proper syntax is: knodeo new --script [script_name]");
      return;
    } else {
      scriptella["new"](subcommand["new"].script, subcommand["new"].usingRecipe);
    }
  }
  if (subcommand["new"].database != null) {
    return liquibase.model(subcommand["new"].database, subcommand["new"].usingRecipe);
  }
});

subcommand.run = program.command('run');

subcommand.run.description('Create a new thing');

subcommand.run.option("-m, --migration", "migration");

subcommand.run.option("-r, --rollback", "rollback");

subcommand.run.option("-d, --for-database [database_name]", "database name");

subcommand.run.option("-s, --script [script_name]", "script name");

subcommand.run.option("-g, --script-group [group_name]", "script group");

subcommand.run.option("-e, --environment [environment]", "environment");

subcommand.run.option("-c, --count [count]", "count");

subcommand.run.option("--sql", "show sql");

subcommand.run.unknownOption = noOp;

subcommand.run.action(function() {
  var options;
  if (subcommand.run.migration != null) {
    options = configuration.forLiquibase(subcommand.run.forDatabase, subcommand.run.environment);
    if (subcommand.run.count != null) {
      if (subcommand.run.sql != null) {
        liquibase.migrateCountSql(subcommand.run.count, options.runParameters);
      } else {
        liquibase.migrateCount(subcommand.run.count, options.runParameters);
      }
    } else {
      if (subcommmand.run.sql != null) {
        liquibase.migrateSql(options.runParameters);
      } else {
        liquibase.migrate(options.runParameters);
      }
    }
    return;
  }
  if (subcommand.run.rollback != null) {
    options = configuration.forLiquibase(subcommand.run.forDatabase, subcommand.run.environment);
    liquibase.rollback(subcommand.run.forDatabase, subcommand.run.environment, options);
    return;
  }
  if (subcommand.run.script != null) {
    logger.info("Run scriptella script " + subcommand.run.script);
    scriptella.script.run(subcommand.run.script, subcommand.run.environment);
    return;
  }
  if (subcommand.run.scriptGroup != null) {
    logger.info("Run scriptella script " + subcommand.run.script);
    scriptella.script.runGroup(subcommand.run.scriptGroup, subcommand.run.environment);
  }
});

subcommand.get = program.command('get');

subcommand.get.unknownOption = noOp;

subcommand.get.description('Create a new thing');

subcommand.get.option("-f, --from [service_name]", "service name");

subcommand.get.action(function() {
  if (services.any(subcommand.get.from)) {
    return require("../lib/services/" + subcommand.get.from);
  } else {
    return console.log("The service '" + subcommand.get.from + "' isn't supported by this version of Knodeo Workshop");
  }
});

subcommand.validate = program.command('validate-model');

subcommand.validate.unknownOption = noOp;

subcommand.validate.description('Create a new thing');

subcommand.validate.option("-d, --database", "database name");

subcommand.validate.action(function() {
  var options;
  options = configuration.forLiquibase(subcommand.run.forDatabase, subcommand.run.environment, cliParameters);
  return liquibase.validate(subcommand.validate.database, subcommand.validate.environment);
});

subcommand.reverseEngineer = program.command('reverse-engineer');

subcommand.reverseEngineer.unknownOption = noOp;

subcommand.reverseEngineer.description('Create a new thing');

subcommand.reverseEngineer.option("-d, --database", "database name");

subcommand.reverseEngineer.option("-e, --environment [environment]", "environment");

subcommand.reverseEngineer.action(function() {
  var options;
  console.log("====");
  console.log(subcommand.reverseEngineer.database || null);
  console.log("====");
  options = configuration.forLiquibase(subcommand.reverseEngineer.database, subcommand.reverseEngineer.environment, cliParameters);
  return liquibase.reverseEngineer(options.runParameters);
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

subcommand.migrationStatus.option("-e, --environment [environment]", "environment");

subcommand.migrationStatus.action(function() {
  var options;
  options = configuration.forLiquibase(subcommand.migrationStatus.database, subcommand.migrationStatus.environment, cliParameters);
  return liquibase.status(options);
});

result = program.parse(process.argv);
