const paths = require("./paths");
const fs = require("fs");

function getManifestContent() {
  return require(`${paths.projectDir}/build/asset-manifest.json`);
}

function getBuildRootJsFileName() {
  const manifestContent = getManifestContent();
  return manifestContent.files["main.js"];
}

function getBuildId() {
  const projectBuildInfo = JSON.parse(
    String(fs.readFileSync(paths.projectBuildInfoFile), `utf-8`)
  );
  return projectBuildInfo.hash;
}

module.exports = {
  getBuildRootJsFileName,
  getBuildId
};
