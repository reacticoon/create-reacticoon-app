function webpackAliasesConfigurator(config, env, options) {
  const reactScriptPaths = env.reactScriptPaths;

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

    views: reactScriptPaths.appSrc + "/views",

    app: reactScriptPaths.appSrc + "/",

    // define the app-environment alias that points to the user configuration for the current env
    // by default it points to app/config/environment.js
    "app-environment": env.__ENV_FILEPATH__,

    // TODO: remove, temporary to use reacticoon from app/src/reacticoon since we does not compile it to
    // node_modules yet
    reacticoon: reactScriptPaths.appSrc + "/reacticoon/src",

    // add user option 'webpackAliases'. Allows the user to add webpackAliases on its
    // config/overrides.js
    ...options.webpackAliases
  };

  config.resolve.alias = Object.assign(
    {},
    config.resolve.alias,
    webpackAliases
  );
}

module.exports = webpackAliasesConfigurator;
