const path = require("path");
const paths = require("../../utils/paths");

const loaderNameMatches = function(rule, loader_name) {
  return (
    rule &&
    rule.loader &&
    typeof rule.loader === "string" &&
    (rule.loader.indexOf(`${path.sep}${loader_name}${path.sep}`) !== -1 ||
      rule.loader.indexOf(`@${loader_name}${path.sep}`) !== -1)
  );
};

const babelLoaderMatcher = function(rule) {
  return loaderNameMatches(rule, "babel-loader");
};

const getLoader = function(rules, matcher) {
  var loader;

  rules.some(rule => {
    return (loader = matcher(rule)
      ? rule
      : getLoader(rule.use || rule.oneOf || [], matcher));
  });

  return loader;
};

const getBabelLoader = function(rules) {
  return getLoader(rules, babelLoaderMatcher);
};

const injectBabelPlugin = function(pluginName, config) {
  const loader = getBabelLoader(config.module.rules);
  if (!loader) {
    console.log("babel-loader not found");
    return config;
  }
  // Older versions of webpack have `plugins` on `loader.query` instead of `loader.options`.
  const options = loader.options || loader.query;
  options.plugins = [pluginName].concat(options.plugins || []);
  return config;
};

const compose = function(...funcs) {
  if (funcs.length === 0) {
    return config => config;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (config, env) => a(b(config, env), env));
};

//
// Utility that add a babel preset to the babel-loader webpack config
// inspired by injectBabelPlugin (https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/index.js#L30)
//
const injectBabelPreset = function(presetName, config) {
  const loader = getBabelLoader(config.module.rules);
  if (!loader) {
    console.log("babel-loader not found");
    return config;
  }
  // Older versions of webpack have `plugins` on `loader.query` instead of `loader.options`.
  const options = loader.options || loader.query;
  options.presets = [presetName].concat(options.presets || []);
  return config;
};

module.exports = {
  injectBabelPreset,
  injectBabelPlugin,
  getLoader
};
