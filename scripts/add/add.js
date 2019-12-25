const invoke = require("./invoke");

const chalk = require("chalk");
const semver = require("semver");
const paths = require("../../utils/paths");

const PackageManager = require("../../utils/ProjectPackageManager");
const LocalPackageManager = require("../../utils/LocalPackageManager");
const {
  resolveModule,
  loadModule,
  log,
  error,
  resolvePluginId,
  isOfficialPlugin,
  isOfficialLocalPlugin
} = require("../../cli-utils");
const confirmIfGitDirty = require("../../utils/confirmIfGitDirty");

const add = async function add(
  pluginName,
  options = {},
  context = process.cwd()
) {
  // if (!(await confirmIfGitDirty(context))) {
  //   return;
  // }

  const packageName = resolvePluginId(pluginName);

  // log();
  // log(`📦  Installing ${chalk.cyan(packageName)}...`);
  // log();

  // let pm = null;
  // if (isOfficialLocalPlugin(packageName)) {
  //   pm = new LocalPackageManager({ context });
  // } else {
  //   pm = new PackageManager({ context });
  // }

  // const cliVersion = require("../../package.json").version;
  // if (isOfficialPlugin(packageName) && semver.prerelease(cliVersion)) {
  //   await pm.add(`${packageName}@^${cliVersion}`);
  // } else {
  //   await pm.add(packageName);
  // }

  // log(
  //   `${chalk.green("✔")}  Successfully installed plugin: ${chalk.cyan(
  //     packageName
  //   )}`
  // );
  // log();

  addPluginToConfig(packageName);
  log();

  let installScriptPath = `${packageName}/install`;
  if (isOfficialLocalPlugin(packageName)) {
    installScriptPath = `${paths.reacticoonCliPluginsDir}/${installScriptPath}`;
    options.isOfficialLocalPlugin = isOfficialLocalPlugin;
  } else {
    options.isOfficialLocalPlugin = false;
  }

  options.installScriptPath = installScriptPath;

  // TODO: handle generator at install
  installScriptPath = resolveModule(installScriptPath, context);
  if (installScriptPath) {
    invoke(pluginName, options, context);
  } else {
    log(`Plugin ${packageName} does not have an install script to invoke`);
  }
};

function addPluginToConfig(packageName) {
  const find = require("lodash").find;
  const { loadOptions, saveOptions } = require("../../cli/options.js");

  const reacticoonConfig = loadOptions();

  const alreadyOnConfig = find(
    reacticoonConfig.plugins,
    plugin => plugin.resolve === packageName
  );
  if (!alreadyOnConfig) {
    reacticoonConfig.plugins = (reacticoonConfig.plugins || []).concat([
      {
        resolve: packageName,
        options: {} // TODO: retrieve plugin default options
      }
    ]);
    saveOptions(reacticoonConfig);

    log(
      `${chalk.green("✔")} Plugin added to your configuration file ${chalk.cyan(
        "config/reacticoon.json"
      )}`
    );
  } else {
    log(
      `${chalk.yellow(
        "✔"
      )} Plugin configuration already exists in your configuration file ${chalk.cyan(
        "config/reacticoon.json"
      )}`
    );
  }
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    error(err);
    // TODO: add REACTICOON_TEST on env when testing
    if (!process.env.REACTICOON_TEST) {
      process.exit(1);
    }
  });
};
