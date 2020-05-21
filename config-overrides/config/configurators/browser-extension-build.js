const find = require("lodash/find");
const filter = require("lodash/filter");
const paths = require("../../../utils/paths");

/**
 * Allows to build a browser extension using reacticoon.
 *
 * TODO: should be put on a cli-plugin, not directly on create-reacticoon-app
 */
function browserExtensionBuildConfigurator(api, config, options, env) {
  if (!env.BROWSER_EXTENSION_MODE) {
    return;
  }

  // https://itnext.io/create-chrome-extension-with-reactjs-using-inject-page-strategy-137650de1f39
  // https://github.com/satendra02/react-chrome-extension/issues/2
  // https://github.com/satendra02/react-chrome-extension/issues/2#issuecomment-460014828
  config.entry = {
    main: [
      // main instead of 'app' see https://github.com/satendra02/react-chrome-extension/issues/2#issuecomment-559533252
      // Include an alternative client for WebpackDevServer. A client's job is to
      // connect to WebpackDevServer by a socket and get notified about changes.
      // When you save a file, the client will either apply hot updates (in case
      // of CSS changes), or refresh the page (in case of JS changes). When you
      // make a syntax error, this client will display a syntax error overlay.
      // Note: instead of the default WebpackDevServer client, we use a custom one
      // to bring better experience for Create React App users. You can replace
      // the line below with these two lines if you prefer the stock client:
      // require.resolve('webpack-dev-server/client') + '?/',
      // require.resolve('webpack/hot/dev-server'),
      !env.isEnvProduction &&
        require.resolve("react-dev-utils/webpackHotDevClient"),
      // Finally, this is your app's code:
      paths.appIndexJs,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ].filter(Boolean),
    content: "./src/content.js",
  };
  // transform from "filename": "static/js/[name].[contenthash:8].js",
  // we need to remove the hash
  config.output.filename = "static/js/[name].js";

  config.optimization.runtimeChunk = false;
  // remove spitChunks config
  delete config.optimization.splitChunks;

  // update css
  // TODO: css is still generated with a hash
  config.plugins.forEach((plugin) => {
    if (
      plugin.options &&
      plugin.options.filename &&
      plugin.options.filename.endsWith(".css")
    ) {
      // "filename": "static/css/[name].[contenthash:8].css",
      plugin.options.filename = "static/css/[name].css";
      // "chunkFilename": "static/css/[name].[contenthash:8].chunk.css"
      plugin.options.chunkFilename = "static/css/[name].chunk.css";
    }
  });

  //
  // const fileLoader = function (conf) {
  //   return conf && conf.loader && conf.loader.indexOf("/css-loader/") !== -1;
  // };
  // const cssLoader = api.getLoader(config, fileLoader);

  // console.jsonDie(env);
  return config;
}

module.exports = browserExtensionBuildConfigurator;
