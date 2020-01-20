const SCREENSHOT_DIRECTORY = "./test/results/screens/";

///
//
//

const getMethods = ({ page }) => {
  const methods = {};

  let screenshotIndex = 0;
  methods.goTo = async function(route) {
    // TODO: right port
    await page.goto(`http://localhost:4242${route}`);
  };

  methods.screenshot = async fileName =>
    await page.screenshot({
      path: `${SCREENSHOT_DIRECTORY}/${pageName}/${screenshotIndex++}_${fileName}.png`
    });

  methods.testReacticoon = async () =>
    await page.evaluate(() => window.ReacticoonTesting.test());

  methods.getRoute = async route =>
    await page.evaluate(
      route => window.ReacticoonTesting.getRoute(route),
      route
    );

  methods.getCurrentRoute = async () =>
    await page.evaluate(() => window.ReacticoonTesting.getCurrentRoute());

  methods.waitForRoute = async function(route) {
    // TODO:
  };

  return methods;
};

// WIP
module.exports = function withDescribeRoute(
  pageName,
  route,
  { browser, mkdirp },
  // TODO: remove this trick
  setData
) {
  return this.extend(`[page] ${pageName}`, {
    page: null,
    methods: null,
    beforeEach: function() {
      // setup ran before each test
    },
    afterEach: [
      function() {
        // teardown ran after each test
      },
      function() {
        // more teardown
      }
    ],
    beforeAll: async function() {
      this.page = await browser.newPage();
      this.methods = getMethods({ page: this.page });
      await this.methods.goTo(route);

      mkdirp(`${SCREENSHOT_DIRECTORY}/${pageName}`);

      this.testReacticoon = this.methods.testReacticoon;
      setData(this.methods);
    },
    afterAll: function() {
      // teardown ran once after all tests
    }
  });
};
