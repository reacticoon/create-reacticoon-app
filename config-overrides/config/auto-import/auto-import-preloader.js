//
// https://github.com/mjaneczek/auto-import-preloader/blob/master/index.js
//

const loaderUtils = require("loader-utils");
const assign = require("object-assign");

const parse = require("babylon").parse;
const traverse = require("babel-traverse").default;
// const babelTypes = require('babel-types')

/**
 * Class representing an AutoImportError.
 * @extends Error
 */
class AutoImportError extends Error {
  /**
   * Create an AutoImportError.
   * @param {string} messages - Formatted eslint errors.
   */
  constructor(messages) {
    super();
    this.name = "AutoImportError";
    this.message = messages;
    this.stack = "";
  }

  /**
   * Returns a stringified representation of our error. This method is called
   * when an error is consumed by console methods
   * ex: console.error(new AutoImportError(formattedMessage))
   * @return {string} error - A stringified representation of the error.
   */
  inspect() {
    return this.message;
  }
}

/**
 * Note: we don't parse the file to a JavaScript AST for performances purposes
 */
module.exports = function(source) {
  try {
    const optionsQuery = loaderUtils.getOptions(this) || {};

    const userOptions = assign(
      // user defaults
      this.options ? this.options.config || {} : {},
      // loader query string
      optionsQuery
    );

    const autoImportDefinitions = userOptions.config;

    const currentFileName = fileName(this.resourcePath);

    //
    // Handle sdk aliases
    //

    // --

    autoImportDefinitions.forEach(autoImport => {
      // handle aliases
      let from = autoImport.from;

      // should we add the import?
      if (
        isNotDefinitionFile(from, currentFileName) &&
        isNotImportedManually(autoImport, source) &&
        containsImportUsage(autoImport, source)
      ) {
        source = prependImport(autoImport, source);
      }
    });

    // Only transform this module when it has changed
    this.cacheable();

    return source;
  } catch (e) {
    throw new AutoImportError(`auto-import-preloader failure: ` + e);
  }
};

function prependImport(autoImport, fileContent) {
  return (
    `import ${autoImport.import} from '${autoImport.from}'\n` + fileContent
  );
}

function containsImportUsage(autoImport, fileContent) {
  const marker = autoImport.functionName;

  // find the function name on raw string, to avoid building ast if there is no trace of the
  // name.
  if (fileContent.search(marker) === -1) {
    return false;
  }

  try {
    let ast = parse(fileContent, {
      sourceType: "module",

      // Enable all the plugins
      plugins: [
        "jsx",
        "flow",
        "asyncFunctions",
        "classConstructorCall",
        "doExpressions",
        "trailingFunctionCommas",
        "objectRestSpread",
        "decorators",
        "classProperties",
        "exportExtensions",
        "exponentiationOperator",
        "asyncGenerators",
        "functionBind",
        "functionSent",
        "dynamicImport"
      ]
    });

    this.res = false;

    // Look for keys in the source code.
    traverse(ast, {
      CallExpression: function(path) {
        const { node } = path;

        const {
          callee: { name, type }
        } = node;

        if (
          (type === "Identifier" && name === marker) ||
          path.get("callee").matchesPattern(marker)
        ) {
          this.res = true;
        }
      }.bind(this)
    });
  } catch (e) {
    // we pass. We don't want that this module to handle the error stack trace
    // throw new AutoImportError(`Invalid file content ${e}`)
    return false;
  }

  return this.res;
}

function isNotDefinitionFile(from, file) {
  return fileName(from) != file;
}

function isNotImportedManually(autoImport, fileContent) {
  return fileContent.search(`import ${autoImport.import}`) === -1;
}

function fileName(path) {
  return path.split("/").pop();
}
