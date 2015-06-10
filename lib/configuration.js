var CSON, cwd;

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

exports.Configuration = {
  current: {},
  cwd: function() {
    return process.env.PWD || process.cwd();
  },
  load: function() {
    return this.current = CSON.parseCSONFile(cwd + "/config.workshop.cson");
  },
  upgrade: function() {},
  environment: function(env) {
    return env || this.current.defaults.environment;
  },
  database: function(database) {
    return database || this.current.defaults.database;
  }
};
