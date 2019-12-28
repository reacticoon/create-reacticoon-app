const { error } = require("create-reacticoon-app/cli-utils")
const { saveCacheFile, getCacheFile } = require("create-reacticoon-app/utils/Filesystem")

const configurationCacheFilepath = 'reacticoon_configuration.json'

let _frontConfiguration = null
try {
  _frontConfiguration = JSON.parse(getCacheFile(configurationCacheFilepath))
} catch (_) {}

const setReacticoonFrontConfiguration = configuration => {
  _frontConfiguration = configuration;
  saveCacheFile(configurationCacheFilepath, JSON.stringify(configuration))
};

const getReacticoonFrontConfiguration = () => {
  if (!_frontConfiguration) {
    error("front configuration is null");
  }
  return _frontConfiguration
};

const getRoutes = () => {
  return getReacticoonFrontConfiguration().routes;
};

const getPlugins = () => {
  return getReacticoonFrontConfiguration().plugins;
};

module.exports = {
  setReacticoonFrontConfiguration,
  getRoutes,
  getPlugins
};
