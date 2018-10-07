const endsWith = require("lodash/endsWith");
const camelCase = require("lodash/camelCase");
const upperFirst = require("lodash/upperFirst");
const lowerFirst = require("lodash/lowerFirst");
const createTemplateFiles = require("../../../../../../generator/utils/createTemplateFiles")

function error(msg) {
  console.error(msg);
  process.exit();
}

const templateFiles = [
  "index.ejs",
  "actions.ejs",
  "reducer.ejs",
  "selectors.ejs"
];

const generateSimpleModule = (args, data) => {
  const moduleIdentifier = args[0];
  let actionName = args[1];

  if (!moduleIdentifier) {
    error(`Missing module name`);
  }

  console.info(`Creating module ${moduleIdentifier}`);

  if (!endsWith(moduleIdentifier, "Module")) {
    error(`ModuleName '${moduleIdentifier}' must be suffix with 'Module'`);
  }

  const moduleName = moduleIdentifier
    .substring(moduleIdentifier.lastIndexOf(":") + 1)
    .replace("Module", "");

  const destPath = `${data.cwd}/src/modules/${lowerFirst(moduleName)}`;


  actionName = actionName || `${moduleName}Action`;

  const templateData = {
    moduleIdentifier,
    moduleName: upperFirst(camelCase(moduleName)),
    actionName,
    actionNameCapitalized: upperFirst(actionName),
    selectorName: buildSelectorName(actionName)
  };


  createTemplateFiles(
    templateFiles,
    __dirname + "/_templates",
    destPath,
    templateData
  );
};

const buildSelectorName = actionName => {
  return `get${upperFirst(actionName)}Data`;
};

module.exports = generateSimpleModule;
