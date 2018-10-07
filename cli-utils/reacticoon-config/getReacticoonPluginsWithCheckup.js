const getReacticoonPlugins = require("./getReacticoonPlugins");

//
//
//
function getReacticoonPluginsWithCheckup() {
  const plugins = getReacticoonPlugins();

  const pluginsWithCheckup = plugins.filter(plugin => plugin.hasCheckup);

  return pluginsWithCheckup;
}

module.exports = getReacticoonPluginsWithCheckup;
