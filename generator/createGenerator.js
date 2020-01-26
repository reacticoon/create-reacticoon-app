const invariant = require("invariant");
const isEmpty = require("lodash/isEmpty");

function createGenerator(data) {
  invariant(!isEmpty(data.name), `name is required`);
  invariant(
    !isEmpty(data.description),
    `description is required for generator ${data.name}`
  );
  invariant(!isEmpty(data.path), `path is required for generator ${data.name}`);

  return {
    ...data,

    __IS_GENERATOR: true
  };
}

module.exports = createGenerator;
