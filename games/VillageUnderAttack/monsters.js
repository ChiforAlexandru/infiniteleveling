// monsters.js
// Handles monster spawning, logic, and behavior

export const monsterImgs = [
    (() => { let img = new Image(); img.src = 'assets/monster1.png'; return img; })(),
    (() => { let img = new Image(); img.src = 'assets/monster2.png'; return img; })(),
    (() => { let img = new Image(); img.src = 'assets/monster3.png'; return img; })()
];

export function spawnMonstersForRoom(room) {
    const monsters = [];
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
        monsters.push({
            type: (room - 1) % monsterImgs.length,
            x: 400 + i * 300 + Math.random() * 100,
            y: 888,
            width: 48,
            height: 72,
            alive: true
        });
    }
    return monsters;
}

export function updateMonsters(monsters, player) {
    for (const m of monsters) {
        if (!m.alive) continue;
        if (m.x < player.x) m.x += 2;
        else if (m.x > player.x) m.x -= 2;
        if (
            m.x < player.x + player.width &&
            m.x + m.width > player.x &&
            m.y < player.y + player.height &&
            m.y + m.height > player.y
        ) {
            if (!player.jumping) player.x += (player.x < m.x ? -40 : 40);
        }
    }
}

export function drawMonsters(ctx, monsters) {
    for (const m of monsters) {
        if (!m.alive) continue;
        const img = monsterImgs[m.type];
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, m.x, m.y, m.width, m.height);
        } else {
            ctx.fillStyle = '#AA2222';
            ctx.fillRect(m.x, m.y, m.width, m.height);
        }
    }
}

export function rectsCollide(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
