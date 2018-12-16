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

// take overrides for the defined plugins. 
let pluginsOverrides = {}
const getReacticoonPluginsWithOverrides = require("../cli-utils/reacticoon-config/getReacticoonPluginsWithOverrides");

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
    return overridesFiles.concat(`${plugin.resolve}/${plugin.overrides}`);
  }, []);
}
const overridesFiles = getOverrides()

// We take the last plugin and spread, to allow the first defined plugin to have the priority.
overridesFiles.reverse().forEach(overridePath => {
  const override = loadOverrides(overridePath)
  pluginsOverrides = {
    ...pluginsOverrides,
    ...override,
  }
})

const webpack = createWebpackOverride(reacticoonOptions, reacticoonWebpack, pluginsOverrides);

const webpackLibrary = createWebpackLibraryOverride(
  reacticoonOptions,
  reacticoonWebpackLibrary,
  pluginsOverrides
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
