// Set up game state variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ball = {
  x: 400,
  y: 300,
  radius: 15,
};

// Set up player paddles
let player1 = null;
let player2 = null;
let playerNo = 0;

// Send paddle position updates to server on arrow key input
document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowUp") {
    event.preventDefault();

    socket.emit("paddlePositionUpdate", {
      playerNo: playerNo,
      direction: "up",
    });
  } else if (event.code === "ArrowDown") {
    event.preventDefault();

    socket.emit("paddlePositionUpdate", {
      playerNo: playerNo,
      direction: "down",
    });
  }

  draw();
});

// Draw game objects on canvas
function draw() {
  if (!player1 || !player2) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a lign as net
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "white";
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.closePath();

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // Draw player1 paddle
  ctx.beginPath();
  ctx.rect(0, player1.y, player1.width, player1.height);
  ctx.fillStyle = playerNo == 1 ? "blue" : "red";
  ctx.fill();
  ctx.closePath();

  // Draw player2 paddle
  ctx.beginPath();
  ctx.rect(
    canvas.width - player2.width,
    player2.y,
    player2.width,
    player2.height
  );
  ctx.fillStyle = playerNo == 2 ? "blue" : "red";
  ctx.fill();
  ctx.closePath();

  // Draw score
  ctx.font = "22px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Player 1: ${player1.score}`, 250, 30);
  ctx.fillText(`Player 2: ${player2.score}`, canvas.width - 370, 30);
}

// Start game when server signals that both players have connected
socket.on("setPlayerNo", (data) => {
  playerNo = data.playerNo;
});

socket.on("ballUpdate", (data) => {
  ball.x = data.x;
  ball.y = data.y;
  draw();
});

socket.on("playerPositionUpdate", (data) => {
  player1 = data.player1;
  player2 = data.player2;
  draw();
});

// Receive updated scores from server
socket.on("scoreUpdate", (scores) => {
  player1.score = scores.player1Score;
  player2.score = scores.player2Score;

  draw();
});

// Draw initial game state
//draw();
