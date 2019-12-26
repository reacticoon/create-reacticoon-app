const {
  isPlugin,
  isOfficialLocalPlugin,
  isOfficialPlugin,
  toShortPluginId,
  resolvePluginId,
  matchesPluginId
} = require("../pluginResolution");

test("isPlugin", () => {
  expect(isPlugin("foobar")).toBe(false);
  expect(isPlugin("@reacticoon/cli-plugin-foo")).toBe(true);
  expect(isPlugin("reacticoon-cli-plugin-foo")).toBe(true);
  expect(isPlugin("@foo/reacticoon-cli-plugin-foo")).toBe(true);
  expect(isPlugin("@foo.bar/reacticoon-cli-plugin-foo")).toBe(true);
});

test("isOfficialLocalPlugin", () => {
  expect(isOfficialLocalPlugin("reacticoon-cli-plugin-dev")).toBe(true)
  expect(isOfficialLocalPlugin("dev")).toBe(false)
  expect(isOfficialLocalPlugin("@reacticoon/reacticoon-cli-plugin-dev")).toBe(false)
  expect(isOfficialLocalPlugin("reacticoon-cli-plugin-foo")).toBe(false);
  expect(isOfficialLocalPlugin("@foo/reacticoon-cli-plugin-foo")).toBe(false);
  expect(isOfficialLocalPlugin("@foo.bar/reacticoon-cli-plugin-foo")).toBe(false);
});

test("isOfficialPlugin", () => {
  expect(isOfficialPlugin("@reacticoon/foo")).toBe(false);
  expect(isOfficialPlugin("@reacticoon/cli-plugin-foo")).toBe(true);
  expect(isOfficialPlugin("reacticoon-cli-plugin-foo")).toBe(false);
  expect(isOfficialPlugin("@foo/reacticoon-cli-plugin-foo")).toBe(false);
  expect(isOfficialPlugin("@foo.bar/reacticoon-cli-plugin-foo")).toBe(false);
  expect(isOfficialPlugin("dev")).toBe(false)
});

test("toShortPluginId", () => {
  expect(toShortPluginId("@reacticoon/cli-plugin-foo")).toBe("foo");
  expect(toShortPluginId("reacticoon-cli-plugin-foo")).toBe("foo");
  expect(toShortPluginId("@foo/reacticoon-cli-plugin-foo")).toBe("foo");
  expect(toShortPluginId("@foo.bar/reacticoon-cli-plugin-foo")).toBe("foo");
});

test("resolvePluginId", () => {
  // already full
  expect(resolvePluginId("@reacticoon/cli-plugin-foo")).toBe(
    "@reacticoon/cli-plugin-foo"
  );
  expect(resolvePluginId("reacticoon-cli-plugin-foo")).toBe(
    "reacticoon-cli-plugin-foo"
  );
  expect(resolvePluginId("@foo/reacticoon-cli-plugin-foo")).toBe(
    "@foo/reacticoon-cli-plugin-foo"
  );
  expect(resolvePluginId("@foo.bar/reacticoon-cli-plugin-foo")).toBe(
    "@foo.bar/reacticoon-cli-plugin-foo"
  );

  // scoped short
  expect(resolvePluginId("@reacticoon/foo")).toBe("@reacticoon/cli-plugin-foo");
  expect(resolvePluginId("@foo/foo")).toBe("@foo/reacticoon-cli-plugin-foo");
  expect(resolvePluginId("@foo.bar/foo")).toBe(
    "@foo.bar/reacticoon-cli-plugin-foo"
  );

  // default short
  expect(resolvePluginId("foo")).toBe("reacticoon-cli-plugin-foo");
});

test("matchesPluginId", () => {
  // full
  expect(
    matchesPluginId("@reacticoon/cli-plugin-foo", "@reacticoon/cli-plugin-foo")
  ).toBe(true);
  expect(
    matchesPluginId("reacticoon-cli-plugin-foo", "reacticoon-cli-plugin-foo")
  ).toBe(true);
  expect(
    matchesPluginId(
      "@foo/reacticoon-cli-plugin-foo",
      "@foo/reacticoon-cli-plugin-foo"
    )
  ).toBe(true);
  expect(
    matchesPluginId(
      "@foo.bar/reacticoon-cli-plugin-foo",
      "@foo.bar/reacticoon-cli-plugin-foo"
    )
  ).toBe(true);

  // short without scope
  expect(matchesPluginId("foo", "@reacticoon/cli-plugin-foo")).toBe(true);
  expect(matchesPluginId("foo", "reacticoon-cli-plugin-foo")).toBe(true);
  expect(matchesPluginId("foo", "@foo/reacticoon-cli-plugin-foo")).toBe(true);
  expect(matchesPluginId("foo", "@foo.bar/reacticoon-cli-plugin-foo")).toBe(
    true
  );

  // short with scope
  expect(matchesPluginId("@reacticoon/foo", "@reacticoon/cli-plugin-foo")).toBe(
    true
  );
  expect(matchesPluginId("@foo/foo", "@foo/reacticoon-cli-plugin-foo")).toBe(
    true
  );
  expect(
    matchesPluginId("@foo.bar/foo", "@foo.bar/reacticoon-cli-plugin-foo")
  ).toBe(true);
});
