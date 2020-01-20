const isFunction = require("lodash/isFunction");
const paths = require("../utils/paths");

const scriptName = process.env.scriptName;

const IS_DEV = scriptName === "start";
const IS_BUILD = scriptName === "build";
const IS_LIBRARY = scriptName === "build-library";
const IS_TESTING =
  scriptName === "test" ||
  scriptName === "test:integration" ||
  scriptName === "test:coverage";

if (!IS_DEV && !IS_LIBRARY && !IS_BUILD && !IS_TESTING) {
  throw new Error("Invalid " + scriptName);
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

// allow override to be a function, receives an isDev parameter.
const reacticoonOptions = isFunction(override)
  ? override(IS_DEV).options
  : override.options || {};

//
// Plugins overrides
//

const retrievePluginsOverridesData = require("./utils/retrievePluginsOverridesData");

const pluginOverridesData = retrievePluginsOverridesData(IS_DEV);

//
// Create webpack data
//
const createWebpackOverride = require("./config/webpack");

const reacticoonWebpackOverride =
  typeof override === "function"
    ? override
    : override.webpack || ((config, env) => config);

let webpack = null;
// let webpackLibrary = null;
if (IS_DEV || IS_BUILD) {
  webpack = createWebpackOverride(
    IS_DEV,
    reacticoonOptions,
    reacticoonWebpackOverride,
    pluginOverridesData
  );
}
// else if (IS_LIBRARY) {
//   const createWebpackLibraryOverride = require("./config/webpackLibrary");

//   const reacticoonWebpackLibrary =
//     typeof override === "function"
//       ? override
//       : override.webpackLibrary || ((config, env) => config);

//   webpackLibrary = createWebpackLibraryOverride(
//     IS_DEV,
//     reacticoonOptions,
//     reacticoonWebpackLibrary,
//     pluginsOverrides
//   );
// }

if (override.devserver) {
  console.log(
    "Warning: `devserver` has been deprecated. Please use `devServer` instead as " +
      "`devserver` will not be used in the next major release."
  );
}

const devServer = configFunction => (proxy, allowedHost) => {
  //https://sourcegraph.com/github.com/facebook/create-react-app@master/-/blob/packages/react-scripts/config/webpackDevServer.config.js#L113
  const defaultConfig = configFunction(proxy, allowedHost);

  const config = {
    ...defaultConfig,
    // headers: {
    //   "Access-Control-Allow-Origin": "*",
    //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    //   "Access-Control-Allow-Headers":
    //     "X-Requested-With, content-type, Authorization"
    // },

    before: function(app, server) {
      // const cors = require("cors");

      // enable CORS
      // app.use(cors());

      defaultConfig.before(app, server);
    }
  };

  const devServerOverride = override.devServer || override.devserver;
  if (devServerOverride) {
    return devServerOverride(config);
  }
  return config;
};

let jest = null;

if (IS_TESTING) {
  const createJestOverride = require("./config/jest");
  jest = createJestOverride(
    IS_TESTING,
    reacticoonOptions,
    reacticoonWebpackOverride,
    pluginOverridesData
  );
}

// normalized overrides functions
module.exports = {
  webpack,
  // webpackLibrary,
  devServer,
  jest
};
