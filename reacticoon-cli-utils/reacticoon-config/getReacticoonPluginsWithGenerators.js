const getReacticoonPlugins = require("./getReacticoonPlugins");

//
//
//
function getReacticoonPluginsWithGenerators() {
  const plugins = getReacticoonPlugins();

  const pluginsWithCommands = plugins.filter(plugin => plugin.hasGenerators);

  return pluginsWithCommands;
}

module.exports = getReacticoonPluginsWithGenerators;
