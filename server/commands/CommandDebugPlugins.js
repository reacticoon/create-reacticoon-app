const getReacticoonPlugins = require("../../cli-utils/reacticoon-config/getReacticoonPlugins");

function CommandDebugPlugin(req, res) {
  const plugins = getReacticoonPlugins();
  res.json(plugins);
}

module.exports = CommandDebugPlugin;
