const express = require("express");
const path = require("path");
// import Peer from "peerjs";

const LOBBY_NAME = "gnility";
const app = express();

const frontendServer = app.listen(3000);

app.use(express.static(__dirname + "/dist"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

// console.log("trying to create lobby");
// const lobby = new Peer(LOBBY_NAME);
// lobby.on("open", function (id) {
//   console.log("Lobby peer ID is: " + id);
// });
// lobby.on("connection", function (conn) {
//   console.log("lobby connection", conn.peer);
// });
