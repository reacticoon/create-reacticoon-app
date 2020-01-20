const forEach = require("lodash/forEach");
const git = require("create-reacticoon-app/cli-utils/git");
const paths = require("create-reacticoon-app/utils/paths");

function envVarsConfigurator(config, env, options) {
  const __DEV__ = process.env.NODE_ENV !== "production";
  const __PROD__ = process.env.NODE_ENV === "production";

  if (env.isTesting) {
    return config;
  }

  //
  // add env vars.
  // Accessible on the app via `process.env`
  // Those variables can be retrieved via `reacticoon/environment`
  //

  // only add env variables that begin with 'REACTICOON_APP__'.
  // Any other variables except NODE_ENV will be ignored to avoid accidentally exposing a private
  // key on the machine that could have the same name. Changing any environment variables will
  // require you to restart the development server if it is running.
  const processEnvReacticoonVars = {};
  forEach(process.env, (value, varName) => {
    if (varName.startsWith("REACTICOON_APP__")) {
      const varNameSmall = varName.replace("REACTICOON_APP__", "");
      processEnvReacticoonVars[varNameSmall] = value;
    }
  });

  const envVars = {
    ...processEnvReacticoonVars,

    PROJECT_NAME: env.reacticoonConfig.projectName || env.appPackageJson.name,

    //
    // Some vars about the environment
    //
    __DEV__,
    __PROD__,

    //
    // retrieve the current app version from the package.json file
    //
    __VERSION__: env.appPackageJson.version,

    __REACTICOON_DOC_URL__: "https://reacticoon.netlify.com",

    __REACTICOON_GITHUB_ORGANISATION_URL__: "https://github.com/reacticoon",

    __REACTICOON_REPOSITORY_URL__: "https://github.com/reacticoon/reacticoon",

    __ENV__: env.__ENV__,

    __ENV_FILEPATH__: env.__ENV_FILEPATH__,

    PROJECT_SRC: paths.projectSrc,

    // TODO: move on dev plugin override
    junitIntegrationTestsReportPath: paths.junitIntegrationTestsReport,
    junitUnitTestsReportPath: paths.junitUnitTestsReport,
    junitCoverageTestsReportPath: paths.junitCoverageTestsReport,

    ...options.env
  };

  //
  // Sometimes, the package.json version is not updated by the user
  // we add the commit info to help error reporting
  // The project can be not `git init` yet, so we need to try catch eventual missing info.
  //
  try {
    envVars.__APP_GIT_COMMIT__ = git.lastAppCommit();
  } catch (e) {
    envVars.__APP_GIT_COMMIT__ = null;
  }
  try {
    envVars.__APP_GIT_BRANCH__ = git.currentProjectBranch();
  } catch (e) {
    envVars.__APP_GIT_BRANCH__ = null;
  }

  try {
    envVars.__APP_GIT_FULLNAME__ = git.currentProjectFullName();
  } catch {
    envVars.__APP_GIT_FULLNAME__ = null;
  }

  try {
    envVars.__APP_GIT_NAME__ = git.currentProjectName();
  } catch {
    envVars.__APP_GIT_NAME__ = null;
  }

  try {
    envVars.__APP_GIT_ORGANIZATION__ = git.currentOrganization();
  } catch (e) {
    envVars.__APP_GIT_ORGANIZATION__ = null;
  }

  // transform env for webpack.
  // We need to stringify the env values
  // https://stackoverflow.com/questions/28145397/injecting-variables-into-webpack
  const finalEnvVars = {};
  Object.keys(envVars).forEach(function(key) {
    finalEnvVars[key] = JSON.stringify(envVars[key]);
  });

  // TODO: better way
  const proccessEnvIndex = env.isDev ? 3 : 4;
  config.plugins[proccessEnvIndex].definitions["process.env"] = {
    ...config.plugins[proccessEnvIndex].definitions["process.env"],
    ...finalEnvVars
  };
}

module.exports = envVarsConfigurator;
