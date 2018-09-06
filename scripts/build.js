// inspired by https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/scripts/start.js

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const ReacticoonChecks = require("../utils/ReacticoonChecks.js");
ReacticoonChecks.run(() => {
  const paths = require("../utils/paths");
  const overrides = require("../config-overrides");
  const webpackConfigPath = paths.scriptVersion + "/config/webpack.config.prod";

  // load original config
  const webpackConfig = require(webpackConfigPath);
  // override config in memory
  require.cache[require.resolve(webpackConfigPath)].exports = overrides.webpack(
    webpackConfig,
    process.env.NODE_ENV
  );
  // run original script
  require(paths.scriptVersion + "/scripts/build");
});
