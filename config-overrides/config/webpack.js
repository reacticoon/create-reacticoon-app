/**
 * This config allow overriding of the create-react-app config.
 *
 * see
 * - https://github.com/timarney/react-app-rewired
 * - https://github.com/facebook/create-react-app
 */

const generateConfigData = require("create-reacticoon-app/config-overrides/config/generateConfigData");

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
  const configData = generateConfigData(
    isDev,
    false,
    config,
    nodeEnv,
    reacticoonOptions,
    reacticoonWebpackOverride,
    retrievePluginsOverridesData
  );

  // do stuff with the webpack config...
  return () => configData.webpackConfig;
};
