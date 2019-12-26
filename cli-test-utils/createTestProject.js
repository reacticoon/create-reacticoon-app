const fs = require("fs-extra");
const path = require("path");
const execa = require("execa");

module.exports = function createTestProject(name, preset, cwd, initGit = true) {
  delete process.env.REACTICOON_SKIP_WRITE;

  cwd = cwd || path.resolve(__dirname, "../test");

  const projectRoot = path.resolve(cwd, name);

  const read = file => {
    return fs.readFile(path.resolve(projectRoot, file), "utf-8");
  };

  const has = file => {
    return fs.existsSync(path.resolve(projectRoot, file));
  };

  if (has(projectRoot)) {
    console.warn(
      `An existing test project already exists for ${name}. May get unexpected test results due to project re-use`
    );
  }

  const write = (file, content) => {
    const targetPath = path.resolve(projectRoot, file);
    const dir = path.dirname(targetPath);
    return fs.ensureDir(dir).then(() => fs.writeFile(targetPath, content));
  };

  const rm = file => {
    return fs.remove(path.resolve(projectRoot, file));
  };

  const run = (command, args) => {
    [command, ...args] = command.split(/\s+/);
    return execa(command, args, { cwd: projectRoot });
  };

  const cliBinPath = require.resolve("../bin/reacticoon-scripts.js");

  const applyDebugSpwan = require("../utils/applyDebugSpwan");
  applyDebugSpwan();

  const args = [
    cliBinPath,
    "create",
    name,
    "--force",
    "--inlinePreset",
    JSON.stringify(preset),
    initGit ? "--git" : "--no-git"
  ];

  const options = {
    cwd,
    stdio: "inherit"
  };

  try {
    // TODO: debug
    return execa(`node`, args, options).then(() => ({
      dir: projectRoot,
      has,
      read,
      write,
      run,
      rm
    }));
  } catch (error) {
    console.log(error);
  }
};
