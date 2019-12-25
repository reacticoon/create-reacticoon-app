const semver = require("semver");
const paths = require("../utils/paths");

function resolveFallback(request, options) {
  const Module = require("module");
  const isMain = false;
  const fakeParent = new Module("", null);

  const paths = [];

  for (let i = 0; i < options.paths.length; i++) {
    const path = options.paths[i];
    fakeParent.paths = Module._nodeModulePaths(path);
    const lookupPaths = Module._resolveLookupPaths(request, fakeParent, true);

    if (!paths.includes(path)) paths.push(path);

    for (let j = 0; j < lookupPaths.length; j++) {
      if (!paths.includes(lookupPaths[j])) paths.push(lookupPaths[j]);
    }
  }

  const filename = Module._findPath(request, paths, isMain);
  if (!filename) {
    const err = new Error(`Cannot find module '${request}'`);
    err.code = "MODULE_NOT_FOUND";
    throw err;
  }
  return filename;
}

const resolve = semver.satisfies(process.version, ">=10.0.0")
  ? require.resolve
  : resolveFallback;

exports.resolveModule = function(request, context) {
  let resolvedPath;
  const pathsToResolve = [
    context
    // paths.reacticoonDir,
    // paths.reacticoonPluginsDir + '/',
    // paths.reacticoonCliPluginsDir + '/',
  ];
  // console.json(pathsToResolve)
  try {
    resolvedPath = resolve(request, {
      paths: pathsToResolve
    });
    // const path = "/home/loic/dev/reacticoon/create-reacticoon-app/reacticoon-cli-plugins/" + request;
    // console.log({ path })
    // resolvedPath = resolve(path, pathsToResolve)
  } catch (e) {
    // console.error(e)
    // process.exit()
  }
  return resolvedPath;
};

exports.loadModule = function(request, context, force = false) {
  const resolvedPath = exports.resolveModule(request, context);
  if (resolvedPath) {
    if (force) {
      clearRequireCache(resolvedPath);
    }
    return require(resolvedPath);
  }
};

exports.clearModule = function(request, context) {
  const resolvedPath = exports.resolveModule(request, context);
  if (resolvedPath) {
    clearRequireCache(resolvedPath);
  }
};

function clearRequireCache(id, map = new Map()) {
  const module = require.cache[id];
  if (module) {
    map.set(id, true);
    // Clear children modules
    module.children.forEach(child => {
      if (!map.get(child.id)) clearRequireCache(child.id, map);
    });
    delete require.cache[id];
  }
}
