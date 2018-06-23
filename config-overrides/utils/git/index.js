'use strict';

const execSimpleSync = require('../command').execSimpleSync

module.exports = {
  lastAppCommit: () => {
    return execSimpleSync(
      'git rev-parse --short HEAD'
    )
  },

  //
  // https://stackoverflow.com/questions/6245570/how-to-get-the-current-branch-name-in-git
  //

  currentProjectBranch: () => {
    return execSimpleSync(
      'git rev-parse --abbrev-ref HEAD'
    )
  },

}
