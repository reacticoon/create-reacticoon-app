const endsWith = require("lodash/endsWith");
const camelCase = require("lodash/camelCase");
const upperFirst = require("lodash/upperFirst");
const lowerFirst = require("lodash/lowerFirst");
const mkdirp = require("mkdirp");

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

  console.info(`Create ${destPath} directory`);
  mkdirp(destPath, function(err) {
    if (err) {
      console.error(`Error while creating '${destPath}' file:\n${err}`);
      process.exit();
    } else {
      console.info(`Creating files`);

      actionName = actionName || `${moduleName}Action`;

      const templateData = {
        moduleIdentifier,
        moduleName: upperFirst(camelCase(moduleName)),
        actionName,
        actionNameCapitalized: upperFirst(actionName),
        selectorName: buildSelectorName(actionName)
      };

      createFiles(
        templateFiles,
        __dirname + "/_templates",
        destPath,
        templateData
      );
    }
  });
};

const buildSelectorName = actionName => {
  return `get${upperFirst(actionName)}Data`;
};

const ejs = require("ejs");
const fs = require("fs");

function createFiles(templateFiles, sourcePath, destPath, templateData) {
  templateFiles.forEach(templateFile => {
    createFile(
      sourcePath + "/" + templateFile,
      destPath + "/" + templateFile.replace(".ejs", ".js"),
      templateData
    );
  });
}

function createFile(templateFilePath, destPath, templateData) {
  const fileContent = fs.readFileSync(templateFilePath, "utf8");

  // https://github.com/mde/ejs
  const options = {};

  const finalContent = ejs.render(fileContent, templateData, options);

  createFileIfNotExists(destPath, finalContent);
}

function createFileIfNotExists(dest, content) {
  // TODO: enable after tests.
  // if (fs.existsSync(dest)) {
  //   console.error(`File '${dest}' already exists. Abroting.`);
  //   process.exit();
  // }

  try {
    fs.writeFileSync(dest, content);
  } catch (e) {
    console.error(`Error while creating '${dest}' file:\n${e}`);
    process.exit();
  }
}

module.exports = generateSimpleModule;
