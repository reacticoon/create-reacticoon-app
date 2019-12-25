//
//
//

function rewireAutoImport(config, env, autoImportConfig) {
  // .scss to file-loader exclude array
  // file-loader is in module->rules[]->oneOf[]
  const preRule = config.module.rules[1];

  const loader = {
    loader: require.resolve(__dirname + "/auto-import-preloader"),
    options: {
      config: autoImportConfig
    }
  };

  // must be the first module to be run, to avoid linter / compilation error of missing imports.
  preRule.use.push(loader);
  return config;
}

module.exports = rewireAutoImport;
