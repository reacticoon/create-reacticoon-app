const { semver } = require("../cli-utils");
const PackageManager = require("./ProjectPackageManager");
const {
  loadConfiguration,
  saveConfiguration
} = require("../cli/configuration");

let sessionCached;
const pm = new PackageManager();

module.exports = async function getVersions() {
  if (sessionCached) {
    return sessionCached;
  }

  let latest;
  const local = require(`../package.json`).version;
  if (process.env.REACTICOON_TEST || process.env.REACTICOON_DEBUG) {
    return (sessionCached = {
      current: local,
      latest: local
    });
  }

  // should also check for prerelease versions if the current one is a prerelease
  const includePrerelease = !!semver.prerelease(local);

  const { latestVersion = local, lastChecked = 0 } = loadConfiguration();
  const cached = latestVersion;
  const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24);

  let error;
  if (daysPassed > 1) {
    // if we haven't check for a new version in a day, wait for the check
    // before proceeding
    try {
      latest = await getAndCacheLatestVersion(cached, includePrerelease);
    } catch (e) {
      latest = cached;
      error = e;
    }
  } else {
    // Otherwise, do a check in the background. If the result was updated,
    // it will be used for the next 24 hours.
    // don't throw to interrupt the user if the background check failed
    getAndCacheLatestVersion(cached, includePrerelease).catch(() => {});
    latest = cached;
  }

  return (sessionCached = {
    current: local,
    latest,
    error
  });
};

// fetch the latest version and save it on disk
// so that it is available immediately next time
async function getAndCacheLatestVersion(cached, includePrerelease) {
  return "0.0.0";
  // TODO:
  let version = await pm.getRemoteVersion("create-reacticoon-app", "latest");

  if (includePrerelease) {
    const next = await pm.getRemoteVersion("create-reacticoon-app", "next");
    version = semver.gt(next, version) ? next : version;
  }

  if (semver.valid(version) && version !== cached) {
    saveConfiguration({ latestVersion: version, lastChecked: Date.now() });
    return version;
  }
  return cached;
}
