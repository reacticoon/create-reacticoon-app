// https://github.com/danvk/source-map-explorer
const paths = require("../../utils/paths")
const BuildUtils = require("../../utils/BuildUtils")


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
  const buildId = BuildUtils.getBuildId()
  try {
    const res = require('source-map-explorer')(paths.appBuild + `/static/js/main.${buildId}.js`, { html: true })
    return {
      success: true,
      result: res,
      buildId,
    }
  } catch (e)  {
    return {
      success: false,
      error: e,
      buildId,
    }
  }
}


module.exports = analyze