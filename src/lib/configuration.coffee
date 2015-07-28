# configuration.coffee

utils = require('aitutils').aitutils
configuration = utils.configuration


cwd = process.env.PWD || process.cwd()
console.log configuration
exports.Configuration = {



  forLiquibase: (database, environment, cliParameters, changelogOverride) ->
    configuration.load("#{cwd}/config.workshop.cson")

    environment = environment || configuration.current.defaults.environment
    database = database || configuration.current.defaults.database

    console.log "database: " + database
    console.log "environment: " + environment

    changelog = changelogOverride || database


    conn = configuration.current.databases[database]
    console.log conn

    db_driver = configuration.current.databases[database][environment].driver
    driver = configuration.current.databases.drivers[db_driver]

    cwd = process.env.PWD || process.cwd()

    return {
      database: database
      environment: environment
      sourcePath: "_src/database_models/#{database}.jade"
      outputPath: "_workshop/liquibase/#{database}.xml"
      cliParameters: cliParameters
      runParameters:
        driver: driver.class
        classpath: "#{driver.classPath.replace(/{{cwd}}/g,cwd)}"
        url: "#{driver.baseUrl}#{conn[environment].host}:#{conn[environment].port}/#{conn[environment].database}"
        username: conn[environment].user
        password: conn[environment].password
        changeLogFile: "_workshop/liquibase/#{changelog}.xml"
    }

  forScriptella: ()->
    return {
    }


  # ## Cloud SErvice related stuff

  # configs for a cloud service
  forService: (service)->
    return @current.cloud[service.replace(/-/g,'_')]

  # data directory for a cloud service
  dataDirectoryForService: (service)->
    return "#{@cwd()}/#{@current.cloud[service.replace(/-/g,'_')].data_path}"

  doSlackForService: (service)->
    return false

  doEmailForService: (service)->
    return false

}