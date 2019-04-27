const isEmpty = require("lodash/isEmpty");

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
function createReacticoonPlugin(plugin) {
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

module.exports = createReacticoonPlugin;
