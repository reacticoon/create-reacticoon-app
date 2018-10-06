const find = require("lodash/find");

const generateModule = require("./generators/module/generate-module");

const rootGenerators = [generateModule];

function main(argv) {
  const templateName = argv[2];

  // TODO: templateName as a path to the template to provides a custom generator.

  let found = false;
  rootGenerators.forEach(rootGenerator => {
    if (rootGenerator.hasTemplate(templateName)) {
      found = true;

      runTemplate(rootGenerator, templateName, argv.splice(3));
    }
  });

  if (!found) {
    console.error(`Could not find template ${templateName}.`);
    console.log(getTemplateListStr(rootGenerators));
  }
}

function error(msg) {
  console.error(msg + "\n\n" + `Usage: [cmd] templateName [...options]`);
  process.exit();
}

function runTemplate(rootGenerator, templateName, generatorArgs) {
  if (!templateName) {
    error(`Missing templateName argument`);
  }

  const template = find(
    rootGenerator.templates,
    template => template.name === templateName
  );

  if (!template) {
    error(`Invalid templateName '${templateName}'. Template not found.`);
  }

  const data = {
    cwd: process.cwd()
  };

  template.handler(generatorArgs, data);
}

function getTemplateListStr(rootGenerators) {
  let str = "";

  rootGenerators.forEach(rootGenerator => {
    str = `${str}\n${rootGenerator.getTemplateListStr()}`;
  });

  return str;
}

main(process.argv);
