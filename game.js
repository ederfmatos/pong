const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 20;
const BALL_SIZE = 16;
const BALL_SPEED = 5;
const AI_SPEED = 4;
const FPS = 60;

// Game state
let leftPaddle = {
    x: PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

let rightPaddle = {
    x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    dy: BALL_SPEED * (Math.random() * 2 - 1)
};

let leftScore = 0;
let rightScore = 0;

// Mouse control for left paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;

    // Clamp paddle within canvas
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > canvas.height)
        leftPaddle.y = canvas.height - leftPaddle.height;
});

// Reset ball to center
function resetBall(direction) {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.dx = BALL_SPEED * (direction || (Math.random() > 0.5 ? 1 : -1));
    ball.dy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Collision detection
function checkCollision(paddle) {
    return (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

// AI movement for right paddle
function moveAIPaddle() {
    const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
    if (paddleCenter < ball.y) {
        rightPaddle.y += AI_SPEED;
    } else if (paddleCenter > ball.y) {
        rightPaddle.y -= AI_SPEED;
    }
    // Clamp within canvas
    rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw net
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update game state
function update() {
    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Collision with top/bottom walls
    if (ball.y < 0) {
        ball.y = 0;
        ball.dy *= -1;
    }
    if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }

    // Collision with paddles
    if (checkCollision(leftPaddle)) {
        ball.x = leftPaddle.x + leftPaddle.width;
        ball.dx *= -1;
        // Add a bit of spin based on where hit
        let impact = ((ball.y + ball.size / 2) - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
        ball.dy = BALL_SPEED * impact;
    }
    if (checkCollision(rightPaddle)) {
        ball.x = rightPaddle.x - ball.size;
        ball.dx *= -1;
        let impact = ((ball.y + ball.size / 2) - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
        ball.dy = BALL_SPEED * impact;
    }

    // Score logic
    if (ball.x < 0) {
        rightScore++;
        document.getElementById('right-score').textContent = rightScore;
        resetBall(1);
    }
    if (ball.x + ball.size > canvas.width) {
        leftScore++;
        document.getElementById('left-score').textContent = leftScore;
        resetBall(-1);
    }

    // Move AI paddle
    moveAIPaddle();
}

// Main loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start game
loop();