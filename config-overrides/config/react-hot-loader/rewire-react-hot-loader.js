//
// https://github.com/gaearon/react-hot-loader
// yarn add react-hot-loader
//
// https://github.com/cdharris/react-app-rewire-hot-loader/blob/master/index.js#L4:1
//

const { injectBabelPlugin } = require("../../utils/rewired");
const paths = require("../../../utils/paths");

function rewireHotLoader(api, config, options, env) {
  if (env === "production") {
    return config;
  }

  config.module.rules[0].use[0].options.emitWarning = true;
  return injectBabelPlugin(
    [
      //paths.resolveReacticoon("react-hot-loader/babel")
    ],
    config
  );
}

module.exports = rewireHotLoader;
