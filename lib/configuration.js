var CSON, cwd;

CSON = require('cson');

cwd = process.env.PWD || process.cwd();

exports.Configuration = {
  current: {},
  load: function() {
    return this.current = CSON.parseCSONFile(cwd + "/config.workshop.cson");
  },
  upgrade: function() {}
};
