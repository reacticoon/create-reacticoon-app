const CommandCheckup = require("./CommandCheckup");
const CommandDebugPlugin = require("./CommandDebugPlugin");
const CommandAnalyzeBuild = require("./CommandAnalyzeBuild");
const CommandBundlePhobia = require("./CommandBundlePhobia");
const CommandReadFile = require("./CommandReadFile");
const Filesystem = require("../../utils/Filesystem");

const commands = {
  CHECKUP: CommandCheckup,
  PLUGINS: CommandDebugPlugin,
  ANALYZE_BUILD: CommandAnalyzeBuild,
  BUNDLE_PHOBIA: CommandBundlePhobia,
  READ_FILE: CommandReadFile
};

const getReacticoonPluginsWithServerCommands = require("../../cli-utils/reacticoon-config/getReacticoonPluginsWithServerCommands");

function getPluginsServerCommands() {
  return getReacticoonPluginsWithServerCommands().reduce(
    (serverCommandsList, plugin) => {
      return serverCommandsList.concat(plugin.serverCommands);
    },
    []
  );
}

function loadServerCommand(commandData) {
  if (commandData.runner) {
    // already loaded
    return generatorData.runner;
  }
  console.log(commandData);
  const path = commandData.resolve;
  try {
    return require(path);
  } catch (e) {
    console.error(`Could not find Generators module on path '${path}'`);
    console.error(e);
    process.exit();
  }
}

getPluginsServerCommands().map(serverCommand => {
  commands[serverCommand.name] = serverCommand;
});

function CommandRoute(app, context) {
  app.post("/commands", (req, res) => {
    console.log(req.body);

    const commandName = req.body.command;
    const command = commands[commandName];

    if (!command) {
      console.log(JSON.stringify(commands, null, 2));
      res.send({
        error: true,
        description: `command not found ${commandName}`
      });
      return;
    }

    let runner = command;
    if (command.__IS_SERVER_COMMAND) {
      runner = loadServerCommand(command);
    }

    try {
      runner(req, res);
    } catch (e) {
      console.error(e);
      res.send({
        error: true,
        description: `Server command has crashed`,
        e
      });
    }
  });

  app.get("/retrieve-file", (req, res) => {
    // TODO: security
    const filename = req.query.filepath;
    const fileContent = Filesystem.readFileSync(filename);
    res.send(fileContent);
  });
}

module.exports = CommandRoute;
