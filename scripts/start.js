// inspired by https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/scripts/start.js

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const paths = require("../utils/paths");
const overrides = require("../config-overrides");

const webpackConfigPath = paths.scriptVersion + "/config/webpack.config.dev";
const devServerConfigPath = paths.scriptVersion + "/config/webpackDevServer.config.js";

// load original configs
const webpackConfig = require(webpackConfigPath);
const devServerConfig = require(devServerConfigPath);

// debug
// console.log(paths)
// process.exit()

// override config in memory
require.cache[require.resolve(webpackConfigPath)].exports = overrides.webpack(
  webpackConfig,
  process.env.NODE_ENV
);

require.cache[
  require.resolve(devServerConfigPath)
].exports = overrides.devServer(devServerConfig, process.env.NODE_ENV);

// console.log(JSON.stringify(webpackConfig, null, 4))
// process.exit()

// run original script
try {
  require(paths.scriptVersion + "/scripts/start");
} catch (e) {
  console.error(e);
}
