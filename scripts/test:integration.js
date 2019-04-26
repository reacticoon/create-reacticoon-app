process.env.NODE_ENV = process.env.NODE_ENV || "development";

const ReacticoonChecks = require("../utils/ReacticoonChecks.js");
ReacticoonChecks.run(() => {
  // const path = require("path");
  const paths = require("../utils/paths");
  // const overrides = require("../config-overrides");

  // const rewireJestConfig = require("../utils/rewireJestConfig");
  // const createJestConfigPath =
  //   paths.scriptVersion + "/scripts/utils/createJestConfig";

  // hide overrides in package.json for CRA's original createJestConfig
  // const packageJson = require(paths.appPackageJson);
  // const jestOverrides = packageJson.jest;
  // delete packageJson.jest;

  // load original createJestConfig
  // const createJestConfig = require(createJestConfigPath);

  // // run original createJestConfig
  // let config = createJestConfig(
  //   relativePath =>
  //     path.resolve(
  //       paths.appPath,
  //       "node_modules",
  //       paths.scriptVersion,
  //       relativePath
  //     ),
  //   path.resolve(paths.appSrc, ".."),
  //   false
  // );

  const watch = process.argv.indexOf("--watch") !== -1;

  const jestConfig = {
    preset: paths.createReacticoonApp + "/node_modules/jest-puppeteer",
    // testRegex: paths.appPath + "/src/reacticoon/*\\.integration\\.js$",
    testRegex: "./*\\.integration\\.js$",
    // testRegex: paths.appPath + "/*\\.integration\\.js$",
    setupFilesAfterEnv: [
      __dirname + "/../integration/setup.js"
      // https://github.com/kentcdodds/jest-setup-files-after-env-example/blob/master/jest.config.js
      //     'react-testing-library/cleanup-after-each'
    ],

    // globalSetup: paths.resolveReacticoon("jest-environment-puppeteer/setup"),
    // replace "setupFiles" and "setupFilesAfterEnv"
    globalSetup: __dirname + "/../integration/setup.js",
    globalTeardown: paths.resolveReacticoon(
      "jest-environment-puppeteer/teardown"
    ),
    testEnvironment: __dirname + "/../integration/puppeteer_environment.js", //paths.resolveReacticoon("jest-environment-puppeteer"),

    // TODO: ignore node_modules

    projects: [paths.projectDir],

    watch
  };

  config = jestConfig;
  // config = { ...config, jestConfig };
  console.log(JSON.stringify(config, null, 2));
  // die;

  // restore overrides for rewireJestConfig
  // packageJson.jest = jestOverrides;

  // override createJestConfig in memory
  // require.cache[require.resolve(createJestConfigPath)].exports = () =>
  //   overrides.jest(rewireJestConfig(config));

  // Passing the --scripts-version on to the original test script can result
  // in the test script rejecting it as an invalid option. So strip it out of
  // the command line arguments before invoking the test script.
  // if (paths.customScriptsIndex > -1) {
  //   process.argv.splice(paths.customScriptsIndex, 2);
  // }

  // run original script
  const jest = paths.requireApp("jest");
  try {
    // debugger breakpoint hits here and show correct `options` object
    jest.runCLI(config, config.projects, result => {});
  } catch (error) {
    console.error(error);
  }
});
