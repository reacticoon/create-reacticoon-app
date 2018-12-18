//
// Module that handles our cache
//

const getValue = require("lodash/get");

const cache = {};

/**
 * 
 * @param {string} namespace cache is seperate per namespace, to avoid key conflicts on the app.
 * @param {string} key the cache key
 */
function get(namespace, key) {
  return getValue(cache, [namespace, key], null);
}

/**
 * 
 * @param {string} repo cache is seperate per namespace, to avoid key conflicts on the app. 
 * @param {string} key the cache key
 * @param {any} value value to save on cache
 */
function set(repo, key, value) {
  if (!cache[repo]) {
    cache[repo] = {}
  }
  cache[repo][key] = value
}

module.exports = {
  get,
  set,
};
