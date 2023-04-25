// Imported required modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Created new Express app and http server
const app = express();
const server = http.createServer(app);

// Set up static file serving for client-side files
app.use(express.static(__dirname + "/public"));

// Started listening for client connections on server
const io = socketIo(server);

// Started server listening on port 3000
const PORT = 3000;

server.listen(PORT, () => {
  console.log("RUNNING...");
  console.log(`Server listening on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Handled paddle position updates from client
  socket.on("paddlePositionUpdate", (data) => {
    // Broadcasted paddle position update to all clients except sender
    socket.broadcast.emit("paddlePositionUpdate", data);
  });

  // Handled score updates from client
  socket.on("scoreUpdate", (data) => {
    // Broadcasted score update to all clients except sender
    socket.broadcast.emit("scoreUpdate", data);
  });

  // Handled disconnect event from client
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

