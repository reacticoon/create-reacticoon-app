const paths = require("../../utils/paths");

let _config = null;

function getReacticoonConfig() {
  if (_config === null) {
    _config = require(paths.projectDir + "/config/reacticoon");
  }

  return _config;
}

module.exports = getReacticoonConfig;
