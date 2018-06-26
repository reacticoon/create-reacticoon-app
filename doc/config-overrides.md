# config-overrides

## How create-reacticoon-app build your app

`create-reacticoon-app` allows you to compile your `Reacticoon` app.

Under the hood, we use [`create-react-app`](https://github.com/facebook/create-react-app).
`create-react-app` allows to "create React apps with no build configuration.".

From the `create-react-app` documentation, the philosophy is:

```text
- One Dependency: There is just one build dependency. It uses Webpack, Babel, ESLint,
and other amazing projects, but provides a cohesive curated experience on top of them.
- You don't need to configure anything. Reasonably good configuration of both development
and production builds is handled for you so you can focus on writing code.
- No Lock-In: You can “eject” to a custom setup at any time. Run a single command, and all the
configuration and build dependencies will be moved directly into your project, so you can pick
up right where you left off.
```

When you use `create-react-app` and wants to add additionnal build configuration, you have to
`eject` or create a fork.
But it is difficult to maintain, and most people wants to focus on developping the app, not
configuring the compilation (that can be hard).

`Reacticoon` use `create-react-app` because the basic possibilities are very well configured
and the community is important.

But we add our custom configuration, such as:

- auto import
- webpack aliases
- annotation
- hot reload
- circular dependency check
- sass (optionnal)

and much more (see below for an exhaustive list).

We take advantage of [react-app-rewired](https://github.com/timarney/react-app-rewired), that
allows to "Tweak the create-react-app webpack config(s) without using 'eject' and without
creating a fork of the react-scripts."

> All the benefits of create-react-app without the limitations of "no config".
> You can add plugins, loaders whatever you need.

Warning:
Overriding `create-react-app` results of breaking the ["guarantees"](https://github.com/facebook/create-react-app/issues/99#issuecomment-234657710)
provided by `create-react-app`.
This means that `create-react-app` contributors will not provide any support.

For any question, post an issue on the [create-reacticoon-app tracker](https://github.com/reacticoon/create-reacticoon-app/issues).
Please search for an exising question before posting.

## Use `config-overrides`

`react-app-rewired` allows to create a `config-overrides.js` file on the app root directory
to override the configuration.

Reacticoon does the same.

/!\ Warning /!\: Reacticoon is inspired by `react-app-rewired` but does not work
exactly like it.

While `react-app-rewired` asks for a unique `override` function to be exported by the `config-overrides.js`
file, `Reacticoon` allows to export much more configuration, to simplify.
The `override` function should be used for _advanced_ configurations.

## `config-overrides` configuration

### Options

You can export an `options` object. Those are the options given to `create-reacticoon-app`.

```javascript
/* config-overrides.js */

module.exports = {
  options: {
    enableSass: true,
    debugMode: false
  }
};
```

| name       | type    | default | description                             |
| ---------- | ------- | ------- | --------------------------------------- |
| enableSass | boolean | false   | enable sass files (`.scss`) compilation |
| debugMode  | boolean | false   | enable debugMode (see below)            |

### `debugMode`

Sometimes, you need to debug the webpack configuration. Set to true to have Reacticoon display
the final webpack configuration.
When creating an issue about the webpack configuration, you should provide the json given by
the `debugMode`.

Note: this will not run the development server.

### Override

You can provide an `override` function, that will works just like the
[react-app-rewired](https://github.com/timarney/react-app-rewired):

```javascript
/* config-overrides.js */

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  return config;
};
```

Note: Before trying to use this method to override the config, be sure that:

- `Reacticoon` does not handle by default the config you want to put in place
- `Reacticoon` does not have an option to enable what you want

## Reacticoon configuration - Default

### auto import

Allows to set 'global' import: the auto import will automatically add the import
line for the defined functions / variables:

- `tr`
- `__DEV__` (in TODO list)
- `hot` to allow use hot reload

There are two types of auto import:

- global methods like `tr`, who auto import allows to reduce code
- `create-reacticoon-app` methods, such as `hot`. It allows to use the `create-reacticoon-app` methods. Those cases are very rare (only `hot` for now).

You can add your custom auto import on the options:

```javascript
/* config-overrides.js */

module.exports = {
  options: {
    enableSass: true,
    debugMode: false,
    autoImport: [
      // if a tr function call is found on a file, it will add the import like
      // import { tr } from 'reacticoon/i18n'
      {
        import: "{ tr }",
        from: "reacticoon/i18n",
        functionName: "tr"
      }
    ]
  }
};
```

/!\ Warning /!\: You should use the `autoImport` feature with extreme caution, since it adds implicit behavior to your codebase.
Use it only for generic global functions (such as `tr`).

### webpack aliases

`webpack` allows to [add aliases](https://webpack.js.org/configuration/resolve/#resolve-alias).

Some are defined by `Reacticoon`:

- `app/` -> `src/app`
- `modules/` -> `src/module`
- `plugins/` -> `src/plugins`

You can add more (or override the default ones) by using the option `aliases`:

```javascript
const webpackAliases = {
  // the path begin at the app root directory
  plugins: "./src/my-plugins"
};
```

### decorator

You can learn more about decorators [on this article.](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)

### hot reload

> Tweak React components in real time.

Add hot reload on development.

See [`react-hot-loader`](https://github.com/gaearon/react-hot-loader).

Note: `create-reacticoon-app` provides the `react-hot-loader` `hot` function
globally.

Hot reload configuration is handled by `Reacticoon`, you have nothing to do.

### circular dependency check

> In software engineering, a circular dependency is a relation between two or more modules which either directly or
> indirectly depend on each other to function properly. Such modules are also known as mutually recursive.
> [Wikipedia](https://en.wikipedia.org/wiki/Circular_dependency)

We use [circular-dependency-plugin](https://github.com/aackerman/circular-dependency-plugin) to detect modules with circular
depency while building with webpack.

## Reacticcon configuration - Optionnal

- sass: use the `enableSass` option
