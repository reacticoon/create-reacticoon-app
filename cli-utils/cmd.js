const execSync = require("child_process").execSync;
const spawn = require("child_process").spawn;
const fs = require("fs");
const paths = require("create-reacticoon-app/utils/paths");
const { info, error, log } = require("./logger");

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

  info(`Run command ${command}`, "cmd");

  const argv = command.split(" ");
  const cmd = spawn(argv[0], argv.slice(1), {
    cwd: options.cwd
  });

  let _running = false;

  function handleRunning() {
    if (!_running) {
      _running = true;
      if (options.onRunning) {
        // TODO: pass pid
        options.onRunning();
      }
    }
  }

  cmd.stderr.on("data", data => {
    handleRunning();
    if (options.onError) {
      options.onError(String(data));
    }
  });

  cmd.stdout.on("data", data => {
    handleRunning();
    if (options.onLog) {
      options.onLog(String(data));
    }
  });

  if (options.onClose) {
    cmd.on("close", ({ code, signal, error }) => {
      options.onClose({ code, signal, error });
    });
  }

  return cmd;
};

const createDefaultOptions = reacticoonCommand => ({
  onError: data => {
    error(data, reacticoonCommand);
  },
  onLog: data => {
    log(data, reacticoonCommand);
  },
  onClose: ({ code, signal }) => {
    info(`Finished with code ${code} ${signal}`, reacticoonCommand);
  }
});

const runReacticoonCommand = (reacticoonCommand, options) => {
  const command = `yarn reacticoon ${reacticoonCommand}`;
  return runCommand(command, {
    cwd: paths.projectDir,
    ...createDefaultOptions(reacticoonCommand),
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
