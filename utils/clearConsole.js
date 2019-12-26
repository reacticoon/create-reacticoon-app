const getVersions = require("./getVersions");
const {
  chalk,
  execa,
  semver,

  clearConsole,

  hasYarn
} = require("../cli-utils");

async function getInstallationCommand() {
  if (hasYarn()) {
    const { stdout: yarnGlobalDir } = await execa("yarn", ["global", "dir"]);
    if (__dirname.includes(yarnGlobalDir)) {
      return "yarn global add";
    }
  }

  const { stdout: npmGlobalPrefix } = await execa("npm", [
    "config",
    "get",
    "prefix"
  ]);
  if (__dirname.includes(npmGlobalPrefix)) {
    return `npm i -g`;
  }
}

exports.generateTitle = async function(checkUpdate) {
  const { current, latest, error } = await getVersions();
  let title = chalk.bold.blue(`Reacticoon CLI v${current}`);

  if (process.env.REACTICOON_TEST) {
    title += " " + chalk.blue.bold("TEST");
  }
  if (process.env.REACTICOON_DEBUG) {
    title += " " + chalk.magenta.bold("DEBUG");
  }

  if (error) {
    title += "\n" + chalk.red("Failed to check for updates");
  }

  if (checkUpdate && !error && semver.gt(latest, current)) {
    if (process.env.REACTICOON_API_MODE) {
      title += chalk.green(` 🌟️ New version available: ${latest}`);
    } else {
      let upgradeMessage = `New version available ${chalk.magenta(
        current
      )} → ${chalk.green(latest)}`;

      try {
        const command = await getInstallationCommand();
        let name = require("../../package.json").name;
        if (semver.prerelease(latest)) {
          name += "@next";
        }

        if (command) {
          upgradeMessage += `\nRun ${chalk.yellow(
            `${command} ${name}`
          )} to update!`;
        }
      } catch (e) {}

      const upgradeBox = require("boxen")(upgradeMessage, {
        align: "center",
        borderColor: "green",
        dimBorder: true,
        padding: 1
      });

      title += `\n${upgradeBox}\n`;
    }
  }

  return title;
};

exports.clearConsole = async function clearConsoleWithTitle(checkUpdate) {
  const title = await exports.generateTitle(checkUpdate);
  clearConsole(title);
};
