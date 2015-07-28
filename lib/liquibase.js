
/*

 * Liquibase

This library is a wrapper for running Liquibase.
 */
var CSON, Mustache, aitutils, cwd, file, general, liquibase, logger, xml;

aitutils = require("aitutils").aitutils;

logger = aitutils.logger;

file = aitutils.file;

general = aitutils.general;

xml = aitutils.xml;

Mustache = require("mustache");

liquibase = require("knodeo-liquibase").Liquibase;

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
  model: function(name, recipe) {
    var data, filename, locals, outputPath, recipePath;
    if (name != null) {
      filename = name;
    } else {
      filename = (general.dateSid()) + "-data-model";
    }
    outputPath = "_src/database_models/" + filename + ".jade";
    if (recipe != null) {
      recipe = file.ensureExtension(recipe, '.jade');
    } else {
      recipe = "default.jade";
    }
    recipePath = "_workshop/recipes/liquibase/data-models/" + recipe;
    if (!file.exists(outputPath)) {
      if (file.exists(recipePath)) {
        data = file.open(recipePath);
        locals = {
          table_name: "tablename",
          id: general.dateSid(),
          db_user_name: "db_user_name",
          author: "author"
        };
        logger.info("Using recipe: /recipes/liquibase/data-models/" + recipe);
        return file.save(outputPath, Mustache.render(data, locals));
      } else {
        return logger.error("_workshop/recipes/liquibase/data-models/" + recipe + " does not exist");
      }
    } else {
      return logger.error(outputPath + " already exists, please try with a new filename");
    }
  },
  migration: function(migration, database, recipe) {
    var configuration, data, locals, modelPath, recipePath;
    recipePath = "_workshop/recipes/liquibase/changesets/";
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    database = database || configuration.defaults.database;
    logger.info("New migration for database named " + database + " with " + recipe + " recipe");
    recipe = recipe || "create-table";
    if (recipe == null) {
      recipe = "changeset";
    }
    modelPath = "_src/database_models/" + database + ".jade";
    recipe = file.ensureExtension(recipe, '.jade');
    recipePath = recipePath + "/" + recipe;
    if (file.exists(modelPath)) {
      if (file.exists(recipePath)) {
        data = "\n" + file.open(recipePath);
        logger.info("Using recipe: " + recipePath + "/" + recipe);
        locals = {
          author: process.env['USER'] || process.env['USERNAME'],
          sid: "sid" + (general.dateSid())
        };
        return file.append(modelPath, Mustache.render(data, locals));
      } else {
        return logger.error(recipePath + "/" + recipe + " does not exist");
      }
    } else {
      return logger.error(modelPath + " does not exist.");
    }
  },
  status: function(database) {
    liquibase.resetRunOptions(this.setOptions(database));
    return liquibase.status();
  },
  migrate: function(database, environment, options) {
    var command;
    logger.info("Run migration for database named " + database + " in " + environment + " environment");
    file.save(options.outputPath, xml.fromJadeFile(options.sourcePath));
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
    liquibase.resetRunOptions(options.runParameters);
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
