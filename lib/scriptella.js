
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
    xml: "_workshop/scriptella",
    recipes: "_workshop/recipes/scriptella"
  },
  execute: function(async) {
    var cmdoutput;
    logger.showOutput = true;
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
      output = [];
      drivers = configuration.databases.drivers;
      Object.keys(drivers).each(function(driver) {
        output.push("driver." + driver + ".class=" + drivers[driver]["class"]);
        output.push("driver." + driver + ".classPath=" + (drivers[driver].classPath.replace(/{{cwd}}/g, cwd)));
        return output.push("driver." + driver + ".baseUrl=" + drivers[driver].baseUrl);
      });
      databases = configuration.databases;
      Object.keys(databases).remove("drivers").each(function(database) {
        var driver, selected_database;
        driver = drivers[databases[database][environment].driver];
        selected_database = databases[database][environment];
        output.push("db." + database + ".class=" + driver["class"]);
        output.push("db." + database + ".classPath=" + (driver.classPath.replace(/{{cwd}}/g, cwd)));
        output.push("db." + database + ".url=" + driver.baseUrl + selected_database.host + ":" + selected_database.port + "/" + selected_database.database);
        output.push("db." + database + ".user=" + selected_database.user);
        output.push("db." + database + ".password=" + selected_database.password);
        if (database.etl_properties != null) {
          return Object.keys(database.etl_properties).each(function(key) {
            return output.push(database.key + "." + key + "=" + database.etl_properties[key]);
          });
        }
      });
      Object.keys(configuration.scriptella.etl_properties[environment]).each(function(property) {
        var value;
        value = configuration.scriptella.etl_properties[environment][property];
        value = value.replace(/{{cwd}}/g, cwd);
        return output.push(property + "=" + value);
      });
      fs.writeFileSync(this.that.paths.xml + "/etl.properties", output.join('\n'));
      return logger.info("Updated etl.properties for " + environment);
    }
  },
  script: {
    compile: function(name) {
      var compiled, locals, outputPath, sourcePath, trailingWhitespace;
      locals = {};
      trailingWhitespace = /( +)(?:\n|\r|\r\n)/m;
      locals.cwd = process.cwd();
      sourcePath = this.that.paths.source + "/" + name + ".jade";
      outputPath = this.that.paths.xml + "/" + name + ".xml";
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
      recipePath = this.that.paths.recipes;
      recipe = utils.checkExtension(recipe, '.jade');
      source = recipePath + "/" + recipe;
      target = this.that.paths.source + "/" + filename + ".jade";
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
      this.that.command.push(this.that.paths.xml + "/" + name + ".xml");
      return this.that.execute();
    },
    groupIterator: function(name, group) {
      var keys, that;
      that = this;
      if (Object.isString(group)) {
        logger.info("Run " + name + "'s task " + group + " (string)");
      }
      if (Object.isArray(group)) {
        logger.info("Scan " + name + "'s tasks (array)");
        group.each(function(task) {
          return logger.info("Run " + name + "'s task " + task + " (string)");
        });
      }
      if (Object.isObject(group)) {
        logger.info("Scan group " + name + "'s children (object)");
        keys = Object.keys(group);
        return keys.each(function(key) {
          return that.groupIterator(key, group[key]);
        });
      }

      /*
      
      keys = Object.keys(group)
      
      keys.each (key)->
        if group[key]
       */
    },
    runGroup: function(group, environment) {
      var groupfile, rootKeys, that;
      console.log("GROUP: " + group);
      console.log("ENV: " + environment);
      that = this;
      groupfile = CSON.parseCSONFile(cwd + "/_src/etl_groups/" + group + ".cson");
      rootKeys = Object.keys(groupfile);
      return rootKeys.each(function(rootkey) {
        return that.groupIterator(rootkey, groupfile[rootkey]);
      });

      /*
      manifest.jobs.each (path)->
      
        if path.endsWith('.xml')
          logger.info "Run update for scriptella/#{path}"
          shell.execSync "scriptella scriptella/#{path}"
        ##
       */
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
