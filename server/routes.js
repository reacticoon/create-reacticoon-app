const CommandRoute = require('./routes/command')

module.exports = function(app, context) {
  CommandRoute(app, context);
};