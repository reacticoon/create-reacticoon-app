const path = require("path");
const debug = require("debug");
const inquirer = require("inquirer");
const EventEmitter = require("events");
const Installer = require("../invoke/Installer");
const cloneDeep = require("lodash/cloneDeep");
const sortObject = require("../../utils/sortObject");
const getVersions = require("../../utils/getVersions");
const PackageManager = require("../../utils/ProjectPackageManager");
const LocalPackageManager = require("../../utils/LocalPackageManager");
const { clearConsole } = require("../../utils/clearConsole");
const PromptModuleAPI = require("./PromptModuleAPI");
const writeFileTree = require("../../utils/writeFileTree");
const { formatFeatures } = require("../../utils/features");
const loadLocalPreset = require("../../utils/loadLocalPreset");
const loadRemotePreset = require("../../utils/loadRemotePreset");
const generateReadme = require("../../utils/generateReadme");

const {
  defaults,
  saveConfiguration,
  loadConfiguration,
  savePluginConfiguration
} = require("../../cli/configuration");

const {
  chalk,
  execa,
  semver,

  log,
  warn,
  error,
  logWithSpinner,
  stopSpinner,

  hasGit,
  hasProjectGit,
  hasYarn,

  isOfficialLocalPlugin,

  exit,
  loadModule
} = require("../../cli-utils");

const isManualMode = answers => answers.preset === "__manual__";

