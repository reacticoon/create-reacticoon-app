jest.mock("fs");
jest.mock("path");

process.env.REACTICOON_CONFIG_PATH = "";

const fs = require("fs");
const {
  rcPath,
  loadConfiguration,
  saveConfiguration,
  getPluginConfiguration,
  savePluginConfiguration
} = require("../configuration");

test("load configurations", () => {
  expect(loadConfiguration()).toEqual({});

  //
  // directly write to file.
  //

  fs.writeFileSync(
    rcPath,
    JSON.stringify(
      {
        plugins: []
      },
      null,
      2
    )
  );
  // configurations is cached here.
  expect(loadConfiguration()).toEqual({
    // plugins: []
  });
});

// test("should not save unknown fields", () => {
//   saveConfiguration({
//     foo: "bar"
//   });
//   expect(loadConfiguration()).toEqual({
//     presets: {}
//   });
// });

test("save configurations", () => {
  // partial
  saveConfiguration({
    packageManager: "yarn"
  });
  expect(loadConfiguration()).toEqual({
    packageManager: "yarn"
    // plugins: []
  });

  // replace
  saveConfiguration({
    plugins: [
      {
        resolve: "reacticoon-dev-cli-plugin",
        options: {}
      }
    ]
  });
  expect(loadConfiguration()).toEqual({
    packageManager: "yarn",
    plugins: [
      {
        resolve: "reacticoon-dev-cli-plugin",
        options: {}
      }
    ]
  });
});

test("getPluginConfiguration", () => {
  savePluginConfiguration("bar", { a: 2 });
  expect(getPluginConfiguration("bar")).toEqual({ a: 2 });

  // should entirely replace presets
  savePluginConfiguration("bar", { d: 4 });
  expect(getPluginConfiguration("bar")).toEqual({ d: 4 });
});

test("save preset", () => {
  savePluginConfiguration("bar", { a: 2 });
  expect(loadConfiguration()).toEqual({
    packageManager: "yarn",
    plugins: [
      {
        resolve: "reacticoon-dev-cli-plugin",
        options: {}
      },
      {
        resolve: "bar",
        options: {
          a: 2
        }
      }
    ]
  });

  // should entirely replace presets
  savePluginConfiguration("foo", { c: 3 });
  savePluginConfiguration("bar", { d: 4 });
  expect(loadConfiguration()).toEqual({
    packageManager: "yarn",
    plugins: [
      {
        resolve: "reacticoon-dev-cli-plugin",
        options: {}
      },
      {
        resolve: "bar",
        options: {
          d: 4
        }
      },
      {
        resolve: "foo",
        options: {
          c: 3
        }
      }
    ]
  });
});
