
/*

 * Scriptella

This library is a wrapper for running scriptella.
 */
var CSON, cwd, fs, jade, logger, shell, utils;

logger = require('../lib/logger').Logger;

shell = require('shelljs');

fs = require('fs-extra');

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

jade = require('jade');

utils = require('../lib/utilities').Utilities;

exports.Scriptella = {
  command: ['scriptella'],
  paths: {
    temp: "_workshop/temp",
    source: "_src/elt_scripts",
    xml: "_workshop/scriptella"
  },
  execute: function(async) {
    var cmdoutput;
    logger.showOutput = true;
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
  properties: {
    generate: function(environment) {
      var configuration, databases, drivers, output;
      cwd = (process.env.PWD || process.cwd()).replace(/\\/g, '/');
      configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
      output = "";
      drivers = configuration.databases.drivers;
      Object.keys(drivers).each(function(driver) {
        output += "driver." + driver + ".class=" + drivers[driver]["class"] + "\n";
        output += "driver." + driver + ".classPath=" + (drivers[driver].classPath.replace(/{{cwd}}/g, cwd)) + "\n";
        return output += "driver." + driver + ".baseUrl=" + drivers[driver].baseUrl + "\n";
      });
      databases = configuration.databases;
      Object.keys(databases).remove("drivers").each(function(database) {
        var driver, selected_database;
        driver = drivers[databases[database][environment].driver];
        selected_database = databases[database][environment];
        output += "db." + database + ".class=" + driver["class"] + "\n";
        output += "db." + database + ".classPath=" + (driver.classPath.replace(/{{cwd}}/g, cwd)) + "\n";
        output += "db." + database + ".url=" + driver.baseUrl + selected_database.host + ":" + selected_database.port + "/" + selected_database.database + "\n";
        output += "db." + database + ".user=" + selected_database.user + "\n";
        output += "db." + database + ".password=" + selected_database.password + "\n";
        if (database.etl_properties != null) {
          return Object.keys(database.etl_properties).each(function(key) {
            return output += database.key + "." + key + "=" + database.etl_properties[key] + "\n";
          });
        }
      });
      Object.keys(configuration.scriptella.etl_properties[environment]).each(function(property) {
        var value;
        value = configuration.scriptella.etl_properties[environment][property];
        value = value.replace(/{{cwd}}/g, cwd);
        console.log(value);
        return output += property + "=" + value + "\n";
      });
      fs.writeFileSync(this.that.paths.xml + "/etl.properties", output);
      return logger.info("Updated etl.properties for " + environment);
    }
  },
  script: {
    compile: function(name) {
      var compiled, locals, outputPath, sourcePath, trailingWhitespace;
      locals = {};
      trailingWhitespace = /( +)(?:\n|\r|\r\n)/m;
      locals.cwd = process.cwd();
      sourcePath = "_src/elt_scripts/" + name + ".jade";
      outputPath = "_workshop/scriptella/" + name + ".xml";
      compiled = jade.compileFile(sourcePath, {
        pretty: true
      });
      fs.writeFileSync(outputPath, compiled(locals));
      return logger.info("Compiled " + sourcePath + " to " + outputPath);
    },
    "new": function(name, recipe) {
      var filename, recipePath, source, target;
      recipe = recipe || "job";
      console.log("Create new " + name + " script using `" + recipe + "` as a recipe.");
      filename = name || ((utils.dateSid()) + "-job");
      recipePath = "_workshop/recipes/scriptella/";
      recipe = utils.checkExtension(recipe, '.jade');
      source = recipePath + "/" + recipe;
      target = "_src/elt_scripts/" + filename + ".jade";
      return fs.readFile(target, function(err, paths) {
        if (err) {
          fs.copySync(source, target);
          return logger.info("Created " + target);
        } else {
          return logger.warn(target + " already exists. Please manually delete it or create a new script with a new name.");
        }
      });
    },
    run: function(name, environment) {
      var configuration;
      configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
      environment = environment || configuration.defaults.environment;
      this.that.properties.generate(environment);
      this.that.script.compile(name);
      logger.info("Running scriptella...");
      this.that.command.push("_workshop/scriptella/" + name + ".xml");
      return this.that.execute();
    },
    runGroup: function(group) {
      var filename, manifest, path;
      filename = utils.checkExtension(shell["arguments"].manifest, ".cson");
      path = "job_manifests/" + filename;
      manifest = CSON.parseCSONFile(path);
      return manifest.jobs.each(function(path) {
        if (path.endsWith('.xml')) {
          logger.info("Run update for scriptella/" + path);
          return shell.execSync("scriptella scriptella/" + path);
        }
      });
    }
  },
  init: function() {
    var keys, that;
    that = this;
    Object.keys(this.paths).each(function(path) {
      return fs.ensureDirSync(that.paths[path]);
    });
    keys = Object.keys(this);
    keys.each(function(key) {
      if (!["init", "execute", "paths"].any(key)) {
        return that[key]["that"] = that;
      }
    });
    delete this.init;
    return this;
  }
}.init();
