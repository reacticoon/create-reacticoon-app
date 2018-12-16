//
// Run via node.js command line
//

const { runCheckup, displayResults } = require("./runCheckup")

function main() {
  const results = runCheckup()
  displayResults(results) 
}

main();
