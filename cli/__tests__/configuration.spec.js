jest.mock("fs");
jest.mock("path");

process.env.REACTICOON_CONFIG_PATH = "";

const fs = require("fs");
const {
  rcPath,
  loadConfiguration,
  saveConfiguration,
  getPluginConfiguration,
  savePluginConfiguration,
  resetConfiguration,
  defaults
} = require("../configuration");

beforeEach(() => {
  resetConfiguration(defaults);
});

test("load configurations", () => {
  expect(loadConfiguration()).toEqual(defaults);

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
  expect(loadConfiguration(true)).toEqual( {
  });
});

test("save configurations", () => {
  // partial
  saveConfiguration({
    packageManager: "yarn"
  });
  expect(loadConfiguration()).toEqual({
    ...defaults,
    packageManager: "yarn"
  });

  // replace
  saveConfiguration({
    plugins: [
      {
        resolve: "reacticoon-cli-plugin-dev",
        options: {}
      }
    ]
  });
  expect(loadConfiguration()).toEqual({
    ...defaults,
    packageManager: "yarn",
    plugins: [
      {
        resolve: "reacticoon-cli-plugin-dev",
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

  const configuration = loadConfiguration();
  expect(configuration).toEqual({
    ...defaults,
    plugins: [
      {
        resolve: "reacticoon-cli-plugin-dev",
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
    ...defaults,
    plugins: [
      {
        resolve: "reacticoon-cli-plugin-dev",
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
