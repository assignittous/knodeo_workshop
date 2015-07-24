###

# Liquibase

This library is a wrapper for running Liquibase.

###

aitutils = require("aitutils").aitutils
logger = aitutils.logger
file = aitutils.file
general = aitutils.general
xml = aitutils.xml

liquibase = require("knodeo-liquibase").Liquibase


fs = require('fs')

CSON = require('cson')

cwd = process.env.PWD || process.cwd()


exports.Liquibase = {


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

    return {
      driver: driver.class
      classpath: "#{driver.classPath.replace(/{{cwd}}/g,cwd)}"
      url: "#{driver.baseUrl}#{conn[environment].host}:#{conn[environment].port}/#{conn[environment].database}"
      username: conn[environment].user
      password: conn[environment].password
      changeLogFile: "_workshop/liquibase/#{changelog}.xml"
    }




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



    recipe = file.checkExtension(recipe, '.jade')


    fs.open modelPath, 'r', (err)->
      if err 
        logger.error "#{modelPath} does not exist."
      else
        

        # file doesn't exist, ok to create
        fs.readFile "#{recipePath}/#{recipe}", { encoding: 'utf8' }, (err, data)->
          if err
            logger.error "#{recipePath}/#{recipe} does not exist"
            return
          else
            logger.info "Using recipe: #{recipePath}/#{recipe}"
            sid = general.dateSid()
            data = "\n" + data
            data = data.replace /#{author}/g, process.env['USER'] || process.env['USERNAME']
            data = data.replace /#{sid}/g, "sid#{sid}"
            console.log data
            fs.appendFile modelPath, data, (err)->
              if err
                logger.error "Error writing #{modelPath}"
                return
              else
                logger.info "Wrote #{modelPath}"





  status: (database)->
    liquibase.resetRunOptions @setOptions(database)
    liquibase.status()

  migrate: (database, environment, options)->
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
    # todo - compile the jade file to xml before running

    # todo - add error trap to make sure jade file exists
  
    environment = environment || configuration.defaults.environment
    database = database || configuration.defaults.database
    logger.info "Run migration for database named #{database} in #{environment} environment"
    


    # synchronously compile the jade file before running
    sourcePath = "_src/database_models/#{database}.jade"
    outputPath = "_workshop/liquibase/#{database}.xml"
    file.save outputPath, xml.fromJadeFile(sourcePath)

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
          
    liquibase.resetRunOptions @setOptions(database)
    
    switch command
      when "updateCount"
        liquibase.updateCount(options.count)
      when "updateSQL"
        liquibase.updateSQL()
      when "updateCountSQL"
        liquibase.updateCountSQL(options.count)
      else
        liquibase.update()


  rollback: (database, environment, options)->
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")    
    database = database || configuration.defaults.database
    logger.info "Roll back migration"
    liquibase.resetRunOptions @setOptions(database)
    liquibase.rollback()




  model: (name, recipe)->
    #logger.todo "Create new database named #{name} using `#{recipe}` as a recipe."

    # Set the filename if the --name arguments was provided
    
    if name?
      filename = name
    else
      filename = "#{general.dateSid()}-data-model"

    path = "_src/database_models/#{filename}.jade"

    if recipe?
      recipe = file.checkExtension(recipe, '.jade')
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
            data = data.replace /#{id}/g, general.dateSid()
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





  tag: (tag, database)->
    logger.todo "Manually tag the database with '#{tag}'"
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")    
    database = database || configuration.defaults.database      
    liquibase.resetRunOptions @setOptions(database)
    liquibase.tag(tag)

  validate: (database)->
    logger.info "Validate a changeset file for the database named: #{name}"
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")    
    database = database || configuration.defaults.database      
    liquibase.resetRunOptions @setOptions(database)
    liquibase.validate()

  doc: (database)->
    logger.todo "Generate liquibase documentation for the database named: #{name}"
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")    
    database = database || configuration.defaults.database      
    liquibase.resetRunOptions @setOptions(database)
    liquibase.dbDoc()

  sync: (name)->
    logger.todo "Mark all migrations as excuted in the database named #{name}"

  reverseEngineer: (name, environment)->
    if !name?
      configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")
      name = configuration.defaults.database

    logger.info "Reverse engineer the database named: #{name}"
    @setOptions(name, environment, "#{name}_reverse_engineer")

    # todo - follow up tasks - convert xml file to jade
    configuration = CSON.parseCSONFile("#{cwd}/config.workshop.cson")    
    database = database || configuration.defaults.database      
    liquibase.resetRunOptions @setOptions(database)
    liquibase.generateChangeLog()

  reset: (name, environment)->
    logger.todo "Reset the database to tag 0.0.0"

  rebuild: (name, environment)->
    logger.todo "Run reset(), followed by migration.run()"


}