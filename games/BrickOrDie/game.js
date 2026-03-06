// Brick or Die - Basic Game Loop and Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


// Game constants (scaled for 960x960 canvas, visible bricks)
const PADDLE_WIDTH = 160;
const PADDLE_HEIGHT = 32;
const BALL_RADIUS = 11;
const BALL_COLLISION_RADIUS = BALL_RADIUS - 3; // Make collision 3 pixels smaller
const BRICK_PADDING = 1;
const BRICK_WIDTH = 36;
const BRICK_HEIGHT = 34;
// Manually set the number of brick rows and columns below:
const BRICK_ROWS = 20// Change this to set the number of brick rows
const BRICK_COLS = 37; // Add 5 columns to the right (32 + 5)
const TUNNEL_COL = Math.floor(BRICK_COLS / 2); // 1 brick wide tunnel
const TUNNEL_WIDTH = 160;

// Paddle

let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let paddleSpeed = 0;
const PADDLE_MOVE_SPEED = 4.8;

// Balls (support multiple balls)
let balls = [
    {
        x: canvas.width / 2,
        y: canvas.height - 120,
        dx: 4,
        dy: -4
    }
];


// Bricks

let bricks = [];
let totalBricks = BRICK_ROWS * BRICK_COLS;
// Only count destructible bricks for win condition
let bricksLeft = 0;
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
    // Center the brick grid horizontally
    let gridWidth = BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING;
    let offsetX = Math.floor((canvas.width - gridWidth) / 2);
    for (let c = 0; c < BRICK_COLS; c++) {
        let brickX = offsetX + c * (BRICK_WIDTH + BRICK_PADDING);
        let brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + 40;
        // Tunnel: leave empty at top row, 1 brick wide
        if (r === 0 && c === TUNNEL_COL) {
            // Top tunnel brick: mark as hit so it's not counted
            bricks[r][c] = { x: brickX, y: brickY, hit: true, indestructible: false };
        } else {
            // Determine visual color and indestructibility
            let indestructible = isIndestructible(r, c);
            let color = indestructible ? '#888' : '#f33';
            bricks[r][c] = { x: brickX, y: brickY, hit: false, indestructible: indestructible, color: color };
            if (!indestructible) bricksLeft++;
        }
    }
}

let score = 0;
let gameState = "playing"; // "playing", "win", "lost"

function drawPaddle() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
}


