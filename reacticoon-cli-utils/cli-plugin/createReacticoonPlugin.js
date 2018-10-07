const invariant = require("invariant");
const isEmpty = require("lodash/isEmpty")

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
function createReacticoonCliPlugin(plugin) {
  return {
    ...plugin,
    hasCheckUp: !isEmpty(plugin.checkup),
    hasCommands: !isEmpty(plugin.commands),
    hasGenerator: !isEmpty(plugin.generators),
    __IS_REACTICOON_PLUGIN__: true, // internal to simplify invariants.
  }
}

module.exports = createReacticoonCliPlugin