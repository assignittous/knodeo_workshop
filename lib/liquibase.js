
/*

 * Liquibase

This library is a wrapper for running scriptella.
 */
var CSON, cwd, fs, logger, shell;

logger = require('../lib/logger').Logger;

shell = require('shelljs');

fs = require('fs');

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

exports.Liquibase = {
  command: ["liquibase"],
  execute: function(async) {
    var cmdoutput, showOutput;
    showOutput = true;
    logger.exec(this.command.join(' '));
    cmdoutput = shell.exec(this.command.join(' '), {
      encoding: "utf8",
      silent: false,
      async: async || false
    });
    return cmdoutput.stdout.on('data', function(data) {
      return console.log(data);
    });
  },
  setOptions: function(database, environment, changelogOverride) {
    var changelog, configuration, conn, db_driver, driver;
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    environment = environment || configuration.defaults.environment;
    database = database || configuration.defaults.database;
    console.log("database: " + database);
    console.log("environment: " + environment);
    changelog = changelogOverride || database;
    conn = configuration.databases[database];
    db_driver = configuration.databases[database][environment].driver;
    driver = configuration.databases.drivers[db_driver];
    cwd = process.env.PWD || process.cwd();
    this.command.push("--driver=" + driver["class"]);
    this.command.push("--classpath=" + (driver.classPath.replace(/{{cwd}}/g, cwd)));
    this.command.push("--url=" + driver.baseUrl + conn[environment].host + ":" + conn[environment].port + "/" + conn[environment].database);
    this.command.push("--username=" + conn[environment].user);
    this.command.push("--password=" + conn[environment].password);
    return this.command.push("--changeLogFile=liquibase/" + changelog + ".xml");
  },
  migration: {
    "new": function(migration, database, recipe) {
      if (database == null) {
        database = "config.workshop.cson default";
      }
      if (recipe == null) {
        recipe = "changeset";
      }
      logger.info("Create new " + migration + " migration in the " + database + " using `" + recipe + "` as a recipe.");
      return this.that.execute();
    },
    status: function(database) {
      var command;
      command = "status";
      this.that.setOptions(database);
      this.that.command.push(command);
      return this.that.execute(true);
    },
    run: function(database, environment, options) {
      var command, commandParameter;
      logger.info("Run migration for database named " + database + " in " + environment + " environment");
      command = "update";
      commandParameter = "";
      if (options.count != null) {
        if (typeof options.count === 'number') {
          command = "updateCount";
          commandParameter = options.count;
        } else {
          options.count = null;
        }
      }
      if (options.sql != null) {
        if (options.sql) {
          command = "updateSQL";
          if (options.count != null) {
            command = "updateCountSQL";
          }
        }
      }
      this.that.setOptions(database);
      this.that.command.push(command);
      if (commandParameter.length > 0) {
        this.that.command.push(commandParameter);
      }
      return this.that.execute(true);
    },
    rollback: function(database) {
      return logger.info("Roll back migration");
    }
  },
  database: {
    compile: function(name) {
      return console.log("compile the specified database file");
    },
    "new": function(name, recipe) {
      if (recipe == null) {
        recipe = "database";
      }
      return logger.info("Create new database named " + name + " using `" + recipe + "` as a recipe.");
    },
    tag: function(tag) {
      return logger.info("Manually tag the database with '" + tag + "'");
    },
    validate: function(name) {
      logger.info("Validate a changeset file for the database named: " + name);
      this.that.setOptions(name);
      this.that.command.push("validate");
      return this.that.execute();
    },
    doc: function(name) {
      return logger.info("Generate liquibase documentation for the database named: " + name);
    },
    sync: function(name) {
      return logger.info("Mark all migrations as excuted in the database named " + name);
    },
    reverseEngineer: function(name, environment) {
      logger.info("Reverse engineer the database named: " + name);
      this.that.setOptions(name, environment, name + "_reverse_engineer");
      this.that.command.push("generateChangeLog");
      return this.that.execute();
    }
  },
  functions: ["init", "execute", "setOptions"],
  init: function() {
    var keys, that;
    that = this;
    keys = Object.keys(this);
    keys.each(function(key) {
      if (!that.functions.any(key)) {
        return that[key]["that"] = that;
      }
    });
    delete this.init;
    return this;
  }
}.init();
