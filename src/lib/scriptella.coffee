###

# Scriptella

This library is a wrapper for running scriptella.

###
logger = require('../lib/logger').Logger
shell = require('shelljs')
fs = require('fs')
CSON = require('cson')
cwd = process.env.PWD || process.cwd()
gulp   = require('gulp')
jade = require('gulp-jade')
plumber = require('gulp-plumber')
rename = require('gulp-rename')

exports.Scriptella = {
  command: ['scriptella']
  execute: (async)->

    showOutput = true

    #try
    logger.exec @command.join(' ')
      #if !test?
    cmdoutput = shell.exec(@command.join(' '), {encoding: "utf8", silent: false, async: async || false})

    cmdoutput.stdout.on 'data', (data)->
      console.log data
  properties: 
    generate: ()->

      options = config.scriptellaOptions(shell.arguments.env)

      output = ""

      options.databases.each (database)->

        console.log database
        driver = options.drivers[database.driver]
        output += "db.#{database.key}.class=#{driver.class}\n"
        output += "db.#{database.key}.classPath=#{process.cwd().replace(/\\/g,'/')}/#{driver.classPath}\n"
        output += "db.#{database.key}.url=#{driver.baseUrl}#{database.host}:#{database.port}/#{database.database}\n"
        output += "db.#{database.key}.user=#{database.user}\n"
        output += "db.#{database.key}.password=#{database.password}\n"
        
        # console.log "database.etl_properties"
        if database.etl_properties?
          Object.keys(database.etl_properties).each (key)->
            output += "#{database.key}.#{key}=#{database.etl_properties[key]}\n"

      Object.keys(options.etl_properties).each (property)->

        value = options.etl_properties[property]

        if property == "data_working_directory" # this is a special case
          if options.etl_properties[property] == "{{cwd}}"
            value = process.cwd().replace(/\\/g,'/')

        output += "#{property}=#{value}\n"

      fs.writeFileSync("./scriptella/etl.properties", output)


  script:
    compile: ()->
      console.log "compile file"
      locals = {}

      locals.cwd = process.cwd()

      gulp.src("./jobs/**/*.jade")
      .pipe(plumber())
      .pipe(jade({ locals: locals, pretty: true  }))
      .pipe(rename({ extname: ".xml"   }))
      .pipe(gulp.dest("./scriptella"))
      
    new: (name, recipe)->
      if !recipe?
        recipe = "default"

      console.log "Create new #{name} script using `#{recipe}` as a recipe."
      # Set the filename if the --name arguments was provided
      if name?
        filename = name
      else
        filename = "#{utils.dateSid()}-job"

      # check that the file doesn't exist, otherwise throw an error
      # note, uses fs.open instead of fs.exists as fs.exists will be deprecated in a future version of Node

      if recipe?
        recipe = utils.checkExtension(recipe, '.jade')
      else
        recipe = "job.jade"

      path = "./jobs/#{filename}.jade"

      fs.open path, 'r', (err)->
        if err # file doesn't exist, ok to build
          gulp.src("./recipes/scriptella/#{recipe}")
          .pipe(rename({ basename: filename }))
          .pipe(gulp.dest("./jobs"))
          logger.info "Created #{path}"
        else
          logger.info "The file already exists, please try with a new filename"

    run: (name)->
      console.log "Run scriptella script named #{name}"
      
      logger.warn "A manifest was not provided"
      # todo: add an argument for a manifest file to run manifests in a particular order

      if name?
        # run one
        filename = utils.checkExtension(name,".xml")    
        path = "scriptella/#{filename}"


        shell.execSyncIfExists path, "scriptella #{path}", "The job name #{name} you entered doesn't exist"


      @that.command.push "sscriptella/#{filename}"
      @that.execute command
      
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
        that[key]["this"] = that
    delete this.init
    return this
}.init()