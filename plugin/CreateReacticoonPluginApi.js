const createCommand = require("create-reacticoon-app/command/createCommand");
const createServerCommand = require("create-reacticoon-app/server/createServerCommand");
const createGenerator = require("create-reacticoon-app/generator/createGenerator");

class CreateReacticoonPluginApi {
  createServerCommand() {
    return createServerCommand.apply(null, arguments);
  }

  createCommand() {
    return createCommand.apply(null, arguments);
  }

  createGenerator() {
    return createGenerator.apply(null, arguments);
  }
}

module.exports = CreateReacticoonPluginApi;
