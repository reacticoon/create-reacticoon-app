const execSync = require("child_process").execSync;
const spawn = require("child_process").spawn;
const fs = require("fs");
const paths = require("create-reacticoon-app/utils/paths");

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

const runCommand = (command, options) => {
  const applyDebugSpwan = require("create-reacticoon-app/utils/applyDebugSpwan");
  applyDebugSpwan();
  const argv = command.split(" ");
  const cmd = spawn(argv[0], argv.slice(1), {
    cwd: options.cwd
  });

  if (options.onError) {
    cmd.stderr.on("data", data => {
      options.onError(String(data));
    });
  }

  if (options.onLog) {
    cmd.stdout.on("data", data => {
      options.onLog(String(data));
    });
  }

  if (options.onClose) {
    cmd.on("close", code => {
      options.onClose({ code });
    });
  }

  return cmd;
};

const runReacticoonCommand = (reacticoonCommand, options) => {
  const command = `yarn reacticoon ${reacticoonCommand}`;
  return runCommand(command, {
    cwd: paths.projectDir,
    ...options
  });
};

const commandline = {
  execSimpleSync,
  execSimpleSyncOnDirectory,
  execSync,
  spawn,
  runCommand,
  runReacticoonCommand
};

module.exports = commandline;
