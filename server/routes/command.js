const CommandCheckup = require("./CommandCheckup")
const CommandDebugPlugin = require("./CommandDebugPlugin")

const commands = {
  'CHECKUP': CommandCheckup,
  'PLUGINS': CommandDebugPlugin,
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

}

module.exports = CommandRoute