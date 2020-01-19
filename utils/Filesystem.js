const fs = require("fs");
const mkdirp = require("mkdirp");
const dirname = require("path").dirname;
const path = require("path");

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
      const odir = {
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

function saveFile(filepath, content) {
  const dir = dirname(filepath);

  mkdirp(dir, function(err) {
    if (err) console.error(err);
    else {
      fs.writeFileSync(filepath, content);
    }
  });
}

//
//
//

// TODO: unique id per project
const cacheDir = `/tmp/reacticoon`;
mkdirp(cacheDir);

function getCacheFile(filepath) {
  return fs.readFileSync(`${cacheDir}/${filepath}`, "utf8");
}

function saveCacheFile(filepath, content) {
  // TODO: unique id per project
  return fs.writeFileSync(`${cacheDir}/${filepath}`, content);
}

function readFileSync(filepath) {
  return fs.readFileSync(filepath, "utf8");
}

function directoryExists(path) {
  return fs.existsSync(path); // TODO: and is directory
}

function fileExists(path) {
  return fs.existsSync(path);
}

function readJsonFile(filepath) {
  return JSON.parse(String(fs.readFileSync(filepath, "utf8")));
}

module.exports = {
  saveFile,
  saveCacheFile,
  getCacheFile,
  readFileSync,
  directoryExists,
  fileExists,
  getTree,
  readJsonFile
};
