###

# Scriptella

This library is a wrapper for running scriptella.

###
logger = require('../lib/logger').Logger
shell = require('shelljs')
fs = require('fs-extra')
CSON = require('cson')
cwd = process.env.PWD || process.cwd()
jade = require('jade')

utils = require('../lib/utilities').Utilities

exports.Scriptella = {
  command: ['scriptella']
  paths:
    temp: "_workshop/temp"
    source: "_src/elt_scripts"
    xml: "_workshop/scriptella"  
    recipes: "_workshop/recipes/scriptella"
  execute: (async)->
    logger.
    showOutput = true

    cmdoutput = shell.exec(@command.join(' '), {encoding: "utf8", silent: false, async: async || false})

    # todo: this needs to be cleaned up/refactored
    cmdoutput.stdout.on 'data', (data)->
      console.log data

  properties: 
    generate: (environment)->
      cwd = (process.env.PWD || process.cwd()).replace(/\\/g,'/')
      configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")

      output = []



      drivers = configuration.databases.drivers
      

      Object.keys(drivers).each (driver)->
        output.push "driver.#{driver}.class=#{drivers[driver].class}"
        output.push "driver.#{driver}.classPath=#{drivers[driver].classPath.replace(/{{cwd}}/g, cwd)}"
        output.push "driver.#{driver}.baseUrl=#{drivers[driver].baseUrl}"


      databases = configuration.databases

      Object.keys(databases).remove("drivers").each (database)->

        driver = drivers[databases[database][environment].driver]

        # selected db for the environment
        selected_database = databases[database][environment]
        output.push "db.#{database}.class=#{driver.class}"
        output.push "db.#{database}.classPath=#{driver.classPath.replace(/{{cwd}}/g, cwd)}"
        output.push "db.#{database}.url=#{driver.baseUrl}#{selected_database.host}:#{selected_database.port}/#{selected_database.database}"
        output.push "db.#{database}.user=#{selected_database.user}"
        output.push "db.#{database}.password=#{selected_database.password}"
        
        # console.log "database.etl_properties"
        if database.etl_properties?
          Object.keys(database.etl_properties).each (key)->
            output.push "#{database.key}.#{key}=#{database.etl_properties[key]}"
      
      Object.keys(configuration.scriptella.etl_properties[environment]).each (property)->

        value = configuration.scriptella.etl_properties[environment][property]

        value = value.replace /{{cwd}}/g, cwd

        output.push "#{property}=#{value}"



      fs.writeFileSync "#{@that.paths.xml}/etl.properties", output.join('\n')
      logger.info "Updated etl.properties for #{environment}"


  script:
    compile: (name)->
      locals = {}

      trailingWhitespace = /( +)(?:\n|\r|\r\n)/m 
      # str.replace(trailingWhitespace, '')
      locals.cwd = process.cwd()
      sourcePath = "#{@that.paths.source}/#{name}.jade"
      outputPath = "#{@that.paths.xml}/#{name}.xml"

      compiled = jade.compileFile(sourcePath, {pretty: true})
      fs.writeFileSync(outputPath, compiled(locals))     
      logger.info "Compiled #{sourcePath} to #{outputPath}"
      # remove temp file



    new: (name, recipe)->
      recipe = recipe || "job"

      console.log "Create new #{name} script using `#{recipe}` as a recipe."
      # Set the filename if the --name arguments was provided

      filename = name || "#{utils.dateSid()}-job"
      recipePath = @that.paths.recipes

      recipe = utils.checkExtension(recipe, '.jade')
      

      source = "#{recipePath}/#{recipe}"
      target = "#{@that.paths.source}/#{filename}.jade"   

      fs.readFile target, (err, paths) ->
        if err
          fs.copySync source, target
          logger.info "Created #{target}"
        else
          logger.warn "#{target} already exists. Please manually delete it or create a new script with a new name."




    run: (name, environment)->

      configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
      environment = environment || configuration.defaults.environment
      @that.properties.generate(environment)
      @that.script.compile name

      logger.info "Running scriptella..."

      @that.command.push  "#{@that.paths.xml}/#{name}.xml"
      @that.execute()


      
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

  

  init: ()->
    that = @
    # Check for prerequisite folders
    Object.keys(@paths).each (path)->
      fs.ensureDirSync that.paths[path]
    # Give grandchildren access to the root object
    
    keys = Object.keys(this)
    keys.each (key)->
      if !["init","execute","paths"].any key
        that[key]["that"] = that

    delete this.init
    return this
}.init()