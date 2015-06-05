###

# Compile bin folder

`gulp compile-bin`


---
###

del = require "del"
gulp   = require "gulp"
coffee = require "gulp-coffee"
plumber = require "gulp-plumber"
inject = require "gulp-inject-string"
cson = require "gulp-cson"
# paths

binPath = ["./bin/**/*.*"]
watchPath = ["./src/bin/**/*.coffee","./src/bin/**/*.cson", "./src/bin**/*.jade"]
sourcePath = ["./src/bin/**/*.coffee", "!./src/bin/knodeo.coffee", "!./src/bin/recipes/**/*"]
csonPath = ["./src/bin/**/*.cson", "!./src/bin/**/*.template.cson"]
recipePath = ["./src/bin/recipes/**/*", "!./src/bin/recipes/**/*.gitkeep"]


targetPath = "./bin"

module.exports = ()->

  del.sync binPath
  gulp.src(sourcePath).pipe(plumber()).pipe(coffee({bare:true})).pipe(gulp.dest(targetPath))
  gulp.src("./src/bin/knodeo.coffee").pipe(plumber()).pipe(coffee({bare:true})).pipe(inject.prepend("#!/usr/bin/env node\n")).pipe(gulp.dest(targetPath))
  gulp.src(csonPath).pipe(cson()).pipe(gulp.dest(targetPath))
  gulp.src(recipePath).pipe(gulp.dest("#{targetPath}/recipes"))

  return

module.exports.watch = watchPath