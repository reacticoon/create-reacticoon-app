#!/usr/bin/env node

"use strict";

var spawn = require("cross-spawn");

const scripts = [
  "build",
  "build-library",
  "test",
  "start",
]

// const spawn = require("react-dev-utils/crossSpawn");
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => scripts.indexOf(x !== -1)
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

const execute = (script, filepath) => {
  const result = spawn.sync(
    "node",
    nodeArgs
      // for now, we delegate to react-app-rewired
      .concat(require.resolve(filepath + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: "inherit" }
  );
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

if (scripts.indexOf(script) !== -1) {
  console.debug(`--- reacticoon-scripts ${script}`);
  execute(script, "../scripts/");
} else {
  console.log(`Unknown script "${script}."`);
  console.log(`Available scripts: ${scripts.join(', ')}.`);
  console.log("You may need to update reacticoon-scripts");
  // TODO: link documentation
  console.log("See: TODO LINK");
}
