const path = require("path");

// this is the path of eslint-loader `index.js`
const ESLINT_PATH = `eslint-loader${path.sep}index.js`;

function getEslintOptions(getLoader, rules) {
  const matcher = rule =>
    rule.loader &&
    typeof rule.loader === "string" &&
    rule.loader.endsWith(ESLINT_PATH);
  return getLoader(rules, matcher).options;
}

function rewireEslint(config, env, { getLoader }) {
  // if `react-scripts` version < 1.0.0
  // **eslint options** is in `config`
  const oldOptions = config.eslint;
  // else `react-scripts` >= 1.0.0
  // **eslint options** is in `config.module.rules`
  const newOptions = getEslintOptions(getLoader, config.module.rules);

  // Thx @Guria, with no break change.
  const options = oldOptions || newOptions;
  options.useEslintrc = true;
  options.ignore = true;
}

module.exports = rewireEslint;
