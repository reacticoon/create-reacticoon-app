"use strict";

const createRootGenerator = require("../../../../reacticoon-cli-generator/utils/createRootGenerator")

module.exports = createRootGenerator({
  templates: [
    require("./generators/simple-module"), // TODO: handle without require.
  ],
})