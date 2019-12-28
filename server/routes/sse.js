const { addClient } = require("../modules/sse")

// https://medium.com/@moinism/using-nodejs-for-uni-directional-event-streaming-sse-c80538e6e82e
function SseRoute(app, context) {
  app.get("/sse-server", (req, res) => {
    res.status(200).set({
      "Content-Type": "text/event-stream", // <- Important headers
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    });

    addClient(req, res)
  });
}

module.exports = SseRoute;
