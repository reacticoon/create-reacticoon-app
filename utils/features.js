const { chalk, toShortPluginId } = require("../cli-utils");

exports.getFeatures = preset => {
  const features = [];

  if (preset.cssPreprocessor) {
    features.push(preset.cssPreprocessor);
  }
  const plugins = Object.keys(preset.plugins).filter(dep => {
    return true; //dep !== "@reacticoon/create-reacticoon-app";
  });
  features.push.apply(features, plugins);
  return features;
};

exports.formatFeatures = (preset, lead, joiner) => {
  const features = exports.getFeatures(preset);
  return features
    .map(dep => {
      dep = toShortPluginId(dep);
      return `${lead || ""}${chalk.yellow(dep)}`;
    })
    .join(joiner || ", ");
};
