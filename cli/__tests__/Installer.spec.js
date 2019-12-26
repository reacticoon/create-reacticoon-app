jest.mock("fs");

process.env.REACTICOON_CONFIG_PATH = "";

const fs = require("fs-extra");
const path = require("path");
const Installer = require("../invoke/Installer");
const { loadConfiguration } = require("../../cli/configuration");

fs.writeFileSync(path.resolve("/package.json"), {});

// TODO: remove after tests
fs.writeFileSync(path.resolve("config/reacticoon.json"), { plugins: [] });
fs.writeFileSync(path.resolve("reacticoon.json"), { plugins: [] });
fs.writeFileSync(path.resolve("/reacticoon.json"), { plugins: [] });
fs.writeFileSync(path.resolve("/config/reacticoon.json"), { plugins: [] });

// prepare template fixtures
const templateDir = path.resolve(__dirname, "template");
fs.ensureDirSync(templateDir);
fs.writeFileSync(path.resolve(templateDir, "foo.js"), "foo(<%- options.n %>)");
fs.ensureDirSync(path.resolve(templateDir, "bar"));
fs.writeFileSync(path.resolve(templateDir, "bar/bar.js"), "bar(<%- m %>)");
fs.writeFileSync(path.resolve(templateDir, "bar/_bar.js"), ".bar(<%- m %>)");
fs.writeFileSync(
  path.resolve(templateDir, "entry.js"),
  `
import foo from 'foo'

new Reacticoon({
  p: p(),
  baz,
  render: h => h(App)
}).$mount('#app')
`.trim()
);
fs.writeFileSync(path.resolve(templateDir, "empty-entry.js"), `;`);
fs.writeFileSync(
  path.resolve(templateDir, "main.ts"),
  `const a: string = 'hello';`
);
fs.writeFileSync(
  path.resolve(templateDir, "hello.reacticoon"),
  `
<template>
  <p>Hello, {{ msg }}</p>
</template>
<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
`
);

// replace stubs
fs.writeFileSync(
  path.resolve(templateDir, "replace.js"),
  `
---
extend: '${path.resolve(templateDir, "bar/bar.js")}'
replace: !!js/regexp /bar\\((.*)\\)/
---
baz($1)
`.trim()
);

fs.writeFileSync(
  path.resolve(templateDir, "multi-replace-source.js"),
  `
foo(1)
bar(2)
`.trim()
);

fs.writeFileSync(
  path.resolve(templateDir, "multi-replace.js"),
  `
---
extend: '${path.resolve(templateDir, "multi-replace-source.js")}'
replace:
  - !!js/regexp /foo\\((.*)\\)/
  - !!js/regexp /bar\\((.*)\\)/
---
<%# REPLACE %>
baz($1)
<%# END_REPLACE %>

<%# REPLACE %>
qux($1)
<%# END_REPLACE %>
`.trim()
);

// dotfile stubs
fs.ensureDirSync(path.resolve(templateDir, "_vscode"));
fs.writeFileSync(path.resolve(templateDir, "_vscode/config.json"), `{}`);
fs.writeFileSync(path.resolve(templateDir, "_gitignore"), "foo");

test("api: extendPluginConfiguration", async () => {
  const pluginOptions = {
    name: "hello2",
    list: [2],
    reacticoon: {
      foo: 2,
      baz: 3,
      pluginOptions: {
        enableInSFC: true
      }
    }
  };

  const installer = new Installer({
    context: "/",
    reacticoonConfiguration: loadConfiguration(true),
    plugins: [
      {
        id: "test",
        apply: api => {
          api.extendPluginConfiguration(pluginOptions);
        }
      }
    ]
  });

  await installer.install();

  // TODO: fix, there is a sync problem with mocked fs
  // const options = getPluginConfiguration("test", true);
  const options = installer.reacticoonConfiguration.plugins[0].options;
  expect(options).toEqual(pluginOptions);
});

