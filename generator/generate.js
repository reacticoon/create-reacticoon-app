const find = require("lodash/find");

const getReacticoonPluginsWithGenerators = require("../cli-utils/reacticoon-config/getReacticoonPluginsWithGenerators");

function getPluginsGenerators() {
  return getReacticoonPluginsWithGenerators().reduce(
    (generatorsList, plugin) => {
      return generatorsList.concat(plugin.generators);
    },
    []
  );
}

function loadGenerator(generatorData) {
  if (generatorData.generator) {
    // already loaded
    return generatorData.generator;
  }
  const path = generatorData.resolve;
  try {
    const generator = require(path);
    // we put it in cache
    generatorData.generator = generator;
    return generator;
  } catch (e) {
    // This should not happen. We exit so the user can see the error.
    console.error(`Could not find Generator on path '${path}'`);
    console.error(e);
    process.exit();
  }
}

function main(argv) {
  const templateName = argv[2];

  // TODO: templateName as a path to the template to provides a custom generator.
  const rootGenerators = getPluginsGenerators();

  let found = false;
  rootGenerators.forEach(rootGeneratorPath => {
    const generator = loadGenerator(rootGeneratorPath);
    if (generator.hasTemplate(templateName)) {
      found = true;

      runTemplate(generator, templateName, argv.splice(3));
    }
  });

  if (!found) {
    console.error(`Could not find template ${templateName}.`);
    console.log(getTemplateListStr(rootGenerators));
    process.exit();
  }
}

function error(msg) {
  console.error(msg + "\n\n" + `Usage: [cmd] templateName [...options]`);
  process.exit();
}

function runTemplate(rootGenerator, templateName, generatorArgs) {
  if (!templateName) {
    console.error(`Missing templateName argument`);
  }

  const template = find(
    rootGenerator.templates,
    template => template.name === templateName
  );

  // TODO: template is required(), handle with string path

  if (!template) {
    console.error(
      `Invalid templateName '${templateName}'. Template not found.`
    );
    process.exit();
  }

  const data = {
    cwd: process.cwd()
  };

  template.handler(generatorArgs, data);
}

function getTemplateListStr(rootGenerators) {
  let str = "";

  rootGenerators.forEach(rootGenerator => {
    console.log(rootGenerator);
    str = `${str}\n${rootGenerator.getTemplateListStr()}`;
  });

  return str;
}

main(process.argv);
