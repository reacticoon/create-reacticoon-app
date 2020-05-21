const RewireApi = require("./RewireApi");
const { info } = require("create-reacticoon-app/cli-utils");

function rewiresConfigurator(api, config, options, env) {
  rewires = [
    require("../../rewire/react-app-rewire-eslint"),
    options.enableSass && require("../../rewire/react-app-rewire-sass"),
    ...(options.rewires || [])
  ].filter(Boolean);

  // TODO: allow user / plugins to list rewires to use on options
  // TODO: doc
  rewires.forEach(rewire => {
    info(`Rewire ${rewire.name} plugin: ${rewire.pluginName}`, "rewire");
    // TODO: verify rewire is function
    try {
      const rewireApi = new RewireApi();
      rewire(api, config, options, env, rewireApi);
    } catch (e) {
      console.log(`An error occured while running a rewire`);
      console.error(e);
    }
  });
}

module.exports = rewiresConfigurator;
