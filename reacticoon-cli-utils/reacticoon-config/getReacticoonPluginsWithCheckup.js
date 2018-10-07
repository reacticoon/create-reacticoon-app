const getReacticoonPlugins = require("./getReacticoonPlugins");

//
//
//
function getReacticoonPluginsWithCheckup() {
  const plugins = getReacticoonPlugins();

  const pluginsWithCheckUp = plugins.filter(plugin => plugin.hasCheckup);

  return pluginsWithCheckUp;
}

module.exports = getReacticoonPluginsWithCheckup;
