const paths = require("../utils/paths");

// TODO: if build / build-library
const createWebpackOverride = require("./config/webpack");
const createWebpackLibraryOverride = require("./config/webpackLibrary")

// load environment variables from .env files
// before overrides scripts are read
require(paths.scriptVersion + "/config/env");

let override = null;
try {
  override = require(paths.configOverrides);
} catch (a) {
  // do nothing, the reacticoon user don't have a custom `config-overrides`
  override = {};
}

const reacticoonWebpack =
  typeof override === "function"
    ? override
    : override.webpack || ((config, env) => config);

const reacticoonWebpackLibrary =
  typeof override === "function"
    ? override
    : override.webpackLibrary || ((config, env) => config);

const reacticoonOptions = override.options || {};

const webpack = createWebpackOverride(reacticoonOptions, reacticoonWebpack);

const webpackLibrary = createWebpackLibraryOverride(
  reacticoonOptions,
  reacticoonWebpackLibrary
);

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
