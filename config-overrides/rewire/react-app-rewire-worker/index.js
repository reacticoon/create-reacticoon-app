const fileLoader = function(conf) {
  return conf && conf.loader && conf.loader.indexOf("/file-loader/") !== -1;
};

function rewireWorker(config, env, { paths }) {
  // .scss to file-loader exclude array
  // file-loader is in module->rules[]->oneOf[]
  const rulesOneOf = config.module.rules[1].oneOf;

  // TODO: is it necessary ?
  const fileLoaderConfig = rulesOneOf.find(fileLoader);
  fileLoaderConfig.exclude.push(/\.worker.js$/);

  // add before .js file handling
  rulesOneOf.splice(1, 0, {
    test: /\.worker\.js$/,
    use: {
      loader: paths.resolveReacticoon("worker-loader")
    }
  });

  // console.log(JSON.stringify(rulesOneOf, null, 2))
  // die

  return config;
}

module.exports = rewireWorker;
