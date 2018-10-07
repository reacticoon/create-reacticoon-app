const trim = require("lodash/trim");
const exec = require("child_process").exec;
const deasync = require("deasync");

const commandline = {
  get: getString,
  run: runCommand,
  getSync: deasync(getString)
};

function runCommand(command) {
  exec(command);
}

function getString(command, callback) {
  exec(
    command,
    (function() {
      return function(err, data, stderr) {
        callback(err, trim(data), stderr);
      };
    })(callback)
  );
}

module.exports = commandline;
