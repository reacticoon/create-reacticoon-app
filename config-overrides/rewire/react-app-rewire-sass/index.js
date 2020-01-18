// `yarn add style-loader css-loader sass-loader node-sass`
//
// Inspired by https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewire-sass/index.js
// https://github.com/webpack-contrib/sass-loader
// TODO: production configuration

const fileLoader = function(conf) {
  return conf && conf.loader && conf.loader.indexOf("/file-loader/") !== -1;
};

function rewireSass(config, env, api) {
  // .scss to file-loader exclude array
  // file-loader is in module->rules[]->oneOf[]
  api.getLoader(config, fileLoader).exclude.push(/\.scss$/);

  const paths = api.getPaths();

  const loader = {
    test: /\.scss$/,
    use: [
      paths.resolveReacticoon("style-loader"), // creates style nodes from JS strings
      paths.resolveReacticoon("css-loader"), // translates CSS into CommonJSuse: [
      // {
      //   loader: paths.requireReacticoon("postcss-loader"),
      //   options: {
      //     ident: "postcss", // https://webpack.js.org/guides/migrating/#complex-options
      //     plugins: () => [
      //       require("postcss-flexbugs-fixes"),
      //       autoprefixer({
      //         browsers: [
      //           ">1%",
      //           "last 4 versions",
      //           "Firefox ESR",
      //           "not ie < 9" // React doesn't support IE8 anyway
      //         ],
      //         flexbox: "no-2009"
      //       })
      //     ]
      //   }
      // },
      {
        loader: paths.resolveReacticoon("sass-loader"),
        options: {
          sourceMap: true
        }
      }
    ]
  };

  api.injectLoaderOneOf(config, loader);
}

module.exports = rewireSass;
