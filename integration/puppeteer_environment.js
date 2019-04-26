// puppeteer_environment.js
const paths = require("../utils/paths");
const map = require("lodash/map");

const PuppeteerEnvironment = paths.requireReacticoon(
  "jest-environment-puppeteer"
);
const puppeteer = require("puppeteer");
const mkdirp = paths.requireReacticoon("mkdirp");

class ReacticoonPuppeteerEnvironment extends PuppeteerEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();

    // const wrap = require("jest-wrap");

    // TODO: allow to define reacticoon pupetter env options
    const options = {};
    // const options = {
    //   headless: false,
    //   slowMo: 250,
    //   devtools: true,
    // }
    const browser = await puppeteer.launch(options);
    this.browser = browser;

    //
    // Register globales
    //

    const toGlobal = {
      // connect to puppeteer
      puppeteer,

      // global
      mkdirp,
      browser: this.browser,
      // page,

      // SCREENSHOT_DIRECTORY,

      // getMethods,

      // describeRoute: reacticoonDescribeRoute,

      // pass jest-wrap wrapper
      // TODO: we should init wrap here and register all instead of passing them
      withDescribeRoute: require("./withDescribeRoute")
    };

    map(toGlobal, (object, name) => {
      this.global[name] = object;
    });
    // console.log(this.global);
  }

  async teardown() {
    await super.teardown();

    await this.browser.close();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = ReacticoonPuppeteerEnvironment;
