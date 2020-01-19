// nst paths = require("../utils/paths");

// // copy of: https://github.com/timarney/react-app-rewired/blob/HEAD/packages/react-app-rewired/scripts/utils/babelTransform.js#L13
// // from https://github.com/facebook/create-react-app/blob/26f701fd60cece427d0e6c5a0ae98a5c79993640/packages/react-scripts/config/jest/babelTransform.js

// // TODO: remove file in major release
// // TODO: Reacticoon: babel-jest and babel-preset-react-app where installed on create-reacticoon-app package.json.
// // it this the right way to do it?
// const babelJest = require("babel-jest");

// const customPlugins = [];
// try {
//   const decoratorsPluginPath = require.resolve(
//     "babel-plugin-transform-decorators-legacy"
//   );
//   customPlugins.push(decoratorsPluginPath);
//   console.log("⚡ Rewired added babel-plugin-transform-decorators-legacy");
// } catch (e) {
//   //do nothing plugin not found
// }

// module.exports = babelJest.createTransformer({
//   presets: [require.resolve("babel-preset-react-app")],
//   plugins: customPlugins,
//   babelrc: true
// });

// will be override in cache. see config/jest.js
module.exports = {};
