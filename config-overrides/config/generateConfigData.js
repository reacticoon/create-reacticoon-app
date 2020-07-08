const merge = require("lodash/merge");

const reacticoonPaths = require("create-reacticoon-app/utils/paths");

// webpack imports

const defaultOptions = {
  enableSass: false,
  debugMode: false,
  autoImport: [],
  webpackAliases: {},
  env: {},
};

function generateConfigData(
  isEnvDev = true,
  isEnvTesting = false,
  webpackConfig,
  nodeEnv,
  reacticoonOptions,
  reacticoonWebpackOverride,
  retrievePluginsOverridesData = {}
) {
  const {
    pluginsOverrides = {},
    pluginsOverridesDebugInfo = {},
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
    if (process.env.NODE_ENV === "production") {
      __ENV__ = "production";
    } else {
      __ENV__ = "local";
    }
  }

  const reactScriptPaths = require(require.resolve(
    reacticoonPaths.scriptVersion + "/config/paths"
  ));

  const appPackageJson = require(reactScriptPaths.appPath + "/package.json");

  const reacticoonConfig = require(reacticoonPaths.projectConfiguration);

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
    reacticoonPaths.reacticoonSrc,
    // reacticoonPaths.reactRefresPath
  ].concat(
    reacticoonPluginsList.map((reacticoonPlugin) => {
      return reacticoonPlugin + "/src";
    })
  );

  //
  //
  //

  // add some data to our env
  const env = {
    isEnvDev,
    isEnvTesting,
    // reactScriptPaths,
    isEnvProduction: process.env.NODE_ENV === "production",
    includePaths,
    reacticoonPaths,
    appPackageJson,
    reacticoonConfig,
    __ENV__,
    __ENV_FILEPATH__,
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
  const RewireApi = require("./configurators/RewireApi");

  const configurators = [
    require("./configurators/env-vars"), // should be first, we add the env vars to our env data
    require("./configurators/auto-import"),
    require("./configurators/babel-plugins"),
    require("./configurators/webpack-aliases"),
    require("./configurators/webpack-plugins"),
    require("./configurators/rewires"),
    require("./configurators/moduleScopePlugin"),
    require("./configurators/react-refresh/rewire-react-refresh"),
    // TODO: only if env building extension
    require("./configurators/browser-extension-build"),
  ];

  configurators.forEach((configurator) => {
    const rewireApi = new RewireApi();
    configurator(rewireApi, webpackConfig, options, env);
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
    (reacticoonPlugin) => reacticoonPlugin + "/node_modules"
  );

  webpackConfig.resolve.modules = [
    reacticoonPaths.reacticoonNodeModules,
    reactScriptPaths.appNodeModules,
    "node_modules",
    ...reacticoonPluginsNodeModules,
  ];

  //
  //
  //

  // TODO:
  // https://github.com/stephencookdev/speed-measure-webpack-plugin
  // const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
  // const smp = new SpeedMeasurePlugin({
  //   disable: false // TODO: only on reacticoon dev mode
  // });

  // webpackConfig = smp.wrap(webpackConfig);

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
    console.log(JSON.stringify(webpackConfig, null, 4));
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

  const {
    getBabelLoader,
  } = require("create-reacticoon-app/config-overrides/utils/rewired");

  const configData = {
    webpackConfig,
    babelConfig: getBabelLoader(webpackConfig).options,
    options,
  };

  return configData;
}

module.exports = generateConfigData;
