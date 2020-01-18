const paths = require("create-reacticoon-app/utils/paths");

function getAllFrontDependencies() {
  const appPackageJson = require(`${paths.projectDir}/package.json`);
  appPackageJson.dependencies;

  let allPackages = {
    ...appPackageJson.dependencies
  };

  // TODO: we should use the front configured plugins, not all our plugins list
  paths.reacticoonPluginsList.forEach(pluginPath => {
    const packageJson = require(`${pluginPath}/package.json`);

    allPackages = {
      ...allPackages,
      ...packageJson.dependencies
    };
  });

  return allPackages;
}

module.exports = getAllFrontDependencies;
