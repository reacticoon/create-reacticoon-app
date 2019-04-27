const paths = require("../utils/paths");

const { setup: setupPuppeteer } = paths.requireReacticoon(
  "jest-environment-puppeteer"
);

// get the expect-puppeteer:
// https://github.com/smooth-code/jest-puppeteer/tree/master/packages/expect-puppeteer
const expect = paths.requireReacticoon("expect-puppeteer");

module.exports = async function(globalConfig) {
  await setupPuppeteer(globalConfig);

  // Your global setup
  // https://jestjs.io/docs/en/configuration.html#globalsetup-string
  global.expect = expect;
});
