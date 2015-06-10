var CSON, cwd;

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

exports.Configuration = {
  current: {},
  cwd: function() {
    return process.env.PWD || process.cwd();
  },
  load: function() {
    return this.current = CSON.parseCSONFile((this.cwd()) + "/config.workshop.cson");
  },
  init: function() {
    this.load();
    return this;
  },
  upgrade: function() {},
  environment: function(env) {
    return env || this.current.defaults.environment;
  },
  database: function(database) {
    return database || this.current.defaults.database;
  },
  forService: function(service) {
    return this.current.cloud[service.replace(/-/g, '_')];
  },
  dataDirectoryForService: function(service) {
    return (this.cwd()) + "/" + this.current.cloud[service.replace(/-/g, '_')].data_path;
  },
  doSlackForService: function(service) {
    return true;
  },
  doEmailForService: function(service) {
    return true;
  }
}.init();
