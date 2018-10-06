const cmd = require("../../reacticoon-cli-utils/cmd");

function getNpmLastVersion(packageName) {
  let lastVersion = null
  try {
    lastVersion = cmd.getSync(`npm show ${packageName} version`);
  } catch (e) {
    // console.error('getNpmLastVersion error', e);
  }
  return lastVersion;
}

module.exports = getNpmLastVersion;
