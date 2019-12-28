"use strict";

const { execSimpleSync } = require("./cmd");
// const simpleGit = require("simple-git");

const isGitInit = (cwd) => {
  // see env/hasProjectGit
  try {
    execSimpleSync('git status', { stdio: 'ignore', cwd })
    return true
  } catch (e) {
   return false
  }
};

// TODO: handle when there is no last commit
const lastAppCommit = () => {
  return execSimpleSync("git rev-parse --short HEAD");
};

//
// https://stackoverflow.com/questions/6245570/how-to-get-the-current-branch-name-in-git
//

const currentProjectBranch = () => {
  return execSimpleSync("git rev-parse --abbrev-ref HEAD");
};

const currentProjectName = () => {
  return execSimpleSync("basename `git rev-parse --show-toplevel`");
};

const currentOrganization = () => {
  let fullName = currentProjectFullName();
  return fullName.split("/")[0];
};

const currentProjectFullName = () => {
  // TODO: handle other than github
  return execSimpleSync(
    'git config --get remote.origin.url | grep -Po "(?<=git@github.com:)(.*?)(?=.git)"'
  );
};

module.exports = {
  isGitInit,
  lastAppCommit,
  currentProjectBranch,
  currentProjectName,
  currentOrganization,
  currentProjectFullName
};
