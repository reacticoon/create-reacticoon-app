const CreateReacticoonPluginApi = require("./CreateReacticoonPluginApi")
const { errorTraceExit } = require('create-reacticoon-app/cli-utils')

function initiatePlugin(pluginCreator) {
  if (!pluginCreator) {
    errorTraceExit(`nil given`, `InitiatePlugin`)
  }
  if (!pluginCreator.__IS_REACTICOON_PLUGIN_CREATOR__) {
    errorTraceExit(`The given parameter is not a plugin creator.`, `InitiatePlugin`) // TODO: link doc
  }
  const createReacticoonPluginApi = new CreateReacticoonPluginApi()
  const plugin = pluginCreator(createReacticoonPluginApi)

  if (!plugin) {
    errorTraceExit(`The plugin creator didn't return the plugin data`, `InitiatePlugin`)
  }

  return plugin
}

module.exports = initiatePlugin