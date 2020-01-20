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

    globals: {
      __DEV__: true
    },

    watch,

    verbose: true,
    // silent: true

    setupFilesAfterEnv: [
      // ...jestConfig.setupFilesAfterEnv,

      //
      // https://github.com/zaqqaz/jest-allure
      // jest -v >24
      //

      paths.resolveCreateReacticoonApp("jest-allure/dist/setup")
    ],

    //
    // add custom reporters
    //

    reporters: [
      // "default", ==> we use jest-standard-reporter

      //
      // https://github.com/zaqqaz/jest-allure
      //

      paths.resolveCreateReacticoonApp("jest-allure"),

      //
      // https://github.com/chrisgalvan/jest-standard-reporter
      // Jest uses stderr to print the results of the tests (as opposed to stdout; see issue https://github.com/facebook/jest/issues/5064).
      // Many CI tools mark any output coming from stderr as a failure, making builds to fail even when the tests pass(false positive).
      // This reporter uses stdout to print messages and only uses stderr when an error is thrown.
      //
      paths.resolveCreateReacticoonApp("jest-standard-reporter"),

      //
      // A Jest reporter that creates compatible junit xml files
      // https://github.com/jest-community/jest-junit
      //
      [
        paths.resolveCreateReacticoonApp("jest-junit"),
        {
          // /!\ if changed, change paths.junitIntegrationTestsReport
          outputDirectory: `${paths.projectDir}/output/jest/integration/`,
          outputName: "junit-integration-tests.xml"
        }
      ],

      //
      // https://github.com/jodonnell/jest-slow-test-reporter
      // Prints out the slowest 10 tests in your app. Can also print warnings when a test exceeds X ms.
      //
      [
        paths.resolveCreateReacticoonApp("jest-slow-test-reporter"),
        { numTests: 8, warnOnSlowerThan: 300, color: true }
      ]
    ]
  };

  config = jestConfig;
  // config = { ...config, jestConfig };
  // console.log(JSON.stringify(config, null, 2));
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
  const jest = paths.requireCreateReacticoonApp("jest");
  try {
    // debugger breakpoint hits here and show correct `options` object
    jest.runCLI(config, config.projects, result => {});
  } catch (error) {
    console.error(error);
  }
});
