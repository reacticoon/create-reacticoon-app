const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const port = 9191;

// TODO: fix
process.env.DIR = "/home/loic/dev/reacticoon/create-reacticoon-app";
// trick for our scripts such as checkup to think we run from the app
process.chdir("/home/loic/dev/bm/bm-website-v2");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// allow CORS
app.use(cors());

const context = {};

require("./routes")(app, context);
app.listen(port, () => {
  const welcomeMessage = `

      Welcome on Reacticoon server.
    -----------------------------------------------------------
      We are live on ${port}


  `;
  console.log(welcomeMessage);
});
