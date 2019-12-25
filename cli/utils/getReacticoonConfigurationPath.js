const paths = require("../../utils/paths");

const getReacticoonConfigurationPath = () => {
  return (
    process.env.REACTICOON_CONFIG_PATH || paths.projectConfiguration
  );
};

module.exports = getReacticoonConfigurationPath;
