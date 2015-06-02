var cwd, fs, logger;

logger = require('../lib/logger').Logger;

fs = require('fs-extra');

cwd = process.env.PWD || process.cwd();

exports.Init = {
  setupConfigFile: function() {
    var confTemplatePath, mainModulePath, source, target;
    mainModulePath = process.mainModule.filename;
    confTemplatePath = mainModulePath.replace('knodeo.js', 'config.template.cson');
    source = confTemplatePath;
    target = "config.workshop.cson";
    return fs.readFile(target, function(err, paths) {
      if (err) {
        return fs.copySync(source, target);
      } else {
        return logger.warn("Config file already exists. Please manually delete it and try again.");
      }
    });
  },
  setupFolderTree: function() {
    var basepath, subfolders;
    basepath = "./_workshop";
    subfolders = ["./_workshop/src", "./_workshop/data", "./_workshop/drivers", "./_workshop/scriptella", "./_workshop/liquibase", "./_workshop/recipes", "./_workshop/src/data", "./_workshop/src/database_models", "./_workshop/src/scripts"];
    return fs.readdir(basepath, function(err, paths) {
      if (err) {
        logger.warn("./_workshop not found");
        fs.mkdirSync(basepath);
        logger.info("created ./_workshop");
      }
      return subfolders.each(function(path) {
        return fs.readdir(path, function(err) {
          if (err) {
            logger.warn(path + " not found");
            fs.mkdirSync(path);
            return logger.info("created " + path);
          }
        });
      });
    });
  },
  setupRecipes: function() {},
  "do": function() {
    this.setupFolderTree();
    this.setupConfigFile();
  }
};
