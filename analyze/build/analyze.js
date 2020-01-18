// https://github.com/danvk/source-map-explorer
const paths = require("../../utils/paths");
const BuildUtils = require("../../utils/BuildUtils");

// Returns
// {
//   totalBytes: 697,
//   unmappedBytes: 0,
//   files: {
//     'node_modules/browserify/node_modules/browser-pack/_prelude.js': 463,
//     'dist/bar.js': 97,
//     'dist/foo.js': 137,
//     '<unmapped>': 0
//   },
//   html: '<!doctype html>...'
// }

function analyze() {
  const rootJsFilename = BuildUtils.getBuildRootJsFileName();
  try {
    const res = require("source-map-explorer")(
      `${paths.appBuild}${rootJsFilename}`,
      { html: true }
    );
    return {
      success: true,
      result: res,
      jsFilename: rootJsFilename
    };
  } catch (e) {
    return {
      success: false,
      error: e,
      jsFilename: rootJsFilename
    };
  }
}

module.exports = analyze;
