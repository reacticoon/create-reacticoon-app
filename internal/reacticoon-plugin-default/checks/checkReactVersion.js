const createCheck = require("../../../checkup/utils/createCheck");
const paths = require("../../../utils/paths");

const packageJson = require(paths.projectDir + "/package.json");

const run = ({ check }) => {
  const reactVersion = packageJson.dependencies.react;
  const reactDomVersion = packageJson.dependencies["react-dom"];

  if (reactVersion && reactDomVersion) {
    check(
      reactVersion === reactDomVersion,
      `react and react-dom version match.`,
      `react and react-dom version must match. react: ${reactVersion}, react-dom: ${reactDomVersion}`,
    );
  }

  // TODO: check version is compatible with reacticoon
};

module.exports = createCheck({
  name: "react-version",
  description: "Check for react package verion",
  run
});
