const loadPlugins = require("./load-plugins");
const getReacticoonConfig = require("./getReacticoonConfig")

let _plugins = null;

function getReacticoonPlugins() {
  if (!_plugins) {
    _plugins = loadPlugins(getReacticoonConfig());
  }
  return _plugins;
}

module.exports = getReacticoonPlugins;
