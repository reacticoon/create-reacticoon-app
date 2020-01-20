const Filesystem = require("../../utils/Filesystem");

async function CommandReadFile(req, res) {
  const { filepath, format = null } = req.body.payload;

  let fileContent = Filesystem.readFileSync(filepath);
  if (filepath.endsWith(".json")) {
    fileContent = JSON.parse(fileContent);
  }

  // transform xml to json format
  // https://www.npmjs.com/package/xml2js
  if (format === "json" && filepath.endsWith(".xml")) {
    const xml2js = require("xml2js");
    fileContent = await xml2js.parseStringPromise(fileContent);
  }

  res.json(fileContent);
}

module.exports = CommandReadFile;
