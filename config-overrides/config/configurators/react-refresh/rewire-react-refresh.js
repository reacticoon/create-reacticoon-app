//
// https://github.com/facebook/react/issues/16604
//
// https://github.com/pmmmwh/react-refresh-webpack-plugin//
const {
  injectBabelPlugin,
  injectWebpackPlugin
} = require("../../../utils/rewired");

// https://github.com/pmmmwh/react-refresh-webpack-plugin
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

function rewireReactRefresh(api, config, options, env) {
  if (!env.isDev) {
    return config;
  }

  config = injectBabelPlugin(
    [
      // https://github.com/pmmmwh/react-refresh-webpack-plugin
      // https://github.com/facebook/react/issues/16604
      require.resolve("react-refresh/babel"),
      {}
    ],
    config
  );

  // https://github.com/facebook/react/issues/16604
  // https://github.com/pmmmwh/react-refresh-webpack-plugin
  config = injectWebpackPlugin(new ReactRefreshWebpackPlugin(), config);

  return config;
}

module.exports = rewireReactRefresh;
