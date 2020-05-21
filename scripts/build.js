// inspired by https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/scripts/start.js
const fs = require("fs");
const { info } = require("create-reacticoon-app/cli-utils");

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const ReacticoonChecks = require("../utils/ReacticoonChecks.js");
ReacticoonChecks.run(() => {
  const paths = require("../utils/paths");
  const overrides = require("../config-overrides");

  const webpackConfigPath = `${paths.scriptVersion}/config/webpack.config.js`;

  // load original config
  const webpackConfig = require(webpackConfigPath);
  // override config in memory
  require.cache[require.resolve(webpackConfigPath)].exports = overrides.webpack(
    webpackConfig("production"),
    process.env.NODE_ENV
  );

  // console.jsonDie(require.cache[require.resolve(webpackConfigPath)].exports())

  // run original script
  try {
    require(paths.scriptVersion + "/scripts/build");
  } catch (e) {
    console.error(e);
  }
});
