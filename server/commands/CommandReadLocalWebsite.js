var path = require("path");

// cache
const running = {};

async function CommandReadLocalWebsite(req, res, api) {
  let { filepath = null, index = "index.html", dir } = req.body.payload;

  if (filepath) {
    index = path.basename(filepath);
    dir = path.dirname(filepath);
  }

  if (!running[dir]) {
    port = api.getNetworkNextAvailablePort();
    const command = `${
      api.getPaths().createReacticoonAppNodeModules
    }/.bin/serve ${dir} -l ${port}`;

    api.info(`Running local server ${command}`, "local server");

    api.runCommand(command);

    running[dir] = port;
  } else {
    port = running[dir];
  }

  res.json({
    url: `http://localhost:${port}`
  });
}

module.exports = CommandReadLocalWebsite;
