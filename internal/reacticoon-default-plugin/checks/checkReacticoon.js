const createCheck = require("../../../reacticoon-cli-checkup/utils/createCheck");
const check = require("../../../reacticoon-cli-checkup/utils/check");
const warn = require("../../../reacticoon-cli-checkup/utils/warn");
const getNpmLastVersion = require("../../../reacticoon-cli-checkup/utils/getNpmLastVersion");
const paths = require("../../../reacticoon-cli-checkup/../utils/paths");

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
