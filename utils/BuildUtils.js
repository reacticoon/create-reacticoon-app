const paths = require("./paths")

function getManifestContent() {
  return require(`${paths.projectDir}/build/asset-manifest.json`)
}

function getBuildRootJsFileName() {
  const manifestContent = getManifestContent()
  return manifestContent["main.js"]
}

function getBuildId() {
  const rootJs = getBuildRootJsFileName()
  // TODO: better way
  return rootJs.replace("static/js/main.", "").replace(".js", "")
}

module.exports = {
  getBuildId,
}