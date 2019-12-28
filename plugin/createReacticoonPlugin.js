const isEmpty = require("lodash/isEmpty");
const isFunction = require("lodash/isFunction")
const initiatePlugin = require("./initiatePlugin")

// plugin example:
// ```
// {
//   name: "",
//   checkup: [
//
//   ],
//   commands: [
//
//   ],
//   generators: [
//
//   ]
// }
// ```
// TODO: add invariant
//
function createReacticoonPlugin(pluginParam) {
  let plugin
  if (isFunction(pluginParam)) {
    pluginParam.__IS_REACTICOON_PLUGIN_CREATOR__ = true;
    plugin = initiatePlugin(pluginParam)
  } else {
    plugin = pluginParam
  }

  return {
    ...plugin,
    hasCheckup: !isEmpty(plugin.checkup),
    hasCommands: !isEmpty(plugin.commands),
    hasServerCommands: !isEmpty(plugin.serverCommands),
    hasGenerators: !isEmpty(plugin.generators),
    hasOverrides: !isEmpty(plugin.overrides),
    // internal to facilitate checks.
    __IS_REACTICOON_PLUGIN__: true
  };
}
createReacticoonPlugin.__IS_REACTICOON_PLUGIN_CREATOR__ = true

module.exports = createReacticoonPlugin;
