// inspired by https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/load-plugins/validate.js
const loadPlugins = require(`./load`);
const fs = require("fs");

// Create a "flattened" array of plugins with all subplugins
// brought to the top-level. This simplifies running gatsby-* files
// for subplugins.
const flattenPlugins = plugins => {
  const flattened = [];
  const extractPlugins = plugin => {
    plugin.pluginOptions.plugins.forEach(subPlugin => {
      flattened.push(subPlugin);
      extractPlugins(subPlugin);
    });
  };

  plugins.forEach(plugin => {
    flattened.push(plugin);
    extractPlugins(plugin);
  });

  return flattened;
};

const formatPlugin = plugin => {
  const readmePath = `${plugin.resolve}/README.md`;
  plugin.hasReadme = fs.existsSync(readmePath);
  plugin.readmePath = readmePath;
};

module.exports = (config = {}) => {
  // Collate internal plugins, site config plugins, site default plugins
  const plugins = loadPlugins(config);

  // Create a flattened array of the plugins
  let flattenedPlugins = flattenPlugins(plugins);

  plugins.forEach(formatPlugin);

  return flattenedPlugins;
};
