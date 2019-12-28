const paths = require("../utils/paths");
const fs = require("fs");
const Filesystem = require("../utils/Filesystem")
const {
  execSimpleSync,
  execSimpleSyncOnDirectory,
  spawn,
  info,
  log,
  error
} = require("create-reacticoon-app/cli-utils");
const get = require("lodash/get");
const {
  getPluginConfiguration
} = require("create-reacticoon-app/cli/configuration");

/**
 * class given to our plugins to provides utility methods.
 *
 * Is used as base for other API, such as CheckApi
 */
class CliPluginApi {
  constructor({ pluginName }) {
    this.pluginName = pluginName;
  }

  getConfig() {
    return getPluginConfiguration(this.pluginName);
  }

  getOption(optionPath, defaultValue) {
    return get(this.getConfig(), optionPath, defaultValue);
  }

  hasProjectFile(filepath) {
    return fs.existsSync(this.getProjectFilepath(filepath));
  }

  getProjectFilepath(filepath) {
    return `${paths.projectDir}/${filepath}`;
  }

  readProjectFile(filepath) {
    return String(fs.readFileSync(this.getProjectFilepath(filepath), "utf8"));
  }

  readYamlFile(filepath) {
    return this.parseYaml(this.readProjectFile(filepath));
  }

  parseYaml(yamlContent) {
    // https://github.com/nodeca/js-yaml
    const yaml = require("js-yaml");
    const parsed = yaml.safeLoad(yamlContent);
    return parsed;
  }

  toYaml(object) {
    // https://github.com/nodeca/js-yaml
    const yaml = require("js-yaml");
    return yaml.dump(object);
  }

  writeProjectFile(filepath, content) {
    return fs.writeFileSync(this.getProjectFilepath(filepath), content);
  }

  execSimpleSync() {
    return execSimpleSync.apply(null, arguments);
  }

  execSimpleSyncOnDirectory() {
    return execSimpleSyncOnDirectory.apply(null, arguments);
  }

  directoryExists(path) {
    return Filesystem.directoryExists(path)
  }

  spawn() {
    const applyDebugSpwan = require("create-reacticoon-app/utils/applyDebugSpwan");
    applyDebugSpwan();
    return spawn.apply(null, arguments);
  }

  info() {
    return info.apply(null, arguments);
  }

  log() {
    return log.apply(null, arguments);
  }

  error() {
    return error.apply(null, arguments);
  }
}

module.exports = CliPluginApi;
