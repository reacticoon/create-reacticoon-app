const createGenerator = require("../../../../utils/createGenerator")
const generateSimpleModule = require("./generateSimpleModule");

const simpleModuleGenerator = createGenerator({
  name: "simple-module",
  path: "module/simple",
  handler: generateSimpleModule
});

module.exports = simpleModuleGenerator;
