/**
 * This config allow overriding of the create-react-app config.
 *
 * see
 * - https://github.com/timarney/react-app-rewired
 * - https://github.com/facebook/create-react-app
 */

// copy of: https://github.com/timarney/react-app-rewired/blob/HEAD/packages/react-app-rewired/scripts/utils/babelTransform.js#L13
// from https://github.com/facebook/create-react-app/blob/26f701fd60cece427d0e6c5a0ae98a5c79993640/packages/react-scripts/config/jest/babelTransform.js

// TODO: remove file in major release
// TODO: Reacticoon: babel-jest and babel-preset-react-app where installed on create-reacticoon-app package.json.
// it this the right way to do it?
const babelJest = require("babel-jest");

const forEach = require("lodash/forEach");
const path = require("path");
const paths = require("create-reacticoon-app/utils/paths");
const generateConfigData = require("create-reacticoon-app/config-overrides/config/generateConfigData");

const rewireJestConfigWithPackageJson = jestConfig => {
  //
  // jest overrides from app package.json
  //
  const overrides = Object.assign({}, require(paths.appPackageJson).jest);

  // Jest configuration in package.json will be added to the the default config
  Object.keys(overrides).forEach(key => {
    //We don't overwrite the default config, but add to each property if not a string
    if (jestConfig[key]) {
      if (typeof overrides[key] === "string") {
        jestConfig[key] = overrides[key];
      } else if (Array.isArray(overrides[key])) {
        jestConfig[key] = overrides[key].concat(jestConfig[key]);
      } else if (typeof overrides[key] === "object") {
        jestConfig[key] = Object.assign({}, overrides[key], jestConfig[key]);
      }
    } else {
      jestConfig[key] = overrides[key];
    }
  });
  return jestConfig;
};

const rewireJestConfigBabel = (jestConfig, babelConfig, webpackConfig) => {
  //
  // babel
  //
  Object.keys(jestConfig.transform).forEach(key => {
    if (jestConfig.transform[key].endsWith("babelTransform.js")) {
      jestConfig.transform[key] = path.resolve(
        __dirname + "/../utils/babelTransform.js"
      );

      require(path.resolve(__dirname + "/../utils/babelTransform.js"));

      require.cache[
        path.resolve(__dirname + "/../utils/babelTransform.js")
      ].exports = babelJest.createTransformer({
        presets: babelConfig.presets,
        plugins: babelConfig.plugins
      });

      // console.jsonDie(babelConfig);
    }
  });

  // https://stackoverflow.com/questions/33190795/configuring-jest-to-mimic-webpack-resolve-root-and-resolve-alias
  // https://jestjs.io/docs/en/webpack.html
  // TODO: make optionnal to include reacticoon and plugins tests
  jestConfig.modulePaths = webpackConfig.resolve.modules;
  // .map(mod => mod.replace("/node_modules", "/src"))
  // .filter(mod => mod !== "node_modules");
  jestConfig.moduleDirectories = webpackConfig.resolve.modules;

  forEach(webpackConfig.resolve.alias, (aliasPath, aliasName) => {
    jestConfig.moduleNameMapper[`^${aliasName}(.*)$`] = `${
      aliasPath[0] === "/" ? aliasPath : `<rootDir>${aliasPath}`
    }$1`;
  });

  // console.jsonDie({
  //   moduleNameMapper: jestConfig.moduleNameMapper,
  //   modulePaths: jestConfig.modulePaths
  //   // moduleDirectories: jestConfig.moduleDirectories
  // });

  return jestConfig;
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

module.exports = createJestOverride = (
  isEnvTesting,
  reacticoonOptions,
  reacticoonWebpackOverride,
  retrievePluginsOverridesData = {}
) => (jestConfig, webpackConfig) => {
  if (!isEnvTesting) {
    return () => jestConfig;
  }

  const configData = generateConfigData(
    false, // in testing mode, we consider being in dev mode too for now. TODO: change this behaviour?
    isEnvTesting,
    webpackConfig,
    "testing",
    reacticoonOptions,
    reacticoonWebpackOverride,
    retrievePluginsOverridesData
  );

  jestConfig = rewireJestConfigBabel(
    jestConfig,
    configData.babelConfig,
    configData.webpackConfig
  );

  jestConfig = {
    ...jestConfig,

    globals: {
      ...jestConfig.globals,
      __DEV__: true
    },

    // A list of paths to directories that Jest should use to search for files in.
    // roots: jestConfig.modulePaths,

    // //
    // projects: jestConfig.modulePaths,

    // projects: [
    //   // ...jestConfig.projects,

    //   // TODO: make optionnal to include reacticoon and plugins tests
    //   paths.reacticoonSrc
    // ].concat(paths.reacticoonPluginsList.map(plugin => `${plugin}/src`)),

    //
    //
    //

    coverageDirectory: `${paths.projectDir}/output/jest/coverage`,
    coverageReporters: ["text", "html"],

    setupFilesAfterEnv: [
      ...jestConfig.setupFilesAfterEnv,

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
          // /!\ if changed, change paths.junitUnitTestsReport
          outputDirectory: `${paths.projectDir}/output/jest/unit`,
          outputName: "junit-unit-tests.xml"
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

  // console.jsonDie(jestConfig.projects);
  return () => rewireJestConfigWithPackageJson(jestConfig);
};
