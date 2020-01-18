const find = require("lodash/find");

const getLoader = function(rulesParam, matcher) {
  var loader;

  let rules = rulesParam;
  // handle when rules given is `config`
  if (rules.module) {
    // First, try to find the babel loader inside the oneOf array.
    // This is where we can find it when working with react-scripts@2.0.3.
    rules = rulesParam.module.rules;
  }
  rules.some(rule => {
    return (loader = matcher(rule)
      ? rule
      : getLoader(rule.use || rule.oneOf || [], matcher));
  });

  return loader;
};

const getLoadersOneOf = config => {
  return config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
};

const injectLoaderOneOf = (config, loader) => {
  getLoadersOneOf(config).push(loader);
};

// Mostly inlined from within `customize-cra` https://www.npmjs.com/package/customize-cra
const getBabelLoader = config => {
  // Filtering out rules that don't define babel plugins.
  const babelLoaderFilter = rule =>
    rule.loader &&
    rule.loader.includes("babel") &&
    rule.options &&
    rule.options.plugins;

  // First, try to find the babel loader inside the oneOf array.
  // This is where we can find it when working with react-scripts@2.0.3.
  let loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf))
    .oneOf;

  let babelLoader = loaders.find(babelLoaderFilter);

  // If the loader was not found, try to find it inside of the "use" array, within the rules.
  // This should work when dealing with react-scripts@2.0.0.next.* versions.
  if (!babelLoader) {
    loaders = loaders.reduce((ldrs, rule) => ldrs.concat(rule.use || []), []);
    babelLoader = loaders.find(babelLoaderFilter);
  }
  return babelLoader;
};

const injectBabelPlugin = function(pluginName, config) {
  const loader = getBabelLoader(config);
  if (!loader) {
    console.log("babel-loader not found");
    return config;
  }
  // Older versions of webpack have `plugins` on `loader.query` instead of `loader.options`.
  const options = loader.options || loader.query;
  options.plugins = [pluginName].concat(options.plugins || []);
  return config;
};

//
// Utility that add a babel preset to the babel-loader webpack config
// inspired by injectBabelPlugin (https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/index.js#L30)
//
const injectBabelPreset = function(presetName, config) {
  const loader = getBabelLoader(config);
  if (!loader) {
    console.log("babel-loader not found");
    return config;
  }
  // Older versions of webpack have `plugins` on `loader.query` instead of `loader.options`.
  const options = loader.options || loader.query;
  options.presets = [presetName].concat(options.presets || []);
  return config;
};

const injectWebpackPlugin = (plugin, config) => {
  config.plugins.push(plugin);
  return config;
};

const findResolvePlugin = (config, finder) => {
  return find(config.resolve.plugins, finder);
};

module.exports = {
  injectBabelPreset,
  injectBabelPlugin,
  injectWebpackPlugin,
  getBabelLoader,
  getLoader,
  getLoadersOneOf,
  injectLoaderOneOf,
  findResolvePlugin
};
