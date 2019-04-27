function createServerCommand(commandName, commandDescription, path, options) {
  return {
    name: commandName,
    description: commandDescription,
    path,
    // will be populate once with resolve
    runner: null,
    options,
    __IS_SERVER_COMMAND: true
  };
}

module.exports = createServerCommand;
