// Space Marine Shooter Game
// Simple 2D shooter inspired by Chicken Invaders

window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ── Game states ──
    const STATE = { MENU: 'menu', PLAYING: 'playing', SETTINGS: 'settings', SKILL_TREE: 'skillTree', GAME_OVER: 'gameOver' };
    let currentState = STATE.MENU;

    // ── Game constants (scaled for 960×1280) ──
    const PLAYER_WIDTH = 72;
    const PLAYER_HEIGHT = 72;
    let PLAYER_SPEED = 7;
    let BULLET_SPEED = 12;
    const ENEMY_WIDTH = 60;
    const ENEMY_HEIGHT = 60;
    let ENEMY_SPEED = 2.5;
    const ENEMY_DROP = 60;
    const ENEMY_ROWS = 5;
    const ENEMY_COLS = 10;

    // ── Skill tree state ──
    let skillPoints = 0;
    let skills = {
        speed:    { level: 0, max: 5, label: 'Move Speed',   desc: '+1 move speed per level' },
        fireRate: { level: 0, max: 5, label: 'Fire Rate',    desc: 'Faster shooting per level' },
        damage:   { level: 0, max: 5, label: 'Bullet Speed', desc: '+2 bullet speed per level' },
        multishot:{ level: 0, max: 3, label: 'Multi-Shot',   desc: 'Extra bullet per level' }
    };
    let shootCooldownBase = 12;

    // ── Settings ──
    let settings = {
        sfx: true,
        particles: true,
        difficulty: 1 // 0=easy, 1=normal, 2=hard
    };
    const diffLabels = ['Easy', 'Normal', 'Hard'];

    // ── Game state ──
    let player, bullets, enemies, particles, score, wave, gameOver;

    function resetGame() {
        player = {
            x: canvas.width / 2 - PLAYER_WIDTH / 2,
            y: canvas.height - PLAYER_HEIGHT - 20,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            dx: 0,
            shootCooldown: 0
        };
        bullets = [];
        enemies = [];
        particles = [];
        score = 0;
        wave = 0;
        gameOver = false;
        applySkills();
        createEnemies();
    }

    function applySkills() {
        PLAYER_SPEED = 7 + skills.speed.level;
        shootCooldownBase = 12 - skills.fireRate.level;
        BULLET_SPEED = 12 + skills.damage.level * 2;
    }

    // ── Controls ──
    let keys = {};
    let mouse = { x: 0, y: 0, clicked: false };
    document.addEventListener('keydown', e => keys[e.code] = true);
    document.addEventListener('keyup', e => keys[e.code] = false);
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
    canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
        mouse.clicked = true;
    });

    // ── Particles ──
    function spawnParticles(x, y, color, count) {
        if (!settings.particles) return;
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 20 + Math.random() * 20,
                color,
                size: 2 + Math.random() * 4
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        for (let p of particles) {
            ctx.globalAlpha = p.life / 40;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }

    // ── Star field background ──
    let stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * 960,
            y: Math.random() * 1280,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1 + 0.3
        });
    }

    function updateStars() {
        for (let s of stars) {
            s.y += s.speed;
            if (s.y > 1280) { s.y = 0; s.x = Math.random() * 960; }
        }
    }

    function drawStars() {
        ctx.fillStyle = '#fff';
        for (let s of stars) {
            ctx.globalAlpha = 0.3 + s.speed * 0.4;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        }
        ctx.globalAlpha = 1;
    }

    // ── Enemy & Bullet logic ──
    function shoot() {
        let shotCount = 1 + skills.multishot.level;
        let spread = 20;
        let startX = player.x + player.width / 2 - (shotCount - 1) * spread / 2;
        for (let i = 0; i < shotCount; i++) {
            bullets.push({
                x: startX + i * spread - 5,
                y: player.y,
                width: 10,
                height: 20
            });
        }
    }

    function createEnemies() {
        wave++;
        enemies = [];
        let rows = ENEMY_ROWS + Math.floor(wave / 3);
        let cols = ENEMY_COLS;
        let speedMult = 1 + (wave - 1) * 0.15 + settings.difficulty * 0.3;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                enemies.push({
                    x: 80 + col * 85,
                    y: 50 + row * 80,
                    width: ENEMY_WIDTH,
                    height: ENEMY_HEIGHT,
                    dx: ENEMY_SPEED * speedMult,
                    dir: 1,
                    hp: 1 + Math.floor(wave / 4)
                });
            }
        }
    }

    function updatePlayer() {
        if (keys['ArrowLeft'] || keys['KeyA']) player.dx = -PLAYER_SPEED;
        else if (keys['ArrowRight'] || keys['KeyD']) player.dx = PLAYER_SPEED;
        else player.dx = 0;
        player.x += player.dx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (keys['Space']) {
            if (!player.shootCooldown) {
                shoot();
                player.shootCooldown = shootCooldownBase;
            }
        }
        if (player.shootCooldown) player.shootCooldown--;
    }

    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= BULLET_SPEED;
            if (bullets[i].y + bullets[i].height < 0) bullets.splice(i, 1);
        }
    }

    function updateEnemies() {
        let hitEdge = false;
        for (let enemy of enemies) {
            enemy.x += enemy.dx * enemy.dir;
            if ((enemy.dir === -1 && enemy.x < 0) || (enemy.dir === 1 && enemy.x + enemy.width > canvas.width)) {
                hitEdge = true;
            }
        }
        if (hitEdge) {
            for (let enemy of enemies) {
                enemy.dir *= -1;
                enemy.y += ENEMY_DROP;
            }
        }
    }

    function checkCollisions() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (rectsCollide(bullets[i], enemies[j])) {
                    spawnParticles(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2, '#f93', 8);
                    bullets.splice(i, 1);
                    enemies[j].hp--;
                    if (enemies[j].hp <= 0) {
                        spawnParticles(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2, '#f33', 15);
                        enemies.splice(j, 1);
                        score += 100;
                        if (score % 500 === 0) skillPoints++;
                    }
                    break;
                }
            }
        }
        for (let enemy of enemies) {
            if (rectsCollide(enemy, player) || enemy.y + enemy.height > canvas.height - 80) {
                gameOver = true;
                currentState = STATE.GAME_OVER;
            }
        }
    }

    function rectsCollide(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // ── Drawing functions ──
    function drawPlayer() {
        // Ship body
        ctx.fillStyle = '#3af';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.closePath();
        ctx.fill();
        // Cockpit
        ctx.fillStyle = '#aef';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height * 0.5, 12, 0, Math.PI * 2);
        ctx.fill();
        // Engine glow
        ctx.fillStyle = '#0ff';
        ctx.globalAlpha = 0.5 + Math.random() * 0.3;
        ctx.fillRect(player.x + 15, player.y + player.height - 5, 15, 10);
        ctx.fillRect(player.x + player.width - 30, player.y + player.height - 5, 15, 10);
        ctx.globalAlpha = 1;
    }

    function drawBullets() {
        for (let b of bullets) {
            ctx.fillStyle = '#ff0';
            ctx.shadowColor = '#ff0';
            ctx.shadowBlur = 10;
            ctx.fillRect(b.x, b.y, b.width, b.height);
        }
        ctx.shadowBlur = 0;
    }

    function drawEnemies() {
        for (let e of enemies) {
            // Body
            ctx.fillStyle = e.hp > 1 ? '#f90' : '#f33';
            ctx.fillRect(e.x, e.y, e.width, e.height);
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(e.x + 12, e.y + 15, 14, 10);
            ctx.fillRect(e.x + e.width - 26, e.y + 15, 14, 10);
            ctx.fillStyle = '#000';
            ctx.fillRect(e.x + 18, e.y + 18, 5, 5);
            ctx.fillRect(e.x + e.width - 22, e.y + 18, 5, 5);
            // HP bar for tough enemies
            if (e.hp > 1) {
                ctx.fillStyle = '#0f0';
                ctx.fillRect(e.x, e.y - 6, e.width * (e.hp / (1 + Math.floor(wave / 4))), 4);
            }
        }
    }

    function drawHUD() {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Orbitron, Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 20, 40);
        ctx.fillText('Wave: ' + wave, 20, 75);
        ctx.textAlign = 'right';
        ctx.fillText('SP: ' + skillPoints, canvas.width - 20, 40);
        ctx.textAlign = 'left';
    }

    // ══════════════════════════════════════
    // ── MENU SYSTEM ──
    // ══════════════════════════════════════

    function pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    function drawButton(x, y, w, h, label, hovered) {
        // Glow
        ctx.shadowColor = hovered ? '#0ff' : '#0881';
        ctx.shadowBlur = hovered ? 25 : 10;
        // Background
        let grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, hovered ? '#1a4a5a' : '#152030');
        grad.addColorStop(1, hovered ? '#0a3040' : '#0a1828');
        ctx.fillStyle = grad;
        ctx.strokeStyle = hovered ? '#0ff' : '#0888';
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, w, h, 16, true, true);
        ctx.shadowBlur = 0;
        // Label
        ctx.fillStyle = hovered ? '#0ff' : '#8cf';
        ctx.font = 'bold 36px Orbitron, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w / 2, y + h / 2);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    // ── Main Menu ──
    function drawMenu() {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars();

        // Title
        ctx.fillStyle = '#0ff';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 30;
        ctx.font = 'bold 72px Orbitron, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE MARINE', canvas.width / 2, 260);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#8cf';
        ctx.font = '28px Orbitron, Arial';
        ctx.fillText('S H O O T E R', canvas.width / 2, 310);

        // Decorative line
        ctx.strokeStyle = '#0ff4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 200, 340);
        ctx.lineTo(canvas.width / 2 + 200, 340);
        ctx.stroke();

        // Buttons
        let bw = 360, bh = 70, bx = canvas.width / 2 - bw / 2;
        let buttons = [
            { y: 440, label: 'PLAY', state: STATE.PLAYING },
            { y: 540, label: 'SKILL TREE', state: STATE.SKILL_TREE },
            { y: 640, label: 'SETTINGS', state: STATE.SETTINGS }
        ];

        for (let btn of buttons) {
            let hovered = pointInRect(mouse.x, mouse.y, bx, btn.y, bw, bh);
            drawButton(bx, btn.y, bw, bh, btn.label, hovered);
            if (mouse.clicked && hovered) {
                if (btn.state === STATE.PLAYING) {
                    resetGame();
                }
                currentState = btn.state;
            }
        }

        // Controls hint
        ctx.fillStyle = '#556';
        ctx.font = '20px Orbitron, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Arrow Keys / A-D to Move  |  Space to Shoot', canvas.width / 2, canvas.height - 60);
        ctx.textAlign = 'left';
    }

    // ── Settings Screen ──
    function drawSettings() {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars();

        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 56px Orbitron, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SETTINGS', canvas.width / 2, 180);

        let cx = canvas.width / 2;
        let startY = 320;
        let gap = 100;

        // SFX toggle
        let sfxBtn = { x: cx - 180, y: startY, w: 360, h: 65 };
        let sfxHov = pointInRect(mouse.x, mouse.y, sfxBtn.x, sfxBtn.y, sfxBtn.w, sfxBtn.h);
        drawButton(sfxBtn.x, sfxBtn.y, sfxBtn.w, sfxBtn.h, 'SFX: ' + (settings.sfx ? 'ON' : 'OFF'), sfxHov);
        if (mouse.clicked && sfxHov) settings.sfx = !settings.sfx;

        // Particles toggle
        let partBtn = { x: cx - 180, y: startY + gap, w: 360, h: 65 };
        let partHov = pointInRect(mouse.x, mouse.y, partBtn.x, partBtn.y, partBtn.w, partBtn.h);
        drawButton(partBtn.x, partBtn.y, partBtn.w, partBtn.h, 'Particles: ' + (settings.particles ? 'ON' : 'OFF'), partHov);
        if (mouse.clicked && partHov) settings.particles = !settings.particles;

        // Difficulty cycle
        let diffBtn = { x: cx - 180, y: startY + gap * 2, w: 360, h: 65 };
        let diffHov = pointInRect(mouse.x, mouse.y, diffBtn.x, diffBtn.y, diffBtn.w, diffBtn.h);
        drawButton(diffBtn.x, diffBtn.y, diffBtn.w, diffBtn.h, 'Difficulty: ' + diffLabels[settings.difficulty], diffHov);
        if (mouse.clicked && diffHov) settings.difficulty = (settings.difficulty + 1) % 3;

        // Back button
        let backBtn = { x: cx - 180, y: startY + gap * 3 + 40, w: 360, h: 65 };
        let backHov = pointInRect(mouse.x, mouse.y, backBtn.x, backBtn.y, backBtn.w, backBtn.h);
        drawButton(backBtn.x, backBtn.y, backBtn.w, backBtn.h, 'BACK', backHov);
        if (mouse.clicked && backHov) currentState = STATE.MENU;

        ctx.textAlign = 'left';
    }

    // ── Skill Tree Screen ──
    function drawSkillTree() {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars();

        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 56px Orbitron, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SKILL TREE', canvas.width / 2, 150);

        ctx.fillStyle = '#8cf';
        ctx.font = '24px Orbitron, Arial';
        ctx.fillText('Skill Points: ' + skillPoints, canvas.width / 2, 200);

        let cx = canvas.width / 2;
        let startY = 280;
        let gap = 140;
        let skillKeys = Object.keys(skills);

        for (let i = 0; i < skillKeys.length; i++) {
            let key = skillKeys[i];
            let sk = skills[key];
            let sy = startY + i * gap;

            // Skill label
            ctx.fillStyle = '#cdf';
            ctx.font = 'bold 30px Orbitron, Arial';
            ctx.textAlign = 'center';
            ctx.fillText(sk.label, cx, sy);

            // Level pips
            let pipW = 30, pipGap = 8;
            let totalPipW = sk.max * (pipW + pipGap) - pipGap;
            let pipX = cx - totalPipW / 2;
            for (let l = 0; l < sk.max; l++) {
                ctx.fillStyle = l < sk.level ? '#0ff' : '#223';
                ctx.strokeStyle = '#0888';
                ctx.lineWidth = 2;
                roundRect(ctx, pipX + l * (pipW + pipGap), sy + 12, pipW, 14, 4, true, true);
            }

            // Description
            ctx.fillStyle = '#667';
            ctx.font = '18px Arial';
            ctx.fillText(sk.desc, cx, sy + 50);

            // Upgrade button
            let canUpgrade = skillPoints > 0 && sk.level < sk.max;
            let ubtn = { x: cx - 80, y: sy + 62, w: 160, h: 45 };
            let uHov = pointInRect(mouse.x, mouse.y, ubtn.x, ubtn.y, ubtn.w, ubtn.h);
            if (canUpgrade) {
                drawButton(ubtn.x, ubtn.y, ubtn.w, ubtn.h, 'UPGRADE', uHov);
                if (mouse.clicked && uHov) {
                    sk.level++;
                    skillPoints--;
                    applySkills();
                }
            } else {
                ctx.fillStyle = '#222';
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                roundRect(ctx, ubtn.x, ubtn.y, ubtn.w, ubtn.h, 10, true, true);
                ctx.fillStyle = '#555';
                ctx.font = 'bold 22px Orbitron, Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sk.level >= sk.max ? 'MAXED' : 'UPGRADE', ubtn.x + ubtn.w / 2, ubtn.y + ubtn.h / 2);
                ctx.textBaseline = 'alphabetic';
            }
        }

        // Back button
        let backBtn = { x: cx - 180, y: startY + skillKeys.length * gap + 20, w: 360, h: 65 };
        let backHov = pointInRect(mouse.x, mouse.y, backBtn.x, backBtn.y, backBtn.w, backBtn.h);
        drawButton(backBtn.x, backBtn.y, backBtn.w, backBtn.h, 'BACK', backHov);
        if (mouse.clicked && backHov) currentState = STATE.MENU;

        ctx.textAlign = 'left';
    }

    // ── Game Over Screen ──
    function drawGameOver() {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f33';
        ctx.shadowColor = '#f33';
        ctx.shadowBlur = 20;
        ctx.font = 'bold 64px Orbitron, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 80);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '32px Orbitron, Arial';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Wave: ' + wave, canvas.width / 2, canvas.height / 2 + 50);

        ctx.fillStyle = '#8cf';
        ctx.font = '22px Orbitron, Arial';
        ctx.fillText('Skill Points Earned: ' + Math.floor(score / 500), canvas.width / 2, canvas.height / 2 + 100);

        // Menu button
        let bw = 360, bh = 70, bx = canvas.width / 2 - bw / 2, by = canvas.height / 2 + 160;
        let hov = pointInRect(mouse.x, mouse.y, bx, by, bw, bh);
        drawButton(bx, by, bw, bh, 'MAIN MENU', hov);
        if (mouse.clicked && hov) {
            currentState = STATE.MENU;
        }
        ctx.textAlign = 'left';
    }

    // ══════════════════════════════════════
    // ── MAIN LOOP ──
    // ══════════════════════════════════════

    function mainLoop() {
        updateStars();

        switch (currentState) {
            case STATE.MENU:
                drawMenu();
                break;
            case STATE.SETTINGS:
                drawSettings();
                break;
            case STATE.SKILL_TREE:
                drawSkillTree();
                break;
            case STATE.PLAYING:
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawStars();
                if (!gameOver) {
                    updatePlayer();
                    updateBullets();
                    updateEnemies();
                    updateParticles();
                    checkCollisions();
                    drawPlayer();
                    drawBullets();
                    drawEnemies();
                    drawParticles();
                    drawHUD();
                    if (enemies.length === 0) createEnemies();
                }
                break;
            case STATE.GAME_OVER:
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawStars();
                drawPlayer();
                drawBullets();
                drawEnemies();
                drawParticles();
                drawGameOver();
                break;
        }

        mouse.clicked = false;
        requestAnimationFrame(mainLoop);
    }

    mainLoop();
};
