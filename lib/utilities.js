
/*

 * Utilities

Utility functions
 */
var fs, logger;

require('sugar');

fs = require('fs');

logger = require('../lib/logger.js').Logger;

exports.Utilities = {
  dateSid: function() {
    return Date.create().format("{yyyy}{MM}{dd}{HH}{mm}{ss}{fff}");
  },
  checkExtension: function(path, ext) {
    if (path.endsWith(ext)) {
      return path;
    } else {
      return "" + path + ext;
    }
  },
  xmlToJade: function(path, jadePath) {
    var fileContents, lines, regexes;
    logger.info("xmltojade");
    fileContents = fs.readFileSync(path, {
      encoding: 'utf8'
    });
    fileContents = fileContents.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', "");
    regexes = [];
    regexes.push({
      name: "Strip close tags",
      regex: new RegExp("</(.*?)>", "g"),
      replacement: ""
    });
    regexes.push({
      name: "Close empty elements",
      regex: new RegExp("/>", "g"),
      replacement: ">"
    });
    regexes.push({
      name: "Convert to jade",
      regex: new RegExp("<(.*?) (.*)>", "g"),
      replacement: "$1($2)"
    });
    regexes.push({
      name: "Comma separate attributes",
      regex: new RegExp('" (.*?=)', "g"),
      replacement: '", $1'
    });
    regexes.push({
      name: "Set tabs to 2 spaces",
      regex: new RegExp('    ', "g"),
      replacement: '  '
    });
    regexes.each(function(o) {
      logger.info(o.name);
      return fileContents = fileContents.replace(o.regex, o.replacement);
    });
    fileContents = '<?xml version="1.0" encoding="UTF-8"?>\n' + fileContents;
    lines = fileContents.split('\n');
    fileContents = '';
    lines.each(function(line) {
      if (!line.isBlank()) {
        return fileContents += line + '\n';
      }
    });
    logger.info("Strip blank lines");
    fs.writeFileSync(jadePath, fileContents);
    return logger.info("Wrote to " + jadePath);
  },
  xmlTidy: function(path, jadePath) {
    var cleansed, fileContents, regex;
    fileContents = fs.readFileSync(path, {
      encoding: 'utf8'
    });
    regex = new RegExp("<(.*?) (.*)/>", "g");
    cleansed = fileContents.replace(regex, "<$1 $2></$1>");
    return fs.writeFileSync(jadePath, cleansed);
  },
  deleteFileIfExists: function(path) {
    var e;
    try {
      fs.openSync(path, 'r');
      fs.unlinkSync(path);
      return logger.info("Deleted " + path);
    } catch (_error) {
      e = _error;
      return console.log("can't open");
    } finally {
      console.log("finally");
    }
  }
};
