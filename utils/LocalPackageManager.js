const fs = require("fs-extra");
const path = require("path");

const minimist = require("minimist");
const LRU = require("lru-cache");

const {
  chalk,
  execa,
  semver,

  hasYarn,
  hasProjectYarn,

  isOfficialPlugin,
  resolvePluginId,

  log,
  warn
} = require("../cli-utils");

const { loadOptions } = require("../cli/options");
const getPackageJson = require("./getPackageJson");
const { executeCommand } = require("./executeCommand");

const isTestOrDebug =
  process.env.REACTICOON_TEST || process.env.REACTICOON_DEBUG;

// extract the package name 'xx' from the format 'xx@1.1'
function stripVersion(packageName) {
  const nameRegExp = /^(@?[^@]+)(@.*)?$/;
  const result = packageName.match(nameRegExp);

  if (!result) {
    throw new Error(`Invalid package name ${packageName}`);
  }

  return result[1];
}

class LocalPackageManager {
  constructor({ context } = {}) {
    this.context = context;
  }

  // Any command that implemented registry-related feature should support
  // `-r` / `--registry` option
  async getRegistry() {
    return this._registry;
  }

  async addRegistryToArgs(args) {}

  // set mirror urls for users in china
  async setBinaryMirrors() {}

  async getMetadata(packageName, { field = "" } = {}) {}

  async getRemoteVersion(packageName, versionRange = "latest") {}

  getInstalledVersion(packageName) {
    // for first level deps, read package.json directly is way faster than `npm list`
    try {
      const packageJson = getPackageJson(
        path.resolve(this.context, "node_modules", packageName)
      );
      return packageJson.version;
    } catch (e) {
      return "N/A";
    }
  }

  async install() {
    console.jsonDie(this.context);
  }

  async add(packageName, isDev = true) {
  }

  async upgrade(packageName) {}

  async remove(packageName) {}
}

module.exports = LocalPackageManager;
