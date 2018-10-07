const fs = require(`fs`);
const slash = require(`slash`);
const path = require(`path`);
const isString = require("lodash/isString");
const merge = require("lodash/merge");
const endsWith = require("lodash/endsWith");
const existsSync = require(`fs-exists-cached`).sync;
const getReacticoonConfig = require("../getReacticoonConfig");

function createPluginData(plugin, resolvedPath) {
  return {
    ...plugin,
    checkup: (plugin.checkup || []).map(check => {
      if (isString(check)) {
        let resolve = check[0] === "/" ? check : `${resolvedPath}/${check}`;
        if (!endsWith(resolve, ".js")) {
          resolve += ".js";
        }
        // TODO: check resolve is valid path

        return {
          resolve,
          check: null // to load
        };
      } else {
        // TODO: throw
      }
    }),
    generators: (plugin.generators || []).map(generator => {
      if (isString(generator)) {
        let resolve = generator[0] === "/" ? generator : `${resolvedPath}/${generator}`;
        if (!endsWith(resolve, ".js")) {
          resolve += ".js";
        }
        // TODO: check resolve is valid path

        return {
          resolve,
          generator: null // to load
        };
      } else {
        // TODO: throw
      }
    }),
    commands: (plugin.commands || []).map(command => {
      // command example:
      // {
      //   name: 'test-cmd',
      //   path: "./commands/test"
      // }
      const { name, path } = command
      let resolveDirectory = path[0] === "/" ? path : `${resolvedPath}/${path}`;
      let resolve = `${resolveDirectory}/${name}`;
      if (!endsWith(resolve, ".js")) {
        resolve += ".js";
      }
      // TODO: check resolve is valid path

      return {
        resolveDirectory,
        resolve,
        name,
        path,
      };
    })
  };
}

// inspired by gatsby https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/load-plugins/load.js
function resolvePlugin(pluginName) {
  // Only find plugins when we're not given an absolute path
  if (!existsSync(pluginName)) {
    // Find the plugin in the local plugins folder
    const resolvedPath = slash(path.resolve(`./plugins/${pluginName}`));

    if (existsSync(resolvedPath)) {
      if (!existsSync(`${resolvedPath}/package.json`)) {
        // Make package.json a requirement for local plugins too
        throw new Error(`Plugin ${pluginName} requires a package.json file`);
      }

      const packageJSON = JSON.parse(
        fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
      );

      if (!existsSync(`${resolvedPath}/index.js`)) {
        throw new Error(`Plugin ${pluginName} requires an index.js file`);
      }

      const plugin = require(resolvedPath);

      if (!plugin.__IS_REACTICOON_PLUGIN__) {
        throw new Error(
          `Plugin ${pluginName} index.js does not export a reacticoon plugin. Use createReacticoonPlugin.`
        );
      }

      return {
        resolve: resolvedPath,
        name: packageJSON.name || pluginName,
        id: `Plugin ${packageJSON.name || pluginName}`,
        version:
          packageJSON.version || createFileContentHash(resolvedPath, `**`),
        ...createPluginData(plugin, resolvedPath)
      };
    }
  }

  /**
   * Here we have an absolute path to an internal plugin, or a name of a module
   * which should be located in node_modules.
   */
  try {
    const resolvedPath = slash(path.dirname(require.resolve(pluginName)));

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    );

    const plugin = require(resolvedPath);

    return {
      resolve: resolvedPath,
      id: `Plugin ${packageJSON.name}`,
      name: packageJSON.name,
      version: packageJSON.version,
      ...createPluginData(plugin, resolvedPath)
    };
  } catch (err) {
    console.error(err);
    throw new Error(
      `Unable to find plugin "${pluginName}". Perhaps you need to install its package?`
    );
  }
}

function load() {
  const config = getReacticoonConfig();
  const plugins = [];

  // Create fake little site with a plugin for testing this
  // w/ snapshots. Move plugin processing to its own module.
  // Also test adding to redux store.
  const processPlugin = plugin => {
    if (isString(plugin)) {
      const info = resolvePlugin(plugin);

      return {
        ...info,
        pluginOptions: {
          plugins: []
        }
      };
    } else {
      // Plugins can have plugins.
      const subplugins = [];
      if (plugin.options && plugin.options.plugins) {
        plugin.options.plugins.forEach(p => {
          subplugins.push(processPlugin(p));
        });

        plugin.options.plugins = subplugins;
      }

      // Add some default values for tests as we don't actually
      // want to try to load anything during tests.
      if (plugin.resolve === `___TEST___`) {
        return {
          name: `TEST`,
          pluginOptions: {
            plugins: []
          }
        };
      }

      const info = resolvePlugin(plugin.resolve);

      return {
        ...info,
        pluginOptions: merge({ plugins: [] }, plugin.options)
      };
    }
  };

  // Add internal plugins
  const internalPlugins = ["../../../internal/reacticoon-default-plugin"];

  internalPlugins.forEach(relPath => {
    const absPath = path.join(__dirname, relPath);
    plugins.push(processPlugin(absPath));
  });

  // Add plugins from the site config.
  if (config.plugins) {
    config.plugins.forEach(plugin => {
      plugins.push(processPlugin(plugin));
    });
  }

  return plugins;
}

module.exports = load;
