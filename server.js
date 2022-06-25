const express = require("express");
const app = express();

//create server
const server = require("http").Server(app);
// socket to bidirectional connection server to web and web to server
const io = require("socket.io")(server);
// to identified the user video and text message
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
// import uuidV4 from uuid
const { v4: uuidV4 } = require("uuid");

// use the request peerServer
app.use("/peerjs", peerServer);

// set the engin type using
app.set("view engine", "ejs");

// use the static files html message
app.use(express.static("public"));

//generate unique id for the requested user
app.get("/", (req, res) => {
  // added the  generated id to the requested homePage
  res.redirect(`/${uuidV4()}`);
});

//serve the html for the requited room
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// connection event between web and server
io.on("connection", (socket) => {
  // listing  on join event
  socket.on("join-room", (roomId, userId) => {
    // join on the requested id
    socket.join(roomId);
    // broad cast the user to visible on the screen
    socket.to(roomId).emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    // listing  on disconnect event
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});
//listen the server
server.listen(process.env.PORT || 3000);
