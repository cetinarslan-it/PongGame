// Set up game state variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dx: 3,
  dy: -3,
  radius: 15,
};

let player1Score = 0;
let player2Score = 0;

// Send paddle position updates to server on arrow key input
document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowUp") {
    socket.emit("paddlePositionUpdate", { paddle: "left", direction: "up" });
  } else if (event.code === "ArrowDown") {
    socket.emit("paddlePositionUpdate", { paddle: "left", direction: "down" });
  } else if (event.code === "KeyW") {
    socket.emit("paddlePositionUpdate", { paddle: "right", direction: "up" });
  } else if (event.code === "KeyS") {
    socket.emit("paddlePositionUpdate", { paddle: "right", direction: "down" });
  }
});

// Draw game objects on canvas
function draw() {
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
  ctx.fillStyle = "black";
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
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // Draw score
  ctx.font = "22px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Player 1: ${player1Score}`, 8, 30);
  ctx.fillText(`Player 2: ${player2Score}`, canvas.width - 115, 30);
}

// Update game objects and check for collisions
function update() {
  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Check for collisions with walls
  if (
    ball.y + ball.dy < ball.radius ||
    ball.y + ball.dy > canvas.height - ball.radius
  ) {
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
    ball.x + ball.radius > canvas.width - player2.width &&
    ball.y > player2.y &&
    ball.y < player2.y + player2.height
  ) {
    ball.dx = -ball.dx;
  }

  // Check if ball goes offscreen
  if (ball.x - ball.radius < 0) {
    player2Score++;
    socket.emit("scoreUpdate", { player: 2, score: player2Score });
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    player1Score++;
    socket.emit("scoreUpdate", { player: 1, score: player1Score });
    resetBall();
  }
}

// Reset ball to center of canvas
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = -ball.dx;
  ball.dy = Math.floor(Math.random() * 6) - 3;
}

// Update player paddles based on server state
function updatePaddles(paddles) {
  player1.y = paddles.left;
  player2.y = paddles.right;
}

// Update player scores based on server state
function updateScores(scores) {
  player1Score = scores[1];
  player2Score = scores[2];
}

// Start game loop
function startGame() {
  setInterval(() => {
    update();
    draw();
  }, 1000);
}

// Start game when server signals that both players have connected
socket.on("startGame", () => {
  startGame();
});

// Receive updated paddle positions from server
socket.on("paddlePositionUpdate", (data) => {
  const paddle = data.paddle;
  const direction = data.direction;
  if (paddle === "left" && direction === "up") {
    player1.y -= 7;
  } else if (paddle === "left" && direction === "down") {
    player1.y += 7;
  } else if (paddle === "right" && direction === "up") {
    player2.y -= 7;
  } else if (paddle === "right" && direction === "down") {
    player2.y += 7;
  }
});

// Receive updated scores from server
socket.on("scoreUpdate", (data) => {
  updateScores(data);
});

// Set up player paddles
const player1 = { width: 20, height: 150, y: canvas.height / 2 - 150 / 2 };
const player2 = { width: 20, height: 150, y: canvas.height / 2 - 150 / 2 };

// Draw initial game state
draw();
