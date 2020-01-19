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
  jestConfig.modulePaths = webpackConfig.resolve.modules;
  jestConfig.moduleDirectories = webpackConfig.resolve.modules;

  forEach(webpackConfig.resolve.alias, (aliasPath, aliasName) => {
    jestConfig.moduleNameMapper[`^${aliasName}(.*)$`] = `${
      aliasPath[0] === "/" ? aliasPath : `<rootDir>${aliasPath}`
    }$1`;
  });

  // console.jsonDie({
  //   moduleNameMapper: jestConfig.moduleNameMapper,
  //   modulePaths: jestConfig.modulePaths,
  //   moduleDirectories: jestConfig.moduleDirectories
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
  isTesting,
  reacticoonOptions,
  reacticoonWebpackOverride,
  retrievePluginsOverridesData = {}
) => (jestConfig, webpackConfig) => {
  if (!isTesting) {
    return () => jestConfig;
  }

  const configData = generateConfigData(
    false, // in testing mode, we consider being in dev mode too for now. TODO: change this behaviour?
    isTesting,
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
  // console.jsonDie(jestConfig);
  return () => rewireJestConfigWithPackageJson(jestConfig);
};
