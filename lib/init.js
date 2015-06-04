var cwd, fs, gulp, logger;

logger = require('../lib/logger').Logger;

gulp = require('gulp');

fs = require('fs-extra');

cwd = process.env.PWD || process.cwd();

exports.Init = {
  setupConfigFile: function() {
    var confTemplatePath, mainModulePath, source, target;
    mainModulePath = process.mainModule.filename;
    confTemplatePath = mainModulePath.replace('knodeo.js', 'recipes/config.workshop.template.cson');
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
    subfolders = ["./_workshop/data", "./_workshop/drivers", "./_workshop/scriptella", "./_workshop/liquibase", "./_workshop/recipes", "./_data", "./_src", "./_src/data", "./_src/database_models", "./_src/elt_scripts"];
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
  setupRecipes: function() {
    var confTemplatePath, mainModulePath;
    mainModulePath = process.mainModule.filename;
    confTemplatePath = mainModulePath.replace('knodeo.js', 'recipes/**/*.jade');
    console.log("move recipes from: " + confTemplatePath);
    return gulp.src(confTemplatePath).pipe(gulp.dest("_workshop/recipes"));
  },
  all: function() {
    this.setupFolderTree();
    this.setupConfigFile();
    this.setupRecipes();
  }
};
