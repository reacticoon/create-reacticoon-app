//
//
//
const GitUtils = require("../config-overrides/utils/git/index");
const paths = require("../utils/paths");
const workingDirPath = paths.projectDir;

/**
 * Check that the Reacticoon project configuration is ok to run our commands.
 */
const run = callback => {
  // verify git is init
  GitUtils.isGitInit(workingDirPath, isRepo => {
    if (!isRepo) {
      console.error(`Reacticoon error: Git must be init. 'git init .'`);
    }

    callback();
  });
};

module.exports = {
  run
};
