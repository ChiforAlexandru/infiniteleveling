// player.js
// Handles player movement, attacks, and animation

export let player = {
    x: 800,
    y: 888, // ground level
    width: 48,
    height: 72,
    speed: 8,
    vy: 0,
    jumping: false,
    crouching: false
};

export let isAttacking = false;
export let attackTimer = 0;
export const ATTACK_DURATION = 15;

export const gravity = 2;
export const groundY = 888;

export const playerImg = new Image();
playerImg.src = 'assets/player_anime.png';
export const playerAttackImg = new Image();
playerAttackImg.src = 'assets/player_attack.png';

export function handleInput(keys) {
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;
    if (keys['w'] && !player.jumping && !player.crouching) {
        player.jumping = true;
        player.vy = -32;
    }
    if (keys['s'] && !player.jumping) {
        player.crouching = true;
    }
}

export function updatePlayer() {
    if (player.jumping) {
        player.vy += gravity;
        player.y += player.vy;
        if (player.y >= groundY) {
            player.y = groundY;
            player.vy = 0;
            player.jumping = false;
        }
    }
    if (player.crouching && !player.jumping) {
        player.height = 36;
    } else {
        player.height = 72;
    }
}

export function drawPlayer(ctx) {
    let drawHeight = player.crouching ? player.height / 2 : player.height;
    let drawY = player.crouching ? player.y + player.height / 2 : player.y;
    if (isAttacking && playerAttackImg.complete && playerAttackImg.naturalWidth > 0) {
        ctx.drawImage(playerAttackImg, player.x, drawY, player.width, drawHeight);
    } else if (playerImg.complete && playerImg.naturalWidth > 0) {
        ctx.drawImage(playerImg, player.x, drawY, player.width, drawHeight);
    } else {
        ctx.fillStyle = isAttacking ? '#FF4444' : '#FFD700';
        ctx.fillRect(player.x, drawY, player.width, drawHeight);
    }
}
