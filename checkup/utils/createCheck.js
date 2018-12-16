const invariant = require("invariant");
const isFunction = require("lodash/isFunction")
const isEmpty = require("lodash/isEmpty")

const check = require("./check");
const warn = require("./warn");

function createCheck(props) {
  invariant(!isEmpty(props.name), `'name' required`)
  invariant(!isEmpty(props.description), `'description' required`)
  invariant(isFunction(props.run), `'run' function required`)

  let results = []

  const addResult = (result) => {
    results.push(result)
  }

  const runProps = {
    check: (isValid, validMessage, invalidMessage) => {
      addResult(check(isValid, validMessage, invalidMessage))
    },
    warn: (isValid, validMessage, warnMessage) => {
      addResult(warn(isValid, validMessage, warnMessage))
    },
  }

  return {
    ...props,
    getResults: () => results,
    run: () => {
      // reset results
      results = []
      props.run(runProps)
    }
  }
}

module.exports = createCheck