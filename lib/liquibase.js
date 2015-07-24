
/*

 * Liquibase

This library is a wrapper for running Liquibase.
 */
var CSON, aitutils, cwd, file, fs, general, liquibase, logger, xml;

aitutils = require("aitutils").aitutils;

logger = aitutils.logger;

file = aitutils.file;

general = aitutils.general;

xml = aitutils.xml;

liquibase = require("knodeo-liquibase").Liquibase;

fs = require('fs');

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

exports.Liquibase = {
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
    return {
      driver: driver["class"],
      classpath: "" + (driver.classPath.replace(/{{cwd}}/g, cwd)),
      url: "" + driver.baseUrl + conn[environment].host + ":" + conn[environment].port + "/" + conn[environment].database,
      username: conn[environment].user,
      password: conn[environment].password,
      changeLogFile: "_workshop/liquibase/" + changelog + ".xml"
    };
  },
  migration: function(migration, database, recipe) {
    var configuration, modelPath, recipePath;
    recipePath = "_workshop/recipes/liquibase/changesets/";
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    database = database || configuration.defaults.database;
    logger.info("New migration for database named " + database + " with " + recipe + " recipe");
    recipe = recipe || "create-table";
    if (recipe == null) {
      recipe = "changeset";
    }
    modelPath = "_src/database_models/" + database + ".jade";
    recipe = file.checkExtension(recipe, '.jade');
    return fs.open(modelPath, 'r', function(err) {
      if (err) {
        return logger.error(modelPath + " does not exist.");
      } else {
        return fs.readFile(recipePath + "/" + recipe, {
          encoding: 'utf8'
        }, function(err, data) {
          var sid;
          if (err) {
            logger.error(recipePath + "/" + recipe + " does not exist");
          } else {
            logger.info("Using recipe: " + recipePath + "/" + recipe);
            sid = general.dateSid();
            data = "\n" + data;
            data = data.replace(/#{author}/g, process.env['USER'] || process.env['USERNAME']);
            data = data.replace(/#{sid}/g, "sid" + sid);
            console.log(data);
            return fs.appendFile(modelPath, data, function(err) {
              if (err) {
                logger.error("Error writing " + modelPath);
              } else {
                return logger.info("Wrote " + modelPath);
              }
            });
          }
        });
      }
    });
  },
  status: function(database) {
    liquibase.resetRunOptions(this.setOptions(database));
    return liquibase.status();
  },
  migrate: function(database, environment, options) {
    var command, configuration, outputPath, sourcePath;
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    environment = environment || configuration.defaults.environment;
    database = database || configuration.defaults.database;
    logger.info("Run migration for database named " + database + " in " + environment + " environment");
    sourcePath = "_src/database_models/" + database + ".jade";
    outputPath = "_workshop/liquibase/" + database + ".xml";
    file.save(outputPath, xml.fromJadeFile(sourcePath));
    command = "update";
    if (options.count != null) {
      if (typeof options.count === 'number') {
        command = "updateCount";
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
    liquibase.resetRunOptions(this.setOptions(database));
    switch (command) {
      case "updateCount":
        return liquibase.updateCount(options.count);
      case "updateSQL":
        return liquibase.updateSQL();
      case "updateCountSQL":
        return liquibase.updateCountSQL(options.count);
      default:
        return liquibase.update();
    }
  },
  rollback: function(database, environment, options) {
    var configuration;
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    database = database || configuration.defaults.database;
    logger.info("Roll back migration");
    liquibase.resetRunOptions(this.setOptions(database));
    return liquibase.rollback();
  },
  model: function(name, recipe) {
    var filename, path;
    if (name != null) {
      filename = name;
    } else {
      filename = (general.dateSid()) + "-data-model";
    }
    path = "_src/database_models/" + filename + ".jade";
    if (recipe != null) {
      recipe = file.checkExtension(recipe, '.jade');
    } else {
      recipe = "default.jade";
    }
    return fs.open(path, 'r', function(err) {
      if (err) {
        return fs.readFile("_workshop/recipes/liquibase/data-models/" + recipe, {
          encoding: 'utf8'
        }, function(err, data) {
          if (err) {
            logger.error("_workshop/recipes/liquibase/data-models/" + recipe + " does not exist");
          } else {
            logger.info("Using recipe: /recipes/liquibase/data-models/" + recipe);
            data = data.replace(/#{table_name}/g, "tablename");
            data = data.replace(/#{id}/g, general.dateSid());
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
  tag: function(tag, database) {
    var configuration;
    logger.todo("Manually tag the database with '" + tag + "'");
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    database = database || configuration.defaults.database;
    liquibase.resetRunOptions(this.setOptions(database));
    return liquibase.tag(tag);
  },
  validate: function(database) {
    var configuration;
    logger.info("Validate a changeset file for the database named: " + name);
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    database = database || configuration.defaults.database;
    liquibase.resetRunOptions(this.setOptions(database));
    return liquibase.validate();
  },
  doc: function(database) {
    var configuration;
    logger.todo("Generate liquibase documentation for the database named: " + name);
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    database = database || configuration.defaults.database;
    liquibase.resetRunOptions(this.setOptions(database));
    return liquibase.dbDoc();
  },
  sync: function(name) {
    return logger.todo("Mark all migrations as excuted in the database named " + name);
  },
  reverseEngineer: function(name, environment) {
    var configuration, database;
    if (name == null) {
      configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
      name = configuration.defaults.database;
    }
    logger.info("Reverse engineer the database named: " + name);
    this.setOptions(name, environment, name + "_reverse_engineer");
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    database = database || configuration.defaults.database;
    liquibase.resetRunOptions(this.setOptions(database));
    return liquibase.generateChangeLog();
  },
  reset: function(name, environment) {
    return logger.todo("Reset the database to tag 0.0.0");
  },
  rebuild: function(name, environment) {
    return logger.todo("Run reset(), followed by migration.run()");
  }
};
