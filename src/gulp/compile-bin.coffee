###

# Compile bin folder

`gulp compile-bin`


---
###

del = require('del')
gulp   = require('gulp')

coffee = require("gulp-coffee")
plumber = require('gulp-plumber')
inject = require('gulp-inject-string')
binPath = ["./bin/**/*.*"]
watchPath = ["./src/bin/**/*.coffee","./src/bin/**/*.cson"]
sourcePath = ["./src/bin/**/*.coffee", "!./src/bin/knodeo.coffee"]
csonPath = ["./src/bin/**/*.cson", "!./src/bin/*.template.cson"]
configTemplatePath = ["./src/bin/*.template.cson"]
cson = require 'gulp-cson'
targetPath = "./bin"

module.exports = ()->

  del.sync binPath
  gulp.src(sourcePath).pipe(plumber()).pipe(coffee({bare:true})).pipe(gulp.dest(targetPath))

  gulp.src("./src/bin/knodeo.coffee").pipe(plumber()).pipe(coffee({bare:true})).pipe(inject.prepend("#!/usr/bin/env node\n")).pipe(gulp.dest(targetPath))
  gulp.src(csonPath).pipe(cson()).pipe(gulp.dest(targetPath))
  gulp.src(configTemplatePath).pipe(gulp.dest(targetPath))
  return

module.exports.watch = watchPath