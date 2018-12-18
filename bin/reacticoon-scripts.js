#!/usr/bin/env node

"use strict";

const spawn = require("cross-spawn");
const find = require("lodash/find");

const getReacticoonPluginsWithCommands = require("../cli-utils/reacticoon-config/getReacticoonPluginsWithCommands");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});


function getPluginsCommands() {
  return getReacticoonPluginsWithCommands().reduce((commandsList, plugin) => {
    return commandsList.concat(plugin.commands);
  }, []);
}

const scripts = [
  { name: "build", path: "../scripts" },
  { name: "build-library", path: "../scripts" },
  { name: "test", path: "../scripts" },
  { name: "start", path: "../scripts" },
  { name: "generate", path: "../generator" },
  { name: "checkup", path: "../checkup" },
  { name: "debug-plugins", path: "../scripts" },
  { name: "list-commands", path: "../scripts"},
  { name: "analyze-build", path: "../analyze/build"},
];

// const spawn = require("react-dev-utils/crossSpawn");
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(x => scripts.indexOf(x !== -1));
const scriptName = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

const execute = (script, filepath) => {
  const finalArgs = nodeArgs
    // for now, we delegate to react-app-rewired
    .concat(require.resolve(filepath + script))
    .concat(args.slice(scriptIndex + 1));
  // console.log(finalArgs);
  // die

  const result = spawn.sync("node", finalArgs, { stdio: "inherit" });
  if (result.signal) {
    if (result.signal === "SIGKILL") {
      console.log(
        "The build failed because the process exited too early. " +
          "This probably means the system ran out of memory or someone called " +
          "`kill -9` on the process."
      );
    } else if (result.signal === "SIGTERM") {
      console.log(
        "The build failed because the process exited too early. " +
          "Someone might have called `kill` or `killall`, or the system could " +
          "be shutting down."
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
};

const script = find(scripts, script => script.name === scriptName);

if (script) {
  console.debug(`--- create-reacticoon-app ${script.name}`);
  execute(script.name, script.path + "/");
} else {
  const pluginsCommands = getPluginsCommands();
  const command = find(pluginsCommands, command => command.name === scriptName);
  if (command) {
    execute(command.name, command.resolveDirectory + "/");
    return;
  }

  console.log(`Unknown script "${scriptName}."`);
  console.log(
    `Available scripts:\n  ${scripts
      .map(script => script.name)
      .concat(pluginsCommands.map(command => command.name))
      .join("\n  ")}.`
  );
  console.log("You may need to update create-reacticoon-app");
  // TODO: link documentation
  console.log("See: TODO LINK");
}
