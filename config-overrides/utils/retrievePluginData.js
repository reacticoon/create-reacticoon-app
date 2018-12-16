/**
 * Retrives the plugin overrides configuration.
 * A plugin can define an `overrides` via the createPlugin.
 *
 *
 * ```
 * createReacticoonPlugin({
 *   overrides: './overrides'
 * })
 * ```
 *
 *
 * ```
 * module.exports = {
 *  options: {
 *   enableSass: true,
 *   debugMode: false,
 *   env: {
 *     'REACTICOON_CLI_PLUGIN_TEST_VERSION': 'TEST',
 *   },
 *  },
 * }
 *
 */
function retrievePluginData() {
  // take overrides for the defined plugins. 
  let pluginsOverrides = {}
  const getReacticoonPluginsWithOverrides = require("../../cli-utils/reacticoon-config/getReacticoonPluginsWithOverrides");

  function loadOverrides(overridePath) {
    const path = overridePath;
    try {
      return require(path);
    } catch (e) {
      console.error(`Could not find overrides module on path '${path}'`);
      console.error(e);
      process.exit();
    }
  }

  function getOverrides() {
    return getReacticoonPluginsWithOverrides().reduce((overridesFiles, plugin) => {
      return overridesFiles.concat({
        plugin,
        resolve: `${plugin.resolve}/${plugin.overrides}`
      });
    }, []);
  }
  const overridesFiles = getOverrides()

  // contains all the plugins override, useful for debug
  const pluginsOverridesDebugInfo = {}

  // We take the last plugin and spread, to allow the first defined plugin to have the priority.
  overridesFiles.reverse().forEach(overrideInfo => {
    const override = loadOverrides(overrideInfo.resolve)
    pluginsOverrides = {
      ...pluginsOverrides,
      ...override,
    }

    pluginsOverridesDebugInfo[overrideInfo.plugin.name] = {
      overrideFilePath: overrideInfo.path,
      override,
    }
  })

  const pluginData = {
    pluginsOverrides,
    pluginsOverridesDebugInfo,
  } 
  return pluginData
}

module.exports = retrievePluginData