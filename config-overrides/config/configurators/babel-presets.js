const { injectBabelPreset } = require("../../utils/rewired");

// TODO: handle babel 7 no longer handle stage preset:
// https://github.com/babel/babel/blob/master/packages/babel-preset-stage-1/README.md
// https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets
function babelPresetConfigurator(config, env) {
  //
  // Config babel pressets
  // https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewired/index.js#L14:7
  //
  const reacticoonDefaultBabelPresets = [
    // Note: on babel 7, remove this and us babel-plugins instead
    require.resolve("babel-preset-stage-1")
  ];

  // inject the presets
  reacticoonDefaultBabelPresets.reverse().forEach(preset => {
    config = injectBabelPreset(preset, config);
  });
}

module.exports = babelPresetConfigurator;
