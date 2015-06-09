###

# Data

Utility functions for outputting cloud data to files

###


fs = require('fs-extra')
logger = require('../lib/logger').Logger
convert = require('../lib/convert').Convert

exports.Data =
  checkPath: (path)->


  toCsv: (path, data, attributes)->
    fs.outputFileSync(path, convert.arrayToCsv(data, attributes)) 
  
  toXlsx: (path, data)->

  toRaw: (path, data)->
    fs.outputFileSync(path, data)