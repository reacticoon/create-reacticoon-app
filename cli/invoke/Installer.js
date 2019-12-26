const ejs = require("ejs");
const debug = require("debug");
const InstallerAPI = require("./InstallerAPI");
const PackageManager = require("../../utils/ProjectPackageManager");
const LocalPackageManager = require("../../utils/LocalPackageManager");
const sortObject = require("../../utils/sortObject");
const writeFileTree = require("../../utils/writeFileTree");
const normalizeFilePaths = require("../../utils/normalizeFilePaths");
const runCodemod = require("../../utils/runCodemod");
const { loadConfiguration } = require("../../cli/configuration");

const {
  semver,

  isPlugin,
  toShortPluginId,
  matchesPluginId,

  error,
  log,
  chalk,

  loadModule
} = require("../../cli-utils");
const ConfigTransform = require("./ConfigTransform");

const logger = require("../../cli-utils/logger");
const logTypes = {
  log: logger.log,
  info: logger.info,
  done: logger.done,
  warn: logger.warn,
  error: logger.error
};

const defaultConfigTransforms = {
  babel: new ConfigTransform({
    file: {
      js: ["babel.config.js"]
    }
  }),
  postcss: new ConfigTransform({
    file: {
      js: ["postcss.config.js"],
      json: [".postcssrc.json", ".postcssrc"],
      yaml: [".postcssrc.yaml", ".postcssrc.yml"]
    }
  }),
  eslintConfig: new ConfigTransform({
    file: {
      js: [".eslintrc.js"],
      json: [".eslintrc", ".eslintrc.json"],
      yaml: [".eslintrc.yaml", ".eslintrc.yml"]
    }
  }),
  jest: new ConfigTransform({
    file: {
      js: ["jest.config.js"]
    }
  }),
  browserslist: new ConfigTransform({
    file: {
      lines: [".browserslistrc"]
    }
  })
};

const reservedConfigTransforms = {
  reacticoon: new ConfigTransform({
    file: {
      js: ["reacticoon.config.js"]
    }
  })
};

const ensureEOL = str => {
  if (str.charAt(str.length - 1) !== "\n") {
    return str + "\n";
  }
  return str;
};

