/**
 * This config allow overriding of the create-react-app config.
 *
 * see
 * - https://github.com/timarney/react-app-rewired
 * - https://github.com/facebook/create-react-app
 */

const merge = require("lodash/merge");

const reacticoonPaths = require("../../utils/paths");

// webpack imports

const defaultOptions = {
  enableSass: false,
  debugMode: false,
  autoImport: [],
  webpackAliases: {},
  env: {}
};

//
// The reacticoon user can override the config too
// see https://github.com/timarney/react-app-rewired
// The user config file can exports an `override` function (such as the one below)
// This function documentation can be found at https://github.com/timarney/react-app-rewired
//
// const reacticoonUserConfig = require('USER_APP_DIR/config-overrides.js')

// reacticoonConfig:
// - enableSass
// - autoImport

module.exports = createWebpackOverride = (
  isDev,
  reacticoonOptions,
  reacticoonWebpackOverride,
  retrievePluginsOverridesData = {}
) => (config, nodeEnv) => {
  const reactScriptPaths = require(require.resolve(
    reacticoonPaths.scriptVersion + "/config/paths"
  ));

  const appPackageJson = require(reactScriptPaths.appPath + "/package.json");

  const reacticoonConfig = require(reacticoonPaths.projectConfiguration);

  const {
    pluginsOverrides = {},
    pluginsOverridesDebugInfo = {}
  } = retrievePluginsOverridesData;

  const options = merge(
    {},
    defaultOptions,
    pluginsOverrides.options,
    reacticoonOptions,
    { rewires: pluginsOverrides.rewires }
  );

  // allow to define user env using the __ENV__ variable
  // by default we use 'local' for local development, and
  let __ENV__ = process.env.__ENV__;
  if (!__ENV__) {
    if (__PROD__) {
      __ENV__ = "production";
    } else {
      __ENV__ = "local";
    }
  }

  function getEnvFilepath(__ENV__) {
    const defaultCustomEnvironmentFilePath =
      reactScriptPaths.appSrc + "/config/environment";
    let filePath = defaultCustomEnvironmentFilePath;

    try {
      const envCustomEnvironmentFilePath =
        defaultCustomEnvironmentFilePath + "." + __ENV__;
      require.resolve(envCustomEnvironmentFilePath);
      // file exists since there is no expection
      filePath = envCustomEnvironmentFilePath;
    } catch (e) {
      // ignore, no custom configuration file
    }

    return filePath.replace(`${reactScriptPaths.appSrc}`, "app");
  }

  const __ENV_FILEPATH__ = getEnvFilepath(__ENV__);

  //
  //
  //
  const reacticoonPluginsList = reacticoonPaths.reacticoonPluginsList;

  const includePaths = [
    reacticoonPaths.appSrc,
    reacticoonPaths.reacticoonSrc
    // reacticoonPaths.reactRefresPath
  ].concat(
    reacticoonPluginsList.map(reacticoonPlugin => {
      return reacticoonPlugin + "/src";
    })
  );

  //
  //
  //

  // add some data to our env
  const env = {
    isDev,
    // reactScriptPaths,
    includePaths,
    reacticoonPaths,
    appPackageJson,
    reacticoonConfig,
    __ENV__,
    __ENV_FILEPATH__
  };

  //
  // TODO: allow reacticoon user to pass its own config here, by adding in the end of Object.assign
  // calls.
  // This config allows to:
  // - give webpack config overrides, to avoid using the `override` callback. Note: works for only
  //  few webpack config, only the one handled by Reacticoon, and described on the documentation
  //  TODO: link doc
  // - configure our following override (for example if we want to toggle features)
  //    - debugMode: true -> Will display the webpack configuration and quit
  //

  const configurators = [
    require("./configurators/auto-import"),
    require("./configurators/babel-plugins"),
    require("./configurators/webpack-aliases"),
    require("./configurators/webpack-plugins"),
    require("./configurators/env-vars"),
    require("./configurators/rewires"),
    require("./configurators/moduleScopePlugin"),
    require("./configurators/react-refresh/rewire-react-refresh")
  ];

  configurators.forEach(configurator => {
    configurator(config, env, options);
  });

  //
  // Other configurations, that does not belong to its own configurator
  //
  // override config.resolve.modules
  // we receive:
  //
  //   "modules": [
  //     "node_modules",
  //     "PATH_APP/node_modules"
  // ],
  //
  // the "node_modules" makes webpack to not find the app node_modules such as react

  //
  //
  //
  const reacticoonPluginsNodeModules = reacticoonPluginsList.map(
    reacticoonPlugin => reacticoonPlugin + "/node_modules"
  );

  config.resolve.modules = [
    reacticoonPaths.reacticoonNodeModules,
    reactScriptPaths.appNodeModules,
    "node_modules",
    ...reacticoonPluginsNodeModules
  ];

  //
  //
  //

  //
  // No config modification after this
  // TODO: if Reacticoon user gives a callback
  // verify it is a function
  // if (reacticoonUserConfig.override) {
  // config = reacticoonUserConfig.override(config, env)
  // }
  //

  // const rewireWorker = require('../rewire/react-app-rewire-worker')
  // bug: worker-loader import webpack/.. but does not find it
  // config = rewireWorker(config, env)

  // console.jsonDie(config);

  //
  // debug config
  //
  if (options.debugMode) {
    console.log("-------- config");
    console.log(JSON.stringify(config, null, 4));
    console.log("-------- plugins override configuration");
    console.log(JSON.stringify(pluginsOverridesDebugInfo, null, 4));
    console.log("-------- plugins override final");
    console.log(JSON.stringify(pluginsOverrides, null, 4));
    console.log("-------- reacticoon options");
    console.log(JSON.stringify(reacticoonOptions, null, 4));
    console.log("-------- final options");
    console.log(JSON.stringify(options, null, 4));
    console.log(
      "Switch off the debug by setting `debugMode` to false in config-overrides options"
    );
  }

  // do not put config here

  if (options.debugMode) {
    process.exit();
  }

  // do stuff with the webpack config...
  return () => config;
};
