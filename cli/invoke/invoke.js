const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const paths = require("../../utils/paths");
const Installer = require("./Installer");

const {
  chalk,
  execa,

  log,
  error,
  logWithSpinner,
  stopSpinner,

  hasProjectGit,

  resolvePluginId,
  isOfficialLocalPlugin,

  loadModule
} = require("../../cli-utils");

const confirmIfGitDirty = require("../../utils/confirmIfGitDirty");
const readFiles = require("../../utils/readFiles");
const PackageManager = require("../../utils/ProjectPackageManager");

function getPkg(context) {
  const pkgPath = path.resolve(context, "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in ${chalk.yellow(context)}`);
  }
  const pkg = fs.readJsonSync(pkgPath);

  return pkg;
}

function getReacticoonConfiguration(context) {
  if (!fs.existsSync(`config/reacticoon.json`)) {
    throw new Error(`package.json not found in ${chalk.yellow(context)}`);
  }
  const reacticoonConfiguration = fs.readJsonSync(`config/reacticoon.json`);

  return reacticoonConfiguration;
}

async function invoke(pluginName, options = {}, context = process.cwd()) {
  if (!(await confirmIfGitDirty(context))) {
    return;
  }

  delete options._;
  const pkg = getPkg(context);

  // attempt to locate the plugin in package.json
  const findPlugin = deps => {
    if (!deps) return;
    let name;
    // official
    if (deps[(name = `@reacticoon/cli-plugin-${pluginName}`)]) {
      return name;
    }
    // full id, scoped short, or default short
    if (deps[(name = resolvePluginId(pluginName))]) {
      return name;
    }
  };

  let id;
  if (!options.isOfficialLocalPlugin) {
    id = findPlugin(pkg.devDependencies) || findPlugin(pkg.dependencies);
    if (!id) {
      throw new Error(
        `Cannot resolve plugin ${chalk.yellow(
          pluginName
        )} from package.json. ` + `Did you forget to install it?`
      );
    }
  } else {
    id = resolvePluginId(pluginName);
    pluginName = id;
  }

  let installScriptPath = options.installScriptPath;

  const pluginInstall = loadModule(installScriptPath, context);
  if (!pluginInstall) {
    throw new Error(`Plugin ${id} does not have an install script.`);
  }

  // resolve options if no command line options (other than --registry) are passed,
  // and the plugin contains a prompt module.
  // eslint-disable-next-line prefer-const
  let { registry, $inlineOptions, ...pluginOptions } = options;
  if ($inlineOptions) {
    try {
      pluginOptions = JSON.parse($inlineOptions);
    } catch (e) {
      throw new Error(`Couldn't parse inline options JSON: ${e.message}`);
    }
  } else if (!Object.keys(pluginOptions).length) {
    let pluginPrompts = loadModule(`${id}/prompts`, context);
    if (pluginPrompts) {
      if (typeof pluginPrompts === "function") {
        pluginPrompts = pluginPrompts(pkg);
      }
      if (typeof pluginPrompts.getPrompts === "function") {
        pluginPrompts = pluginPrompts.getPrompts(pkg);
      }
      pluginOptions = await inquirer.prompt(pluginPrompts);
    }
  }

  const cliPlugin = {
    id,
    pluginName,
    isOfficialLocalPlugin,
    apply: pluginInstall,
    options: {
      registry,
      ...pluginOptions
    }
  };

  await runCliPluginInstall(context, cliPlugin, pkg);
}

async function runCliPluginInstall(context, cliPlugin, pkg = getPkg(context)) {
  const isTestOrDebug =
    process.env.REACTICOON_TEST || process.env.REACTICOON_TEST_DEBUG;
  const afterInvokeCbs = [];
  const afterAnyInvokeCbs = [];

  const installer = new Installer({
    context,
    pkg,
    reacticoonConfiguration: getReacticoonConfiguration(context),
    plugin: cliPlugin,
    files: await readFiles(context),
    afterInvokeCbs,
    afterAnyInvokeCbs,
    invoking: true
  });

  log(`🚀  Invoking installer for ${cliPlugin.id}...`);
  await installer.install();

  const newDeps = installer.pkg.dependencies;
  const newDevDeps = installer.pkg.devDependencies;
  const depsChanged =
    JSON.stringify(newDeps) !== JSON.stringify(pkg.dependencies) ||
    JSON.stringify(newDevDeps) !== JSON.stringify(pkg.devDependencies);

  if (!isTestOrDebug && depsChanged) {
    log(`📦  Installing additional dependencies...`);
    log();

    let pm = null;
    if (isOfficialLocalPlugin(cliPlugin.id)) {
      pm = new LocalPackageManager({ context });
    } else {
      pm = new PackageManager({ context });
    }
    await pm.install();
  }

  if (afterInvokeCbs.length || afterAnyInvokeCbs.length) {
    logWithSpinner("⚓", `Running completion hooks...`);
    for (const cb of afterInvokeCbs) {
      await cb();
    }
    for (const cb of afterAnyInvokeCbs) {
      await cb();
    }
    stopSpinner();
    log();
  }

  log(
    `${chalk.green(
      "✔"
    )}  Successfully invoked installer for plugin: ${chalk.cyan(cliPlugin.id)}`
  );
  if (!process.env.REACTICOON_TEST && hasProjectGit(context)) {
    const { stdout } = await execa(
      "git",
      ["ls-files", "--exclude-standard", "--modified", "--others"],
      {
        cwd: context
      }
    );
    if (stdout.trim()) {
      log(`   The following files have been updated / added:\n`);
      log(
        chalk.red(
          stdout
            .split(/\r?\n/g)
            .map(line => `     ${line}`)
            .join("\n")
        )
      );
      log();
      log(
        `   You should review these changes with ${chalk.cyan(
          `git diff`
        )} and commit them.`
      );
      log();
    }
  }

  installer.printExitLogs();
}

module.exports = (...args) => {
  return invoke(...args).catch(err => {
    error(err);
    if (!process.env.REACTICOON_TEST) {
      process.exit(1);
    }
  });
};

module.exports.runCliPluginInstall = runCliPluginInstall;
