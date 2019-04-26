const CommandCheckup = require("./CommandCheckup")
const CommandDebugPlugin = require("./CommandDebugPlugin")
const CommandAnalyzeBuild = require("./CommandAnalyzeBuild")
const CommandBundlePhobia = require("./CommandBundlePhobia")
const Filesystem = require("../../utils/Filesystem")

const commands = {
  'CHECKUP': CommandCheckup,
  'PLUGINS': CommandDebugPlugin,
  'ANALYZE_BUILD': CommandAnalyzeBuild,
  'BUNDLE_PHOBIA': CommandBundlePhobia,
}

function CommandRoute(app, context) {
  
  app.post('/commands', (req, res) => {
    console.log(req.body)

    const command = commands[req.body.command]

    if (!command) {
      res.send({ error: true, description: "command not found"})
    }

    command(req, res)
  });

  app.get('/retrieve-file', (req, res) => {
    // TODO: security
    const filename = req.query.filepath
    const fileContent = Filesystem.readFileSync(filename)
    res.send(fileContent)
  })
}

module.exports = CommandRoute