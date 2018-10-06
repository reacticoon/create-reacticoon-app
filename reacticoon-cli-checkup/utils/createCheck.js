const invariant = require("invariant");
const isFunction = require("lodash/isFunction")
const isEmpty = require("lodash/isEmpty")

function createCheck(props) {
  invariant(!isEmpty(props.name), `'name' required`)
  invariant(!isEmpty(props.description), `'description' required`)
  invariant(isFunction(props.run), `'run' function required`)

  return {
    ...props,
  }
}

module.exports = createCheck