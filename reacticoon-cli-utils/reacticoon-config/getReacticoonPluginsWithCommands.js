const getReacticoonPlugins = require("./getReacticoonPlugins");

//
//
//
function getReacticoonPluginsWithCheckup() {
  const plugins = getReacticoonPlugins();

  const pluginsWithCheckUp = plugins.filter(plugin => plugin.hasCommands);

  return pluginsWithCheckUp;
}

module.exports = getReacticoonPluginsWithCheckup;
