const createReacticoonPlugin = require('../../plugin/createReacticoonPlugin')

module.exports = createReacticoonPlugin({
  checkup: [
    require.resolve("./checks/checkReacticoonConfig"),
    require.resolve("./checks/checkCreateReacticoonApp"),
    require.resolve("./checks/checkReactVersion"),
    require.resolve("./checks/checkReacticoon")
  ],
  generators: [
    "./generators/module/generate-module.js",
  ],
});
