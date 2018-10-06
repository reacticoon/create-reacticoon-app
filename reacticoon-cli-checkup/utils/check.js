const symbol = require("../../reacticoon-cli-utils/symbol")

function check(isValid, validMessage, invalidMessage) {
  if (isValid) {
    console.log(`${symbol.success} ${validMessage}`);
  } else {
    console.log(`${symbol.error} ${invalidMessage}`);
  }
}

module.exports = check;
