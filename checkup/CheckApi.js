const CliPluginApi = require("../plugin/CliPluginApi");

const check = require("./utils/check");
const warn = require("./utils/warn");

class CheckApi extends CliPluginApi {
  constructor(props) {
    super(props);

    this.results = [];
  }

  beforeRun() {
    // reset results
    this.results = [];
  }

  getResults = () => {
    return this.results;
  };

  addResult = result => {
    this.results.push(result);
  };

  check = (isValid, validMessage, invalidMessage) => {
    this.addResult(check(isValid, validMessage, invalidMessage));
  };

  warn = (isValid, validMessage, warnMessage) => {
    this.addResult(warn(isValid, validMessage, warnMessage));
  };

  // syntaxic sugar for `check`
  error = (isValid, validMessage, invalidMessage) => {
    this.check(isValid, validMessage, invalidMessage)
  }

  warnMissingOption = (optionPath) => {
    this.warn(
      this.getOption(optionPath, null) !== null,
      `${optionPath} option`,
      `${optionPath} option not found` // TODO: link to doc
    ) 
  }
}

module.exports = CheckApi;
