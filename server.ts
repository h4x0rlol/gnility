const express = require("express");
const path = require("path");

const LOBBY_NAME = "gnility";
const app = express();

let port = process.env.PORT || 3000;

const frontendServer = app.listen(port);

app.use(express.static(__dirname + "/dist"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});
