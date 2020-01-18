const {
  injectBabelPreset,
  injectBabelPlugin,
  injectWebpackPlugin,
  getBabelLoader,
  getLoader,
  getLoadersOneOf,
  injectLoaderOneOf,
  findResolvePlugin
} = require("create-reacticoon-app/config-overrides/utils/rewired");

const paths = require("create-reacticoon-app/utils/paths");
//

class RewireApi {
  injectBabelPreset() {
    return injectBabelPreset.apply(null, arguments);
  }

  injectBabelPlugin() {
    return injectBabelPlugin.apply(null, arguments);
  }

  injectWebpackPlugin() {
    return injectWebpackPlugin.apply(null, arguments);
  }

  getBabelLoader() {
    return getBabelLoader.apply(null, arguments);
  }

  getLoader() {
    return getLoader.apply(null, arguments);
  }

  getLoadersOneOf() {
    return getLoadersOneOf.apply(null, arguments);
  }

  injectLoaderOneOf() {
    return injectLoaderOneOf.apply(null, arguments);
  }

  findResolvePlugin() {
    return findResolvePlugin.apply(null, arguments);
  }

  getPaths() {
    return paths;
  }
}

module.exports = RewireApi;
