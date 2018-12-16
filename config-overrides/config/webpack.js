/**
 * This config allow overriding of the create-react-app config.
 *
 * see
 * - https://github.com/timarney/react-app-rewired
 * - https://github.com/facebook/create-react-app
 */

const reacticoonPaths = require("../../utils/paths");

const merge = require("lodash/merge")

const paths = require(require.resolve(
  reacticoonPaths.scriptVersion + "/config/paths"
));
const { injectBabelPreset, injectBabelPlugin } = require("../utils/rewired");

const git = require("../utils/git");

const appPackageJson = require(paths.appPath + "/package.json");

// webpack imports
const CircularDependencyPlugin = reacticoonPaths.requireReacticoon(
  "circular-dependency-plugin"
);

const defaultOptions = {
  enableSass: false,
  debugMode: false,
  autoImport: [],
  webpackAliases: {},
  env: {},
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

module.exports = createWebpackOverride = (reacticoonOptions, override, pluginData = {}) => (
  config,
  env
) => {
  const { pluginsOverrides = {}, pluginsOverridesDebugInfo = {} } = pluginData
  const options = merge({}, defaultOptions, pluginsOverrides.options, reacticoonOptions)

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
    // i18n tr
    {
      import: "{ tr }",
      from: "reacticoon/i18n",
      functionName: "tr"
    },
    // __DEV__
    // TODO: handle propertyName
    // {
    //   import: "{ __DEV__ }",
    //   from: "reacticoon/environment",
    //   propertyName: "__DEV__"
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

  // - react hot loader

  // TODO: remove react-hot-loader/ dir ?
  // const rewireReactHotLoader = require("./react-hot-loader/rewire-react-hot-loader");
  // config = rewireReactHotLoader(config, env);

  //
  // Config babel plugins
  // doc: https://github.com/timarney/react-app-rewired#utilities
  //

  const babelPlugins = [
    require.resolve("react-hot-loader/babel"),
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
  ];

  // inject the plugins
  babelPlugins.reverse().forEach(plugin => {
    config = injectBabelPlugin(plugin, config);
  });

  //
  // Add webpack aliases
  //
  const webpackAliases = {
    //
    // add alias to 'src/modules'
    // Reacticoon recommand to use 'src/modules' for the app modules
    // This config allows to:
    // `import myModule from 'modules/myModule'`
    //
    modules: paths.appSrc + "/modules",

    //
    // add alias to 'src/plugins'
    // Reacticoon recommand to use 'src/plugins' for the app custom plugins
    // This config allows to:
    // `import myPlugin from 'plugins/myPlugin'`
    //
    plugins: paths.appSrc + "/plugins",

    components: paths.appSrc + "/components",

    app: paths.appSrc + "/",

    // TODO: remove temporary:
    reacticoon: paths.appSrc + "/reacticoon/src",

    ...options.webpackAliases,
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
    __VERSION__: "" + appPackageJson.version,


    __REACTICOON_DOC_URL__: "https://reacticoon.netlify.com",

    __REACTICOON_GITHUB_ORGANISATION_URL__: "https://github.com/reacticoon",

    __REACTICOON_REPOSITORY_URL__: "https://github.com/reacticoon/reacticoon",

    ...options.env,
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
    envVars.__APP_GIT_BRANCH__ = null;
  }

  // transform env for webpack.
  // We need to stringify the env values
  // https://stackoverflow.com/questions/28145397/injecting-variables-into-webpack
  const finalVars = {}
  Object.keys(envVars).forEach(function (key) {
    finalVars[key] = JSON.stringify(envVars[key])
  })

  config.plugins[3].definitions["process.env"] = {
    ...config.plugins[3].definitions["process.env"],
    ...finalVars,
  }

  // webpack crash if there is null plugins
  config.plugins = config.plugins.filter(plugin => plugin != null)

  //
  // add our webpack plugins
  //

  // TODO: concat with Reacticoon user plugins config
  const webpackPlugins = [
    //
    // Webpack - CircularDependancy plugin
    // https://github.com/aackerman/circular-dependency-plugin
    //
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: true,
      // set to true to add errors to webpack instead of warnings
      failOnError: false,
      // `onDetected` is called for each module that is cyclical
      onDetected(props = {}) {
        if (!props) {
          return;
        }
        const { module: webpackModuleRecord, paths, compilation } = props;
        let errorMsg = "Circular dependency detected:\n";

        paths.forEach(path => {
          errorMsg += "-> " + path + "\n";
        });

        // `paths` will be an Array of the relative module paths that make up the cycle
        // `module` will be the module record generated by webpack that caused the cycle
        compilatio.warnings.push(new Error(errorMsg));
      }
    })
  ];

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
  //
  //

  //
  // No config modification after this
  // TODO: if Reacticoon user gives a callback
  // verify it is a function
  // if (reacticoonUserConfig.override) {
  // config = reacticoonUserConfig.override(config, env)
  // }
  //

  if (options.enableSass) {
    const rewireSass = require("../rewire/react-app-rewire-sass");
    config = rewireSass(config, env);
  }

  //
  // debug config
  //
  if (options.debugMode) {
    console.log("-------- config");
    console.log(JSON.stringify(config, null, 4));
    console.log("-------- plugins override configuration");
    console.log(JSON.stringify(pluginsOverridesDebugInfo, null, 4))
    console.log("-------- plugins override final");
    console.log(JSON.stringify(pluginsOverrides, null, 4))
    console.log("-------- reacticoon options");
    console.log(JSON.stringify(reacticoonOptions, null, 4))
    console.log("-------- final options");
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
