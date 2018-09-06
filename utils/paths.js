var path = require("path");
var fs = require("fs");

//try to detect if user is using a custom scripts version
var custom_scripts = false;
const cs_index = process.argv.indexOf("--scripts-version");

if (cs_index > -1 && cs_index + 1 <= process.argv.length) {
  custom_scripts = process.argv[cs_index + 1];
}

//Allow custom overrides package location
const projectDir = path.resolve(fs.realpathSync(process.cwd()));
var config_overrides = projectDir + "/config/overrides.js";
const co_index = process.argv.indexOf("--config-overrides");

if (co_index > -1 && co_index + 1 <= process.argv.length) {
  config_overrides = path.resolve(process.argv[co_index + 1]);
  process.argv.splice(co_index, 2);
}

const appNodeModules = `${projectDir}/node_modules/`;

const scriptVersion = custom_scripts || "react-scripts";
const modulePath = path.join(
  require.resolve(`${appNodeModules}/${scriptVersion}/package.json`),
  ".."
);

// const rewiredScript =  path.join(
// require.resolve(`${appNodeModules}/react-app-rewired/package.json`),
// require.resolve(`react-app-rewired/package.json`),
// '..'
// );

const paths = require(modulePath + "/config/paths");

const createReacticoonApp = path.resolve(__dirname, "../");

module.exports = Object.assign(
  {
    projectDir,
    projectSrc: projectDir + '/src',
    libDir: projectDir + "/lib",
    createReacticoonApp,
    appNodeModules,
    appLibIndexJs: projectDir + '/src/index.js',
    // TODO: rename to reactScripts
    scriptVersion: modulePath,
    // rewiredScript,
    configOverrides: config_overrides,
    customScriptsIndex: custom_scripts ? cs_index : -1,

    requireReacticoon: path => {
      return require(createReacticoonApp + "/node_modules/" + path);
    },
    resolveReacticoon: path => {
      return require.resolve(createReacticoonApp + "/node_modules/" + path);
    }
  },
  paths
);
