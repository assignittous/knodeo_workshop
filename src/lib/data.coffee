###

# Data

Utility functions for outputting cloud data to files

###


fs = require('fs-extra')
logger = require('aitutils').aitutils.logger
convert = require('../lib/convert').Convert
nodePath = require 'path'
pd = require('pretty-data').pd

exports.Data =
  checkPath: (path)->


  toCsv: (path, data, attributes, transformFunction)->
    fs.outputFileSync(path, convert.arrayToCsv(data, attributes)) 
  
  toXlsx: (path, data, attributes, transformFunction)->

  toXml: (path, data, attributes, transformFunction)->
    

  toRaw: (path, data)->

    extension = nodePath.extname(path)

    switch extension
      when ".xml"
        data = pd.xml(data)
      when ".json"
        data = pd.json(data)




    fs.outputFileSync(path, data)