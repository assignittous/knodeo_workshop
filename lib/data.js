
/*

 * Data

Utility functions for outputting cloud data to files
 */
var convert, fs, logger, nodePath, pd;

fs = require('fs-extra');

logger = require('../lib/logger').Logger;

convert = require('../lib/convert').Convert;

nodePath = require('path');

pd = require('pretty-data').pd;

exports.Data = {
  checkPath: function(path) {},
  toCsv: function(path, data, attributes, transformFunction) {
    return fs.outputFileSync(path, convert.arrayToCsv(data, attributes));
  },
  toXlsx: function(path, data, attributes, transformFunction) {},
  toXml: function(path, data, attributes, transformFunction) {},
  toRaw: function(path, data) {
    var extension;
    extension = nodePath.extname(path);
    switch (extension) {
      case ".xml":
        data = pd.xml(data);
        break;
      case ".json":
        data = pd.json(data);
    }
    return fs.outputFileSync(path, data);
  }
};
