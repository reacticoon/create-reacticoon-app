const mkdirp = require("mkdirp");
const ejs = require("ejs");
const fs = require("fs");

function createTemplateFiles(
  templateFiles,
  sourcePath,
  destPath,
  templateData
) {
  const destRelativePath = destPath.replace(process.cwd(), "")
  console.info(`Create ${destRelativePath} directory`);
  mkdirp(destPath, function(err) {
    if (err) {
      console.error(`Error while creating '${destPath}' file:\n${err}`);
      process.exit();
    } else {
      console.info(`Creating files`);

      templateFiles.forEach(templateFile => {
        createFile(
          sourcePath + "/" + templateFile,
          destPath + "/" + templateFile.replace(".ejs", ".js"),
          templateData
        );
      });
    }
  });
}

function createFile(templateFilePath, destPath, templateData) {
  const fileContent = fs.readFileSync(templateFilePath, "utf8");

  // https://github.com/mde/ejs
  const options = {};

  const finalContent = ejs.render(fileContent, templateData, options);

  createFileIfNotExists(destPath, finalContent);
}

function createFileIfNotExists(dest, content) {
  if (fs.existsSync(dest)) {
    console.error(`File '${dest}' already exists. Abroting.`);
    process.exit();
  }

  try {
    fs.writeFileSync(dest, content);
  } catch (e) {
    console.error(`Error while creating '${dest}' file:\n${e}`);
    process.exit();
  }
}

module.exports = createTemplateFiles;
