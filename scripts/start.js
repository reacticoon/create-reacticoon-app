// inspired by https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/scripts/start.js
const isNil = require("lodash/isNil");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const ReacticoonChecks = require("../utils/ReacticoonChecks.js");
ReacticoonChecks.run(() => {
  const paths = require("../utils/paths");
  const overrides = require("../config-overrides");

  const webpackConfigPath = `${paths.scriptVersion}/config/webpack.config.js`;

  const devServerConfigPath =
    paths.scriptVersion + "/config/webpackDevServer.config.js";

  // load original configs
  const webpackConfig = require(webpackConfigPath);

  if (isNil(webpackConfig)) {
    console.error(`Could not found webpackConfig on ${webpackConfigPath}`);
    process.exit();
  }

  const devServerConfig = require(devServerConfigPath);


  //
  // Open browser override
  // By default react-scripts open the website url on the browser. This can be annoying, so we
  // override the behaviour by making it optional
  //
  const openBrowser = require("react-dev-utils/openBrowser");
  const openBrowserMiddleware = url => {
    // TODO: add option to open url on browser or not. Default: open
    // openBrowser(url)
  };

  require.cache[
    require.resolve("react-dev-utils/openBrowser")
  ].exports = openBrowserMiddleware;

  // debug
  // console.log(paths)
  // process.exit()

  // override config in memory
  require.cache[require.resolve(webpackConfigPath)].exports = overrides.webpack(
    webpackConfig("development"),
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
});
