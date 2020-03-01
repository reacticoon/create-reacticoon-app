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
    // TODO: better require
    // Reacticoon features are first to allow plugins overriding it, such as: FEATURE_REACTICOON_DEV_MODE.
    require("create-reacticoon-app/reacticoon/config/features"),

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
      // TODO: log when there is an override (e.g: FEATURE_REACTICOON_DEV_MODE can be override by plugins).
      // we want a boolean
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
    ...(getConfiguredFeatureFlags(env) || [])
  });
};
