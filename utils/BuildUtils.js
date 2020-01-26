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
      const now = moment();

      buildInfo.builtAtFormatted = builtAtDate.toISOString();

      const diffDays = now.diff(builtAtDate, "days");
      const diffHours = now.diff(builtAtDate, "hours");
      const diffMinutes = now.diff(builtAtDate, "minutes");

      let diffStr = "";
      if (diffDays > 0) {
        diffStr += `${diffDays} days `;
      }

      if (diffHours > 0) {
        diffStr += `${diffHours} hours `;
      }

      diffStr += `${diffMinutes} minutes `;

      buildInfo.builtAtDiffFormatted = `${diffStr}ago`;
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
