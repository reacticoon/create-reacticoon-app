//
// Realise a Reacticoon checkup.
//
const getReacticoonPluginsWithCheckup = require("../cli-utils/reacticoon-config/getReacticoonPluginsWithCheckup");
const symbol = require("../cli-utils/symbol");
const createCheck = require("./utils/createCheck")
const CheckApi = require("./CheckApi")

function getPluginsChecks() {
  return getReacticoonPluginsWithCheckup().reduce((checkupList, plugin) => {
    return checkupList.concat(plugin.checkup.map(checkup => {
      checkup.pluginName = plugin.name
      return checkup
    }));
  }, []);
}

function loadCheck(checkData) {
  if (checkData.check) {
    // already loaded
    return checkData.check;
  }
  const path = checkData.resolve;
  try {
    return createCheck(require(path));
  } catch (e) {
    console.error(e);
    throw new Error(`Could not find checkup module on path '${path}'`);
    process.exit();
  }
}

function runCheckup() {
  const checks = getPluginsChecks();

  const results = checks.map(checkData => {
    const checkRunner = loadCheck(checkData);

    const check = {
      data: {
        name: checkRunner.name,
        description: checkRunner.description
      }
    };
    try {
      const checkApi = new CheckApi({
        pluginName: checkData.pluginName
      });
      checkRunner.run(checkApi);
      check.results = checkApi.getResults();
    } catch (e) {
      // TODO: add doc what to do in this case -> contact dev / create issue
      // display plugin package.json issue uri
      console.error(e);
      check.error = {
        message: `An exception has been thrown.`,
        exception: e
      };
    }
    return check;
  });

  return {
    date: new Date(),
    checks: results
  };
}

function displayResults(results) {
  results.checks.forEach(check => {
    console.log(`${check.data.name}: ${check.data.description}`);

    if (check.error) {
      console.error(result.error.message);
      console.error(e);
    } else {
      check.results.forEach(result => {
        let symbolStr = "";
        switch (result.type) {
          case "GOOD":
            symbolStr = symbol.success;
            break;
          case "WARN":
            symbolStr = symbol.warn;
            break;
          case "ERROR":
            symbolStr = symbol.error;
            break;
        }
        console.log(`${symbolStr} ${result.message}`);
      });
    }

    console.log("\n");
  });
}

module.exports = {
  runCheckup,
  displayResults
};
