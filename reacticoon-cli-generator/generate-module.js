"use strict";

const find = require("lodash/find");

const simpleModule = require("./generators/simple-module");

const templates = [
  simpleModule,
];

function error(msg) {
  console.error(
    msg
    + '\n\n'
    + `Usage: [cmd] templateName [...options]`
  )
  process.exit();
}

function main() {
  const templateName = process.argv[2];

  if (!templateName) {
    error(`Missing templateName argument`)
  }

  const generatorArgs = [ ...process.argv ]
  generatorArgs.splice(0, 3);

  const template = find(templates, template => template.name === templateName);

  if (!template) {
    error(`Invalid templateName '${templateName}'. Template not found.`);
  }

  const data = {
    cwd: process.cwd(),
  }

  template.handler(generatorArgs, data);
}

main()