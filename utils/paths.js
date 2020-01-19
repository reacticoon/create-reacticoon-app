var path = require("path");
var fs = require("fs");

// We put this here since this file is imported from almost everywhere.
// TODO: maybe there is a better place to put it.
console.json = obj => console.log(JSON.stringify(obj, null, 2));
console.jsonDie = obj => {
  console.json(obj);
  console.trace();
  process.exit();
};

const isTesting = process.env.NODE_ENV === "test";

//Allow custom overrides package location
const projectDir = isTesting
  ? "" // TODO:
  : path.resolve(fs.realpathSync(process.cwd()));
var config_overrides = projectDir + "/config/overrides.js";
const co_index = process.argv.indexOf("--config-overrides");

if (co_index > -1 && co_index + 1 <= process.argv.length) {
  config_overrides = path.resolve(process.argv[co_index + 1]);
  process.argv.splice(co_index, 2);
}

//
//
//

const createReacticoonApp = path.resolve(__dirname, "../");

const createReacticoonAppNodeModules = path.resolve(
  createReacticoonApp + "/node_modules"
);
let createReacticoonAppReactScripts = null;
try {
  createReacticoonAppReactScripts = path.resolve(
    `${createReacticoonAppNodeModules}/react-scripts`
  );
} catch (e) {
  // TODO: tutorial to install create-reacticoon-app node_modules
  console.info("react-scripts are not installed.");
  console.error(e);
  process.exit();
}

//
//
//
let reacticoonDir = null;
try {
  // TODO: remove after tests, for now we put reacticoon on project src
  reacticoonDir = path.resolve(`${createReacticoonApp}/reacticoon`);
} catch (e) {
  console.info(`Could not find reacticoon.`); // TODO: tutorial to install reacticoon
  console.error(e);
  process.exit();
}
const reacticoonNodeModules = path.join(reacticoonDir, "node_modules");

let reacticoonPluginsDir = null;
try {
  reacticoonPluginsDir = path.resolve(
    `${createReacticoonApp}/reacticoon-plugins`
  );
} catch (e) {
  console.info(`Could not find reacticoon-plugins.`); // TODO: tutorial to install reacticoon-plugins
  console.error(e);
  process.exit();
}

let reacticoonCliPluginsDir = null;
try {
  reacticoonCliPluginsDir = path.resolve(
    `${createReacticoonApp}/reacticoon-cli-plugins`
  );
} catch (e) {
  console.info(`Could not find reacticoon-cli-plugins.`); // TODO: tutorial to install reacticoon-plugins
  console.error(e);
  process.exit();
}

// TODO: automatic discover
const reacticoonPluginsList = [
  `${reacticoonPluginsDir}/reacticoon-flash-messages`,
  `${reacticoonPluginsDir}/reacticoon-form`,
  `${reacticoonPluginsDir}/reacticoon-hibp`,
  `${reacticoonPluginsDir}/reacticoon-history`,
  `${reacticoonPluginsDir}/reacticoon-material-ui`,
  `${reacticoonPluginsDir}/reacticoon-plugin-example`,
  `${reacticoonPluginsDir}/reacticoon-plugin-logger`,
  `${reacticoonPluginsDir}/reacticoon-plugin-sentry`,
  `${reacticoonPluginsDir}/reacticoon-validation`,
  `${reacticoonPluginsDir}/reacticoon-dev-plugin`,
  `${reacticoonPluginsDir}/reacticoon-mock-api-plugin`,
  `${reacticoonPluginsDir}/reacticoon-testing-plugin`,
  `${reacticoonPluginsDir}/reacticoon-plugins-marketplace-plugin`,
  `${reacticoonPluginsDir}/reacticoon-plugin-ci`,
  `${reacticoonPluginsDir}/reacticoon-plugin-git`,
  `${reacticoonPluginsDir}/reacticoon-plugin-lighthouse`,
  `${reacticoonPluginsDir}/reacticoon-plugin-bundle-stats`
];

// TODO: automatic discover
const getOfficialPluginsList = require("../cli-utils/pluginResolution")
  .getOfficialPluginsList;
const reacticoonCliPluginsList = getOfficialPluginsList().map(
  pluginName => `${reacticoonCliPluginsDir}/${pluginName}`
);

const appNodeModules = `${projectDir}/node_modules/`;

const scriptVersion = createReacticoonAppReactScripts || "react-scripts";
const modulePath = isTesting
  ? ""
  : path.join(require.resolve(`${scriptVersion}/package.json`), "..");

// const rewiredScript =  path.join(
// require.resolve(`${appNodeModules}/react-app-rewired/package.json`),
// require.resolve(`react-app-rewired/package.json`),
// '..'
// );

// TODO: isTesting
const paths = isTesting ? {} : require(modulePath + "/config/paths");

//
//
//

const moduleAlias = require("module-alias");

//
// Register alias
//

moduleAlias.addAliases({
  // add alias for our cli plugins, to easily find create-reacticoon-app
  "create-reacticoon-app": createReacticoonApp
});

//
//
//

const finalPaths = Object.assign(
  {
    projectDir,
    projectConfiguration: `${projectDir}/config/reacticoon.json`,
    projectSrc: projectDir + "/src",
    projectBuild: projectDir + "/build",
    projectBuildInfoFile: projectDir + "/build/reacticoon-build-info.json",
    libDir: projectDir + "/lib",
    createReacticoonApp,

    appNodeModules,
    appLibIndexJs: projectDir + "/src/index.js",

    //
    //
    //
    reacticoonDir,
    reacticoonSrc: `${reacticoonDir}/src`,
    reacticoonNodeModules,

    reacticoonPluginsDir,
    reacticoonPluginsList,

    reacticoonCliPluginsDir,
    reacticoonCliPluginsList,

    //
    //
    //

    reactRefreshPath: createReacticoonApp + "/node_modules/react-refresh",

    //
    //
    //

    // TODO: rename to reactScripts
    scriptVersion: modulePath,
    // rewiredScript,
    configOverrides: config_overrides,

    requireApp: path => {
      return require(appNodeModules + "/" + path);
    },

    requireReacticoon: path => {
      // TODO: update. When installed via npm, the depencencies are not in ./node_modules but in
      // the project node_modules ("../")
      let lib = null;
      try {
        lib = require(createReacticoonApp + "/../" + path);
      } catch (e) {
        lib = require(createReacticoonApp + "/node_modules/" + path);
      }
      return lib;
    },

    resolveReacticoon: path => {
      // TODO: update. When installed via npm, the depencencies are not in ./node_modules but in
      // the project node_modules ("../")
      let lib = null;
      try {
        lib = require.resolve(createReacticoonApp + "/../" + path);
      } catch (e) {
        lib = require.resolve(createReacticoonApp + "/node_modules/" + path);
      }
      return lib;
    },

    resolveCreateReacticoonApp: path => {
      return require.resolve(createReacticoonApp + "/node_modules/" + path);
    }
  },
  paths
);

// console.log(finalPaths);
// die

module.exports = finalPaths;
