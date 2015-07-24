var cwd, file, fs, gulp, logger;

logger = require('aitutils').aitutils.logger;

file = require('aitutils').aitutils.file;

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
    if (!file.exists(target)) {
      return fs.copySync(source, target);
    } else {
      return logger.warn("Config file already exists. Please manually delete it and try again.");
    }
  },
  setupFolderTree: function() {
    var subfolders;
    subfolders = ["./_workshop", "./_workshop/drivers", "./_workshop/scriptella", "./_workshop/liquibase", "./_workshop/logs", "./_workshop/recipes", "./_workshop/pem", "./_workshop/temp", "./_data", "./_src", "./_src/database_models", "./_src/elt_scripts", "./_src/etl_groups"];
    return file.setupFolderTree(subfolders);
  },
  setupRecipes: function() {
    var confTemplatePath, mainModulePath;
    mainModulePath = process.mainModule.filename;
    confTemplatePath = mainModulePath.replace('knodeo.js', 'recipes/**/*.jade');
    logger.info("Move recipes from: " + confTemplatePath);
    return gulp.src(confTemplatePath).pipe(gulp.dest("_workshop/recipes"));
  },
  all: function() {
    this.setupFolderTree();
    this.setupConfigFile();
    this.setupRecipes();
  }
};
