const analyze = require("./analyze")
const Filesystem = require("../../utils/Filesystem")
const paths = require("../../utils/paths")
const openBrowser = require(paths.projectDir + '/node_modules/react-dev-utils/openBrowser')

const report = analyze()

if (!report.success) {
  console.error(`An error occured`)
  console.error(report.error)
}

// write html to temporary file
const path = `/tmp/reacticoon_build_analyze.${report.buildId}.html`
Filesystem.saveFile(path, report.result.html)

// open temporary file
openBrowser("file://" + path)