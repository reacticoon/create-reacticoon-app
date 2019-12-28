const { execSimpleSync } = require("../../cli-utils/cmd");

function getNpmLastVersion(packageName) {
  let lastVersion = null
  try {
    lastVersion = execSimpleSync(`npm show ${packageName} version`);
  } catch (e) {
    // console.error('getNpmLastVersion error', e);
  }
  return lastVersion;
}

module.exports = getNpmLastVersion;
