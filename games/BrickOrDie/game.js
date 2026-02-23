// Brick or Die - Basic Game Loop and Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


// Game constants (scaled for 960x960 canvas, visible bricks)
const PADDLE_WIDTH = 160;
const PADDLE_HEIGHT = 32;
const BALL_RADIUS = 12;
const BRICK_PADDING = 2;
const BRICK_WIDTH = 30;
const BRICK_HEIGHT = 28;
const BRICK_ROWS = Math.floor((canvas.height / 2 - 40) / (BRICK_HEIGHT + BRICK_PADDING));
const BRICK_COLS = Math.floor(canvas.width / (BRICK_WIDTH + BRICK_PADDING));
const TUNNEL_COL = Math.floor(BRICK_COLS / 2); // 1 brick wide tunnel
const TUNNEL_WIDTH = 160;

// Paddle

let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let paddleSpeed = 0;
const PADDLE_MOVE_SPEED = 4.8;

// Ball

let ballX = canvas.width / 2;
let ballY = canvas.height - 120;
let ballDX = 4;
let ballDY = -4;


// Bricks

let bricks = [];
let totalBricks = BRICK_ROWS * BRICK_COLS;
let bricksLeft = totalBricks;
// Indestructible area mask (true = indestructible)
function isIndestructible(r, c) {
    const tunnelCol = Math.floor(BRICK_COLS / 2);
    // Bottom row: all gray except tunnel (center) brick, which is red
    if (r === BRICK_ROWS - 1) {
        if (c === tunnelCol) return false; // tunnel stays red
        return true;
    }
    // Always keep the center column (tunnel) red
    if (c === tunnelCol) return false;
    // Vertical gray lines 10 bricks tall, left and right of tunnel
    if (r >= BRICK_ROWS - 10 && r < BRICK_ROWS - 1) {
        if (c === tunnelCol - 1 || c === tunnelCol + 1) return true;
    }

    // Diagonals: from bottom row up to about 1/3 height
    const diagHeight = Math.floor(BRICK_ROWS / 2.2); // how high the diagonal goes
    // Left diagonal
    if (r < diagHeight && c === tunnelCol - r) return true;
    // Right diagonal
    if (r < diagHeight && c === tunnelCol + r) return true;

    return false;
}

for (let r = 0; r < BRICK_ROWS; r++) {
    bricks[r] = [];
    for (let c = 0; c < BRICK_COLS; c++) {
        let brickX = c * (BRICK_WIDTH + BRICK_PADDING);
        let brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + 40;
        // Tunnel: leave empty at top row, 1 brick wide
        if (r === 0 && c === TUNNEL_COL) {
            bricks[r][c] = { x: brickX, y: brickY, hit: true, indestructible: false };
        } else if (isIndestructible(r, c)) {
            bricks[r][c] = { x: brickX, y: brickY, hit: false, indestructible: true };
        } else {
            bricks[r][c] = { x: brickX, y: brickY, hit: false, indestructible: false };
        }
    }
}

let score = 0;

function drawPaddle() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#0ff';
    ctx.fill();
    ctx.closePath();
}


function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            let b = bricks[r][c];
            if (b && !b.hit) {
                if (b.indestructible) {
                    ctx.fillStyle = '#888'; // gray for indestructible
                } else {
                    ctx.fillStyle = '#f33'; // red for normal
                }
                ctx.fillRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
            }
        }
    }
}


function drawTunnel() {
    ctx.fillStyle = '#000';
    ctx.fillRect((canvas.width - TUNNEL_WIDTH) / 2, 0, TUNNEL_WIDTH, 40);
}



function drawScore() {
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 32, 64);
}


function drawWin() {
    ctx.font = '64px Arial';
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTunnel();
    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();
    if (bricksLeft === 0) drawWin();
}

draw();

// Keyboard controls
let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') leftPressed = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rightPressed = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') leftPressed = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rightPressed = false;
});

function update() {
    // Paddle movement
    if (leftPressed && paddleX > 0) paddleX -= PADDLE_MOVE_SPEED;
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) paddleX += PADDLE_MOVE_SPEED;

    // Ball movement
    ballX += ballDX;
    ballY += ballDY;

    // Wall collision
    if (ballX < BALL_RADIUS || ballX > canvas.width - BALL_RADIUS) ballDX = -ballDX;
    if (ballY < BALL_RADIUS) ballDY = -ballDY;

    // Paddle collision
    if (
        ballY + BALL_RADIUS > canvas.height - PADDLE_HEIGHT - 10 &&
        ballX > paddleX &&
        ballX < paddleX + PADDLE_WIDTH
    ) {
        // Calculate hit position relative to paddle center
        let hitPos = (ballX - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        // Max angle: 60 degrees (PI/3)
        let maxBounce = Math.PI / 3;
        let angle = hitPos * maxBounce;
        let speed = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
        ballDX = speed * Math.sin(angle);
        ballDY = -Math.abs(speed * Math.cos(angle));
        ballY = canvas.height - PADDLE_HEIGHT - 10 - BALL_RADIUS;
    }


    // Brick collision (axis-aligned, only one bounce per frame)
    let bounced = false;
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            let b = bricks[r][c];
            if (!b.hit) {
                if (
                    ballX + BALL_RADIUS > b.x &&
                    ballX - BALL_RADIUS < b.x + BRICK_WIDTH &&
                    ballY + BALL_RADIUS > b.y &&
                    ballY - BALL_RADIUS < b.y + BRICK_HEIGHT
                ) {
                    // For indestructible, just bounce, don't mark as hit
                    if (b.indestructible) {
                        // Determine axis of collision
                        let prevX = ballX - ballDX;
                        let prevY = ballY - ballDY;
                        let collidedX = prevX + BALL_RADIUS <= b.x || prevX - BALL_RADIUS >= b.x + BRICK_WIDTH;
                        let collidedY = prevY + BALL_RADIUS <= b.y || prevY - BALL_RADIUS >= b.y + BRICK_HEIGHT;
                        if (collidedX && !bounced) {
                            ballDX = -ballDX;
                            bounced = true;
                        } else if (collidedY && !bounced) {
                            ballDY = -ballDY;
                            bounced = true;
                        } else if (!bounced) {
                            // Fallback: reverse Y
                            ballDY = -ballDY;
                            bounced = true;
                        }
                    } else if (!bounced) {
                        ballDY = -ballDY;
                        b.hit = true;
                        score += 10;
                        bricksLeft--;
                        bounced = true;
                    }
                }
            }
        }
    }


    // Lose condition
    if (ballY > canvas.height) {
        setTimeout(() => document.location.reload(), 1000);
    }

    // Win condition
    if (bricksLeft === 0) {
        setTimeout(() => document.location.reload(), 2000);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
