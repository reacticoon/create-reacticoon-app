//
// Realise a Reacticoon checkup.
//
const getReacticoonPluginsWithCheckup = require("../cli-utils/reacticoon-config/getReacticoonPluginsWithCheckup");

function getPluginsChecks() {
  return getReacticoonPluginsWithCheckup().reduce((checkupList, plugin) => {
    return checkupList.concat(plugin.checkup);
  }, []);
}

function loadCheck(checkData) {
  if (checkData.check) {
    // already loaded
    return checkData.check;
  }
  const path = checkData.resolve;
  try {
    return require(path);
  } catch (e) {
    console.error(`Could not find checkup module on path '${path}'`);
    console.error(e);
    process.exit();
  }
}

function main() {
  const checks = getPluginsChecks();
  checks.forEach(checkData => {
    const check = loadCheck(checkData);

    console.log(`${check.name}: ${check.description}`);
    try {
      check.run();
    } catch (e) {
      console.error(`An exception has been thrown.`);
      // TODO: add doc what to do in this case -> contact dev / create issue
      // display plugin package.json issue uri
      console.error(e);
    }
    console.log("\n");
  });
}

main();
