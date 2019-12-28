const CommandCheckup = require("../commands/CommandCheckup");
const CommandDebugPlugins = require("../commands/CommandDebugPlugins");
const CommandDebugPlugin = require("../commands/CommandDebugPlugin");
const CommandAnalyzeBuild = require("../commands/CommandAnalyzeBuild");
const CommandBundlePhobia = require("../commands/CommandBundlePhobia");
const CommandReadFile = require("../commands/CommandReadFile");
const CommandReadMarkdownFile = require("../commands/CommandReadMarkdownFile");
const Filesystem = require("../../utils/Filesystem");
const CliPluginApi = require("../../plugin/CliPluginApi");

// List the reacticoon default commands.
// We add on it the cli-plugins commands.
// The key is the command name, while the value is the command itself.
// A command is a function that receives the request and result:
// ```
// function myCommand(req, res) {
//    res.send({ result: true })
// }
// ```
// TODO: lazy load commands?
let commands = {};

function loadCommands() {
  commands = {
    CHECKUP: CommandCheckup,
    PLUGINS: CommandDebugPlugins,
    PLUGIN: CommandDebugPlugin,
    ANALYZE_BUILD: CommandAnalyzeBuild,
    BUNDLE_PHOBIA: CommandBundlePhobia,
    READ_FILE: CommandReadFile,
    READ_MARKDOWN_FILE: CommandReadMarkdownFile
  };
  // add plugin commands to our commands map
  getPluginsServerCommands().map(serverCommand => {
    commands[serverCommand.name] = serverCommand;
  });
}

const getReacticoonPluginsWithServerCommands = require("../../cli-utils/reacticoon-config/getReacticoonPluginsWithServerCommands");

/**
 * Utility that retrieve the server commands defined on the cli-plugins.
 */
function getPluginsServerCommands() {
  return getReacticoonPluginsWithServerCommands().reduce(
    (serverCommandsList, plugin) => {
      return serverCommandsList.concat(
        plugin.serverCommands.map(serverCommand => {
          serverCommand.pluginName = plugin.name;
          return serverCommand;
        })
      );
    },
    []
  );
}

/**
 * Utility that loads the server command defined on a cli-plugin.
 */
function loadServerCommand(commandData) {
  // if the `runner` property exists, then the command has previously been loaded
  if (commandData.runner) {
    // TODO: we could verify that runner is a function, in case the user set this property manually
    return commandData.runner;
  }

  // log the requested command
  console.log(commandData);

  // the resolver property contains the path of the command runner, we require it.
  const path = commandData.resolve;
  try {
    const runner = require(path);
    // we put it in cache.
    commandData.runner = runner;
    return runner;
  } catch (e) {
    // This should not happen. We exit so the user can see the error.
    console.error(`Could not find Command on path '${path}'\n\n`);
    console.error(e);
    return null;
  }
}

/**
 * Define the route '/commands' for our server.
 *
 * The route is using POST method and the `command` body parameter to know which command to run.
 */
function CommandRoute(app, context) {
  app.post("/commands", (req, res) => {
    console.log(req.body);

    // retrieve the command name on the body
    const commandName = req.body.command;

    // we load commands on each api call for now to facilitate development.
    // TODO: make optional if we are in web dev mode or cli dev mode.
    loadCommands()

    // retrieve the command configuration
    const command = commands[commandName];

    // command does not exists
    if (!command) {
      console.log(JSON.stringify(commands, null, 2));
      res.status(400).send({
        error: true,
        description: `command not found ${commandName}`
      });
      return;
    }

    // the command can either be:
    // - the function that run the command (aka runne)
    // - an object created using createServerCommand, that defines the command and its runner
    // We retrieve
    let runner = command;
    if (command.__IS_SERVER_COMMAND) {
      runner = loadServerCommand(command);
    }

    if (!runner) {
      res.status(404).send({
        error: true,
        description: `runner not found ${req.body.command}`
      });
      return;
    }

    // run our command.
    // catch any exception here to:
    // - avoid the server to crash
    // - notify the front that the command failed
    // - log the error
    try {
      console.log(
        `\n\n[command] ${req.body.command}\n${JSON.stringify(
          req.body,
          null,
          2
        )}`
      );

      pluginApi = new CliPluginApi({
        pluginName: command.pluginName
      });
      runner(req, res, pluginApi);
    } catch (e) {
      console.error(e);
      res.status(400).send({
        error: true,
        description: `Server command has crashed`,
        e
      });
    }
  });

  // TODO: put on its own route file or remove
  app.get("/retrieve-file", (req, res) => {
    // TODO: security
    const filename = req.query.filepath;
    const fileContent = Filesystem.readFileSync(filename);
    res.send(fileContent);
  });
}

module.exports = CommandRoute;
