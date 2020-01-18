/**
 * This config allow overriding of the create-react-app webpack config to handle library build.
 *
 * See also './webpack.js'.
 *
 * - https://github.com/DimiMikadze/create-react-library
 */
const reacticoonPaths = require("../../utils/paths");
const find = require("lodash/find");

const webpack = reacticoonPaths.requireApp("webpack");

const paths = require(require.resolve(
  reacticoonPaths.scriptVersion + "/config/paths"
));
const { injectBabelPreset, injectBabelPlugin } = require("../utils/rewired");

const git = require("../utils/git");

const appPackageJson = require(paths.appPath + "/package.json");

const defaultOptions = {
  debugMode: false,
  autoImport: [],
  webpackAliases: {}
};

//
// The reacticoon user can override the config too
// see https://github.com/timarney/react-app-rewired
// The user config file can exports an `override` function (such as the one below)
// This function documentation can be found at https://github.com/timarney/react-app-rewired
//
// const reacticoonUserConfig = require('USER_APP_DIR/config-overrides.js')

// reacticoonConfig:
// - enableSass
// - autoImport

module.exports = createWebpackLibraryOverride = (
  isDev,
  reacticoonOptions,
  override
) => (config, env) => {
  const options = { ...defaultOptions, ...reacticoonOptions };

  //
  // TODO: allow reacticoon user to pass its own config here, by adding in the end of Object.assign
  // calls.
  // This config allows to:
  // - give webpack config overrides, to avoid using the `override` callback. Note: works for only
  //  few webpack config, only the one handled by Reacticoon, and described on the documentation
  //  TODO: link doc
  // - configure our following override (for example if we want to toggle features)
  //    - debugMode: true -> Will display the webpack configuration and quit
  //

  //
  // -- auto import
  //

  const autoImportConfig = [
    // __DEV__
    // TODO: handle propertyName
    // {
    //   import: "{ __DEV__ }",
    //   from: "reacticoon/environment",
    //   propertyName: "__DEV__"
    // }
    // TODO: move to reacticoon config/overrides
    // react-hot-loader
    // since the react-hot-loader is on our create-reacticoon-app node modules, we make it available
    // globally
    // {
    //   import: "{ hot }",
    //   from: reacticoonPaths.resolveReacticoon("react-hot-loader"),
    //   functionName: "hot"
    // }
  ].concat(options.autoImport || []);

  const rewireAutoImport = require("./auto-import/rewire-auto-import");
  config = rewireAutoImport(config, env, autoImportConfig);

  //
  // Config babel pressets
  // https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/index.js#L14:7
  //
  const babelPresets = [require.resolve("babel-preset-stage-1")];

  // inject the presets
  babelPresets.reverse().forEach(preset => {
    config = injectBabelPreset(preset, config);
  });

  //
  // Config babel plugins
  // doc: https://github.com/timarney/react-app-rewired#utilities
  //

  const babelPlugins = [
    // Compile export default to ES2015
    require.resolve("@babel/plugin-proposal-export-default-from"),

    // add decoractors
    // require.resolve("babel-plugin-transform-decorators-legacy"),
    // Compile class and object decorators to ES5
    [require.resolve("@babel/plugin-proposal-decorators"), { legacy: true }],
    // This plugin transforms static class properties as well as properties declared with the property initializer syntax
    [
      require.resolve("@babel/plugin-proposal-class-properties"),
      { loose: true }
    ],

    // https://github.com/lodash/babel-plugin-lodash
    [
      require.resolve("babel-plugin-lodash"),
      {
        // This plugin is moving in a lib agnostic direction, to become a generic cherry-pick plugin
        // so babel-plugin-lodash is not limited to lodash. It can be used with recompose as well.
        // see https://github.com/acdlite/recompose
        id: ["lodash", "recompose"]
      }
    ]
    // // add trailing function commas
    // // Ex: this.myFunc(
    // //  a,
    // //  b,
    // //  c, <--
    // // )
    // require.resolve("babel-plugin-syntax-trailing-function-commas"),
    // // transform the eventual for-of
    // // for of is not supported on old browsers
    // require.resolve("babel-plugin-transform-es2015-for-of"),

    // // https://github.com/lodash/babel-plugin-lodash
    // [
    //   require.resolve("babel-plugin-lodash"),
    //   {
    //     // This plugin is moving in a lib agnostic direction, to become a generic cherry-pick plugin
    //     // so babel-plugin-lodash is not limited to lodash. It can be used with recompose as well.
    //     // see https://github.com/acdlite/recompose
    //     // TODO: add reacticoon config to allow add more
    //     id: ["lodash", "recompose"]
    //   }
    // ]
    // TODO: add
    // - react-app-rewire-poyfills
    // - react-app-rewire-eslint
  ];

  console.jsonDie(babelPlugins);

  // inject the plugins
  babelPlugins.reverse().forEach(plugin => {
    config = injectBabelPlugin(plugin, config);
  });

  //
  // Add webpack aliases
  //
  const webpackAliases = {
    // TODO: rename?
    app: paths.appSrc + "/",

    // TODO: move to reacticoon config override
    reacticoon: paths.appSrc + "/",

    ...options.webpackAliases
  };

  config.resolve.alias = Object.assign(
    {},
    config.resolve.alias,
    webpackAliases
  );
  // -- end babel plugins

  //
  // add env vars.
  // Accessible on the app via `process.env`
  // Those variables can be retrieved via `reacticoon/environment`
  //
  const envVars = {
    //
    // Some vars about the environment
    //
    __DEV__: process.env.NODE_ENV !== "production",
    __PROD__: process.env.NODE_ENV === "production",

    //
    // retrieve the current app version from the package.json file
    //
    __VERSION__: appPackageJson.version
  };

  //
  // Sometimes, the package.json version is not updated by the user
  // we add the commit info to help error reporting
  // The project can be not `git init` yet, so we need to try catch eventual missing info.
  //
  try {
    const lastAppComCommit = git.lastAppCommit();
    envVars.__APP_GIT_COMMIT__ = lastAppComCommit;
  } catch (e) {
    envVars.__APP_GIT_COMMIT__ = null;
  }
  try {
    const currentProjectBranch = git.currentProjectBranch();
    envVars.__APP_GIT_BRANCH__ = currentProjectBranch;
  } catch (e) {
    envVars.__APP_GIT_COMMIT__ = null;
  }

  // --> move from replacements to
  config.plugins[0].replacements = Object.assign(
    {},
    config.plugins[0].replacements,
    envVars
  );

  //
  // add our webpack plugins
  //

  // TODO: concat with Reacticoon user plugins config
  const webpackPlugins = [];

  // TODO:
  // config.plugins = config.plugins.concat(webpackPlugins);

  // override config.resolve.modules
  // we receive:
  //
  //   "modules": [
  //     "node_modules",
  //     "PATH_APP/node_modules"
  // ],
  //
  // the "node_modules" makes webpack to not find the app node_modules such as react

  config.resolve.modules = [paths.appNodeModules, "node_modules"];

  //
  // CRL updates, see https://github.com/DimiMikadze/create-react-library/blob/master/config/webpack.config.prod.js
  //

  // CRL: library index file instead of app index

  // Mode 1: Allows to create a library with all the sources in index.js
  // config.entry = [reacticoonPaths.appLibIndexJs];

  // Mode 2: We want to reproduce the file architecture to allows import from '/dir'
  // https://github.com/webpack/docs/wiki/configuration#entry
  const modules = [
    // root index.js
    // "./", force access to directory
    "action",
    "api",
    "archi",
    "environment",
    "event",
    "format",
    "i18n",
    "middleware",
    "module",
    "plugin",
    "reducer",
    "routing",
    "selector",
    "store",
    "view"
  ];

  config.entry = {};
  modules.forEach(moduleName => {
    // handle "./" specific path
    const key = moduleName === "./" ? "index" : moduleName;
    config.entry[key] = "./src/" + moduleName + "/index.js";
  });

  // CRL: Updated whole block with library specific info
  config.output = {
    path: reacticoonPaths.libDir,
    filename: "[name].js",
    // library: '',
    // libraryTarget: "umd"
    // https://webpack.js.org/configuration/output/#output-librarytarget
    libraryTarget: "commonjs"
  };

  // update rules
  config.module.rules = config.module.rules.map(rule => {
    if (rule.enforce === "pre") {
      // CRL: updated with library src folder
      rule.include = paths.appLibSrc;
    }

    if (rule.oneOf) {
      const mediaRule = rule.oneOf[0];

      mediaRule.options.outputPath = "media/";
      mediaRule.options.publicPath = "../";

      const fileRule = find(
        rule.oneOf,
        subRule => subRule.loader.indexOf("file-loader") !== -1
      );
      fileRule.options.outputPath = "media/";
      fileRule.options.publicPath = "../";

      const babelRule = find(
        rule.oneOf,
        subRule => subRule.loader.indexOf("babel-loader") !== -1
      );
      // CRL: updated with library src folder
      babelRule.include = paths.appLibSrc;
    }
    return rule;
  });

  const libraryDependencies = appPackageJson.dependencies;

  // CRL: added externals block for library
  config.externals = {
    react: "react",
    "react-dom": "react-dom",
    ...libraryDependencies
  };

  // remove plugin app
  // TODO: use find index
  delete config.plugins[1];
  delete config.plugins[5]; // asset-manifest
  delete config.plugins[6]; // sw-precache-webpack-plugin

  // https://medium.com/@adamrackis/vendor-and-code-splitting-in-webpack-2-6376358f1923
  const createLibraryPlugins = [
    // new BundleAnalyzerPlugin({
    //   analyzerMode: "static"
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: "node-static",
    //   filename: "static.js",
    //   minChunks(module, count) {
    //     var context = module.context;
    //     return context && context.indexOf("node_modules") >= 0;
    //   }
    // })
  ];

  config.plugins = config.plugins.concat(createLibraryPlugins);

  // webpack crash if there is null plugins
  config.plugins = config.plugins.filter(plugin => plugin != null);

  //
  // No config modification after this
  // TODO: if Reacticoon user gives a callback
  // verify it is a function
  // if (reacticoonUserConfig.override) {
  // config = reacticoonUserConfig.override(config, env)
  // }
  //

  //
  // debug config
  //
  if (options.debugMode) {
    console.log("-------- config");
    console.log(JSON.stringify(config, null, 4));
    console.log("-------- options");
    console.log(JSON.stringify(options, null, 4));
    console.log(
      "Switch off the debug by setting `debugMode` to false in config-overrides options"
    );
  }

  // do not put config here

  if (options.debugMode) {
    process.exit();
  }

  // do stuff with the webpack config...
  return config;
};