module.exports = class Generator {
  constructor({
    context,
    reacticoonConfiguration = {},
    pkg = {},
    plugin = null,
    plugins = [],
    afterInvokeCbs = [],
    afterAnyInvokeCbs = [],
    files = {},
    invoking = false
  } = {}) {
    this.context = context;

    if (plugin) {
      this.plugins = [plugin];
      this.plugin = plugin;
    } else {
      this.plugins = plugins;
      // TODO: remove trick
      this.plugin = plugins[0];
    }
    this.originalPkg = pkg;
    this.pkg = Object.assign({}, pkg);

    this.reacticoonConfiguration =
      reacticoonConfiguration || loadConfiguration();

    if (this.plugin.isOfficialLocalPlugin) {
      this.pm = new LocalPackageManager({ context });
    } else {
      this.pm = new PackageManager({ context });
    }
    this.imports = {};
    this.rootOptions = {};
    // we don't load the passed afterInvokes yet because we want to ignore them from other plugins
    this.passedAfterInvokeCbs = afterInvokeCbs;
    this.afterInvokeCbs = [];
    this.afterAnyInvokeCbs = afterAnyInvokeCbs;
    this.configTransforms = {};
    this.defaultConfigTransforms = defaultConfigTransforms;
    this.reservedConfigTransforms = reservedConfigTransforms;
    this.invoking = invoking;
    // for conflict resolution
    this.depSources = {};
    // virtual file tree
    this.files = files;
    this.fileMiddlewares = [];
    this.postProcessFilesCbs = [];
    // exit messages
    this.exitLogs = [];

    // load all the other plugins
    this.allPluginIds = Object.keys(this.pkg.dependencies || {})
      .concat(Object.keys(this.pkg.devDependencies || {}))
      .filter(isPlugin);

    const rootOptions = {};

    this.rootOptions = rootOptions;
  }

  async initPlugins() {
    const { rootOptions, invoking } = this;
    const pluginIds = this.plugins.map(p => p.id);

    // apply hooks from all plugins
    for (const id of this.allPluginIds) {
      const api = new InstallerAPI(id, this, {}, rootOptions);
      const pluginGenerator = loadModule(`${id}/generator`, this.context);

      if (pluginGenerator && pluginGenerator.hooks) {
        await pluginGenerator.hooks(api, {}, rootOptions, pluginIds);
      }
    }

    // We are doing save/load to make the hook order deterministic
    // save "any" hooks
    const afterAnyInvokeCbsFromPlugins = this.afterAnyInvokeCbs;

    // reset hooks
    this.afterInvokeCbs = this.passedAfterInvokeCbs;
    this.afterAnyInvokeCbs = [];
    this.postProcessFilesCbs = [];

    // apply generators from plugins
    for (const plugin of this.plugins) {
      const { id, apply, options } = plugin;

      this.addPluginToConfig(id, this.reacticoonConfiguration);

      const api = new InstallerAPI(id, this, options, rootOptions);
      try {
        await apply(api, options, rootOptions, invoking);
      } catch (e) {
        error(`Exception on installer for ${plugin.id}. Exiting...`);
        console.error(e);
        process.exit();
      }

      if (apply.hooks) {
        // while we execute the entire `hooks` function,
        // only the `afterInvoke` hook is respected
        // because `afterAnyHooks` is already determined by the `allPluginIds` loop above
        await apply.hooks(api, options, rootOptions, pluginIds);
      }

      // restore "any" hooks
      this.afterAnyInvokeCbs = afterAnyInvokeCbsFromPlugins;
    }
  }

  addPluginToConfig(packageName, reacticoonConfiguration) {
    const find = require("lodash").find;

    const alreadyOnConfig = find(
      reacticoonConfiguration.plugins,
      plugin => plugin.resolve === packageName
    );
    if (!alreadyOnConfig) {
      reacticoonConfiguration.plugins = (
        reacticoonConfiguration.plugins || []
      ).concat([
        {
          resolve: packageName,
          // default options will be set by the plugin install script, using api.extendPluginConfiguration
          options: {}
        }
      ]);
    }
  }

  async install() {
    await this.initPlugins();

    // save the file system before applying plugin for comparison
    const initialFiles = Object.assign({}, this.files);

    // wait for file resolve
    await this.resolveFiles();
    this.files["package.json"] = JSON.stringify(this.pkg, null, 2) + "\n";
    this.files[`config/reacticoon.json`] =
      JSON.stringify(this.reacticoonConfiguration, null, 2) + "\n";
    // write/update file tree to disk
    await writeFileTree(this.context, this.files, initialFiles);
  }

  async resolveFiles() {
    const files = this.files;
    for (const middleware of this.fileMiddlewares) {
      await middleware(files, ejs.render);
    }

    // normalize file paths on windows
    // all paths are converted to use / instead of \
    normalizeFilePaths(files);

    // handle imports and root option injections
    Object.keys(files).forEach(file => {
      let imports = this.imports[file];
      imports = imports instanceof Set ? Array.from(imports) : imports;
      if (imports && imports.length > 0) {
        files[file] = runCodemod(
          require("../../utils/codemods/injectImports"),
          { path: file, source: files[file] },
          { imports }
        );
      }

      let injections = this.rootOptions[file];
      injections =
        injections instanceof Set ? Array.from(injections) : injections;
      if (injections && injections.length > 0) {
        files[file] = runCodemod(
          require("../../utils/codemods/injectOptions"),
          { path: file, source: files[file] },
          { injections }
        );
      }
    });

    for (const postProcess of this.postProcessFilesCbs) {
      await postProcess(files);
    }
    debug("reacticoon:cli-files")(this.files);
  }

  hasPlugin(_id, _version) {
    return [...this.plugins.map(p => p.id), ...this.allPluginIds].some(id => {
      if (!matchesPluginId(_id, id)) {
        return false;
      }

      if (!_version) {
        return true;
      }

      const version = this.pm.getInstalledVersion(id);
      return semver.satisfies(version, _version);
    });
  }

  printExitLogs() {
    if (this.exitLogs.length) {
      this.exitLogs.forEach(({ id, msg, type }) => {
        const shortId = toShortPluginId(id);
        const logFn = logTypes[type];
        if (!logFn) {
          logger.error(`Invalid api.exitLog type '${type}'.`, shortId);
        } else {
          logFn(msg, msg && shortId);
        }
      });
      logger.log();
    }
  }
};
