const express = require("express");
const path = require("path");
// const { ExpressPeerServer } = require("peer");

const frontend = express();
const backend = express();

const frontendServer = frontend.listen(3000);
// const backendServer = backend.listen(5000);

// react
frontend.use(express.static(__dirname + "/dist"));

frontend.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

// peerjs
// const peerServer = ExpressPeerServer(backendServer, {
//   path: "/chat",
//   debug: true,
// });

// backend.use("/peerjs", peerServer, (req, res) => {
//   console.log(req.data);
//   // console.log(res.data);
// });
