const paths = require("./paths");
const fs = require("fs");
const {
  directoryExists,
  readJsonFile,
  fileExists
} = require("create-reacticoon-app/utils/Filesystem");
const moment = require("moment");

function getManifestContent() {
  return require(`${paths.projectDir}/build/asset-manifest.json`);
}

function getBuildRootJsFileName() {
  const manifestContent = getManifestContent();
  return manifestContent.files["main.js"];
}

function hasBuild() {
  return (
    directoryExists(paths.projectBuild) &&
    fileExists(paths.projectBuildInfoFile)
  );
}

function getBuildInfo() {
  let buildInfo;

  if (hasBuild()) {
    buildInfo = readJsonFile(paths.projectBuildInfoFile);

    if (buildInfo) {
      const builtAtDate = moment(buildInfo.builtAt);
      buildInfo.builtAtDiffFormatted = builtAtDate.fromNow();
      buildInfo.builtAtFormatted = builtAtDate.format("HH:mm:ss");
    }
  }
  return buildInfo;
}

function getBuildId() {
  const projectBuildInfo = JSON.parse(
    String(fs.readFileSync(paths.projectBuildInfoFile), `utf-8`)
  );
  return projectBuildInfo.hash;
}

module.exports = {
  getBuildRootJsFileName,
  getBuildId,
  hasBuild,
  getBuildInfo
};
