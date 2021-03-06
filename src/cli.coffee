require 'sugar'


# Get listing of valid cloud services
services = require "./services.json"
pkg = require('./package.json')
program = require('commander')
utils = require('aitutils').aitutils
logger = utils.logger

# local libs
liquibase = require("./lib/liquibase").Liquibase
scriptella = require("./lib/scriptella").Scriptella
init = require("./lib/init").Init
configuration = require("./lib/configuration").Configuration

cwd = process.env.PWD || process.cwd()






noOp = ()-> 
  console.log "Nothing ran, couldn't understand your command"


#console.log liquibase

# version
program
.version(pkg.version, '-v, --version')

subcommand = { }

# # Simple Subcommands

# ## `knodeo config`

# Dumps the configuration file to standard out

config = program.command 'config'
config.description 'Create a new thing'
config.action ()->
  console.log "This command dumps the configuration"

# ## `knodeo help`

help = program.command 'help'
help.description 'Create a new thing'
help.action ()->
  require('../lib/about')



# # Parameterized Subcommands

# ## `knodeo new --database {database_name}`

# Creates a new liquibase database definition (.jade)

# ## `knodeo new --migration {migration_name} [--for-database {database name}]`

# Creates a new liquibase database definition (.jade)

# ## `knodeo new --script {script_name}`




subcommand.init = program.command 'init'
subcommand.init.description 'Initialize knodeo for the current working folder'
subcommand.init.action ()->

  init.all()

# todo upgrade handling new recipes


subcommand.new = program.command 'new'
subcommand.new.description 'Create a new thing'
subcommand.new.option "-d, --database [database-name]", "database name"
subcommand.new.option "-m, --migration [migration_name]", "migration name"
subcommand.new.option "-s, --script [script_name]", "script name"
subcommand.new.option "-f, --for-database [database-name]", "database name"
subcommand.new.option "-g, --script-group [script_name]", "script group"
subcommand.new.option "-r, --using-recipe [recipe_name]", "recipe_name"
subcommand.new.action ()->

  if subcommand.new.migration?
    liquibase.migration subcommand.new.migration, subcommand.new.forDatabase, subcommand.new.usingRecipe

  if subcommand.new.script?
    if subcommand.new.script == true
      logger.error "No script name was provided"
      logger.info "The proper syntax is: knodeo new --script [script_name]"
      return
    else
      scriptella.new subcommand.new.script, subcommand.new.usingRecipe

  if subcommand.new.database?
    liquibase.model subcommand.new.database, subcommand.new.usingRecipe

# ## `knodeo run --migration [--for-database {database_name}] [--environment {environment}]`
# ## `knodeo run --script [--environment {environment}]`

subcommand.run = program.command 'run'
subcommand.run.description 'Create a new thing'
subcommand.run.option "-m, --migration", "migration"
subcommand.run.option "-r, --rollback", "rollback"
subcommand.run.option "-d, --for-database [database_name]", "database name"
subcommand.run.option "-s, --script [script_name]", "script name"
subcommand.run.option "-g, --script-group [group_name]", "script group"
subcommand.run.option "-e, --environment [environment]", "environment"
subcommand.run.option "-c, --count [count]", "count"
subcommand.run.option "--sql", "show sql"
subcommand.run.unknownOption = noOp

subcommand.run.action ()->
  if subcommand.run.migration?
    options = configuration.forLiquibase(subcommand.run.forDatabase, subcommand.run.environment)
    if subcommand.run.count?
      if subcommand.run.sql?
        liquibase.migrateCountSql subcommand.run.count, options.runParameters
      else
        liquibase.migrateCount subcommand.run.count, options.runParameters
    else
      if subcommmand.run.sql?
        liquibase.migrateSql options.runParameters
      else
        liquibase.migrate options.runParameters
    return

  if subcommand.run.rollback?
    options = configuration.forLiquibase(subcommand.run.forDatabase, subcommand.run.environment)
    # todo: tag or count
    liquibase.rollback subcommand.run.forDatabase, subcommand.run.environment, options
    return

  if subcommand.run.script?
    logger.info "Run scriptella script #{subcommand.run.script}"
    scriptella.script.run subcommand.run.script, subcommand.run.environment
    return

  if subcommand.run.scriptGroup?
    logger.info "Run scriptella script #{subcommand.run.script}"
    scriptella.script.runGroup subcommand.run.scriptGroup, subcommand.run.environment
    return


subcommand.get = program.command 'get'
subcommand.get.unknownOption = noOp
subcommand.get.description 'Create a new thing'
subcommand.get.option "-f, --from [service_name]", "service name"
subcommand.get.action ()->
  if services.any(subcommand.get.from)
    require "../lib/services/#{subcommand.get.from}"
  else
    console.log "The service '#{subcommand.get.from}' isn't supported by this version of Knodeo Workshop"


# Liquibase-Specific Commands

subcommand.validate = program.command 'validate-model'
subcommand.validate.unknownOption = noOp
subcommand.validate.description 'Create a new thing'
subcommand.validate.option "-d, --database", "database name"
subcommand.validate.action ()->
  options = configuration.forLiquibase(subcommand.run.forDatabase, subcommand.run.environment, cliParameters)
    
  liquibase.validate subcommand.validate.database, subcommand.validate.environment

subcommand.reverseEngineer = program.command 'reverse-engineer'
subcommand.reverseEngineer.unknownOption = noOp
subcommand.reverseEngineer.description 'Create a new thing'
subcommand.reverseEngineer.option "-d, --database", "database name"
subcommand.reverseEngineer.option "-e, --environment [environment]", "environment"
subcommand.reverseEngineer.action ()->
  console.log "===="
  console.log subcommand.reverseEngineer.database || null
  console.log "===="
  options = configuration.forLiquibase(subcommand.reverseEngineer.database, subcommand.reverseEngineer.environment, cliParameters)
        
  liquibase.reverseEngineer options.runParameters

subcommand.documentDatabase = ""

subcommand.rebuildDatabase = ""

subcommand.resetDatabase = ""

subcommand.tagDatabase = ""

subcommand.syncDatabase = ""

subcommand.migrationStatus = program.command 'migration-status'
subcommand.migrationStatus.unknownOption = noOp
subcommand.migrationStatus.description 'Create a new thing'
subcommand.migrationStatus.option "-d, --database", "database name"
subcommand.migrationStatus.option "-e, --environment [environment]", "environment"
subcommand.migrationStatus.action ()->
  options = configuration.forLiquibase(subcommand.migrationStatus.database, subcommand.migrationStatus.environment, cliParameters)
      
  liquibase.status options




# Scriptella-Specific Commands

result = program.parse(process.argv)
