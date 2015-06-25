
/*

 * Data

Utility functions for outputting cloud data to files
 */
var config, json2xlsx, logger, testObject;

json2xlsx = require('json2xlsx');

logger = require('../lib/logger').Logger;

config = require("../lib/configuration").Configuration;

exports.Xlsx = testObject = {
  "sheet1": [[1, 2, 3], [4, 5, 6]],
  sheet2: [
    {
      h: 1,
      e: 2,
      l: 3,
      p: 4
    }, {
      h: 3,
      e: 4,
      l: 5,
      p: 6
    }, {
      h: 5,
      e: 6,
      l: 7,
      p: 8
    }
  ]
};
