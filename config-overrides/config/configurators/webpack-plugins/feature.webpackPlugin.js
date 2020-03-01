//
// https://webpack.js.org/plugins/define-plugin/
//
const DefinePlugin = require("webpack").DefinePlugin;
const isFunction = require("lodash/isFunction");
const isBoolean = require("lodash/isBoolean");
const map = require("lodash/map");

function getConfiguredFeatureFlags(env) {
  const api = {
    env
  };

  const features = {};

  const featuresFiles = [
    // TODO:
    // from app
    // from cli plugins
    // from ui plugins
    require("create-reacticoon-app/reacticoon-plugins/reacticoon-plugin-dev/src/config/features.js")
  ];

  featuresFiles.forEach(featureFile => {
    const pluginFeatures = isFunction(featureFile)
      ? featureFile(api)
      : featureFile;

    map(pluginFeatures, (value, key) => {
      if (!isBoolean(value)) {
        console.warn(`Feature flag ${key} value is not a boolean`);
      }
      // we want a booleaan
      features[key] = value === true;
    });
  });

  return features;
}

module.exports = env => {
  return new DefinePlugin({
    __DEV__: !env.isEnvProduction,
    __PROD__: !env.isEnvProduction,
    __TEST__: false, // TODO: handle
    // TODO: allow to configure on env, to allow heavy debug on "production" build.
    // TODO: allow plugins/project to add their own features on config.
    // force to true in __DEV__.
    FEATURE_REACTICOON_HEAVY_DEBUG: !env.isEnvProduction,
    FEATURE_USER_TIMING_API: !env.isEnvProduction,
    ...(getConfiguredFeatureFlags(env) || [])
  });
};
