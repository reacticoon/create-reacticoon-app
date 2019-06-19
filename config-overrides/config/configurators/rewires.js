const rewiredUtils = require("../../utils/rewired");

function rewiresConfigurator(config, env, options) {
  // we pass this as third argument to our rewires, allowing to use Reacticoon rewire utility
  // methods
  const rewireTools = {
    // gives all our rewired utils like injectBabelPreset, injectBabelPlugin,
    // getLoader
    ...rewiredUtils,
    paths: require("../../../utils/paths")
  };

  if (options.enableSass) {
    const rewireSass = require("../../rewire/react-app-rewire-sass");
    rewireSass(config, env, rewireTools);
  }

  const rewireEslint = require("../../rewire/react-app-rewire-eslint");
  rewireEslint(config, env, rewireTools);

  // TODO: allow user / plugins to list rewires to use on options
  // TODO: doc
  (options.rewires || []).forEach(rewire => {
    // TODO: verify rewire is function
    try {
      rewire(config, env, rewireTools);
    } catch (e) {
      console.log(`An error occured while running a rewire`);
      console.error(e);
    }
  });
}

module.exports = rewiresConfigurator;
