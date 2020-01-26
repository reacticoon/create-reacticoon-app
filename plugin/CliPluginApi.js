const fs = require("fs");
const Filesystem = require("../utils/Filesystem");
const paths = require("../utils/paths");
const uuidv4 = require("uuid/v4");
const mkdirp = require("mkdirp");
const {
  execSimpleSync,
  execSimpleSyncOnDirectory,
  runCommand,
  runReacticoonCommand,
  info,
  log,
  error,
  setCacheValue,
  getCacheValue
} = require("create-reacticoon-app/cli-utils");

const get = require("lodash/get");
const isEmpty = require("lodash/isEmpty");

const {
  getPluginConfiguration,
  loadConfiguration
} = require("create-reacticoon-app/cli/configuration");

const {
  sendEventToCurrentClient
} = require("create-reacticoon-app/server/modules/sse");

const {
  getBuildId,
  hasBuild,
  getBuildInfo
} = require("create-reacticoon-app/utils/BuildUtils");

const {
  getNetworkAddress,
  getNetworkNextAvailablePort
} = require("create-reacticoon-app/utils/Network");

const getReacticoonPlugin = require("create-reacticoon-app/cli-utils/reacticoon-config/getReacticoonPlugin");

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

  getPluginConfiguration(name) {
    return getPluginConfiguration(name);
  }

  getReacticoonPlugin(name) {
    return getReacticoonPlugin(name);
  }

  loadConfiguration() {
    return loadConfiguration();
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

  fileExists(path) {
    return Filesystem.fileExists(path);
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

  runReacticoonCommandWithSse(reacticoonCommand, sseEventName) {
    const taskId = this.generateUUID();

    this.runReacticoonCommand(reacticoonCommand, {
      onError: message => {
        this.sendEventToCurrentSseClient(sseEventName, {
          type: "error",
          taskId,
          message
        });
      },
      onLog: message => {
        this.sendEventToCurrentSseClient(sseEventName, {
          type: "log",
          taskId,
          message
        });
      },
      onClose: ({ code }) => {
        this.sendEventToCurrentSseClient(sseEventName, {
          type: "done",
          taskId,
          code,
          message: `Ended with code ${code}`
        });
      }
    });

    return {
      sseEventName,
      taskId
    };
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
  // Network
  //

  getNetworkAddress() {
    return getNetworkAddress();
  }

  getNetworkNextAvailablePort() {
    return getNetworkNextAvailablePort();
  }

  //
  //
  //

  setCacheValue(path, data) {
    setCacheValue(path, data);
  }

  getCacheValue(path) {
    return getCacheValue(path);
  }

  //
  //
  //

  async runOnBuildedServer() {
    return new Promise((resolve, reject) => {
      const serverIsRunning = this.getCacheValue("BUILD_SERVER.isRunning");

      if (!serverIsRunning) {
        // return {
        //   error: true,
        //   errorMessage: `Build server is not running`,
        //   errorCode: "BUILD_SERVER_NOT_RUNNING"
        // };
        this.runReacticoonCommand("build:server", {
          onClose: () => {
            const buildServerData = this.getCacheValue("BUILD_SERVER");
            resolve(buildServerData);
          }
        });
      } else {
        const buildServerData = this.getCacheValue("BUILD_SERVER");
        resolve(buildServerData);
      }
    });
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

  async sleep(ms) {
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/wait
    const sab = new SharedArrayBuffer(1024);
    const int32 = new Int32Array(sab);
    await Atomics.wait(int32, 0, 0, ms);
  }
}

module.exports = CliPluginApi;