// test("api: extendPackage", async () => {
//   const installer = new Installer({
//     context: "/",
//     pkg: {
//       name: "hello",
//       list: [1],
//       reacticoon: {
//         foo: 1,
//         bar: 2,
//         pluginOptions: {
//           graphqlMock: true,
//           apolloEngine: false
//         }
//       }
//     },
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.extendPackage({
//             name: "hello2",
//             list: [2],
//             reacticoon: {
//               foo: 2,
//               baz: 3,
//               pluginOptions: {
//                 enableInSFC: true
//               }
//             }
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();

//   const pkg = JSON.parse(fs.readFileSync("/package.json", "utf-8"));
//   expect(pkg).toEqual({
//     name: "hello2",
//     list: [1, 2],
//     reacticoon: {
//       foo: 2,
//       bar: 2,
//       baz: 3,
//       pluginOptions: {
//         graphqlMock: true,
//         apolloEngine: false,
//         enableInSFC: true
//       }
//     }
//   });
// });

// test("api: extendPackage function", async () => {
//   const installer = new Installer({
//     context: "/",
//     pkg: { foo: 1 },
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.extendPackage(pkg => ({
//             foo: pkg.foo + 1
//           }));
//         }
//       }
//     ]
//   });

//   await installer.install();

//   const pkg = JSON.parse(fs.readFileSync("/package.json", "utf-8"));
//   expect(pkg).toEqual({
//     foo: 2
//   });
// });

// test("api: extendPackage allow git, github, http, file version ranges", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               foo: "git+ssh://git@github.com:npm/npm.git#v1.0.27",
//               baz: "git://github.com/npm/npm.git#v1.0.27",
//               bar: "expressjs/express",
//               bad: "mochajs/mocha#4727d357ea",
//               bac: "http://asdf.com/asdf.tar.gz",
//               bae: "file:../dyl",
//               "my-lib": "https://bitbucket.org/user/my-lib.git#semver:^1.0.0"
//             }
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();

//   const pkg = JSON.parse(fs.readFileSync("/package.json", "utf-8"));
//   expect(pkg).toEqual({
//     dependencies: {
//       foo: "git+ssh://git@github.com:npm/npm.git#v1.0.27",
//       baz: "git://github.com/npm/npm.git#v1.0.27",
//       bar: "expressjs/express",
//       bad: "mochajs/mocha#4727d357ea",
//       bac: "http://asdf.com/asdf.tar.gz",
//       bae: "file:../dyl",
//       "my-lib": "https://bitbucket.org/user/my-lib.git#semver:^1.0.0"
//     }
//   });
// });

// test("api: extendPackage merge nonstrictly semver deps", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               "my-lib": "https://bitbucket.org/user/my-lib.git#semver:1.0.0",
//               bar: "expressjs/express"
//             }
//           });
//         }
//       },
//       {
//         id: "test2",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               "my-lib": "https://bitbucket.org/user/my-lib.git#semver:1.2.0",
//               bar: "expressjs/express"
//             }
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();

//   const pkg = JSON.parse(fs.readFileSync("/package.json", "utf-8"));
//   expect(pkg).toEqual({
//     dependencies: {
//       "my-lib": "https://bitbucket.org/user/my-lib.git#semver:1.2.0",
//       bar: "expressjs/express"
//     }
//   });
// });

// test("api: extendPackage merge dependencies", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test1",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               foo: "^1.1.0",
//               bar: "^1.0.0"
//             }
//           });
//         }
//       },
//       {
//         id: "test2",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               foo: "^1.0.0",
//               baz: "^1.0.0"
//             }
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();

//   const pkg = JSON.parse(fs.readFileSync("/package.json", "utf-8"));
//   expect(pkg).toEqual({
//     dependencies: {
//       foo: "^1.1.0",
//       bar: "^1.0.0",
//       baz: "^1.0.0"
//     }
//   });
// });

// test("api: warn invalid dep range", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test1",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               foo: "foo"
//             }
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();

//   expect(
//     logs.warn.some(([msg]) => {
//       return (
//         msg.match(/invalid version range for dependency "foo"/) &&
//         msg.match(/injected by installer "test1"/)
//       );
//     })
//   ).toBe(true);
// });

// test("api: extendPackage dependencies conflict", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test1",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               foo: "^1.0.0"
//             }
//           });
//         }
//       },
//       {
//         id: "test2",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               foo: "^2.0.0"
//             }
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();

//   expect(
//     logs.warn.some(([msg]) => {
//       return (
//         msg.match(/conflicting versions for project dependency "foo"/) &&
//         msg.match(/\^1\.0\.0 injected by installer "test1"/) &&
//         msg.match(/\^2\.0\.0 injected by installer "test2"/) &&
//         msg.match(/Using newer version \(\^2\.0\.0\)/)
//       );
//     })
//   ).toBe(true);
// });

// test("api: extendPackage merge warn nonstrictly semver deps", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test3",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               bar: "expressjs/express"
//             }
//           });
//         }
//       },
//       {
//         id: "test4",
//         apply: api => {
//           api.extendPackage({
//             dependencies: {
//               bar: "expressjs/express#1234"
//             }
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();

//   expect(
//     logs.warn.some(([msg]) => {
//       return (
//         msg.match(/conflicting versions for project dependency "bar"/) &&
//         msg.match(/expressjs\/express injected by installer "test3"/) &&
//         msg.match(/expressjs\/express#1234 injected by installer "test4"/) &&
//         msg.match(/Using version \(expressjs\/express\)/)
//       );
//     })
//   ).toBe(true);
// });

// test("api: render fs directory", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test1",
//         apply: api => {
//           api.render("./template", { m: 2 });
//         },
//         options: {
//           n: 1
//         }
//       }
//     ]
//   });

//   await installer.install();

//   expect(fs.readFileSync("/foo.js", "utf-8")).toMatch("foo(1)");
//   expect(fs.readFileSync("/bar/bar.js", "utf-8")).toMatch("bar(2)");
//   expect(fs.readFileSync("/bar/.bar.js", "utf-8")).toMatch(".bar(2)");
//   expect(fs.readFileSync("/replace.js", "utf-8")).toMatch("baz(2)");
//   expect(fs.readFileSync("/multi-replace.js", "utf-8")).toMatch(
//     "baz(1)\nqux(2)"
//   );
//   expect(fs.readFileSync("/.gitignore", "utf-8")).toMatch("foo");
//   expect(fs.readFileSync("/.vscode/config.json", "utf-8")).toMatch("{}");
// });

// test("api: render object", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test1",
//         apply: api => {
//           api.render(
//             {
//               "foo1.js": path.join(templateDir, "foo.js"),
//               "bar/bar1.js": path.join(templateDir, "bar/bar.js")
//             },
//             { m: 3 }
//           );
//         },
//         options: {
//           n: 2
//         }
//       }
//     ]
//   });

//   await installer.install();

//   expect(fs.readFileSync("/foo1.js", "utf-8")).toMatch("foo(2)");
//   expect(fs.readFileSync("/bar/bar1.js", "utf-8")).toMatch("bar(3)");
// });

// test("api: render middleware", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test1",
//         apply: (api, options) => {
//           api.render((files, render) => {
//             files["foo2.js"] = render("foo(<%- n %>)", options);
//             files["bar/bar2.js"] = render("bar(<%- n %>)", options);
//           });
//         },
//         options: {
//           n: 3
//         }
//       }
//     ]
//   });

//   await installer.install();

//   expect(fs.readFileSync("/foo2.js", "utf-8")).toMatch("foo(3)");
//   expect(fs.readFileSync("/bar/bar2.js", "utf-8")).toMatch("bar(3)");
// });

// test("api: hasPlugin", () => {
//   new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "foo",
//         apply: api => {
//           expect(api.hasPlugin("foo")).toBe(true);
//           expect(api.hasPlugin("bar")).toBe(true);
//           expect(api.hasPlugin("baz")).toBe(true);
//           expect(api.hasPlugin("reacticoon-cli-plugin-bar")).toBe(true);
//           expect(api.hasPlugin("@reacticoon/cli-plugin-baz")).toBe(true);
//         }
//       },
//       {
//         id: "reacticoon-cli-plugin-bar",
//         apply: () => {}
//       },
//       {
//         id: "@reacticoon/cli-plugin-baz",
//         apply: () => {}
//       }
//     ]
//   });
// });

// test("api: onCreateComplete", async () => {
//   const fn = () => {};
//   const cbs = [];
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.onCreateComplete(fn);
//         }
//       }
//     ],
//     afterInvokeCbs: cbs
//   });

//   await installer.install();

//   expect(cbs).toContain(fn);
// });

// test("api: afterInvoke", async () => {
//   const fn = () => {};
//   const cbs = [];
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.afterInvoke(fn);
//         }
//       }
//     ],
//     afterInvokeCbs: cbs
//   });

//   await installer.install();

//   expect(cbs).toContain(fn);
// });

// test("api: resolve", () => {
//   new Installer("/foo/bar", {
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           expect(api.resolve("baz")).toBe(path.resolve("/foo/bar", "baz"));
//         }
//       }
//     ]
//   });
// });

// test("api: addEntryImport & addEntryInjection", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.injectImports("main.js", `import bar from 'bar'`);
//           api.injectRootOptions("main.js", ["foo", "bar"]);
//           api.render({
//             "main.js": path.join(templateDir, "entry.js")
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();
//   expect(fs.readFileSync("/main.js", "utf-8")).toMatch(
//     /import foo from 'foo'\r?\nimport bar from 'bar'/
//   );
//   expect(fs.readFileSync("/main.js", "utf-8")).toMatch(
//     /new Reacticoon\({\s+p: p\(\),\s+baz,\s+foo,\s+bar,\s+render: h => h\(App\)\s+}\)/
//   );
// });

// test("api: injectImports to empty file", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.injectImports("main.js", `import foo from 'foo'`);
//           api.injectImports("main.js", `import bar from 'bar'`);
//           api.render({
//             "main.js": path.join(templateDir, "empty-entry.js")
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();
//   expect(fs.readFileSync("/main.js", "utf-8")).toMatch(
//     /import foo from 'foo'\r?\nimport bar from 'bar'/
//   );
// });

// test("api: injectImports to typescript file", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.injectImports("main.ts", `import foo from 'foo'`);
//           api.render({
//             "main.ts": path.join(templateDir, "main.ts")
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();
//   expect(fs.readFileSync("/main.ts", "utf-8")).toMatch(/import foo from 'foo'/);
// });

// test("api: addEntryDuplicateImport", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.injectImports("main.js", `import foo from 'foo'`);
//           api.render({
//             "main.js": path.join(templateDir, "entry.js")
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();
//   expect(fs.readFileSync("/main.js", "utf-8")).toMatch(
//     /^import foo from 'foo'\s+new Reacticoon/
//   );
// });

// test("api: injectImport for .reacticoon files", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.injectImports("hello.reacticoon", `import foo from 'foo'`);
//           api.render({
//             "hello.reacticoon": path.join(templateDir, "hello.reacticoon")
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();
//   const content = fs.readFileSync("/hello.reacticoon", "utf-8");
//   expect(content).toMatch(/import foo from 'foo'/);
//   expect(content).toMatch(/<template>([\s\S]*)<\/template>/);
// });

// test("api: addEntryDuplicateInjection", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.injectRootOptions("main.js", "baz");
//           api.render({
//             "main.js": path.join(templateDir, "entry.js")
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();
//   expect(fs.readFileSync("/main.js", "utf-8")).toMatch(
//     /{\s+p: p\(\),\s+baz,\s+render/
//   );
// });

// test("api: addEntryDuplicateNonIdentifierInjection", async () => {
//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.injectRootOptions("main.js", "p: p()");
//           api.render({
//             "main.js": path.join(templateDir, "entry.js")
//           });
//         }
//       }
//     ]
//   });

//   await installer.install();
//   expect(fs.readFileSync("/main.js", "utf-8")).toMatch(
//     /{\s+p: p\(\),\s+baz,\s+render/
//   );
// });

// test("api: addConfigTransform", async () => {
//   const configs = {
//     fooConfig: {
//       bar: 42
//     }
//   };

//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.addConfigTransform("fooConfig", {
//             file: {
//               json: ["foo.config.json"]
//             }
//           });
//           api.extendPackage(configs);
//         }
//       }
//     ]
//   });

//   await installer.install({
//     extractConfigFiles: true
//   });

//   const json = v => JSON.stringify(v, null, 2);
//   expect(fs.readFileSync("/foo.config.json", "utf-8")).toMatch(
//     json(configs.fooConfig)
//   );
//   expect(installer.pkg).not.toHaveProperty("fooConfig");
// });

// test("api: addConfigTransform (multiple)", async () => {
//   const configs = {
//     bazConfig: {
//       field: 2501
//     }
//   };

//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.addConfigTransform("bazConfig", {
//             file: {
//               js: [".bazrc.js"],
//               json: [".bazrc", "baz.config.json"]
//             }
//           });
//           api.extendPackage(configs);
//         }
//       }
//     ]
//   });

//   await installer.install({
//     extractConfigFiles: true
//   });

//   const js = v => `module.exports = ${stringifyJS(v, null, 2)}`;
//   expect(fs.readFileSync("/.bazrc.js", "utf-8")).toMatch(js(configs.bazConfig));
//   expect(installer.pkg).not.toHaveProperty("bazConfig");
// });

// test("api: addConfigTransform transform reacticoon warn", async () => {
//   const configs = {
//     reacticoon: {
//       lintOnSave: "default"
//     }
//   };

//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.addConfigTransform("reacticoon", {
//             file: {
//               js: ["reacticoon.config.js"]
//             }
//           });
//           api.extendPackage(configs);
//         }
//       }
//     ]
//   });

//   await installer.install({
//     extractConfigFiles: true
//   });

//   expect(fs.readFileSync("/reacticoon.config.js", "utf-8")).toMatch(
//     `module.exports = {\n  lintOnSave: 'default'\n}`
//   );
//   expect(
//     logs.warn.some(([msg]) => {
//       return msg.match(/Reserved config transform 'reacticoon'/);
//     })
//   ).toBe(true);
// });

// test("extract config files", async () => {
//   const configs = {
//     reacticoon: {
//       lintOnSave: false
//     },
//     babel: {
//       presets: ["@reacticoon/app"]
//     },
//     postcss: {
//       autoprefixer: {}
//     },
//     eslintConfig: {
//       extends: ["plugin:reacticoon/essential"]
//     },
//     jest: {
//       foo: "bar"
//     },
//     browserslist: ["> 1%", "not <= IE8"]
//   };

//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.extendPackage(configs);
//         }
//       }
//     ]
//   });

//   await installer.install({
//     extractConfigFiles: true
//   });

//   const js = v => `module.exports = ${stringifyJS(v, null, 2)}`;
//   expect(fs.readFileSync("/reacticoon.config.js", "utf-8")).toMatch(
//     js(configs.reacticoon)
//   );
//   expect(fs.readFileSync("/babel.config.js", "utf-8")).toMatch(
//     js(configs.babel)
//   );
//   expect(fs.readFileSync("/postcss.config.js", "utf-8")).toMatch(
//     js(configs.postcss)
//   );
//   expect(fs.readFileSync("/.eslintrc.js", "utf-8")).toMatch(
//     js(configs.eslintConfig)
//   );
//   expect(fs.readFileSync("/jest.config.js", "utf-8")).toMatch(js(configs.jest));
//   expect(fs.readFileSync("/.browserslistrc", "utf-8")).toMatch(
//     "> 1%\nnot <= IE8"
//   );
// });

// test("generate a JS-Only value from a string", async () => {
//   const jsAsString = 'true ? "alice" : "bob"';

//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.extendPackage({
//             testScript: api.makeJSOnlyValue(jsAsString)
//           });
//         }
//       }
//     ]
//   });

//   await installer.install({});

//   expect(installer.pkg).toHaveProperty("testScript");
//   expect(typeof installer.pkg.testScript).toBe("function");
// });

// test("run a codemod on the entry file", async () => {
//   // A test codemod that tranforms `new Reacticoon` to `new TestReacticoon`
//   const codemod = (fileInfo, api) => {
//     const j = api.jscodeshift;
//     return j(fileInfo.source)
//       .find(j.NewExpression, {
//         callee: { name: "Reacticoon" },
//         arguments: [{ type: "ObjectExpression" }]
//       })
//       .replaceWith(({ node }) => {
//         node.callee.name = "TestReacticoon";
//         return node;
//       })
//       .toSource();
//   };

//   const installer = new Installer({
//     context: "/",
//     plugins: [
//       {
//         id: "test",
//         apply: api => {
//           api.render({
//             "main.js": path.join(templateDir, "entry.js")
//           });

//           api.transformScript("main.js", codemod);
//         }
//       }
//     ]
//   });

//   await installer.install();
//   expect(fs.readFileSync("/main.js", "utf-8")).toMatch(/new TestReacticoon/);
// });
