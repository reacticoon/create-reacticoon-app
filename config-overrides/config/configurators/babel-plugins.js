const { injectBabelPlugin } = require("../../utils/rewired");

function babelPluginsConfigurator(config, env, options) {
  // - react hot loader

  // TODO: remove react-hot-loader/ dir ?
  // const rewireReactHotLoader = require("./react-hot-loader/rewire-react-hot-loader");
  // config = rewireReactHotLoader(config, env);

  //
  // Config babel plugins
  // doc: https://github.com/timarney/react-app-rewired#utilities
  //

  const babelPlugins = [
    env.isDev && require.resolve("react-hot-loader/babel"),

    // add decoractors
    // Ex: @debug
    // class ...
    require.resolve("babel-plugin-transform-decorators-legacy"),
    // add trailing function commas
    // Ex: this.myFunc(
    //  a,
    //  b,
    //  c, <--
    // )
    require.resolve("babel-plugin-syntax-trailing-function-commas"),
    // transform the eventual for-of
    // for of is not supported on old browsers
    require.resolve("babel-plugin-transform-es2015-for-of"),

    // https://github.com/lodash/babel-plugin-lodash
    [
      require.resolve("babel-plugin-lodash"),
      {
        // This plugin is moving in a lib agnostic direction, to become a generic cherry-pick plugin
        // so babel-plugin-lodash is not limited to lodash. It can be used with recompose as well.
        // see https://github.com/acdlite/recompose
        // TODO: add reacticoon config to allow add more
        id: ["lodash", "recompose"]
      }
    ]
    // TODO: add
    // - react-app-rewire-poyfills
    // - react-app-rewire-eslint
    //
    // v2: Enable with config:
    // - react-app-rewire-less
    // - DONE. react-app-rewire-sass
  ].filter(Boolean);

  // inject the plugins
  babelPlugins.reverse().forEach(plugin => {
    config = injectBabelPlugin(plugin, config);
  });

  // webpack crash if there is null plugins
  config.plugins = config.plugins.filter(plugin => plugin != null);
}

module.exports = babelPluginsConfigurator;
