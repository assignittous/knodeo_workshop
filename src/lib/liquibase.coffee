###

# Liquibase

This library is a wrapper for running Liquibase.

###

aitutils = require("aitutils").aitutils
logger = aitutils.logger
file = aitutils.file
general = aitutils.general
xml = aitutils.xml

Mustache = require "mustache"
liquibase = require("knodeo-liquibase").Liquibase




CSON = require('cson')

cwd = process.env.PWD || process.cwd()


exports.Liquibase = {



  setOptions: (liquibaseOptions)->
    return liquibaseOptions.runParameters
    ###
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
    
    environment = environment || configuration.defaults.environment
    database = database || configuration.defaults.database

    console.log "database: " + database
    console.log "environment: " + environment

    changelog = changelogOverride || database


    conn = configuration.databases[database]
    

    db_driver = configuration.databases[database][environment].driver
    driver = configuration.databases.drivers[db_driver]

    cwd = process.env.PWD || process.cwd()

    return {
      driver: driver.class
      classpath: "#{driver.classPath.replace(/{{cwd}}/g,cwd)}"
      url: "#{driver.baseUrl}#{conn[environment].host}:#{conn[environment].port}/#{conn[environment].database}"
      username: conn[environment].user
      password: conn[environment].password
      changeLogFile: "_workshop/liquibase/#{changelog}.xml"
    }
    ###

  # file manipulations for migrations and model

  model: (name, recipe)->
    if name?
      filename = name
    else
      filename = "#{general.dateSid()}-data-model"
    outputPath = "_src/database_models/#{filename}.jade"
    if recipe?
      recipe = file.ensureExtension(recipe, '.jade')
    else
      recipe = "default.jade"

    recipePath = "_workshop/recipes/liquibase/data-models/#{recipe}"

    

    if !file.exists(outputPath)
      if file.exists(recipePath)
        data = file.open(recipePath)
        locals =
          table_name: "tablename"
          id: general.dateSid()
          db_user_name: "db_user_name"
          author: "author"
        logger.info "Using recipe: /recipes/liquibase/data-models/#{recipe}"
        file.save outputPath, Mustache.render(data, locals)
      else
        logger.error "_workshop/recipes/liquibase/data-models/#{recipe} does not exist"
    else
      logger.error "#{outputPath} already exists, please try with a new filename"

  migration: (migration, database, recipe)->

    recipePath = "_workshop/recipes/liquibase/changesets/"


    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")

    # todo - add error trap to make sure jade file exists
  
    database = database || configuration.defaults.database
    logger.info "New migration for database named #{database} with #{recipe} recipe"

    recipe = recipe || "create-table"

    if !recipe?
      recipe = "changeset"

    modelPath = "_src/database_models/#{database}.jade"
    recipe = file.ensureExtension(recipe, '.jade')
    recipePath = "#{recipePath}/#{recipe}"

    if file.exists(modelPath)
      if file.exists(recipePath)
        data = "\n" + file.open(recipePath)
        logger.info "Using recipe: #{recipePath}/#{recipe}"
        locals = 
          author: process.env['USER'] || process.env['USERNAME']
          sid: "sid#{general.dateSid()}"
        file.append modelPath, Mustache.render(data,locals)

      else
        logger.error "#{recipePath}/#{recipe} does not exist"

    else
      logger.error "#{modelPath} does not exist."




  # CLI based commands

  status: (database)->
    liquibase.resetRunOptions @setOptions(database)
    liquibase.status()

  migrate: (command, runParameters)->

    logger.info "Run migration for database named #{database} in #{environment} environment"
    
    # synchronously compile the jade file before running
    file.save options.outputPath, xml.fromJadeFile(options.sourcePath)

    # default
    command = "update"

    if options.count?
      if typeof(options.count) == 'number'
        command = "updateCount"
    if options.sql?
      if options.sql
        command = "updateSQL"
        if options.count?
          command = "updateCountSQL"
          
    liquibase.resetRunOptions runParameters
    
    switch command
      when "updateCount"
        liquibase.updateCount(options.count)
      when "updateSQL"
        liquibase.updateSQL()
      when "updateCountSQL"
        liquibase.updateCountSQL(options.count)
      else
        liquibase.update()


  rollback: (runParameters)->
    logger.info "Roll back migration"
    liquibase.resetRunOptions runParameters
    liquibase.rollback()

  tag: (tag, runParameters)->
    logger.todo "Manually tag the database with '#{tag}'"
    liquibase.resetRunOptions runParameters
    liquibase.tag(tag)

  validate: (runParameters)->
    logger.info "Validate a changeset file for the database named: #{name}"  
    liquibase.resetRunOptions runParameters
    liquibase.validate()

  doc: (runParameters)->
    liquibase.resetRunOptions runParameters
    liquibase.dbDoc()

  sync: (name)->
    logger.todo "Mark all migrations as excuted in the database named #{name}"

  reverseEngineer: (runParameters)->
    runParameters.changeLogFile = runParameters.changeLogFile.replace(".xml", "_reverse_engineer.xml")
    liquibase.resetRunOptions runParameters
    liquibase.generateChangeLog()

  reset: (name, environment)->
    logger.todo "Reset the database to tag 0.0.0"

  rebuild: (name, environment)->
    logger.todo "Run reset(), followed by migration.run()"


}