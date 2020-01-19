#!/usr/bin/env node

// TODO: rename file to reacticoon
"use strict";

// Most of this is inspired by vue.js
// https://sourcegraph.com/github.com/vuejs/vue-cli@dev/-/blob/packages/@vue/cli/bin/vue.js
const requiredVersion = require("../package.json").engines.node;
const chalk = require("chalk");
const didYouMean = require("didyoumean");
const semver = require("semver");
const isFunction = require("lodash/isFunction");

// Setting edit distance to 60% of the input string's length
didYouMean.threshold = 0.6;

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(
      chalk.red(
        "You are using Node " +
          process.version +
          ", but this version of " +
          id +
          " requires Node " +
          wanted +
          ".\nPlease upgrade your Node version."
      )
    );
    process.exit(1);
  }
}

checkNodeVersion(requiredVersion, "reacticoon");

if (semver.satisfies(process.version, "9.x")) {
  console.log(
    chalk.red(
      `You are using Node ${process.version}.\n` +
        `Node.js 9.x has already reached end-of-life and will not be supported in future major releases.\n` +
        `It's strongly recommended to use an active LTS version instead.`
    )
  );
}

const minimist = require("minimist");
const program = require("commander");

program
  .version(`reacticoon ${require("../package").version}`)
  .usage("<command> [options]");

const getReacticoonPluginsWithCommands = require("../cli-utils/reacticoon-config/getReacticoonPluginsWithCommands");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

function getPluginsCommands() {
  return getReacticoonPluginsWithCommands().reduce((commandsList, plugin) => {
    return commandsList.concat(plugin.commands).map(command => {
      command.pluginName = plugin.name;
      return command;
    });
  }, []);
}

// TODO: remove, transform to program
// const scripts = [
//   { name: "build", path: "../scripts" },
//   { name: "build-library", path: "../scripts" },
//   { name: "test", path: "../scripts" },
//   { name: "test:integration", path: "../scripts" },
//   // { name: "start", path: "../scripts" },
//   { name: "generate", path: "../generator" },
//   // { name: "checkup", path: "../checkup" },
//   { name: "debug-plugins", path: "../scripts" },
//   { name: "list-commands", path: "../scripts" }
//   // { name: "analyze-build", path: "../analyze/build" }
// ];

program
  .command("add <plugin> [pluginOptions]")
  .description(
    "install a plugin and invoke its generator in an already created project"
  )
  .allowUnknownOption()
  .action(plugin => {
    require("../cli/add/add")(plugin, minimist(process.argv.slice(3)));
  });

program
  .command("invoke <plugin> [pluginOptions]")
  .description("invoke the generator of a plugin in an already created project")
  .option(
    "--registry <url>",
    "Use specified npm registry when installing dependencies (only for npm)"
  )
  .allowUnknownOption()
  .action(plugin => {
    require("../lib/invoke")(plugin, minimist(process.argv.slice(3)));
  });

program
  .command("create <app-name>")
  .description("create a new project powered by Reacticoon")
  .option(
    "-p, --preset <presetName>",
    "Skip prompts and use saved or remote preset"
  )
  .option("-d, --default", "Skip prompts and use default preset")
  .option(
    "-i, --inlinePreset <json>",
    "Skip prompts and use inline JSON string as preset"
  )
  .option(
    "-m, --packageManager <command>",
    "Use specified npm client when installing dependencies"
  )
  .option(
    "-r, --registry <url>",
    "Use specified npm registry when installing dependencies (only for npm)"
  )
  .option(
    "-g, --git [message]",
    "Force git initialization with initial commit message"
  )
  .option("-n, --no-git", "Skip git initialization")
  .option("-f, --force", "Overwrite target directory if it exists")
  .option("-c, --clone", "Use git clone when fetching remote preset")
  .option("-x, --proxy", "Use specified proxy when creating project")
  .option("-b, --bare", "Scaffold project without beginner instructions")
  .option("--skipGetStarted", 'Skip displaying "Get started" instructions')
  .action((name, cmd) => {
    const options = cleanArgs(cmd);

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          "\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored."
        )
      );
    }
    // --git makes commander to default git to true
    if (process.argv.includes("-g") || process.argv.includes("--git")) {
      options.forceGit = true;
    }
    require("../cli/create/create")(name, options);
  });

getPluginsCommands().forEach(pluginCommand => {
  // console.jsonDie(pluginCommand);
  program
    .command(pluginCommand.name)
    .description(pluginCommand.name)
    .allowUnknownOption()
    .action(() => {
      const CommandApi = require("../command/CommandApi");
      const commandApi = new CommandApi({
        pluginName: pluginCommand.pluginName
      });
      const command = require(pluginCommand.resolve);
      if (isFunction(command)) {
        command(commandApi);
      }
    });
});

