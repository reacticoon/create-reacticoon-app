//
// Define the Reacticoon server Api routes
//

const CommandRoute = require("./routes/command");

module.exports = function(app, context) {
  CommandRoute(app, context);
};
