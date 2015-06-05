
/*

 * Data

Utility functions for outputting cloud data to files
 */
var convert, fs, logger;

fs = require('fs-extra');

logger = require('../lib/logger').Logger;

convert = require('../lib/convert').Convert;

exports.Data = {
  checkPath: function(path) {},
  toCsv: function(path, data) {
    return fs.outputFileSync(path, convert.arrayToCsv(data));
  },
  toXlsx: function(path, data) {}
};