// TODO:
// program
//   .command("test [options]")
//   .description(
//     "install a plugin and invoke its generator in an already created project"
//   )
//   .allowUnknownOption()
//   .action(() => {
//     require("../scripts/test")(minimist(process.argv.slice(2)));
//   });

program
  .command("start")
  .description("start development server")
  .allowUnknownOption()
  .action(() => {
    // trick for config-overrides/index.js, this allow to run reacticoon in different ways:
    // - yarn start
    // - yarn reacticoon start
    process.env.scriptName = "start";
    require("../scripts/start");
  });

program
  .command("build")
  .description("build")
  .allowUnknownOption()
  .action(() => {
    // trick for config-overrides/index.js, this allow to run reacticoon in different ways:
    // - yarn build
    // - yarn reacticoon build
    process.env.scriptName = "build";
    require("../scripts/build");
  });

program
  .command("checkup")
  .description("run checkups")
  .allowUnknownOption()
  .action(() => {
    // trick for config-overrides/index.js, this allow to run reacticoon in different ways:
    // - yarn start
    // - yarn reacticoon checkup
    process.env.scriptName = "checkup";
    require("../checkup/checkup");
  });

// TODO:
// program
//   .command("analyze-build")
//   .description("start development server")
//   .allowUnknownOption()
//   .action(() => {
//     require("../analyze/build/analyze-build");
//   });

// scripts.forEach(script => {
//   program.command();
// });

// output help information on unknown commands
program.arguments("<command>").action(cmd => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
  suggestCommands(cmd);
});

// add some useful info on help
program.on("--help", () => {
  console.log();
  console.log(
    `  Run ${chalk.cyan(
      `yarn reacticoon <command> --help`
    )} for detailed usage of given command.`
  );
  console.log();
});

program.commands.forEach(c => c.on("--help", () => console.log()));

// enhance common error messages
const enhanceErrorMessages = require("../cli-utils/enhanceErrorMessages");

enhanceErrorMessages("missingArgument", argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`;
});

enhanceErrorMessages("unknownOption", optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`;
});

enhanceErrorMessages("optionMissingArgument", (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  );
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map(cmd => cmd._name);

  const suggestion = didYouMean(unknownCommand, availableCommands);
  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));
  }
}

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {};
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ""));
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== "function" && typeof cmd[key] !== "undefined") {
      args[key] = cmd[key];
    }
  });
  return args;
}

// const spawn = require("cross-spawn");
// const find = require("lodash/find");

// const spawn = require("react-dev-utils/crossSpawn");
// const args = process.argv.slice(2);

// const scriptIndex = args.findIndex(x => scripts.indexOf(x !== -1));
// const scriptName = scriptIndex === -1 ? args[0] : args[scriptIndex];
// const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

// const execute = (script, filepath) => {
//   const finalArgs = nodeArgs
//     // for now, we delegate to react-app-rewired
//     .concat(require.resolve(filepath + script))
//     .concat(args.slice(scriptIndex + 1));
//   // console.log(finalArgs);
//   // die

//   const result = spawn.sync("node", finalArgs, { stdio: "inherit" });
//   if (result.signal) {
//     if (result.signal === "SIGKILL") {
//       console.log(
//         "The build failed because the process exited too early. " +
//           "This probably means the system ran out of memory or someone called " +
//           "`kill -9` on the process."
//       );
//     } else if (result.signal === "SIGTERM") {
//       console.log(
//         "The build failed because the process exited too early. " +
//           "Someone might have called `kill` or `killall`, or the system could " +
//           "be shutting down."
//       );
//     }
//     process.exit(1);
//   }
//   process.exit(result.status);
// };

// const script = find(scripts, script => script.name === scriptName);

// if (script) {
//   console.debug(`--- create-reacticoon-app ${script.name}`);
//   execute(script.name, script.path + "/");
// } else {
//   const pluginsCommands = getPluginsCommands();
//   const command = find(pluginsCommands, command => command.name === scriptName);
//   if (command) {
//     execute(command.name, command.resolveDirectory + "/");
//     return;
//   }

//   console.log(`Unknown script "${scriptName}."`);
//   console.log(
//     `Available scripts:\n  ${scripts
//       .map(script => script.name)
//       .concat(pluginsCommands.map(command => command.name))
//       .join("\n  ")}.`
//   );
//   console.log("You may need to update create-reacticoon-app");
//   // TODO: link documentation
//   console.log("See: TODO LINK");
// }
