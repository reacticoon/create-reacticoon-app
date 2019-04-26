const forEach = require("lodash/forEach");
const startsWith = require("lodash/startsWith");
const paths = require("../../utils/paths");
const semver = require("semver");

resolveVersionFromRange = range => {
  const rangeSet = new semver.Range(range).set;
  return rangeSet[0][0].semver.version;
};

function analyzeDependencies() {
  const appPackageJson = require(`${paths.projectDir}/package.json`);

  const dependencies = appPackageJson.dependencies;

  // see https://github.com/pastelsky/bundlephobia/blob/53f10d4b5d2bcfaebea14c0fdfa3ae701cd0efe1/pages/scan/Scan.js
  const packages = Object.keys(dependencies)
    .filter(packageName => {
      const versionRange = dependencies[packageName];
      return semver.valid(versionRange) || semver.validRange(versionRange);
    })
    .map(packageName => {
      const versionRange = dependencies[packageName];

      return {
        name: packageName,
        versionRange,
        resolvedVersion: resolveVersionFromRange(versionRange)
      };
    });

  const query = packages
    .map(pack => `${pack.name}@${pack.resolvedVersion}`)
    .join(",");

  let bundlePhobiaUrl = `https://bundlephobia.com/scan-results?packages=${query}`;

  return {
    dependencies,
    packages,
    bundlePhobiaUrl,
  };
}

module.exports = {
  analyzeDependencies
};
