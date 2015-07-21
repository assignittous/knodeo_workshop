require 'sugar'


# Get listing of valid cloud services
services = require "../bin/services.json"
pkg = require('../package.json')
program = require('commander')
liquibase = require("../lib/liquibase").Liquibase
scriptella = require("../lib/scriptella").Scriptella
init = require("../lib/init").Init
logger = require('../lib/logger').Logger

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
    liquibase.migration.new subcommand.new.migration, subcommand.new.forDatabase, subcommand.new.usingRecipe

  if subcommand.new.script?
    if subcommand.new.script == true
      logger.error "No script name was provided"
      logger.info "The proper syntax is: knodeo new --script [script_name]"
      return
    else
      scriptella.script.new subcommand.new.script, subcommand.new.usingRecipe

  if subcommand.new.database?
    liquibase.database.new subcommand.new.database, subcommand.new.usingRecipe

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
    options =
      count: subcommand.run.count
      sql: subcommand.run.sql
    liquibase.migration.run subcommand.run.forDatabase, subcommand.run.environment, options
    return

  if subcommand.run.rollback?
    options =
      count: subcommand.run.count
      sql: subcommand.run.sql
    liquibase.migration.rollback subcommand.run.forDatabase, subcommand.run.environment, options
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
  liquibase.database.validate subcommand.validate.database, subcommand.validate.environment

subcommand.reverseEngineer = program.command 'reverse-engineer'
subcommand.reverseEngineer.unknownOption = noOp
subcommand.reverseEngineer.description 'Create a new thing'
subcommand.reverseEngineer.option "-d, --database", "database name"
subcommand.reverseEngineer.option "-e, --environment [environment]", "environment"
subcommand.reverseEngineer.action ()->
  console.log "===="
  console.log subcommand.reverseEngineer.database || null
  console.log "===="
  liquibase.database.reverseEngineer (subcommand.reverseEngineer.database || null), (subcommand.reverseEngineer.environment || null)

subcommand.documentDatabase = ""

subcommand.rebuildDatabase = ""

subcommand.resetDatabase = ""

subcommand.tagDatabase = ""

subcommand.syncDatabase = ""

subcommand.migrationStatus = program.command 'migration-status'
subcommand.migrationStatus.unknownOption = noOp
subcommand.migrationStatus.description 'Create a new thing'
subcommand.migrationStatus.option "-d, --database", "database name"
subcommand.migrationStatus.action ()->
  liquibase.migration.status subcommand.migrationStatus.database, subcommand.migrationStatus.environment




# Scriptella-Specific Commands

result = program.parse(process.argv)

###
Object.keys(result).each (key) ->
  if !['commands', 'options'].any(key)
    console.log ""
    console.log "KEY: " + key
    console.log ""

    console.log result[key]
###
#console.log "\n\n\n\n\n\n"
#console.log result
###
if result.args?
  if result.args.length == 0
    require('../lib/about')
###