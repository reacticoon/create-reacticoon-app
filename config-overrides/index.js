const paths = require("../utils/paths");

const scriptName = process.env.npm_lifecycle_event

const IS_START = scriptName === "start"
const IS_LIBRARY = scriptName === "build-library"

if (!IS_START && !IS_LIBRARY) {
  throw new Error("Invalid " + scriptName)
}

// load environment variables from .env files
// before overrides scripts are read
// TODO: test
require(paths.scriptVersion + "/config/env");

//
// App config overrides
//
let override = null;
try {
  override = require(paths.configOverrides);
} catch (a) {
  // do nothing, the reacticoon user don't have a custom `config-overrides`
  override = {};
}

const reacticoonOptions = override.options || {};

//
// Plugins overrides
//

const retrievePluginData = require("./utils/retrievePluginData")

const pluginData = retrievePluginData()

//
// Create webpack data
//

let webpack = null
let webpackLibrary = null
if (IS_START) {
  const createWebpackOverride = require("./config/webpack");

  const reacticoonWebpack =
    typeof override === "function"
      ? override
      : override.webpack || ((config, env) => config);

  webpack = createWebpackOverride(reacticoonOptions, reacticoonWebpack, pluginData);
} else if (IS_LIBRARY) {
  const createWebpackLibraryOverride = require("./config/webpackLibrary")

  const reacticoonWebpackLibrary =
    typeof override === "function"
      ? override
      : override.webpackLibrary || ((config, env) => config);

  webpackLibrary = createWebpackLibraryOverride(
    reacticoonOptions,
    reacticoonWebpackLibrary,
    pluginsOverrides
  )
}

if (override.devserver) {
  console.log(
    "Warning: `devserver` has been deprecated. Please use `devServer` instead as " +
      "`devserver` will not be used in the next major release."
  );
}

const devServer =
  override.devServer ||
  override.devserver ||
  (configFunction => (proxy, allowedHost) =>
    configFunction(proxy, allowedHost));

const jest = override.jest || (config => config);

// normalized overrides functions
module.exports = {
  webpack,
  webpackLibrary,
  devServer,
  jest
};
