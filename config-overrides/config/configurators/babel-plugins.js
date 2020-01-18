const { injectBabelPlugin, getBabelLoader } = require("../../utils/rewired");

function babelPluginsConfigurator(config, env, options) {
  // modify babel to include all our code paths
  getBabelLoader(config).include = env.includePaths;

  // - react hot loader

  //
  // Config babel plugins
  // doc: https://github.com/timarney/react-app-rewired#utilities
  //

  const babelPlugins = [
    // Babel plugin to prune unused/unreachable imports
    // https://github.com/rtsao/babel-plugin-transform-prune-unused-imports
    [
      require.resolve("babel-plugin-transform-prune-unused-imports"),
      {
        truthyExpressions: env.isDev ? ["__DEV__"] : ["__PROD__"]
      }
    ],

    // Compile export default to ES2015
    // require.resolve("@babel/plugin-proposal-export-default-from"),

    // add decoractors
    // require.resolve("babel-plugin-transform-decorators-legacy"),
    // Compile class and object decorators to ES5
    // [require.resolve("@babel/plugin-proposal-decorators"), { legacy: true }],

    // This plugin transforms static class properties as well as properties declared with the property initializer syntax
    [
      require.resolve("@babel/plugin-proposal-class-properties"),
      { loose: true }
    ],

    // require.resolve("babel-plugin-syntax-trailing-function-commas"),

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

  // console.jsonDie(babelPlugins);

  // inject the plugins
  // reverse because inject put it on top of the array
  babelPlugins.reverse().forEach(plugin => {
    injectBabelPlugin(plugin, config);
  });

  // webpack crash if there is null plugins
  // config.plugins = config.plugins.filter(Boolean);

  // console.jsonDie(config);
}

module.exports = babelPluginsConfigurator;
