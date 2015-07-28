
/*

 * Scriptella

This library is a wrapper for running scriptella.
 */
var CSON, aitutils, cwd, file, general, jade, logger, scriptella, xml;

aitutils = require("aitutils").aitutils;

logger = aitutils.logger;

file = aitutils.file;

general = aitutils.general;

xml = aitutils.xml;

scriptella = require("knodeo-scriptella").Scriptella;

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

jade = require('jade');

exports.Scriptella = {
  command: ['scriptella'],
  paths: {
    temp: "_workshop/temp",
    source: "_src/elt_scripts",
    xml: "_workshop/scriptella",
    recipes: "_workshop/recipes/scriptella"
  },
  execute: function(path, properties, locals) {
    return scriptella.execute(path, properties, locals);
  },
  compile: function(name) {
    var compiled, locals, outputPath, sourcePath, trailingWhitespace;
    locals = {};
    trailingWhitespace = /( +)(?:\n|\r|\r\n)/m;
    locals.cwd = process.cwd();
    sourcePath = this.paths.source + "/" + name + ".jade";
    outputPath = this.paths.xml + "/" + name + ".xml";
    compiled = jade.compileFile(sourcePath, {
      pretty: true
    });
    file.save(outputPath, compiled(locals));
    return logger.info("Compiled " + sourcePath + " to " + outputPath);
  },
  "new": function(name, recipe) {
    var filename, recipePath, source, target;
    recipe = recipe || "job";
    logger.info("Create new " + name + " script using `" + recipe + "` as a recipe.");
    filename = name || ((general.dateSid()) + "-job");
    recipePath = this.paths.recipes;
    recipe = file.ensureExtension(recipe, '.jade');
    source = recipePath + "/" + recipe;
    target = this.paths.source + "/" + filename + ".jade";
    if (file.exists(target)) {
      return logger.warn(target + " already exists. Please manually delete it or create a new script with a new name.");
    } else {
      file.copy(source, target);
      return logger.info("Created " + target);
    }
  },
  run: function(name, environment) {
    var configuration;
    configuration = CSON.parseCSONFile(cwd + "/config.workshop.cson");
    environment = environment || configuration.defaults.environment;
    this.properties.generate(environment);
    this.script.compile(name);
    logger.info("Running scriptella...");
    this.command.push(this.paths.xml + "/" + name + ".xml");
    return this.execute();
  },
  groupIterator: function(name, group) {
    var keys, that;
    that = this;
    if (Object.isString(group)) {
      logger.exec("Run " + name + "'s task " + group + " (string)");
    }
    if (Object.isArray(group)) {
      logger.info("Scan " + name + "'s tasks (array)");
      group.each(function(task) {
        return logger.exec("Run " + name + "'s task " + task + " (string)");
      });
    }
    if (Object.isObject(group)) {
      logger.info("Scan group " + name + "'s children (object)");
      keys = Object.keys(group);
      return keys.each(function(key) {
        return that.groupIterator(key, group[key]);
      });
    }
  },
  runGroup: function(group, environment) {
    var groupfile, rootKeys, that;
    that = this;
    groupfile = CSON.parseCSONFile(cwd + "/_src/etl_groups/" + group + ".cson");
    rootKeys = Object.keys(groupfile);
    return rootKeys.each(function(rootkey) {
      return that.groupIterator(rootkey, groupfile[rootkey]);
    });
  }
};
