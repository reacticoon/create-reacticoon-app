const symbol = require("../../reacticoon-cli-utils/symbol")

function warn(isValid, validMessage, warnMessage) {
  if (!isValid) {
    console.log(`${symbol.warning} ${warnMessage}`);
  } else {
    console.log(`${symbol.success} ${validMessage}`);
  }
}

module.exports = warn;
