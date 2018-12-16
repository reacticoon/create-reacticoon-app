const getReacticoonPlugins = require("./getReacticoonPlugins");

//
//
//
function getReacticoonPluginsWithOverrides() {
  const plugins = getReacticoonPlugins();

  const pluginsWithOverrides = plugins.filter(plugin => plugin.hasOverrides);

  return pluginsWithOverrides;
}

module.exports = getReacticoonPluginsWithOverrides;
