const invariant = require("invariant");
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
function createReacticoonCliPlugin(plugin) {
  return {
    ...plugin,
    hasCheckup: !isEmpty(plugin.checkup),
    hasCommands: !isEmpty(plugin.commands),
    hasGenerators: !isEmpty(plugin.generators),
    hasOverrides: !isEmpty(plugin.overrides),
    // internal to facilitate checks.
    __IS_REACTICOON_PLUGIN__: true,
  };
}

module.exports = createReacticoonCliPlugin;
