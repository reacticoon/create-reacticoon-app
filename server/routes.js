//
// Define the Reacticoon server Api routes
//

const CommandRoute = require("./routes/command");
const SseRoute = require("./routes/sse")

module.exports = function(app, context) {
  CommandRoute(app, context);
  SseRoute(app, context);
};
