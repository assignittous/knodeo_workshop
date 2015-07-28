###

# Scriptella

This library is a wrapper for running scriptella.

###
aitutils = require("aitutils").aitutils
logger = aitutils.logger
file = aitutils.file
general = aitutils.general
xml = aitutils.xml

scriptella = require("knodeo-scriptella").Scriptella





CSON = require('cson')
cwd = process.env.PWD || process.cwd()
jade = require('jade')


exports.Scriptella = {
  command: ['scriptella']
  paths:
    temp: "_workshop/temp"
    source: "_src/elt_scripts"
    xml: "_workshop/scriptella"  
    recipes: "_workshop/recipes/scriptella"


  execute: (path, properties, locals)->
    scriptella.execute path, properties, locals




  compile: (name)->
    locals = {}

    trailingWhitespace = /( +)(?:\n|\r|\r\n)/m 
    # str.replace(trailingWhitespace, '')
    locals.cwd = process.cwd()
    sourcePath = "#{@paths.source}/#{name}.jade"
    outputPath = "#{@paths.xml}/#{name}.xml"

    compiled = jade.compileFile(sourcePath, {pretty: true})

    file.save outputPath, compiled(locals)

    logger.info "Compiled #{sourcePath} to #{outputPath}"
    # remove temp file



  new: (name, recipe)->
    recipe = recipe || "job"

    logger.info "Create new #{name} script using `#{recipe}` as a recipe."
    # Set the filename if the --name arguments was provided

    filename = name || "#{general.dateSid()}-job"
    recipePath = @paths.recipes

    recipe = file.ensureExtension(recipe, '.jade')
    

    source = "#{recipePath}/#{recipe}"
    target = "#{@paths.source}/#{filename}.jade"   


    if file.exists(target)
      logger.warn "#{target} already exists. Please manually delete it or create a new script with a new name."
    else
      file.copy source, target
      logger.info "Created #{target}"




  run: (name, environment)->

    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
    environment = environment || configuration.defaults.environment
    @properties.generate(environment)
    @script.compile name

    logger.info "Running scriptella..."

    @command.push  "#{@paths.xml}/#{name}.xml"
    @execute()


    
  groupIterator: (name, group)->
    that = @
    if Object.isString(group)
      logger.exec "Run #{name}'s task #{group} (string)"

    if Object.isArray(group)
      logger.info "Scan #{name}'s tasks (array)"
      group.each (task)->
        logger.exec "Run #{name}'s task #{task} (string)"          

    if Object.isObject(group)
      logger.info "Scan group #{name}'s children (object)"
      keys = Object.keys(group)
      keys.each (key)->
        # recurse
        that.groupIterator key, group[key]

  runGroup: (group, environment)->

    that = @
    groupfile = CSON.parseCSONFile("#{cwd}/_src/etl_groups/#{group}.cson")

    rootKeys = Object.keys(groupfile)

    rootKeys.each (rootkey)->
      that.groupIterator rootkey, groupfile[rootkey]



}