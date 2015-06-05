###

# Data

Utility functions for outputting cloud data to files

###


fs = require('fs-extra')
logger = require('../lib/logger').Logger
convert = require('../lib/convert').Convert

exports.Data =
  checkPath: (path)->


  toCsv: (path, data)->
    parentDirectory = require('path').dirname(path)
    # if the parent directory doesn't exist, create it
    fs.ensureDirSync parentDirectory
    fs.writeFileSync(path, convert.arrayToCsv(data)) 
  
  toXlsx: (path, data)->
