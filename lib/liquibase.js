
/*

 * Liquibase

This library is a wrapper for running scriptella.
 */
var CSON, cwd, fs, gulp, logger, rename, shell, utils;

logger = require('../lib/logger').Logger;

shell = require('shelljs');

fs = require('fs');

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

gulp = require('gulp');

rename = require('gulp-rename');

utils = require('../lib/utilities').Utilities;

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
    if (cmdoutput.stdout != null) {
      return cmdoutput.stdout.on('data', function(data) {
        return console.log(data);
      });
    }
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
    console.log(conn);
    db_driver = configuration.databases[database][environment].driver;
    driver = configuration.databases.drivers[db_driver];
    cwd = process.env.PWD || process.cwd();
    this.command.push("--driver=" + driver["class"]);
    this.command.push("--classpath=\"" + (driver.classPath.replace(/{{cwd}}/g, cwd)) + "\"");
    this.command.push("--url=" + driver.baseUrl + conn[environment].host + ":" + conn[environment].port + "/" + conn[environment].database);
    this.command.push("--username=" + conn[environment].user);
    this.command.push("--password=" + conn[environment].password);
    return this.command.push("--changeLogFile=_workshop/liquibase/" + changelog + ".xml");
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
      return logger.todo("Roll back migration");
    }
  },
  database: {
    compile: function(name) {
      return console.log("compile the specified database file");
    },
    "new": function(name, recipe) {
      var filename, path;
      if (name != null) {
        filename = name;
      } else {
        filename = (utils.dateSid()) + "-data-model";
      }
      path = "_src/database_models/" + filename + ".jade";
      if (recipe != null) {
        recipe = utils.checkExtension(recipe, '.jade');
      } else {
        recipe = "new-model.jade";
      }
      return fs.open(path, 'r', function(err) {
        if (err) {
          return fs.readFile("_workshop/recipes/liquibase/" + recipe, {
            encoding: 'utf8'
          }, function(err, data) {
            if (err) {
              logger.error("_workshop/recipes/liquibase/" + recipe + " does not exist");
            } else {
              logger.info("Using recipe: /recipes/liquibase/" + recipe);
              data = data.replace(/#{table_name}/g, "tablename");
              data = data.replace(/#{id}/g, utils.dateSid());
              data = data.replace(/#{db_user_name}/g, "db_user_name");
              data = data.replace(/#{db_user_name}/g, "author");
              console.log(data);
              return fs.writeFile(path, data, function(err) {
                if (err) {
                  logger.error("Error writing " + path);
                } else {
                  return logger.info("Wrote " + path);
                }
              });
            }
          });
        } else {
          return logger.error("/databases/" + filename + " already exists, please try with a new filename");
        }
      });
    },
    tag: function(tag) {
      return logger.todo("Manually tag the database with '" + tag + "'");
    },
    validate: function(name) {
      logger.info("Validate a changeset file for the database named: " + name);
      this.that.setOptions(name);
      this.that.command.push("validate");
      return this.that.execute();
    },
    doc: function(name) {
      return logger.todo("Generate liquibase documentation for the database named: " + name);
    },
    sync: function(name) {
      return logger.todo("Mark all migrations as excuted in the database named " + name);
    },
    reverseEngineer: function(name, environment) {
      var configuration;
      if (name == null) {
        configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
        name = configuration.defaults.database;
      }
      logger.info("Reverse engineer the database named: " + name);
      this.that.setOptions(name, environment, name + "_reverse_engineer");
      this.that.command.push("generateChangeLog");
      return this.that.execute(true);
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
