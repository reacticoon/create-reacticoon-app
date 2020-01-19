const paths = require("../utils/paths");
const fs = require("fs");
const Filesystem = require("../utils/Filesystem");
const uuidv4 = require("uuid/v4");
const mkdirp = require("mkdirp");
const {
  execSimpleSync,
  execSimpleSyncOnDirectory,
  runCommand,
  runReacticoonCommand,
  info,
  log,
  error
} = require("create-reacticoon-app/cli-utils");

const get = require("lodash/get");

const {
  getPluginConfiguration
} = require("create-reacticoon-app/cli/configuration");

const {
  sendEventToCurrentClient
} = require("create-reacticoon-app/server/modules/sse");

const {
  getBuildId,
  hasBuild,
  getBuildInfo
} = require("create-reacticoon-app/utils/BuildUtils");

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

  //
  //
  //

  hasProjectFile(filepath) {
    return fs.existsSync(this.getProjectFilepath(filepath));
  }

  getProjectFilepath(filepath) {
    return `${paths.projectDir}/${filepath}`;
  }

  getPaths() {
    return paths;
  }

  getPluginPath() {
    // TODO: better handling
    return `${paths.reacticoonCliPluginsDir}/${this.pluginName}`;
  }

  getPluginTmpPath() {
    // TODO: mv to Filesystem
    return `/tmp/reacticoon/${this.pluginName}`;
  }

  //
  //
  //

  readProjectFile(filepath) {
    // TODO: mv to Filesystem
    return String(fs.readFileSync(this.getProjectFilepath(filepath), "utf8"));
  }

  readJsonFile(filepath) {
    return Filesystem.readJsonFile(filepath);
  }

  readFile(filepath) {
    return String(fs.readFileSync(filepath, "utf8"));
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

  directoryExists(path) {
    return Filesystem.directoryExists(path);
  }

  getCacheFile(filepath) {
    return Filesystem.getCacheFile(`${this.pluginName}/${filepath}`);
  }

  saveCacheFile(filepath, content) {
    return Filesystem.saveCacheFile(`${this.pluginName}/${filepath}`, content);
  }

  async mkdirp() {
    return await mkdirp.apply(null, arguments);
  }

  //
  //
  //

  execSimpleSync() {
    return execSimpleSync.apply(null, arguments);
  }

  execSimpleSyncOnDirectory() {
    return execSimpleSyncOnDirectory.apply(null, arguments);
  }

  runCommand(command, options = {}) {
    return runCommand(command, options);
  }

  runReacticoonCommand(reacticoonCommand, options) {
    return runReacticoonCommand(reacticoonCommand, options);
  }

  //
  // log
  //

  info() {
    return info.apply(null, arguments);
  }

  log() {
    return log.apply(null, arguments);
  }

  error() {
    return error.apply(null, arguments);
  }

  //
  // eventrs
  //

  sendEventToCurrentSseClient(eventName, payload) {
    return sendEventToCurrentClient(eventName, payload);
  }

  //
  // dev server
  //

  getServerUrl() {
    // TODO:
    return `http://localhost:4242`;
  }

  //
  // build
  //

  getBuildId() {
    return getBuildId.apply(null, arguments);
  }

  hasBuild() {
    return hasBuild.apply(null, arguments);
  }

  getBuildInfo() {
    return getBuildInfo.apply(null, arguments);
  }

  //
  // other utils
  //

  generateUUID() {
    return uuidv4();
  }

  openBrowser() {
    const openBrowser = require("react-dev-utils/openBrowser");
    return openBrowser.apply(null, arguments);
  }
}

module.exports = CliPluginApi;
