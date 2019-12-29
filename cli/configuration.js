const fs = require("fs");
const cloneDeep = require("lodash").cloneDeep;
const find = require("lodash/find");
const getReacticoonConfigurationPath = require("./utils/getReacticoonConfigurationPath");
const { exit } = require("../cli-utils/exit");
const { error } = require("../cli-utils/logger");

const rcPath = (exports.reacticoonConfigurationPath = getReacticoonConfigurationPath());

exports.defaults = {
  lastChecked: undefined,
  latestVersion: undefined,

  packageManager: undefined,
  plugins: [
    {
      resolve: "reacticoon-cli-plugin-dev",
      options: {}
    }
  ]
};

let cachedConfiguration;

exports.loadConfiguration = (withoutCache = false) => {
  if (cachedConfiguration && !withoutCache) {
    return cachedConfiguration;
  }
  if (fs.existsSync(rcPath)) {
    try {
      cachedConfiguration = JSON.parse(fs.readFileSync(rcPath, "utf-8"));
    } catch (e) {
      error(
        `Error loading saved preferences: ` +
          `config/reacticoon.js may be corrupted or have syntax errors. ` +
          `Please fix/delete it and re-run vue-cli in manual mode.\n` +
          `(${e.message})`
      );
      exit(1);
    }
    // validate(cachedConfiguration, schema, () => {
    //   error(
    //     `config/reacticoon.js may be outdated. ` +
    //     `Please delete it and re-run vue-cli in manual mode.`
    //   )
    // })
    return cachedConfiguration;
  } else {
    if (process.env.NODE_ENV !== 'test') {
      error(
        `Error loading saved preferences: ` +
          `config/reacticoon.js does not exists`
      );
    }
    return {};
  }
};

exports.resetConfiguration = configuration => {
  cachedConfiguration = configuration;
  try {
    fs.writeFileSync(rcPath, JSON.stringify(configuration, null, 2));
  } catch (e) {
    error(
      `Error saving preferences: ` +
        `make sure you have write access to ${rcPath}.\n` +
        `(${e.message})`
    );
  }
}

exports.saveConfiguration = toSave => {
  const configuration = Object.assign(cloneDeep(exports.loadConfiguration()), toSave);
  for (const key in configuration) {
    if (!(key in exports.defaults)) {
      delete configuration[key];
    }
  }
  cachedConfiguration = configuration;
  try {
    fs.writeFileSync(rcPath, JSON.stringify(configuration, null, 2));
  } catch (e) {
    error(
      `Error saving preferences: ` +
        `make sure you have write access to ${rcPath}.\n` +
        `(${e.message})`
    );
  }
};

exports.getPluginConfiguration = (pluginName, withoutCache) => {
  const plugins = cloneDeep(
    exports.loadConfiguration(withoutCache).plugins || []
  );

  const plugin = find(plugins, plugin => plugin.resolve === pluginName);

  if (plugin) {
    return plugin.options || {};
  }
  return null;
};

exports.savePluginConfiguration = (pluginName, options) => {
  const plugins = cloneDeep(exports.loadConfiguration().plugins || []);

  const alreadyOnConfig = find(
    plugins,
    plugin => plugin.resolve === pluginName
  );
  if (alreadyOnConfig) {
    alreadyOnConfig.options = options;
  } else {
    plugins.push({
      resolve: pluginName,
      options
    });
  }
  exports.saveConfiguration({ plugins });
};
