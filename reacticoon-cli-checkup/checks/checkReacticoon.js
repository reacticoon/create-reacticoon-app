const createCheck = require("../utils/createCheck");
const check = require("../utils/check");
const warn = require("../utils/warn");
const getNpmLastVersion = require("../utils/getNpmLastVersion");
const paths = require("../../utils/paths");

const packageJson = require(paths.projectDir + "/package.json");

const run = () => {
  const reacticoonVersion = packageJson.dependencies.reacticoon;

  check(
    reacticoonVersion,
    `reacticoon is defined on your package.json`,
    `reacticoon is missing from your package.json`
  );

  if (reacticoonVersion) {
    const lastVersion = getNpmLastVersion("reacticoon");
    warn(
      !lastVersion || lastVersion === reacticoonVersion,
      'reacticoon is up to date'
      `reacticoon: a new version is available ${lastVersion}`
    );
  }
};

module.exports = createCheck({
  name: "reacticoon",
  description: "Check for Reacticoon",
  run
});
