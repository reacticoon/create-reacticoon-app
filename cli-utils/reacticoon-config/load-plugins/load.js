const invariant = require("invariant");
const fs = require(`fs`);
const slash = require(`slash`);
const path = require(`path`);
const isString = require("lodash/isString");
const merge = require("lodash/merge");
const find = require("lodash/find");
const endsWith = require("lodash/endsWith");
const existsSync = require(`fs-exists-cached`).sync;
const getReacticoonConfig = require("../getReacticoonConfig");
const initiatePlugin = require("create-reacticoon-app/plugin/initiatePlugin");
const paths = require("../../../utils/paths");
const { error, info, log } = require("../../../cli-utils");

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
    generators: (plugin.generators || []).filter(Boolean).map(generator => {
      invariant(
        generator.__IS_GENERATOR,
        `generator must be created using api.createGenerator`
      );

      let resolve =
        generator[0] === "/" ? generator : `${resolvedPath}/${generator}`;
      if (!endsWith(resolve, ".js")) {
        resolve += ".js";
      }
      // TODO: check resolve is valid path

      return {
        ...generator,
        resolve,
        generator: null // to load
      };
    }),
    commands: (plugin.commands || []).filter(Boolean).map(command => {
      invariant(
        command.__IS_COMMAND,
        `command must be created using api.createCommand`
      );

      // command example:
      // {
      //   name: 'test-cmd',
      //   path: "./commands/test"
      // }
      const { name, path, description } = command;
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
        description,
        path
      };
    }),

    serverCommands: (plugin.serverCommands || [])
      .filter(Boolean)
      .map(serverCommand => {
        invariant(
          serverCommand.__IS_SERVER_COMMAND,
          `server command must be created using api.createServerCommand`
        );

        // server command example:
        // {
        //   name: 'TEST',
        //   path: "./server-commands/test"
        // }
        const { name, path } = serverCommand;
        let resolveDirectory = path[0] === "/" ? path : `${resolvedPath}`;
        let resolve = `${resolveDirectory}/${path}`;
        if (!endsWith(resolve, ".js")) {
          resolve += ".js";
        }
        // TODO: check resolve is valid path

        return {
          ...serverCommand,
          resolve,
          name,
          path
        };
      })
  };
}

function inititatePluginData(resolvedPath) {
  let plugin = require(resolvedPath);
  if (
    !plugin.__IS_REACTICOON_PLUGIN__ &&
    !plugin.__IS_REACTICOON_PLUGIN_CREATOR__
  ) {
    error(
      `Plugin ${pluginName} index.js does not export a reacticoon plugin. Use createReacticoonPlugin.`
    );
    process.exit();
  }

  if (plugin.__IS_REACTICOON_PLUGIN_CREATOR__) {
    plugin = initiatePlugin(plugin);
  }

  const packageJSON = JSON.parse(
    fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
  );

  const pluginData = {
    resolve: resolvedPath,
    name: packageJSON.name || pluginName,
    id: `${packageJSON.name || pluginName}`,
    version: packageJSON.version || createFileContentHash(resolvedPath, `**`),
    ...createPluginData(plugin, resolvedPath)
  };

  info(`Initiate ${pluginData.name}`, "cli-plugin");

  return pluginData;
}

// inspired by gatsby https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/load-plugins/load.js
function resolvePlugin(pluginName) {
  // Only find plugins when we're not given an absolute path
  if (!existsSync(pluginName)) {
    // Find the plugin in the local plugins folder
    const testsPaths = [
      `${paths.projectDir}/plugins/${pluginName}`,
      `${paths.reacticoonCliPluginsDir}/${pluginName}`,
      `${paths.appNodeModules}/${pluginName}`
    ];

    let resolvedPath = find(testsPaths, path => {
      return existsSync(path);
    });

    if (!resolvedPath) {
      error(`Could not find plugin ${pluginName} directory`);
      process.exit();
    }

    resolvedPath = slash(path.resolve(resolvedPath));
    if (!existsSync(`${resolvedPath}/package.json`)) {
      // Make package.json a requirement for local plugins too
      error(`Plugin ${pluginName} requires a package.json file`);
      process.exit();
    }

    if (!existsSync(`${resolvedPath}/index.js`)) {
      error(`Plugin ${pluginName} requires an index.js file`);
      process.exit();
    }

    return inititatePluginData(resolvedPath);
  }

  /**
   * Here we have an absolute path to an internal plugin, or a name of a module
   * which should be located in node_modules.
   */
  try {
    const resolvedPath = slash(path.dirname(require.resolve(pluginName)));
    return inititatePluginData(resolvedPath);
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

  // Add plugins from the site config.
  if (config.plugins) {
    config.plugins.forEach(plugin => {
      plugins.push(processPlugin(plugin));
    });
  }

  return plugins;
}

module.exports = load;
