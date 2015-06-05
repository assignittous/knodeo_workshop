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
  execute: (async)->
    logger.
    showOutput = true

    #try
    logger.exec @command.join(' ')
      #if !test?
    cmdoutput = shell.exec(@command.join(' '), {encoding: "utf8", silent: false, async: async || false})

    cmdoutput.stdout.on 'data', (data)->
      console.log data
  properties: 
    generate: (environment)->
      cwd = (process.env.PWD || process.cwd()).replace(/\\/g,'/')
      configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")

      output = ""



      drivers = configuration.databases.drivers
      

      Object.keys(drivers).each (driver)->
        output += "driver.#{driver}.class=#{drivers[driver].class}\n"
        output += "driver.#{driver}.classPath=#{drivers[driver].classPath.replace(/{{cwd}}/g, cwd)}\n"
        output += "driver.#{driver}.baseUrl=#{drivers[driver].baseUrl}\n"


      databases = configuration.databases

      Object.keys(databases).remove("drivers").each (database)->

        driver = drivers[databases[database][environment].driver]

        # selected db for the environment
        selected_database = databases[database][environment]
        output += "db.#{database}.class=#{driver.class}\n"
        output += "db.#{database}.classPath=#{driver.classPath.replace(/{{cwd}}/g, cwd)}\n"
        output += "db.#{database}.url=#{driver.baseUrl}#{selected_database.host}:#{selected_database.port}/#{selected_database.database}\n"
        output += "db.#{database}.user=#{selected_database.user}\n"
        output += "db.#{database}.password=#{selected_database.password}\n"
        
        # console.log "database.etl_properties"
        if database.etl_properties?
          Object.keys(database.etl_properties).each (key)->
            output += "#{database.key}.#{key}=#{database.etl_properties[key]}\n"
      
      Object.keys(configuration.scriptella.etl_properties[environment]).each (property)->

        value = configuration.scriptella.etl_properties[environment][property]

        value = value.replace /{{cwd}}/g, cwd
        console.log value

        output += "#{property}=#{value}\n"

      fs.writeFileSync("_workshop/scriptella/etl.properties", output)
      logger.info "Updated etl.properties for #{environment}"

  script:
    compile: (name)->
      locals = {}

      trailingWhitespace = /( +)(?:\n|\r|\r\n)/m 
      # str.replace(trailingWhitespace, '')
      locals.cwd = process.cwd()
      sourcePath = "_src/elt_scripts/#{name}.jade"
      outputPath = "_workshop/scriptella/#{name}.xml"
      compiled = jade.compileFile(sourcePath, {pretty: true})
      fs.writeFileSync(outputPath, compiled(locals))     
      logger.info "Compiled #{sourcePath} to #{outputPath}"



    new: (name, recipe)->
      recipe = recipe || "job"

      console.log "Create new #{name} script using `#{recipe}` as a recipe."
      # Set the filename if the --name arguments was provided

      filename = name || "#{utils.dateSid()}-job"
      recipePath = "_workshop/recipes/scriptella/"

      # check that the file doesn't exist, otherwise throw an error
      # note, uses fs.open instead of fs.exists as fs.exists will be deprecated in a future version of Node

      
      recipe = utils.checkExtension(recipe, '.jade')
      

      


      source = "#{recipePath}/#{recipe}"
      target = "_src/elt_scripts/#{filename}.jade"   
      fs.readFile target, (err, paths) ->
        if err
          #console.log err
          #console.log "should copy config"
          fs.copySync source, target
          logger.info "Created #{target}"
        else
          logger.warn "Config file already exists. Please manually delete it and try again."




    run: (name, environment)->

      
      
      configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
      environment = environment || configuration.defaults.environment
      # database = database || configuration.defaults.database
      @that.properties.generate(environment)
      @that.script.compile name

      logger.info "Running scriptella..."

      @that.command.push  "_workshop/scriptella/#{name}.xml"
      @that.execute()
      
    runGroup: (group)->

        # run one
        filename = utils.checkExtension(shell.arguments.manifest,".cson")    
        path = "job_manifests/#{filename}"

        manifest = CSON.parseCSONFile(path)

        manifest.jobs.each (path)->
        
          if path.endsWith('.xml')
            logger.info "Run update for scriptella/#{path}"
            #options.changeLogFile = "scriptella/#{path}"
            shell.execSync "scriptella scriptella/#{path}"


  

  init: ()->
    # Give grandchildren access to the root object
    that = @
    keys = Object.keys(this)
    keys.each (key)->
      if !["init","execute"].any key
        that[key]["that"] = that
    delete this.init

    return this
}.init()