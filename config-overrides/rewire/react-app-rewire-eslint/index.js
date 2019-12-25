const { getLoader } = require("../../utils/rewired");

const path = require("path");

// this is the path of eslint-loader `index.js`
const ESLINT_PATH = `eslint-loader${path.sep}dist${path.sep}cjs.js`;

function rewireEslint(config, env) {
  const matcher = rule =>
    rule.loader &&
    typeof rule.loader === "string" &&
    rule.loader.endsWith(ESLINT_PATH);

  // if `react-scripts` version < 1.0.0
  // **eslint options** is in `config`
  const oldOptions = config.eslint;
  // else `react-scripts` >= 1.0.0
  // **eslint options** is in `config.module.rules`
  const newOptions = getLoader(config, matcher).options;

  // Thx @Guria, with no break change.
  const options = oldOptions || newOptions;

  options.include = env.includePaths;
  options.useEslintrc = true;
  options.ignore = true;
}

module.exports = rewireEslint;
