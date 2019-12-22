const Filesystem = require("../../utils/Filesystem");

function CommandReadFile(req, res) {
  const fileContent = Filesystem.readFileSync(req.body.payload.filepath);
  res.json(fileContent);
}

module.exports = CommandReadFile;
