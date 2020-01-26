const find = require("lodash/find");
const getReacticoonPlugins = require("./getReacticoonPlugins");

function formatPlugin(plugin) {
  //
  // overridesData
  //

  let overridesData = {
    hasOverrides: plugin.hasOverrides
  };

  if (plugin.hasOverrides) {
    overridesData = {
      ...overridesData,
      // TODO: handle overrides being a directory with an index.js on it ?
      filepath: `${plugin.resolve}/${plugin.overrides}.js`
    };
  }
  plugin.overridesData = overridesData;

  return plugin;
}

function getReacticoonPlugin(pluginName) {
  const plugin = find(getReacticoonPlugins(), plugin => {
    return plugin.name.endsWith(pluginName);
  });

  return formatPlugin(plugin);
}

module.exports = getReacticoonPlugin;
