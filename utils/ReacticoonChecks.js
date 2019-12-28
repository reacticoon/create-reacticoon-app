//
//
//
const { error, isGitInit } = require("../cli-utils");
const paths = require("../utils/paths");
const workingDirPath = paths.projectDir;

/**
 * Check that the Reacticoon project configuration is ok to run our commands.
 */
const run = callback => {
  // verify git is init
  if (!isGitInit(workingDirPath)) {
    error(`Reacticoon error: Git must be init. 'git init .'`);
  }
  callback();
};

module.exports = {
  run
};