function drawBalls() {
    for (const ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#0ff';
        ctx.fill();
        ctx.closePath();
    }
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
    // Overlay background
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    // Win text
    ctx.font = '64px Arial';
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 40);
    // Start Again button
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 + 10, 240, 60);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 + 10, 240, 60);
    ctx.fillStyle = '#0f0';
    ctx.fillText('Start Again', canvas.width / 2, canvas.height / 2 + 50);
}
function drawLost() {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.font = '64px Arial';
    ctx.fillStyle = '#f33';
    ctx.textAlign = 'center';
    ctx.fillText('You Lost!', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 + 10, 240, 60);
    ctx.strokeStyle = '#f33';
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 + 10, 240, 60);
    ctx.fillStyle = '#f33';
    ctx.fillText('Start Again', canvas.width / 2, canvas.height / 2 + 50);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTunnel();
    drawBricks();
    drawPaddle();
    drawBalls();
    drawScore();
    // Show remaining red bricks (destructible, actually red)
    let redBricksLeft = 0;
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            let b = bricks[r][c];
            if (b && !b.indestructible && !b.hit && b.color === '#f33') {
                redBricksLeft++;
            }
        }
    }
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ff0';
    ctx.fillText('Red Bricks Left: ' + redBricksLeft, canvas.width - 220, 30);
    // Draw Add Balls button (bottom right)
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillRect(canvas.width - 170, canvas.height - 60, 160, 50);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width - 170, canvas.height - 60, 160, 50);
    ctx.fillStyle = '#0ff';
    ctx.fillText('Add 10 Balls', canvas.width - 90, canvas.height - 30);
    if (gameState === "win") {
        drawWin();
    } else if (gameState === "lost") {
        drawLost();
    }
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

    // Track balls to remove (out of bounds)
    let ballsToRemove = [];

    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision
        if (ball.x < BALL_COLLISION_RADIUS || ball.x > canvas.width - BALL_COLLISION_RADIUS) ball.dx = -ball.dx;
        if (ball.y < BALL_COLLISION_RADIUS) ball.dy = -ball.dy;

        // Paddle collision
        if (
            ball.y + BALL_COLLISION_RADIUS > canvas.height - PADDLE_HEIGHT - 10 &&
            ball.x > paddleX &&
            ball.x < paddleX + PADDLE_WIDTH
        ) {
            // Calculate hit position relative to paddle center
            let hitPos = (ball.x - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
            // Max angle: 60 degrees (PI/3)
            let maxBounce = Math.PI / 3;
            let angle = hitPos * maxBounce;
            let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = speed * Math.sin(angle);
            ball.dy = -Math.abs(speed * Math.cos(angle));
            ball.y = canvas.height - PADDLE_HEIGHT - 10 - BALL_COLLISION_RADIUS;
        }

        // Brick collision (per ball)
        let bounced = false;
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                let b = bricks[r][c];
                if (!b.hit) {
                    // Brick collision area is 2 pixels larger than visual, but red bricks (not indestructible) are 4 pixels larger
                    let BRICK_COLLISION_PAD = 2;
                    if (!b.indestructible) {
                        BRICK_COLLISION_PAD = 4;
                    } else {
                        BRICK_COLLISION_PAD = 1; // Gray bricks collision 1 pixel smaller
                    }
                    if (
                        ball.x + BALL_COLLISION_RADIUS > b.x - BRICK_COLLISION_PAD &&
                        ball.x - BALL_COLLISION_RADIUS < b.x + BRICK_WIDTH + BRICK_COLLISION_PAD &&
                        ball.y + BALL_COLLISION_RADIUS > b.y - BRICK_COLLISION_PAD &&
                        ball.y - BALL_COLLISION_RADIUS < b.y + BRICK_HEIGHT + BRICK_COLLISION_PAD
                    ) {
                        // Calculate overlap on both axes
                        let overlapLeft = (ball.x + BALL_COLLISION_RADIUS) - (b.x - BRICK_COLLISION_PAD);
                        let overlapRight = (b.x + BRICK_WIDTH + BRICK_COLLISION_PAD) - (ball.x - BALL_COLLISION_RADIUS);
                        let overlapTop = (ball.y + BALL_COLLISION_RADIUS) - (b.y - BRICK_COLLISION_PAD);
                        let overlapBottom = (b.y + BRICK_HEIGHT + BRICK_COLLISION_PAD) - (ball.y - BALL_COLLISION_RADIUS);
                        let minOverlapX = Math.min(overlapLeft, overlapRight);
                        let minOverlapY = Math.min(overlapTop, overlapBottom);
                        if (b.indestructible) {
                            if (minOverlapX < minOverlapY && !bounced) {
                                ball.dx = -ball.dx;
                                // Push ball out horizontally
                                if (ball.x < b.x) {
                                    ball.x = b.x - BRICK_COLLISION_PAD - BALL_COLLISION_RADIUS;
                                } else {
                                    ball.x = b.x + BRICK_WIDTH + BRICK_COLLISION_PAD + BALL_COLLISION_RADIUS;
                                }
                                bounced = true;
                            } else if (minOverlapY < minOverlapX && !bounced) {
                                ball.dy = -ball.dy;
                                // Push ball out vertically
                                if (ball.y < b.y) {
                                    ball.y = b.y - BRICK_COLLISION_PAD - BALL_COLLISION_RADIUS;
                                } else {
                                    ball.y = b.y + BRICK_HEIGHT + BRICK_COLLISION_PAD + BALL_COLLISION_RADIUS;
                                }
                                bounced = true;
                            }
                        } else if (!bounced) {
                            if (minOverlapX < minOverlapY) {
                                ball.dx = -ball.dx;
                            } else {
                                ball.dy = -ball.dy;
                            }
                            b.hit = true;
                            score += 10;
                            if (!b.indestructible) bricksLeft--;
                            bounced = true;
                            // 5% chance to spawn 2 extra balls for red bricks
                            if (Math.random() < 0.05) {
                                for (let n = 0; n < 2; n++) {
                                    balls.push({
                                        x: ball.x,
                                        y: ball.y,
                                        dx: (Math.random() - 0.5) * 8,
                                        dy: -4 - Math.random() * 2
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        // Track balls that are out of bounds
        if (ball.y > canvas.height) {
            ballsToRemove.push(i);
        }
    }

    // Remove balls that are out of bounds (from last to first)
    for (let j = ballsToRemove.length - 1; j >= 0; j--) {
        balls.splice(ballsToRemove[j], 1);
    }

    // Lose condition: only if all balls are out of bounds
    if (balls.length === 0 && gameState === "playing") {
        gameState = "lost";
    }

    // Win condition: only when all destructible (red) bricks are destroyed
    let redBricksLeft = 0;
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            let b = bricks[r][c];
            if (b && !b.indestructible && !b.hit && b.color === '#f33') {
                redBricksLeft++;
            }
        }
    }
    if (redBricksLeft === 0 && gameState === "playing") {
        gameState = "win";
    }
}

function gameLoop() {
    if (gameState === "playing") {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Handle Start Again and Add Balls button click
canvas.addEventListener('click', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;
    // Start Again button
    if (gameState === "win" || gameState === "lost") {
        let bx = canvas.width / 2 - 120;
        let by = canvas.height / 2 + 10;
        let bw = 240;
        let bh = 60;
        if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
            document.location.reload();
            return;
        }
    }
    // Add Balls button
    let abx = canvas.width - 170;
    let aby = canvas.height - 60;
    let abw = 160;
    let abh = 50;
    if (mx >= abx && mx <= abx + abw && my >= aby && my <= aby + abh) {
        for (let i = 0; i < 10; i++) {
            balls.push({
                x: canvas.width / 2,
                y: canvas.height - 120,
                dx: (Math.random() - 0.5) * 8,
                dy: -4 - Math.random() * 2
            });
        }
    }
});
