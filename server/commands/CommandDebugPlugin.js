const getReacticoonPlugins = require("../../cli-utils/reacticoon-config/getReacticoonPlugins");
const find = require("lodash/find");

function CommandDebugPlugin(req, res) {
  // TODO: optimize
  const plugins = getReacticoonPlugins();
  const pluginId = req.body.payload.pluginId;
  const plugin = find(plugins, plugin => plugin.id === pluginId);
  res.json(plugin);
}

module.exports = CommandDebugPlugin;
