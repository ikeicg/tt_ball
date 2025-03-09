const { createServer } = require("node:http");
const { Server } = require("socket.io");
require("dotenv").config();

const appControl = require("./app");
const httpServer = createServer(appControl);
const socketServer = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// import imitation DB
let db = require("./db");

// add web socket handles
require("./ws_ops/match")(socketServer);
require("./ws_ops/lobby")(socketServer);

const port = process.env.PORT || 5000;
httpServer.listen(port, () => {
  console.log("Server up and running at", port);
});
