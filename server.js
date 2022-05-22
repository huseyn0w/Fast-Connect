const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const io = require("socket.io")(server);
const path = require("path");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;
const ExpressPeerServer = require("peer").ExpressPeerServer;

const options = {
  debug: true,
};

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

io.on("connection", (socket) => {
  socket.on("i-am-arrived", (peerID, roomID, userName) => {
    socket.join(roomID);
    socket.to(roomID).emit("new-user-arrived", peerID, roomID, userName);
  });

  socket.on("userExited", (peerID, roomID) => {
    socket.leave(roomID);
    io.to(roomID).emit("userLeft", peerID);
  });

  socket.on("new message", (data, roomID) => {
    socket.emit("new message received", data);
    socket.to(roomID).emit("new message received", data);
  });

  socket.on("disconnect", () => {});
});

app.get("/", (req, res) => {
  res.send("Welcome to the Fast Connect Backend ;)");
});

app.use("/mypeer", ExpressPeerServer(server, options));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

server.listen(port);
