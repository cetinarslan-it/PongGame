// Imported required modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Created new Express app and http server
const app = express();
const server = http.createServer(app);

let connections = [];

// Set up player paddles
const player1 = { width: 20, height: 150, y: 300 - 150 / 2, score: 0 };
const player2 = { width: 20, height: 150, y: 300 - 150 / 2, score: 0 };

const ball = {
  x: 400,
  y: 300,
  dx: 1,
  dy: -1,
  radius: 15,
};

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
  connections.push(socket);

  console.log("Client connected:", socket.id, " length:", connections.length);

  // Handled paddle position updates from client
  socket.on("paddlePositionUpdate", (data) => {
    console.log("Command is " + data.direction);

    var player = data.playerNo == 1 ? player1 : player2;

    if (data.direction == "up") player.y -= 5;
    else player.y += 5;

    sendToAll("playerPositionUpdate", { player1: player1, player2: player2 });
  });

  // Handled disconnect event from client
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    connections.splice(connections.indexOf(socket), 1);
  });

  //Start game if there are 2 clients
  if (connections.length == 2) {
    connections[0].emit("setPlayerNo", { playerNo: 1 });
    connections[1].emit("setPlayerNo", { playerNo: 2 });

    sendToAll("playerPositionUpdate", { player1: player1, player2: player2 });

    resetBall();

    setInterval(() => {
      manageGameRoom();
    }, 10);
  }
});

function manageGameRoom() {
  moveBall();

  // Check for collisions with walls
  if (ball.y + ball.dy < ball.radius || ball.y + ball.dy > 600 - ball.radius) {
    ball.dy = -ball.dy;
  }

  // Check for collisions with player paddles
  if (
    ball.x - ball.radius < player1.width &&
    ball.y > player1.y &&
    ball.y < player1.y + player1.height
  ) {
    ball.dx = -ball.dx;
  } else if (
    ball.x + ball.radius > 800 - player2.width &&
    ball.y > player2.y &&
    ball.y < player2.y + player2.height
  ) {
    ball.dx = -ball.dx;
  }

  // Check if ball goes offscreen
  if (ball.x - ball.radius < 0) {
    player2.score++;
    sendToAll("scoreUpdate", {
      player1Score: player1.score,
      player2Score: player2.score,
    });
    resetBall();
  } else if (ball.x + ball.radius > 800) {
    player1.score++;
    sendToAll("scoreUpdate", {
      player1Score: player1.score,
      player2Score: player2.score,
    });
    resetBall();
  }

  sendToAll("ballUpdate", { x: ball.x, y: ball.y });
}

function sendToAll(command, data) {
  io.sockets.emit(command, data);
}

function moveBall() {
  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;
}

function resetBall() {
  ball.x = 400;
  ball.y = 300;

  console.log(Math.random());

  if (Math.random() > 0.5) ball.dx = -1;
  else ball.dx = 1;

  if (Math.random() > 0.5) ball.dy = -1;
  else ball.dy = 1;
}
