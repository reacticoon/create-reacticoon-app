function webpackAliasesConfigurator(config, env, options) {
  const reacticoonPaths = env.reacticoonPaths;

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
    modules: reacticoonPaths.appSrc + "/modules",

    //
    // add alias to 'src/plugins'
    // Reacticoon recommand to use 'src/plugins' for the app custom plugins
    // This config allows to:
    // `import myPlugin from 'plugins/myPlugin'`
    //
    plugins: reacticoonPaths.appSrc + "/plugins",

    components: reacticoonPaths.appSrc + "/components",

    views: reacticoonPaths.appSrc + "/views",

    app: reacticoonPaths.appSrc + "/",

    // define the app-environment alias that points to the user configuration for the current env
    // by default it points to app/config/environment.js
    "app-environment": env.__ENV_FILEPATH__,

    // TODO: remove, temporary to use reacticoon from app/src/reacticoon since we does not compile it to
    // node_modules yet
    reacticoon: reacticoonPaths.reacticoonDir + "/src",

    // TODO: remove, temporary to use reacticoon from app/src/reacticoon since we does not compile it to
    // node_modules yet
    "reacticoon-plugins": reacticoonPaths.reacticoonPluginsDir,

    // Previously we were using classNames but replaced it with clsx following material-ui
    // (https://github.com/mui-org/material-ui/pull/14152)
    // We use this alias to force it to use clsx, thus reducing our build size
    // To test this, just remove the ./node_modules/classnames directory and start the dev server
    classnames: "clsx",

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
