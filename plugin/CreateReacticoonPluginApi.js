const createServerCommand = require("create-reacticoon-app/server/createServerCommand");

class CreateReacticoonPluginApi {

  createServerCommand() {
    return createServerCommand.apply(null, arguments)
  }

}

module.exports = CreateReacticoonPluginApi