//
// `yarn add style-loader css-loader sass-loader node-sass`
//
// Inspired by https://sourcegraph.com/github.com/timarney/react-app-rewired/-/blob/packages/react-app-rewire-sass/index.js
// https://github.com/webpack-contrib/sass-loader
// TODO: production configuration

const paths = require("../../../utils/paths");

const fileLoader = function(conf) {
  console.log(conf)
  return conf && conf.loader && conf.loader.indexOf("/file-loader/") !== -1;
};

function rewireSass(config, env) {
  // .scss to file-loader exclude array
  // file-loader is in module->rules[]->oneOf[]
  const rulesOneOf = config.module.rules[1].oneOf
  const fileLoaderConfig = rulesOneOf.find(fileLoader);

  fileLoaderConfig.exclude.push(/\.scss$/);

  if (env !== "development") {
    throw new Exception("TODO: prod react-app-rewire-sass");
  }

  rulesOneOf.push({
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
  });

  return config;
}

module.exports = rewireSass;
