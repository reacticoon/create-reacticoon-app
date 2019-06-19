const trim = require("lodash/trim");
const exec = require("child_process").exec;
const deasync = require("deasync");

function runCommand(command) {
  exec(command);
}

async function getString(command, callback) {
  exec(
    command,
    (function() {
      return function(err, data, stderr) {
        callback(err, trim(data), stderr);
      };
    })(callback)
  );
}

const commandline = {
  get: getString,
  run: runCommand,
  getSync: deasync(getString)
};

module.exports = commandline;
