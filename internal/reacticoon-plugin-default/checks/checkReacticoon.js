const createCheck = require("../../../checkup/utils/createCheck");
const getNpmLastVersion = require("../../../checkup/utils/getNpmLastVersion");
const paths = require("../../../checkup/../utils/paths");

const packageJson = require(paths.projectDir + "/package.json");

const run = ({ check, warn }) => {
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
