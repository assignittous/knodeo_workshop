###

# Liquibase

This library is a wrapper for running scriptella.

###


logger = require('../lib/logger').Logger
shell = require('shelljs')
fs = require('fs')
CSON = require('cson')
cwd = process.env.PWD || process.cwd()
gulp   = require('gulp')
rename = require('gulp-rename')
utils = require('../lib/utilities').Utilities
exports.Liquibase = {
  command: ["liquibase"]


  execute: (async)->

    showOutput = true

    #try
    logger.exec @command.join(' ')
      #if !test?
    cmdoutput = shell.exec(@command.join(' '), {encoding: "utf8", silent: false, async: async || false})

    if cmdoutput.stdout?
      cmdoutput.stdout.on 'data', (data)->
        console.log data
    #catch e
    #  logger.error "An error occurred, check the command"
    #  console.log e
    #  showOutput = false
    #finally
    #  if showOutput
    #    #console.log "-------"
    #    console.log cmdoutput.output
    #    if next?
    #      next()

  
  setOptions: (database, environment, changelogOverride)->
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
    
    environment = environment || configuration.defaults.environment
    database = database || configuration.defaults.database

    console.log "database: " + database
    console.log "environment: " + environment

    changelog = changelogOverride || database


    conn = configuration.databases[database]
    console.log conn

    db_driver = configuration.databases[database][environment].driver
    driver = configuration.databases.drivers[db_driver]

    cwd = process.env.PWD || process.cwd()

    @command.push "--driver=#{driver.class}"
    @command.push "--classpath=\"#{driver.classPath.replace(/{{cwd}}/g,cwd)}\""
    @command.push "--url=#{driver.baseUrl}#{conn[environment].host}:#{conn[environment].port}/#{conn[environment].database}"
    @command.push "--username=#{conn[environment].user}"
    @command.push "--password=#{conn[environment].password}"
    @command.push "--changeLogFile=_workshop/liquibase/#{changelog}.xml"



  migration:
    new: (migration, database, recipe)->
      if !database?
        database = "config.workshop.cson default"
      if !recipe?
        recipe = "changeset"

      logger.info "Create new #{migration} migration in the #{database} using `#{recipe}` as a recipe."
      @that.execute()

    status: (database)->
      command = "status"
      @that.setOptions(database)
      @that.command.push command      
      @that.execute(true)

    run: (database, environment, options)->

      # todo - compile the jade file to xml before running

      logger.info "Run migration for database named #{database} in #{environment} environment"

      command = "update"
      commandParameter = ""

      if options.count?
        if typeof(options.count) == 'number'
          command = "updateCount"
          commandParameter = options.count
        else
          options.count = null
      if options.sql?
        if options.sql
          command = "updateSQL"
          if options.count?
            command = "updateCountSQL"
            

      @that.setOptions(database)
      @that.command.push command      
      if commandParameter.length > 0
        @that.command.push commandParameter
      @that.execute(true)



    rollback: (database)->
      logger.todo "Roll back migration"

  database:
    compile: (name)->
      console.log "compile the specified database file"
    new: (name, recipe)->
      #logger.todo "Create new database named #{name} using `#{recipe}` as a recipe."

      # Set the filename if the --name arguments was provided
      
      if name?
        filename = name
      else
        filename = "#{utils.dateSid()}-data-model"

      path = "_src/database_models/#{filename}.jade"

      if recipe?
        recipe = utils.checkExtension(recipe, '.jade')
      else
        recipe = "default.jade"

      fs.open path, 'r', (err)->
        if err 
          # file doesn't exist, ok to create
          fs.readFile "_workshop/recipes/liquibase/data-models/#{recipe}", { encoding: 'utf8' }, (err, data)->
            if err
              logger.error "_workshop/recipes/liquibase/data-models/#{recipe} does not exist"
              return
            else
              logger.info "Using recipe: /recipes/liquibase/data-models/#{recipe}"
              data = data.replace /#{table_name}/g, "tablename"
              data = data.replace /#{id}/g, utils.dateSid()
              data = data.replace /#{db_user_name}/g, "db_user_name"
              data = data.replace /#{db_user_name}/g, "author"
              console.log data
              fs.writeFile path, data, (err)->
                if err
                  logger.error "Error writing #{path}"
                  return
                else
                  logger.info "Wrote #{path}"
        else
          logger.error "/databases/#{filename} already exists, please try with a new filename"














    tag: (tag)->
      logger.todo "Manually tag the database with '#{tag}'"

    validate: (name)->
      logger.info "Validate a changeset file for the database named: #{name}"

      @that.setOptions(name)
      @that.command.push "validate"      
      @that.execute()

    doc: (name)->
      logger.todo "Generate liquibase documentation for the database named: #{name}"

    sync: (name)->
      logger.todo "Mark all migrations as excuted in the database named #{name}"

    reverseEngineer: (name, environment)->
      if !name?
        configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
        name = configuration.defaults.database

      logger.info "Reverse engineer the database named: #{name}"
      @that.setOptions(name, environment, "#{name}_reverse_engineer")
      @that.command.push "generateChangeLog"      
      @that.execute(true)
      # todo - follow up tasks - convert xml file to jade


  functions: ["init","execute","setOptions"]
  init: ()->
    # Give grandchildren access to the root object
    that = @
    keys = Object.keys(this)
    keys.each (key)->
      # exclude function attributes
      if !that.functions.any key
        that[key]["that"] = that
    delete this.init
    return this
}.init()