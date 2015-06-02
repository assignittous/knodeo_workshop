console.log """

  ===============================================================================
  Knodeo Workshop Quick Reference
  ===============================================================================

  Read the full Knodeo Workshop documentation for more detailed information on
  how to use the knodeo command set.

  ===============================================================================


  General Usage:

    knodeo <command> <parameters>

  Database Schema Commands
  ------------------------


  Create a database file:

  knodeo new --database {database} --using-recipe {recipe}
  or
  knodeo new -d {database} -r {recipe}


  Add a migration to a database file:

  knodeo new --migration {migration} --using-recipe {recipe}
  or
  knodeo new -m {migration} -r {recipe}


  Reverse engineer a database:

  knodeo reverse-engineer --database {database} --environment {environment}
  or
  knodeo reverse-engineer -d {database}


  Validate a database file:

  knodeo validate --database {database}
  or
  knodeo validate -d {database}


  Document a database

  knodeo document --database {database}
  or
  knodeo document -d {database}


  Rebuild a database

  knodeo rebuild --database {database}
  or
  knodeo rebuild -d {database}


  Tag a database migration state

  knodeo tag --database {database}
  or
  knodeo tag -d {database}


  Cloud Data Commands
  -------------------

  Get data from a cloud service

  knodeo get --from {servicename}
  or
  knodeo get -f {servicename}


  ELT Commands
  ------------

  Create a new Scriptella script

  knodeo new --script {scriptname} --using-recipe {recipe}
  or
  knodeo new -s {scriptname} -r {recipe}


  Execute a scriptella script

  knodeo run --script {scriptname} --environment {environment}
  or
  knodeo run -s {scriptname} -e {environment}



"""
