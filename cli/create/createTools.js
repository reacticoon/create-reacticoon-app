exports.getPromptModules = () => {
  return [
    // TODO: handle modules
    //"typescript",
    //"cssPreprocessors"
  ].map(file => require(`./promptModules/${file}`));
};
