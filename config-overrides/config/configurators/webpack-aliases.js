const path = require("path");

function webpackAliasesConfigurator(api, config, options, env) {
  const reacticoonPaths = env.reacticoonPaths;

  const reacticoonPluginsAliases = {};

  reacticoonPaths.reacticoonPluginsList.forEach(reacticoonPluginPath => {
    reacticoonPluginsAliases[
      path.basename(reacticoonPluginPath)
    ] = `${reacticoonPluginPath}/src`;
  });

  // TODO: check __ENV_FILEPATH__ exists before start / build
  if (!env.__ENV_FILEPATH__) {
    console.error('missing __ENV_FILEPATH__')
    process.exit()
  }
  // console.log({filepath: env.__ENV_FILEPATH__ }) 
  // die();

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

    // TODO: remove, temporary to use import to reacticoon plugins
    ...reacticoonPluginsAliases,

    // Previously we were using classNames but replaced it with clsx following material-ui
    // (https://github.com/mui-org/material-ui/pull/14152)
    // We use this alias to force it to use clsx, thus reducing our build size
    // To test this, just remove the ./node_modules/classnames directory and start the dev server
    classnames: "clsx",

    "react-refresh": reacticoonPaths.reactRefreshPath,

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
