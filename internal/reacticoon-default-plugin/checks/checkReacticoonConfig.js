const createCheck = require("../../../checkup/utils/createCheck");
const check = require("../../../checkup/utils/check");
const paths = require("../../../checkup/../utils/paths");
const requireOptionnal = require("../../../cli-utils/requireOptionnal")

// const packageJson = require(paths.projectDir + "/package.json");

const run = () => {
  const reacticoonConfig = requireOptionnal(paths.projectDir + "/config/reacticoon")
  
  check(
    reacticoonConfig !== false,
    `'reacticoon' config found`,
    `'reacticoon' config not found. You must create the file on your app/config directory`
  )
};

module.exports = createCheck({
  name: "reacticoon",
  description: "Check Reacticoon configuration",
  run
});
