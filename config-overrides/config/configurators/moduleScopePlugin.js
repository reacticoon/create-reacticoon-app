const { findResolvePlugin } = require("../../utils/rewired");

/**
 * Update the module scope plugin. This plugin display an error if we try to load code from a
 * non-defined directory, for example
 *
 * <pre>
 *
 * Module not found: You attempted to import /home/loic/dev/reacticoon/create-reacticoon-reacticoon-plugins/src/reacticoon-flash-messages/src
 * which falls outside of the project src/ directory. Relative imports outside of src/
 * are not supported. You can either move it inside src/, or add a symlink to it from project's
 * node_modules/.
 * </pre>
 *
 * We add the reacticoon and reacticoon-plugins paths.
 */
function moduleScopePluginConfigurator(api, config, options, env) {
  if (env.isEnvTesting) {
    return config;
  }

  // default configuration example:
  // {
  //   "appSrc": "/home/loic/dev/bm/bm-website-v2/src",
  //   "allowedFiles": {}
  // }
  const plugin = findResolvePlugin(
    config,
    plugin => plugin.appSrcs && plugin.allowedFiles
  );
  plugin.appSrcs = env.includePaths;
  plugin._pluginName = "ModuleScope";
  // console.jsonDie(config.resolve.plugins);
}

module.exports = moduleScopePluginConfigurator;
