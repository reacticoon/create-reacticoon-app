const paths = require("./paths");
const fs = require("fs");
const {
  directoryExists,
  readJsonFile,
  fileExists
} = require("create-reacticoon-app/utils/Filesystem");

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
      buildInfo.builtAtFormatted = new Date(buildInfo.builtAt).toISOString();
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
