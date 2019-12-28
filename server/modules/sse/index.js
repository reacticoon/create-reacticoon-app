const { info } = require("../../../cli-utils");

var clientId = 0;
var clients = {}; // <- Keep a map of attached clients

// keep only one client to interract with for most of our actions
var currentClient = null;

function sendEventToCurrentClient(eventName, payload) {
  currentClient.write(`data: ${JSON.stringify({ eventName, payload })}\n\n`);
}

function sendMessageToCurrentClient(message) {
  currentClient.write(`data: ${message}\n\n`);
}

function addClient(req, res) {
  clients[clientId] = res; // <- Add this client to those we consider "attached"

  currentClient = res;

  sendEventToCurrentClient("INIT", {
    message: `Initiated with client id ${clientId}`,
    clientId
  });

  info(`Added sse client ${clientId}`);

  req.on("close", function() {
    info(`Removed sse client ${clientId}`);

    delete clients[clientId];
  }); // <- Remove this client when he disconnects
  ++clientId;
}

module.exports = {
  addClient,
  sendEventToCurrentClient
};
