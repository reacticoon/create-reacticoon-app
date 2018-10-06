const createCheck = require("../utils/createCheck");
const check = require("../utils/check");
const warn = require("../utils/warn");
const getNpmLastVersion = require("../utils/getNpmLastVersion");
const paths = require("../../utils/paths");

const packageJson = require(paths.projectDir + "/package.json");

const run = () => {
  const createReacticoonAppVersion =
    packageJson.dependencies["create-reacticoon-app"];

  check(
    createReacticoonAppVersion,
    `create-reacticoon-app is defined on your package.json`,
    `create-reacticoon-app is missing from your package.json`
  );

  if (createReacticoonAppVersion) {
    const lastVersion = getNpmLastVersion("create-reacticoon-app");
    warn(
      !lastVersion || lastVersion === createReacticoonAppVersion,
      `create-reacticoon-app is up to date`,
      `create-reacticoon-app: a new version is available: '${lastVersion}'`,
    );
  }
};

module.exports = createCheck({
  name: "create-reacticoon-app",
  description: "Check for create-reacticoon-app",
  run
});
