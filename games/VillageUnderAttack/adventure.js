// adventure.js (main orchestrator)
import { player, isAttacking, attackTimer, ATTACK_DURATION, handleInput, updatePlayer, drawPlayer } from './player.js';
import { currentRoom, inVillage, checkRoomChange, drawRoom } from './levels.js';
import { spawnMonstersForRoom, updateMonsters, drawMonsters, rectsCollide } from './monsters.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.style.imageRendering = 'pixelated';

// Use the correct background image
const bgImage = new Image();
bgImage.src = 'assets/village_bg.png';

let monsters = spawnMonstersForRoom(currentRoom);
const keys = {};

document.addEventListener('keydown', (e) => {
    if ((e.key === 'f' || e.key === 'F') && !isAttacking) {
        isAttacking = true;
        attackTimer = ATTACK_DURATION;
    }
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if ((e.key === 's' || e.key === 'S')) {
        player.crouching = false;
    }
});

function updateCombat() {
    if (isAttacking) {
        for (const m of monsters) {
            if (!m.alive) continue;
            let attackBox = {
                x: player.x + (player.width / 2),
                y: player.y,
                width: player.width,
                height: player.height
            };
            if (rectsCollide(attackBox, m)) {
                m.alive = false;
            }
        }
    }
}

function update() {
    handleInput(keys);
    updatePlayer();
    updateCombat();
    if (isAttacking) {
        attackTimer--;
        if (attackTimer <= 0) {
            isAttacking = false;
        }
    }
    if (checkRoomChange(player, canvas)) {
        if (!inVillage) {
            monsters = spawnMonstersForRoom(currentRoom);
        } else {
            monsters = [];
        }
    }
    if (!inVillage) updateMonsters(monsters, player);
}

function render() {
    drawRoom(ctx, bgImage, canvas);
    drawPlayer(ctx);
    if (!inVillage) drawMonsters(ctx, monsters);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
