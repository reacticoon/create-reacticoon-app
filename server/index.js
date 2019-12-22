//
// Reacticoon server. Running on port 9191.
//
// This server allows the reacticoon-dev-plugin to interact with a node.js environment.
// It displays a simple server API that can receive commands.
//
//
// The server gives access to two routes:
// - GET `/retrieve-file`: returns the file content of the filepath given as query param.
// - POST `/commands`: run the defined command. It receives a json body with the 'command' field.
//
// Commands are defined by:
// - create-reacticoon-app
// - reacticoon-cli plugins
//
// create-reacticoon-app gives the following commands:
//    - CHECKUP: run the Reacticoon checkup, a list of checks defined by Reacticoon and the cli
//               plugins, that do verifications about your configurations.
//    - PLUGINS: list the Reacticoon cli-plugins and their configuration.
//    - ANALYZE_BUILD: analyze the build. You must have run `yarn build` before.
//    - BUNDLE_PHOBIA: Run bundle phobia check.
//    - READ_FILE: gives a json file content.
//

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Port where Reacticoon server will run.
const port = 9191 || process.env.reacticoonServerPort;

// TODO: fix
process.env.DIR = "/home/loic/dev/reacticoon/create-reacticoon-app";
// trick for our scripts such as checkup to think we run from the app
process.chdir("/home/loic/dev/bm/bm-website-v2");

// initializa an express app server.
const reacticoonServer = express();
// add json handling
reacticoonServer.use(express.json());
// allow to parse json body
reacticoonServer.use(bodyParser.urlencoded({ extended: false }));

// allow CORS
// Learn more about CORS on https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
reacticoonServer.use(cors());

const context = {};

// require our API routes
require("./routes")(reacticoonServer, context);

// start the server
reacticoonServer.listen(port, () => {
  // display a nice welcome message when starting the server
  const welcomeMessage = `

      Welcome on Reacticoon server.
    -----------------------------------------------------------
      We are live on ${port}


  `;
  console.log(welcomeMessage);
});
