const CommandCheckup = require("./CommandCheckup")

const commands = {
  'CHECKUP': CommandCheckup,
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