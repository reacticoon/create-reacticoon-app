"use strict";

const createRootGenerator = require("../../../../generator/utils/createRootGenerator")

module.exports = createRootGenerator({
  templates: [
    require("./generators/simple-module"), // TODO: handle without require.
  ],
})