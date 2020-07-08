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
function retrievePluginsOverridesData(isEnvDev) {
  // take overrides for the defined plugins.
  let pluginsOverrides = {
    rewires: []
  };
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
    return getReacticoonPluginsWithOverrides().reduce(
      (overridesFiles, plugin) => {
        return overridesFiles.concat({
          plugin,
          resolve: `${plugin.resolve}/${plugin.overrides}`
        });
      },
      []
    );
  }
  const overridesFiles = getOverrides();

  // contains all the plugins override, useful for debug
  const pluginsOverridesDebugInfo = {};

  const merge = require("lodash/merge");
  const isFunction = require("lodash/isFunction");
  const isEmpty = require("lodash/isEmpty");

  // We take the last plugin and spread, to allow the first defined plugin to have the priority.
  overridesFiles.reverse().forEach(overrideInfo => {
    const overrideLoaded = loadOverrides(overrideInfo.resolve);

    const override = isFunction(overrideLoaded)
      ? overrideLoaded()
      : overrideLoaded;

    override.hasOptions = !isEmpty(override.options);

    if (override.hasOptions) {
      pluginsOverrides.options = merge(
        pluginsOverrides.options,
        override.options
      );
    }

    override.hasRewire = isFunction(override.rewire);

    if (override.hasRewire) {
      const rewire = override.rewire;
      rewire.pluginName = overrideInfo.plugin.name;

      if (!isFunction(rewire)) {
        throw new Error(
          `Rewire for plugin ${overrideInfo.plugin.name} is not a function.`
        );
      }

      pluginsOverrides.rewires.push(rewire);
    }

    pluginsOverridesDebugInfo[overrideInfo.plugin.name] = {
      overrideFilePath: overrideInfo.resolve,
      override
    };
  });

  const pluginOverridesData = {
    pluginsOverrides,
    pluginsOverridesDebugInfo
  };

  // console.jsonDie(pluginOverridesData.pluginsOverrides);
  return pluginOverridesData;
}

module.exports = retrievePluginsOverridesData;
