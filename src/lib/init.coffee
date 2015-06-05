# init.coffee

# Initializes a working folder for use with Knodeo Workshop.

logger = require('../lib/logger').Logger

gulp   = require('gulp')

fs = require('fs-extra')
cwd = process.env.PWD || process.cwd()


exports.Init = 


  setupConfigFile: ()->
    # copy the templates\
    mainModulePath = process.mainModule.filename
    confTemplatePath = mainModulePath.replace('knodeo.js','recipes/config.workshop.template.cson')


    source = confTemplatePath
    target = "config.workshop.cson"    
    fs.readFile target, (err, paths) ->
      if err
        #console.log err
        #console.log "should copy config"
        fs.copySync source, target
      else
        logger.warn "Config file already exists. Please manually delete it and try again."

  setupFolderTree: ()->
    basepath = "./_workshop"
    subfolders = [
      "./_workshop"
      "./_workshop/drivers"
      "./_workshop/scriptella"
      "./_workshop/liquibase"
      "./_workshop/recipes"
      "./_workshop/temp"  
      "./_data"
      "./_src"
      "./_src/database_models"
      "./_src/elt_scripts"    
    ]
    # Check for ./_site folder
    fs.readdir basepath, (err, paths) ->
        if err
          logger.warn "./_workshop not found"
          fs.ensureDirSync(basepath)
          logger.info "created ./_workshop"
        subfolders.each (path)->
          fs.readdir path, (err)->
            if err
              logger.warn "#{path} not found"
              fs.ensureDirSync(path)
              logger.info "created #{path}"

  setupRecipes: ()->
    # copy the recipes\
    mainModulePath = process.mainModule.filename
    confTemplatePath = mainModulePath.replace('knodeo.js','recipes/**/*.jade')    
    logger.info "Move recipes from: #{confTemplatePath}"
    gulp.src(confTemplatePath).pipe(gulp.dest("_workshop/recipes"))

  all: ()->
    @setupFolderTree()
    @setupConfigFile()
    @setupRecipes()
    return