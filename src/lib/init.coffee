# init.coffee

# Initializes a working folder for use with Knodeo Workshop.

logger = require('aitutils').aitutils.logger
file = require('aitutils').aitutils.file
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
    if !file.exists(target)
      fs.copySync source, target
    else
      logger.warn "Config file already exists. Please manually delete it and try again."

        

  setupFolderTree: ()->

    subfolders = [
      "./_workshop"
      "./_workshop/drivers"
      "./_workshop/scriptella"
      "./_workshop/liquibase"
      "./_workshop/logs"
      "./_workshop/recipes"
      "./_workshop/pem"  
      "./_workshop/temp"  
      "./_data"
      "./_src"
      "./_src/database_models"
      "./_src/elt_scripts" 
      "./_src/etl_groups"  
    ]
    # Check for ./_site folder
    file.setupFolderTree subfolders


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