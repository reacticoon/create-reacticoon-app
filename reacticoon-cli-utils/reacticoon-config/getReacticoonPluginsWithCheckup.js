const getReacticoonPlugins = require("./getReacticoonPlugins");

// TODO: dynamically add check methods on user node_modules
// use package.json, take packages that begin with "reacticoon".
// Go to node_modules folder. Search for a reacticoon-config.js[on] file
// -> contains:
// - checks
// - cli command(s)
// - code generators
//
// + to do
// - cache system

//
//
//
function getReacticoonPluginsWithCheckup() {
  const plugins = getReacticoonPlugins();

  const pluginsWithCheckUp = plugins.filter(plugin => plugin.hasCheckUp);

  return pluginsWithCheckUp;
}

module.exports = getReacticoonPluginsWithCheckup;
