const {
  setReacticoonFrontConfiguration
} = require("create-reacticoon-app/front");

function CommandReacticoonConfiguration(req, res) {
  const configuration = req.body.payload;

  setReacticoonFrontConfiguration(configuration);

  res.json({ success: true });
}

module.exports = CommandReacticoonConfiguration;
