// inspired by https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/scripts/start.js

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const ReacticoonChecks = require("../utils/ReacticoonChecks.js");
ReacticoonChecks.run(() => {
  const path = require("path");
  const paths = require("../utils/paths");
  const overrides = require("../config-overrides");

  const createJestConfigPath =
    paths.scriptVersion + "/scripts/utils/createJestConfig";

  // hide overrides in package.json for CRA's original createJestConfig
  const packageJson = require(paths.appPackageJson);
  const jestOverrides = packageJson.jest;
  delete packageJson.jest;

  // load original createJestConfig
  const createJestConfig = require(createJestConfigPath);

  const webpackConfigPath = `${paths.scriptVersion}/config/webpack.config.js`;

  const webpackConfig = require(webpackConfigPath)("testing");

  // run original createJestConfig
  const jestConfig = createJestConfig(
    relativePath =>
      path.resolve(
        paths.appPath,
        "node_modules",
        paths.scriptVersion,
        relativePath
      ),
    path.resolve(paths.appSrc, ".."),
    false
  );

  // restore overrides for rewireJestConfig
  packageJson.jest = jestOverrides;

  // override createJestConfig in memory
  require.cache[require.resolve(createJestConfigPath)].exports = overrides.jest(
    jestConfig,
    webpackConfig
  );

  // Passing the --scripts-version on to the original test script can result
  // in the test script rejecting it as an invalid option. So strip it out of
  // the command line arguments before invoking the test script.
  if (paths.customScriptsIndex > -1) {
    process.argv.splice(paths.customScriptsIndex, 2);
  }

  // run original script
  try {
    require(paths.scriptVersion + "/scripts/test");
  } catch (e) {
    console.error(e);
  }
});
