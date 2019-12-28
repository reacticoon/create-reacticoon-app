"use strict";

var fs = require("fs");
var mkdirp = require("mkdirp");
var dirname = require("path").dirname;
var path = require("path");

// List all files in a directory in Node.js recursively in a synchronous fashion
// https://gist.github.com/kethinov/6658166
// TODO: handle subfolders
const getTree = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      console.log("directory", path.join(dir, file));
      var odir = {
        filepath: dirFile,
        name: file,
        files: [],
        isFile: false
      };
      odir.files = getTree(dirFile, dir.files);
      filelist.push(odir);
    } else {
      filelist.push({
        filepath: dirFile,
        name: file,
        isFile: true
      });
    }
  }
  return filelist;
};

var saveFile = function saveFile(filepath, content) {
  var dir = dirname(filepath);

  mkdirp(dir, function(err) {
    if (err) console.error(err);
    else {
      fs.writeFileSync(filepath, content);
    }
  });
};

//
//
//

// TODO: unique id per project
const cacheDir = `/tmp/create-reacticoon-app`;
mkdirp(cacheDir);

const getCacheFile = filepath => {
  return fs.readFileSync(`${cacheDir}/${filepath}`, "utf8");
};

const saveCacheFile = (filepath, content) => {
  // TODO: unique id per project
  return fs.writeFileSync(`${cacheDir}/${filepath}`, content);
};

var readFileSync = function readFileSync(filepath) {
  return fs.readFileSync(filepath, "utf8");
};

var directoryExists = function directoryExists(path) {
  return fs.existsSync(path);
};

module.exports = {
  saveFile: saveFile,
  saveCacheFile: saveCacheFile,
  getCacheFile: getCacheFile,
  readFileSync: readFileSync,
  directoryExists: directoryExists,
  getTree: getTree
};
