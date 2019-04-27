const getReacticoonPlugins = require("./getReacticoonPlugins");

//
//
//
function getReacticoonPluginsWithCommands() {
  const plugins = getReacticoonPlugins();

  const pluginsWithCommands = plugins.filter(plugin => plugin.hasCommands);

  return pluginsWithCommands;
}

module.exports = getReacticoonPluginsWithCommands;
