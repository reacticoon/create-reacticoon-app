const createGenerator = require("../../../../../../generator/utils/createGenerator")
const generateSimpleModule = require("./generateSimpleModule");

const simpleModuleGenerator = createGenerator({
  name: "simple-module",
  handler: generateSimpleModule
});

module.exports = simpleModuleGenerator;
