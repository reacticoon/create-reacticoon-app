const { runCheckup, displayResults } = require("../../checkup/runCheckup")

function CommandCheckup(req, res) {
  const checkupResult = runCheckup()

  res.json(checkupResult)
}

module.exports = CommandCheckup