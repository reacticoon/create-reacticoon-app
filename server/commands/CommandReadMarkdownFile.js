const Filesystem = require("../../utils/Filesystem");
const showdown = require("showdown");

const converter = new showdown.Converter();

function CommandReadMarkdownFile(req, res) {
  const fileContent = Filesystem.readFileSync(req.body.payload.filepath);
  const html = converter.makeHtml(fileContent);
  res.json(html);
}

module.exports = CommandReadMarkdownFile;
