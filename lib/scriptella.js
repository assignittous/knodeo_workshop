
/*

 * Scriptella

This library is a wrapper for running scriptella.
 */
var CSON, cwd, fs, gulp, jade, logger, plumber, rename, shell;

logger = require('../lib/logger').Logger;

shell = require('shelljs');

fs = require('fs');

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

gulp = require('gulp');

jade = require('gulp-jade');

plumber = require('gulp-plumber');

rename = require('gulp-rename');

exports.Scriptella = {
  command: ['scriptella'],
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
  properties: {
    generate: function() {
      var options, output;
      options = config.scriptellaOptions(shell["arguments"].env);
      output = "";
      options.databases.each(function(database) {
        var driver;
        console.log(database);
        driver = options.drivers[database.driver];
        output += "db." + database.key + ".class=" + driver["class"] + "\n";
        output += "db." + database.key + ".classPath=" + (process.cwd().replace(/\\/g, '/')) + "/" + driver.classPath + "\n";
        output += "db." + database.key + ".url=" + driver.baseUrl + database.host + ":" + database.port + "/" + database.database + "\n";
        output += "db." + database.key + ".user=" + database.user + "\n";
        output += "db." + database.key + ".password=" + database.password + "\n";
        if (database.etl_properties != null) {
          return Object.keys(database.etl_properties).each(function(key) {
            return output += database.key + "." + key + "=" + database.etl_properties[key] + "\n";
          });
        }
      });
      Object.keys(options.etl_properties).each(function(property) {
        var value;
        value = options.etl_properties[property];
        if (property === "data_working_directory") {
          if (options.etl_properties[property] === "{{cwd}}") {
            value = process.cwd().replace(/\\/g, '/');
          }
        }
        return output += property + "=" + value + "\n";
      });
      return fs.writeFileSync("./scriptella/etl.properties", output);
    }
  },
  script: {
    compile: function() {
      var locals;
      console.log("compile file");
      locals = {};
      locals.cwd = process.cwd();
      return gulp.src("./jobs/**/*.jade").pipe(plumber()).pipe(jade({
        locals: locals,
        pretty: true
      })).pipe(rename({
        extname: ".xml"
      })).pipe(gulp.dest("./scriptella"));
    },
    "new": function(name, recipe) {
      var filename, path;
      if (recipe == null) {
        recipe = "default";
      }
      console.log("Create new " + name + " script using `" + recipe + "` as a recipe.");
      if (name != null) {
        filename = name;
      } else {
        filename = (utils.dateSid()) + "-job";
      }
      if (recipe != null) {
        recipe = utils.checkExtension(recipe, '.jade');
      } else {
        recipe = "job.jade";
      }
      path = "./jobs/" + filename + ".jade";
      return fs.open(path, 'r', function(err) {
        if (err) {
          gulp.src("./recipes/scriptella/" + recipe).pipe(rename({
            basename: filename
          })).pipe(gulp.dest("./jobs"));
          return logger.info("Created " + path);
        } else {
          return logger.info("The file already exists, please try with a new filename");
        }
      });
    },
    run: function(name) {
      var filename, path;
      console.log("Run scriptella script named " + name);
      logger.warn("A manifest was not provided");
      if (name != null) {
        filename = utils.checkExtension(name, ".xml");
        path = "scriptella/" + filename;
        shell.execSyncIfExists(path, "scriptella " + path, "The job name " + name + " you entered doesn't exist");
      }
      this.that.command.push("sscriptella/" + filename);
      return this.that.execute(command);
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
    keys = Object.keys(this);
    keys.each(function(key) {
      if (!["init", "execute"].any(key)) {
        return that[key]["this"] = that;
      }
    });
    delete this.init;
    return this;
  }
}.init();