module.exports = class Creator extends EventEmitter {
  constructor(name, context, promptModules) {
    super();

    this.name = name;
    this.context = process.env.REACTICOON_CLI_CONTEXT = context;
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
    this.presetPrompt = presetPrompt;
    this.featurePrompt = featurePrompt;
    this.outroPrompts = this.resolveOutroPrompts();
    this.injectedPrompts = [];
    this.promptCompleteCbs = [];
    this.afterInvokeCbs = [];
    this.afterAnyInvokeCbs = [];

    this.run = this.run.bind(this);

    const promptAPI = new PromptModuleAPI(this);
    promptModules.forEach(m => m(promptAPI));
  }

  async create(cliOptions = {}, preset = null) {
    const isTestOrDebug =
      process.env.REACTICOON_CLI_TEST || process.env.REACTICOON_CLI_DEBUG;
    const { run, name, context, afterInvokeCbs, afterAnyInvokeCbs } = this;

    if (!preset) {
      if (cliOptions.preset) {
        // reacticoon create foo --preset bar
        preset = await this.resolvePreset(cliOptions.preset, cliOptions.clone);
      } else if (cliOptions.default) {
        // reacticoon create foo --default
        preset = defaults.presets.default;
      } else if (cliOptions.inlinePreset) {
        // reacticoon create foo --inlinePreset {...}
        try {
          preset = JSON.parse(cliOptions.inlinePreset);
        } catch (e) {
          error(
            `CLI inline preset is not valid JSON: ${cliOptions.inlinePreset}`
          );
          exit(1);
        }
      } else {
        preset = await this.promptAndResolvePreset();
      }
    }

    // clone before mutating
    preset = cloneDeep(preset);
    // inject core service
    preset.plugins = {
      "reacticoon-cli-plugin-dev": {}
    };
    Object.assign(
      {
        projectName: name
      },
      preset
    );

    const packageManager =
      cliOptions.packageManager ||
      loadConfiguration().packageManager ||
      (hasYarn() ? "yarn" : null) ||
      "npm";

    // TODO:
    // const pm = new PackageManager({
    //   context,
    //   forcePackageManager: packageManager
    // });

    const pm = new LocalPackageManager({
      context,
      forcePackageManager: packageManager
    });

    await clearConsole();
    logWithSpinner(`✨`, `Creating project in ${chalk.yellow(context)}.`);
    this.emit("creation", { event: "creating" });

    // get latest CLI version
    const { current, latest } = await getVersions();
    let latestMinor = `${semver.major(latest)}.${semver.minor(latest)}.0`;

    if (
      // if the latest version contains breaking changes
      /major/.test(semver.diff(current, latest)) ||
      // or if using `next` branch of cli
      (semver.gte(current, latest) && semver.prerelease(current))
    ) {
      // fallback to the current cli version number
      latestMinor = current;
    }
    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: "0.1.0",
      private: true,
      scripts: {
        reacticoon: "reacticoon",
        start: "reacticoon start",
        build: "reacticoon build",
        test: "reacticoon test",
        "test:integration": "reacticoon test:integration",
        "test:integration:watch": "reacticoon test:integration --watch"
      },
      devDependencies: {}
    };
    const deps = Object.keys(preset.plugins);
    deps.forEach(dep => {
      if (preset.plugins[dep]._isPreset) {
        return;
      }

      // Note: the default creator includes no more than `@reacticoon/cli-*` & `@reacticoon/babel-preset-env`,
      // so it is fine to only test `@reacticoon` prefix.
      // Other `@reacticoon/*` packages' version may not be in sync with the cli itself.
      pkg.devDependencies[dep] =
        preset.plugins[dep].version ||
        (/^@reacticoon/.test(dep) ? `^${latestMinor}` : `latest`);
    });

    // write package.json
    await writeFileTree(context, {
      "package.json": JSON.stringify(pkg, null, 2)
    });

    // intilaize git repository before installing deps
    // so that reacticoon-create-reacticoon-app can setup git hooks.
    const shouldInitGit = this.shouldInitGit(cliOptions);
    if (shouldInitGit) {
      logWithSpinner(`🗃`, `Initializing git repository...`);
      this.emit("creation", { event: "git-init" });
      await run("git init");
    }

    // install plugins
    stopSpinner();
    log(`⚙  Installing CLI plugins. This might take a while...`);
    log();
    this.emit("creation", { event: "plugins-install" });

    if (isTestOrDebug && !process.env.REACTICOON_CLI_TEST_DO_INSTALL_PLUGIN) {
      // in development, avoid installation process
      await require("../../utils/setupDevProject")(context);
    } else {
      await pm.install();
    }

    // run installer
    log(`🚀  Invoking installers...`);
    this.emit("creation", { event: "invoking-installers" });
    const plugins = await this.resolvePlugins(preset.plugins);

    const installer = new Installer({
      context,
      pkg,
      plugins,
      afterInvokeCbs,
      afterAnyInvokeCbs
    });

    await installer.install({
      extractConfigFiles: preset.useConfigFiles
    });

    // install additional deps (injected by installers)
    log(`📦  Installing additional dependencies...`);
    this.emit("creation", { event: "deps-install" });
    log();
    if (!isTestOrDebug) {
      await pm.install();
    }

    // run complete cbs if any (injected by installers)
    logWithSpinner("⚓", `Running completion hooks...`);
    this.emit("creation", { event: "completion-hooks" });
    for (const cb of afterInvokeCbs) {
      await cb();
    }
    for (const cb of afterAnyInvokeCbs) {
      await cb();
    }

    // generate README.md
    stopSpinner();
    log();
    logWithSpinner("📄", "Generating README.md...");
    await writeFileTree(context, {
      "README.md": generateReadme(installer.pkg, packageManager)
    });

    // commit initial state
    let gitCommitFailed = false;
    if (shouldInitGit) {
      await run("git add -A");
      if (isTestOrDebug) {
        await run("git", ["config", "user.name", "test"]);
        await run("git", ["config", "user.email", "test@test.com"]);
      }
      const msg = typeof cliOptions.git === "string" ? cliOptions.git : "init";
      try {
        await run("git", ["commit", "-m", msg]);
      } catch (e) {
        gitCommitFailed = true;
      }
    }

    // log instructions
    stopSpinner();
    log();
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`);
    if (!cliOptions.skipGetStarted) {
      log(
        `👉  Get started with the following commands:\n\n` +
          (this.context === process.cwd()
            ? ``
            : chalk.cyan(` ${chalk.gray("$")} cd ${name}\n`)) +
          chalk.cyan(
            ` ${chalk.gray("$")} ${
              packageManager === "yarn"
                ? "yarn serve"
                : packageManager === "pnpm"
                ? "pnpm run serve"
                : "npm run serve"
            }`
          )
      );
    }
    log();
    this.emit("creation", { event: "done" });

    if (gitCommitFailed) {
      warn(
        `Skipped git commit due to missing username and email in git config.\n` +
          `You will need to perform the initial commit yourself.\n`
      );
    }

    installer.printExitLogs();
  }

  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }
    return execa(command, args, { cwd: this.context });
  }

  async promptAndResolvePreset(answers = null) {
    // prompt
    if (!answers) {
      await clearConsole(true);
      answers = await inquirer.prompt(this.resolveFinalPrompts());
    }
    debug("reacticoon-cli:answers")(answers);

    if (answers.packageManager) {
      saveConfiguration({
        packageManager: answers.packageManager
      });
    }

    let preset;
    if (answers.preset && answers.preset !== "__manual__") {
      preset = await this.resolvePreset(answers.preset);
    } else {
      // manual
      preset = {
        useConfigFiles: answers.useConfigFiles === "files",
        plugins: {}
      };
      answers.features = answers.features || [];
      // run cb registered by prompt modules to finalize the preset
      this.promptCompleteCbs.forEach(cb => cb(answers, preset));
    }

    // validate
    // validatePreset(preset);

    // save preset
    if (answers.save && answers.saveName) {
      // TODO: better handling
      savePluginConfiguration(answers.saveName, preset);
    }

    debug("reacticoon-cli:preset")(preset);
    return preset;
  }

  async resolvePreset(name, clone) {
    let preset;
    const savedPresets = loadConfiguration().presets || {};

    if (name in savedPresets) {
      preset = savedPresets[name];
    } else if (
      name.endsWith(".json") ||
      /^\./.test(name) ||
      path.isAbsolute(name)
    ) {
      preset = await loadLocalPreset(path.resolve(name));
    } else if (name.includes("/")) {
      logWithSpinner(`Fetching remote preset ${chalk.cyan(name)}...`);
      this.emit("creation", { event: "fetch-remote-preset" });
      try {
        preset = await loadRemotePreset(name, clone);
        stopSpinner();
      } catch (e) {
        stopSpinner();
        error(`Failed fetching remote preset ${chalk.cyan(name)}:`);
        throw e;
      }
    }

    // use default preset if user has not overwritten it
    if (name === "default" && !preset) {
      preset = defaults.presets.default;
    }
    if (!preset) {
      error(`preset "${name}" not found.`);
      const presets = Object.keys(savedPresets);
      if (presets.length) {
        log();
        log(`available presets:\n${presets.join(`\n`)}`);
      } else {
        log(`you don't seem to have any saved preset.`);
        log(`run reacticoon-cli in manual mode to create a preset.`);
      }
      exit(1);
    }
    return preset;
  }

  // { id: options } => [{ id, apply, options }]
  async resolvePlugins(rawPlugins) {
    // ensure reacticoon-cli-plugin-dev is invoked first
    rawPlugins = sortObject(rawPlugins, ["reacticoon-cli-plugin-dev"], true);
    const plugins = [];
    for (const id of Object.keys(rawPlugins)) {
      const apply = loadModule(`${id}/installer`, this.context) || (() => {});
      let options = rawPlugins[id] || {};
      if (options.prompts) {
        const prompts = loadModule(`${id}/prompts`, this.context);
        if (prompts) {
          log();
          log(`${chalk.cyan(options._isPreset ? `Preset options:` : id)}`);
          options = await inquirer.prompt(prompts);
        }
      }
      plugins.push({
        id,
        apply,
        options,
        isOfficialLocalPlugin: isOfficialLocalPlugin(id)
      });
    }
    return plugins;
  }

  getPresets() {
    const savedOptions = loadConfiguration();
    return Object.assign({}, savedOptions.presets, defaults.presets);
  }

  resolveIntroPrompts() {
    const presets = this.getPresets();
    const presetChoices = Object.keys(presets).map(name => {
      return {
        name: `${name} (${formatFeatures(presets[name])})`,
        value: name
      };
    });
    const presetPrompt = {
      name: "preset",
      type: "list",
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices,
        {
          name: "Manually select features",
          value: "__manual__"
        }
      ]
    };
    const featurePrompt = {
      name: "features",
      when: isManualMode,
      type: "checkbox",
      message: "Check the features needed for your project:",
      choices: [],
      pageSize: 10
    };
    return {
      presetPrompt,
      featurePrompt
    };
  }

  resolveOutroPrompts() {
    const outroPrompts = [
      {
        name: "useConfigFiles",
        when: isManualMode,
        type: "list",
        message: "Where do you prefer placing config for Babel, ESLint, etc.?",
        choices: [
          {
            name: "In dedicated config files",
            value: "files"
          },
          {
            name: "In package.json",
            value: "pkg"
          }
        ]
      },
      {
        name: "save",
        when: isManualMode,
        type: "confirm",
        message: "Save this as a preset for future projects?",
        default: false
      },
      {
        name: "saveName",
        when: answers => answers.save,
        type: "input",
        message: "Save preset as:"
      }
    ];

    // ask for packageManager once
    const savedOptions = loadConfiguration();
    if (!savedOptions.packageManager && hasYarn()) {
      const packageManagerChoices = [];

      if (hasYarn()) {
        packageManagerChoices.push({
          name: "Use Yarn",
          value: "yarn",
          short: "Yarn"
        });
      }

      packageManagerChoices.push({
        name: "Use NPM",
        value: "npm",
        short: "NPM"
      });

      outroPrompts.push({
        name: "packageManager",
        type: "list",
        message:
          "Pick the package manager to use when installing dependencies:",
        choices: packageManagerChoices
      });
    }

    return outroPrompts;
  }

  resolveFinalPrompts() {
    // patch installer-injected prompts to only show in manual mode
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true);
      prompt.when = answers => {
        return isManualMode(answers) && originalWhen(answers);
      };
    });
    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompts
    ];
    debug("reacticoon-cli:prompts")(prompts);
    return prompts;
  }

  shouldInitGit(cliOptions) {
    if (!hasGit()) {
      return false;
    }
    // --git
    if (cliOptions.forceGit) {
      return true;
    }
    // --no-git
    if (cliOptions.git === false || cliOptions.git === "false") {
      return false;
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.context);
  }
};
