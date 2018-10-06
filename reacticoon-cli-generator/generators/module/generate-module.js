"use strict";

const simpleModule = require("./generators/simple-module");

const createRootGenerator = require("../../utils/createRootGenerator")

module.exports = createRootGenerator({
  templates: [
    simpleModule
  ],
})