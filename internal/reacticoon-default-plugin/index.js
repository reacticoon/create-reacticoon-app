const createReacticoonPlugin = require('../../reacticoon-cli-utils/cli-plugin/createReacticoonPlugin')

module.exports = createReacticoonPlugin({
  checkup: [
    require.resolve("./checks/checkReacticoonConfig"),
    require.resolve("./checks/checkCreateReacticoonApp"),
    require.resolve("./checks/checkReactVersion"),
    require.resolve("./checks/checkReacticoon")
  ]
});
