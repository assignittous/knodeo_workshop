###

# Utilities

Utility functions

###

require 'sugar'
fs = require('fs')
logger = require('aitutils').aitutils.logger
exports.Utilities = 

  # Produce a date sid
  dateSid: ()->
    Date.create().format("{yyyy}{MM}{dd}{HH}{mm}{ss}{fff}")

  # Check if a path has extension, if not add it
  checkExtension: (path, ext)->
    if path.endsWith(ext)
      return path
    else
      return "#{path}#{ext}"


  xmlToJade: (path, jadePath)->
    logger.info "xmltojade"
    fileContents = fs.readFileSync path, { encoding: 'utf8' }
    
    fileContents = fileContents.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>',"")

    # remove close tags

    #regexes = []
    regexes = []


    regexes.push
      name: "Strip close tags"
      regex: new RegExp("</(.*?)>","g")
      replacement: ""

    regexes.push
      name: "Close empty elements"
      regex: new RegExp("/>","g")
      replacement: ">"

    regexes.push
      name: "Convert to jade"
      regex: new RegExp("<(.*?) (.*)>","g")
      replacement: "$1($2)"

    regexes.push
      name: "Comma separate attributes"
      regex: new RegExp('" (.*?=)',"g")
      replacement: '", $1'
    regexes.push
      name: "Set tabs to 2 spaces"
      regex: new RegExp('    ',"g")
      replacement: '  '
    regexes.each (o)->
      #onsole.log "asdfasdfasdf"
      logger.info o.name
      #logger.info o # fileContents
      fileContents = fileContents.replace o.regex, o.replacement

    fileContents = '<?xml version="1.0" encoding="UTF-8"?>\n' + fileContents
    #regex = new RegExp("<(.*?) (.*)/>", "g")
    #cleansed = fileContents.replace(regex, "<$1 $2></$1>")  

    lines = fileContents.split('\n')

    fileContents = ''
    lines.each (line)->
      if !line.isBlank()
        fileContents += line + '\n'
    logger.info "Strip blank lines"
    fs.writeFileSync(jadePath, fileContents)
    logger.info "Wrote to #{jadePath}"
  xmlTidy: (path, jadePath)->
    fileContents = fs.readFileSync path, { encoding: 'utf8' }
    regex = new RegExp("<(.*?) (.*)/>", "g")
    cleansed = fileContents.replace(regex, "<$1 $2></$1>")    
    fs.writeFileSync(jadePath, cleansed)

  deleteFileIfExists: (path)->
    try
      fs.openSync path, 'r'
      fs.unlinkSync path
      logger.info "Deleted #{path}"
    catch e
      console.log "can't open"
    finally
      console.log "finally"