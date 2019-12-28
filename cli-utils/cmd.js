const execSync = require("child_process").execSync;
const spawn = require("child_process").spawn;
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());

const cleanStdout = stdout => {
  // remove last \n
  return String(stdout).replace(/\n$/, "");
};

const execSimpleSync = cmd => {
  const stdout = execSync(cmd, { cwd: appDirectory });
  return cleanStdout(stdout);
};

const execSimpleSyncOnDirectory = (cmd, cwd) => {
  const stdout = execSync(cmd, { cwd: appDirectory + "/" + cwd });
  return cleanStdout(stdout);
};

const commandline = {
  execSimpleSync,
  execSimpleSyncOnDirectory,
  spawn
};

module.exports = commandline;
