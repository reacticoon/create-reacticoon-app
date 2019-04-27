"use strict";

var fs = require("fs");
var mkdirp = require("mkdirp");
var dirname = require("path").dirname;

var saveFile = function saveFile(filepath, content) {
  var dir = dirname(filepath);

  mkdirp(dir, function(err) {
    if (err) console.error(err);
    else {
      fs.writeFileSync(filepath, content);
    }
  });
};

var readFileSync = function readFileSync(filepath) {
  return fs.readFileSync(filepath, "utf8");
};

var directoryExists = function directoryExists(path) {
  return fs.existsSync(path);
};

module.exports = {
  saveFile: saveFile,
  readFileSync: readFileSync,
  directoryExists: directoryExists
};
