const pluginRE = /^(@reacticoon\/|reacticoon-|@[\w-]+(\.)?[\w-]+\/reacticoon-)cli-plugin-/;
const scopeRE = /^@[\w-]+(\.)?[\w-]+\//;
const officialRE = /^@reacticoon\//;

const officialPlugins = [
  "reacticoon-cli-plugin-dev",
  "reacticoon-cli-plugin-test",
  "reacticoon-cli-plugin-mock-api",
  "reacticoon-cli-plugin-ci"
];

exports.isPlugin = id => pluginRE.test(id);

// TODO: temporary since we have our plugins clone on create-reacticoon-app
exports.isOfficialLocalPlugin = id =>
  exports.isPlugin(id) &&
  (officialPlugins.includes(id) ||
    officialPlugins.includes(`reacticoon-cli-plugin-${id}`));

exports.isOfficialPlugin = id =>
  (exports.isPlugin(id) && officialRE.test(id)) ||
  exports.isOfficialLocalPlugin(id);

exports.toShortPluginId = id => id.replace(pluginRE, "");

exports.resolvePluginId = id => {
  if (
    officialPlugins.includes(id) ||
    officialPlugins.includes(`reacticoon-cli-plugin-${id}`)
  ) {
    return `reacticoon-cli-plugin-${id}`;
  }

  // already full id
  // e.g. reacticoon-cli-plugin-foo, @reacticoon/cli-plugin-foo, @bar/reacticoon-cli-plugin-foo, reacticoon-plugin-test
  if (pluginRE.test(id)) {
    return id;
  }

  // scoped short
  // e.g. @reacticoon/foo, @bar/foo
  if (id.charAt(0) === "@") {
    const scopeMatch = id.match(scopeRE);
    if (scopeMatch) {
      const scope = scopeMatch[0];
      const shortId = id.replace(scopeRE, "");
      return `${scope}${
        scope === "@reacticoon/" ? `` : `reacticoon-`
      }cli-plugin-${shortId}`;
    }
  }
  // default short
  // e.g. foo
  return `reacticoon-cli-plugin-${id}`;
};

exports.matchesPluginId = (input, full) => {
  const short = full.replace(pluginRE, "");
  return (
    // input is full
    full === input ||
    // input is short without scope
    short === input ||
    // input is short with scope
    short === input.replace(scopeRE, "")
  );
};

exports.getPluginLink = id => {
  let pkg = {};
  try {
    pkg = require(`${id}/package.json`);
  } catch (e) {}
  return (
    pkg.homepage ||
    (pkg.repository && pkg.repository.url) ||
    `https://www.npmjs.com/package/${id.replace(`/`, `%2F`)}`
  );
};
