const getReacticoonPlugins = require("./getReacticoonPlugins");

//
//
//
function getReacticoonPluginsWithServerCommands() {
  const plugins = getReacticoonPlugins();

  const pluginsWithServerCommands = plugins.filter(
    plugin => plugin.hasServerCommands
  );

  return pluginsWithServerCommands;
}

module.exports = getReacticoonPluginsWithServerCommands;
