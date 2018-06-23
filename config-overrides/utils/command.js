"use strict";

const execSync = require("child_process").execSync;
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  execSimpleSync: cmd => {
    const stdout = execSync(cmd, { cwd: appDirectory });
    return String(stdout)
      .split("\n")
      .join("");
  },
  execSimpleSyncOnDirectory: (cmd, cwd) => {
    const stdout = execSync(cmd, { cwd: appDirectory + "/" + cwd });
    return String(stdout)
      .split("\n")
      .join("");
  }
};
