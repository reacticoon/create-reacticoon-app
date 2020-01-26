const find = require("lodash/find");
const getReacticoonPlugins = require("./getReacticoonPlugins");

function getReacticoonPlugin(pluginName) {
  const plugin = find(getReacticoonPlugins(), plugin => {
    return plugin.name.endsWith(pluginName);
  });

  return plugin;
}

module.exports = getReacticoonPlugin;
