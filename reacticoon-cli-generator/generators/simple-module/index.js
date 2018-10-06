const generateSimpleModule = require("./generateSimpleModule");

const simpleModuleGenerator = {
  name: "simple-module",
  path: "module/simple",
  handler: generateSimpleModule
};

module.exports = simpleModuleGenerator;
