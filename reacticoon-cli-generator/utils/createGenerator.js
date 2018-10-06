const invariant = require("invariant");
const isEmpty = require("lodash/isEmpty");
const isFunction = require("lodash/isFunction");

const createGenerator = props => {
  invariant(!isEmpty(props.name), `'name' required`);
  invariant(!isEmpty(props.path), `'path' required`);
  invariant(isFunction(props.handler), `'handler' must be a function`);

  return {
    ...props
  };
};

module.exports = createGenerator;
