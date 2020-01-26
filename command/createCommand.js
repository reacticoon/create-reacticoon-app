const invariant = require("invariant");
const isEmpty = require("lodash/isEmpty");

function createCommand(data) {
  invariant(!isEmpty(data.name), `name is required`);
  invariant(
    !isEmpty(data.description),
    `description is required for command ${data.name}`
  );
  invariant(!isEmpty(data.path), `path is required for command ${data.name}`);

  return {
    ...data,

    // will be populate later
    runner: null,

    __IS_COMMAND: true
  };
}

module.exports = createCommand;
