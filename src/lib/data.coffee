###

# Data

Utility functions for outputting cloud data to files

###


fs = require('fs-extra')
logger = require('../lib/logger').Logger

exports.Data =
  checkPath: (path)->


  exportCsv: (data, path)->
    