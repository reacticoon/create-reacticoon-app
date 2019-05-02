/**
 * This config allow overriding of the create-react-app config.
 *
 * see
 * - https://github.com/timarney/react-app-rewired
 * - https://github.com/facebook/create-react-app
 */

const forEach = require("lodash/forEach");
const reacticoonPaths = require("../../utils/paths");

const merge = require("lodash/merge");

const reactScriptPaths = require(require.resolve(
  reacticoonPaths.scriptVersion + "/config/paths"
));
const { injectBabelPreset, injectBabelPlugin } = require("../utils/rewired");

const git = require("../utils/git");

const appPackageJson = require(reactScriptPaths.appPath + "/package.json");

// webpack imports
const CircularDependencyPlugin = reacticoonPaths.requireReacticoon(
  "circular-dependency-plugin"
);

const defaultOptions = {
  enableSass: false,
  debugMode: false,
  autoImport: [],
  webpackAliases: {},
  env: {}
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

module.exports = createWebpackOverride = (
  isDev,
  reacticoonOptions,
  override,
  pluginData = {}
) => (config, env) => {
  const { pluginsOverrides = {}, pluginsOverridesDebugInfo = {} } = pluginData;
  const options = merge(
    {},
    defaultOptions,
    pluginsOverrides.options,
    reacticoonOptions
  );

  const __DEV__ = process.env.NODE_ENV !== "production";
  const __PROD__ = process.env.NODE_ENV === "production";

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
    }
    // __DEV__
    // TODO: handle propertyName
    // {
    //   import: "{ __DEV__ }",
    //   from: "reacticoon/environment",
    //   propertyName: "__DEV__"
    // }
  ]
    .concat(options.autoImport || [])
    .filter(Boolean);

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
    isDev && require.resolve("react-hot-loader/babel"),

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

  function getEnvFilepath(__ENV__) {
    const defaultCustomEnvironmentFilePath =
      reactScriptPaths.appSrc + "/config/environment";
    let filePath = defaultCustomEnvironmentFilePath;

    try {
      const envCustomEnvironmentFilePath =
        defaultCustomEnvironmentFilePath + "." + __ENV__;
      require.resolve(envCustomEnvironmentFilePath);
      // file exists since there is no expection
      filePath = envCustomEnvironmentFilePath;
    } catch (e) {
      // ignore, no custom configuration file
    }

    return filePath.replace(`${reactScriptPaths.appSrc}`, "app");
  }

  // allow to define user env using the __ENV__ variable
  // by default we use 'local' for local development, and
  let __ENV__ = process.env.__ENV__;
  if (!__ENV__) {
    if (__PROD__) {
      __ENV__ = "production";
    } else {
      __ENV__ = "local";
    }
  }

  const __ENV_FILEPATH__ = getEnvFilepath(__ENV__);

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
    modules: reactScriptPaths.appSrc + "/modules",

    //
    // add alias to 'src/plugins'
    // Reacticoon recommand to use 'src/plugins' for the app custom plugins
    // This config allows to:
    // `import myPlugin from 'plugins/myPlugin'`
    //
    plugins: reactScriptPaths.appSrc + "/plugins",

    components: reactScriptPaths.appSrc + "/components",

    app: reactScriptPaths.appSrc + "/",

    // define the app-environment alias that points to the user configuration for the current env
    // by default it points to app/config/environment.js
    "app-environment": __ENV_FILEPATH__,

    // TODO: remove temporary:
    reacticoon: reactScriptPaths.appSrc + "/reacticoon/src",

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

  // only add env variables that begin with 'REACTICOON_APP__'.
  // Any other variables except NODE_ENV will be ignored to avoid accidentally exposing a private
  // key on the machine that could have the same name. Changing any environment variables will
  // require you to restart the development server if it is running.
  const processEnvReacticoonVars = {};
  forEach(process.env, (value, varName) => {
    if (varName.startsWith("REACTICOON_APP__")) {
      const varNameSmall = varName.replace("REACTICOON_APP__", "");
      processEnvReacticoonVars[varNameSmall] = value;
    }
  });

  const envVars = {
    ...processEnvReacticoonVars,

    //
    // Some vars about the environment
    //
    __DEV__,
    __PROD__,

    //
    // retrieve the current app version from the package.json file
    //
    __VERSION__: appPackageJson.version,

    __REACTICOON_DOC_URL__: "https://reacticoon.netlify.com",

    __REACTICOON_GITHUB_ORGANISATION_URL__: "https://github.com/reacticoon",

    __REACTICOON_REPOSITORY_URL__: "https://github.com/reacticoon/reacticoon",

    __ENV__,

    __ENV_FILEPATH__,

    ...options.env
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
  const finalEnvVars = {};
  Object.keys(envVars).forEach(function(key) {
    finalEnvVars[key] = JSON.stringify(envVars[key]);
  });

  // TODO: better way
  const proccessEnvIndex = isDev ? 3 : 2;
  config.plugins[proccessEnvIndex].definitions["process.env"] = {
    ...config.plugins[proccessEnvIndex].definitions["process.env"],
    ...finalEnvVars
  };

  // webpack crash if there is null plugins
  config.plugins = config.plugins.filter(plugin => plugin != null);

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

  config.resolve.modules = [reactScriptPaths.appNodeModules, "node_modules"];

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

  const rewireEslint = require("../rewire/react-app-rewire-eslint");
  config = rewireEslint(config, env);

  //
  // debug config
  //
  if (options.debugMode) {
    console.log("-------- config");
    console.log(JSON.stringify(config, null, 4));
    console.log("-------- plugins override configuration");
    console.log(JSON.stringify(pluginsOverridesDebugInfo, null, 4));
    console.log("-------- plugins override final");
    console.log(JSON.stringify(pluginsOverrides, null, 4));
    console.log("-------- reacticoon options");
    console.log(JSON.stringify(reacticoonOptions, null, 4));
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
