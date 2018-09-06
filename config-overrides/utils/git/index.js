"use strict";

const execSimpleSync = require("../command").execSimpleSync;
const simpleGit = require("simple-git");

module.exports = {
  isGitInit: (workingDirPath, callback) => {
    // const git = simpleGit(workingDirPath);
    // git.checkIsRepo(callback);
    // TODO: checkIsRepo fail if there is no commit..
    callback(true)
  },

  // TODO: handle when there is no last commit
  lastAppCommit: () => {
    return execSimpleSync("git rev-parse --short HEAD");
  },

  //
  // https://stackoverflow.com/questions/6245570/how-to-get-the-current-branch-name-in-git
  //

  currentProjectBranch: () => {
    return execSimpleSync("git rev-parse --abbrev-ref HEAD");
  }
};
