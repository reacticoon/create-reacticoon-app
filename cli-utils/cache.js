const get = require("lodash/get");

const { saveCacheFile, getCacheFile } = require("../utils/Filesystem");

const filename = "reacticoon_server_cache.json";

let _cache;

function loadCache() {
  try {
    _cache = JSON.parse(getCacheFile(filename));
  } catch (_) {}
}

function setCacheValue(name, value) {
  loadCache();
  _cache[name] = value;
  const content = JSON.stringify(_cache, null, 2);
  saveCacheFile(filename, content);
}

function getCacheValue(name) {
  loadCache();
  const content = get(_cache, name, null);
  return content;
}

function resetCache() {
  saveCacheFile(filename, JSON.stringify({}));
}

module.exports = { setCacheValue, getCacheValue, resetCache };
