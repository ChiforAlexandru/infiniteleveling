// Auto-combine all possible relics in the player's inventory
game.autoCombineAllRelics = function() {
    // Assume player.relics is an array of {type, rarity}
    const rarities = ['common', 'uncommon', 'epic', 'legendary', 'mythic'];
    let changed = true;

    while (changed) {
        changed = false;
        for (let type of game.relicTypes.map(r => r.id)) {
            for (let i = 0; i < rarities.length - 1; i++) {
                const rarity = rarities[i];
                // Count how many relics of this type and rarity
                let count = game.player.relics.filter(r => r.type === type && r.rarity === rarity).length;
                // If at least 2, combine them
                while (count >= 2) {
                    // Remove two relics
                    let removed = 0;
                    game.player.relics = game.player.relics.filter(r => {
                        if (removed < 2 && r.type === type && r.rarity === rarity) {
                            removed++;
                            return false;
                        }
                        return true;
                    });
                    // Add one relic of next rarity
                    game.player.relics.push({type: type, rarity: rarities[i + 1]});
                    changed = true;
                    count -= 2;
                }
            }
        }
    }
    // Optionally update UI
    if (game.updateRelicUI) game.updateRelicUI();
};
game.createPlayer = function() {
    const maxHpBonus = (this.skills.maxhp1 || 0) * 10;
    const damageBonus = 1 + ((this.skills.damage1 || 0) * 0.05);
    const speedBonus = 1 + ((this.skills.speed1 || 0) * 0.05);
    const fireRateBonus = 1 - ((this.skills.firerate1 || 0) * 0.05);
    const rangeBonus = 1 + ((this.skills.projrange || 0) * 0.08);
    const projSpeedBonus = 1 + ((this.skills.projspeed || 0) * 0.06);
    const startingProj = (this.skills.multiproj || 0);
    const cooldownReduction = 1 - ((this.skills.cooldown || 0) * 0.06);
    
    // Apply Power Overwhelming (all stats bonus)
    const powerBonus = 1 + ((this.skills.maxpower || 0) * 0.03);
    
    const char = this.characters[this.selectedCharacterIndex];
    
    this.player = {
        x: MAP_WIDTH / 2,
        y: MAP_HEIGHT / 2,
        radius: 15,
        health: (char.stats.hp + maxHpBonus) * powerBonus,
        maxHealth: (char.stats.hp + maxHpBonus) * powerBonus,
        speed: char.stats.speed * speedBonus * powerBonus,
        damage: char.stats.damage * damageBonus * powerBonus,
        fireRate: (char.stats.fireRate || 500) * fireRateBonus * cooldownReduction,
        lastShot: 0,
        projectileCount: 1 + startingProj,
        projectileSpeed: 8 * projSpeedBonus * powerBonus,
        projectileRange: 400 * rangeBonus * powerBonus,
        hasAoE: (this.skills.explosion || 0) > 0,
        aoePercent: (this.skills.explosion || 0) * 0.08,
        vx: 0,
        vy: 0,
        invulnerable: 0,
        // Animation properties
        animState: 'idle',
        animFrame: 0,
        animTimer: 0,
        facingRight: true,
        spriteKey: char.spriteKey || 'survivor',
        // New skill properties
        regen: (this.skills.regen || 0) * 0.25,
        invulnBonus: 1 + ((this.skills.invuln || 0) * 0.15),
        dodgeChance: (this.skills.dodge || 0) * 0.05,
        thorns: (this.skills.thorns || 0) * 0.10,
        critChance: (this.skills.critchance || 0) * 0.03,
        pierceCount: (this.skills.pierce || 0),
        magnetRange: 1 + ((this.skills.magnet || 0) * 0.25),
        auraDamage: (this.skills.killaura || 0) * 1,
        bossDamageBonus: 1 + ((this.skills.bossdmg || 0) * 0.10),
        bossDefenseBonus: 1 - ((this.skills.bossdefense || 0) * 0.10),
        hasRevive: (this.skills.revival || 0) > 0,
        damageTakenMultiplier: 1,
        usedRevive: false,
        extraCard: (this.skills.luckycard || 0) > 0,
        orbitalCount: (this.skills.orbital || 0),
        orbitals: [],
        vampiric: (this.skills.vampiric || 0) * 0.02,
        lastNuke: 0,
        nukeInterval: 30000,
        hasNuke: (this.skills.nuke || 0) > 0,
        homingStrength: (this.skills.homingshot || 0) * 0.05,
        lastAuraDamage: 0,
        // Necromancer properties
        isNecromancer: char.name === 'Necromancer',
        // Summoner properties
        isSummoner: char.name === 'Summoner',
        permanentMinions: [],
        minionRespawnTimer: 0,
        // Berserker properties
        isBerserker: char.name === 'Berserker',
        // Vampire properties
        isVampire: char.name === 'Vampire',
        vampireLifesteal: char.name === 'Vampire' ? 0.03 : 0,
        vampireKillBonus: 0,
        minions: []
    };
    
    // Story Mode specific setup
    if (this.mode === 'story') {
        const config = this.getStoryConfig();
        this.currentZone = config.zone;
        this.storyEnemiesRequired = config.enemiesRequired;
        this.storyBossesRequired = config.bossesRequired;
        this.storyEnemiesKilled = 0;
        this.storyBossesKilled = 0;
        this.storyIsBossLevel = config.isBossLevel;
        
        // On boss levels, spawn boss earlier (after 5 seconds)
        if (config.isBossLevel) {
            this.nextBossTime = 5000;
        }
        
        // Show objective HUD
        this.updateObjectiveHUD();
    }

    // Apply starting levels
    const startLevels = this.skills.startlevel || 0;
    this.level = 1 + startLevels;
    
    // Adjust XP needed based on starting level using exponential scaling
    if (startLevels > 0) {
        const levelReduction = 1 - ((this.skills.levelbonus || 0) * 0.05);
        const baseXp = 10;
        const scalingFactor = Math.pow(1.15, this.level);
        this.xpNeeded = Math.ceil(baseXp * scalingFactor * levelReduction);
        // Ensure minimum XP requirement
        this.xpNeeded = Math.max(10, this.xpNeeded);
    }
    
    // Initialize zone properties
    this.player.hasFireZone = (this.skills.firezone || 0) > 0;
    this.player.fireZoneDamage = (this.skills.firezone || 0) * 5;
    this.player.hasIceZone = (this.skills.icezone || 0) > 0;
    this.player.iceZoneSlow = 0.4 + ((this.skills.icezone || 0) * 0.1);
    this.player.hasElectricZone = (this.skills.electriczone || 0) > 0;
    this.player.electricZoneDamage = (this.skills.electriczone || 0) * 8;
    this.player.hasWaterZone = (this.skills.waterzone || 0) > 0;
    
    // Create orbital projectiles
    for (let i = 0; i < this.player.orbitalCount; i++) {
        this.player.orbitals.push({
            angle: (Math.PI * 2 * i) / this.player.orbitalCount,
            distance: 60,
            speed: 0.05,
            lastHit: 0,
            hitCooldown: 500
        });
    }
    
    // Apply equipped relics
    if (this.applyEquippedRelics) {
        this.applyEquippedRelics(this.player);
    }
};

game.setupControls = function() {
    window.addEventListener('keydown', (e) => {
        this.keys[e.key.toLowerCase()] = true;
        // Escape key toggles pause
        if (e.key === 'Escape' && this.running) {
            this.togglePause();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
    });
    
    // Gamepad connection events
    window.addEventListener('gamepadconnected', (e) => {
        console.log('Gamepad connected:', e.gamepad.id);
        this.gamepadIndex = e.gamepad.index;
        this.gamepadConnected = true;
        this.showGamepadNotification('Controller connected: ' + e.gamepad.id.split('(')[0].trim());
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
        console.log('Gamepad disconnected:', e.gamepad.id);
        if (this.gamepadIndex === e.gamepad.index) {
            this.gamepadIndex = null;
            this.gamepadConnected = false;
        }
        this.showGamepadNotification('Controller disconnected');
    });
};

// Gamepad notification helper
game.showGamepadNotification = function(message) {
    // Create notification element if it doesn't exist
    let notif = document.getElementById('gamepadNotification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'gamepadNotification';
        notif.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#00ff88;padding:10px 20px;border-radius:8px;border:1px solid #00ff88;font-family:inherit;z-index:10000;opacity:0;transition:opacity 0.3s;';
        document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.style.opacity = '1';
    setTimeout(() => { notif.style.opacity = '0'; }, 2000);
};

// Poll gamepad for input - call this in the game loop
game.pollGamepad = function() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    
    // Find first connected gamepad if we don't have one
    if (this.gamepadIndex === null) {
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.gamepadIndex = i;
                this.gamepadConnected = true;
                break;
            }
        }
    }
    
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return { x: 0, y: 0 };
    
    // Get analog stick input (left stick)
    let x = gp.axes[0] || 0;
    let y = gp.axes[1] || 0;
    
    // Apply deadzone
    if (Math.abs(x) < this.gamepadDeadzone) x = 0;
    if (Math.abs(y) < this.gamepadDeadzone) y = 0;
    
    // Handle D-pad as fallback (buttons 12-15 on standard gamepad)
    if (x === 0 && y === 0) {
        if (gp.buttons[12]?.pressed) y = -1; // D-pad up
        if (gp.buttons[13]?.pressed) y = 1;  // D-pad down
        if (gp.buttons[14]?.pressed) x = -1; // D-pad left
        if (gp.buttons[15]?.pressed) x = 1;  // D-pad right
    }
    
    // Handle button presses (with state tracking to prevent repeats)
    const checkButton = (index, callback) => {
        const pressed = gp.buttons[index]?.pressed;
        const wasPressed = this.gamepadButtonStates[index];
        if (pressed && !wasPressed) {
            callback();
        }
        this.gamepadButtonStates[index] = pressed;
    };
    
    // Start button (button 9) - toggle pause
    checkButton(9, () => {
        if (this.running) this.togglePause();
    });
    
    // A button (button 0) - can be used for confirmations in menus
    // B button (button 1) - can be used for cancel/back
    
    return { x, y };
};

game.updatePlayer = function(deltaTime) {
    let dx = 0;
    let dy = 0;
    
    // Keyboard input
    if (this.keys && this.keys['w'] || this.keys && this.keys['arrowup']) dy -= 1;
    if (this.keys && this.keys['s'] || this.keys && this.keys['arrowdown']) dy += 1;
    if (this.keys && this.keys['a'] || this.keys && this.keys['arrowleft']) dx -= 1;
    if (this.keys && this.keys['d'] || this.keys && this.keys['arrowright']) dx += 1;
    
    // Gamepad input (adds to keyboard input for seamless hybrid control)
    const gamepadInput = this.pollGamepad();
    if (gamepadInput.x !== 0 || gamepadInput.y !== 0) {
        dx = gamepadInput.x;
        dy = gamepadInput.y;
    }
    
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
        dx /= length;
        dy /= length;
    }
    
    // Apply slow enemies effect
    const slowMultiplier = 1 - ((this.skills.slowenemies || 0) * 0.08);
    
    this.player.vx = dx * this.player.speed;
    this.player.vy = dy * this.player.speed;
    
    // Update position with boundary checking using explicit map bounds
    let newX = this.player.x + this.player.vx;
    let newY = this.player.y + this.player.vy;
    
    // Safety check for NaN positions which cause rendering to fail
    if (isNaN(newX) || isNaN(newY)) {
        console.warn('Player position became NaN, resetting');
        newX = this.player.x;
        newY = this.player.y;
        this.player.vx = 0;
        this.player.vy = 0;
    }
    
    // Clamp to map boundaries - use explicit constants
    this.player.x = Math.max(MAP_MIN_X, Math.min(MAP_MAX_X, newX));
    this.player.y = Math.max(MAP_MIN_Y, Math.min(MAP_MAX_Y, newY));
    
    if (this.player.invulnerable > 0) {
        this.player.invulnerable -= deltaTime;
    }
    
    // Regeneration (disabled for Vampire)
    if (this.player.regen > 0 && !this.player.isVampire) {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + (this.player.regen * deltaTime / 1000));
    }
    
    // Damage Aura
    if (this.player.auraDamage > 0) {
        this.player.lastAuraDamage += deltaTime;
        if (this.player.lastAuraDamage >= 1000) {
            this.player.lastAuraDamage = 0;
            const auraRange = 80;
            
            this.enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < auraRange) {
                    enemy.health -= this.player.auraDamage;
                }
            });
            
            this.bosses.forEach(boss => {
                const dx = boss.x - this.player.x;
                const dy = boss.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < auraRange) {
                    boss.health -= this.player.auraDamage;
                }
            });
        }
    }
    
    // Nuclear Option
    if (this.player.hasNuke) {
        this.player.lastNuke += deltaTime;
        if (this.player.lastNuke >= this.player.nukeInterval) {
            this.player.lastNuke = 0;
            this.triggerNuke();
        }
    }
    
    // Update Orbitals
    this.player.orbitals.forEach((orbital, index) => {
        orbital.angle += orbital.speed;
        orbital.lastHit += deltaTime;
        
        const orbX = this.player.x + Math.cos(orbital.angle) * orbital.distance;
        const orbY = this.player.y + Math.sin(orbital.angle) * orbital.distance;
        
        // Check orbital collisions
        if (orbital.lastHit >= orbital.hitCooldown) {
            this.enemies.forEach(enemy => {
                const dx = enemy.x - orbX;
                const dy = enemy.y - orbY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 15 + enemy.radius) {
                    const orbDamage = this.player.damage * 0.5 * (this.skills.nuke || 1);
                    enemy.health -= orbDamage;
                    orbital.lastHit = 0;
                    this.createExplosion(orbX, orbY, '#00ffff');
                }
            });
            
            this.bosses.forEach(boss => {
                const dx = boss.x - orbX;
                const dy = boss.y - orbY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 15 + boss.radius) {
                    const orbDamage = this.player.damage * 0.5 * this.player.bossDamageBonus * (this.skills.nuke || 1);
                    boss.health -= orbDamage;
                    orbital.lastHit = 0;
                    this.createExplosion(orbX, orbY, '#00ffff');
                }
            });
        }
    });
};

game.triggerNuke = function() {
    const nukeRadius = 300 * (this.skills.nuke || 1);
    const nukeDamage = this.player.damage * 10 * (this.skills.nuke || 1);
    
    // Massive explosion effect
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 5;
        this.particles.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 8 + 4,
            life: 1,
            color: '#ffff00'
        });
    }
    
    // Damage all enemies in range
    this.enemies.forEach(enemy => {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nukeRadius) {
            enemy.health -= nukeDamage;
        }
    });
    
    this.bosses.forEach(boss => {
        const dx = boss.x - this.player.x;
        const dy = boss.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nukeRadius) {
            boss.health -= nukeDamage * this.player.bossDamageBonus;
        }
    });
};

game.autoShoot = function(deltaTime) {
    this.player.lastShot += deltaTime;
    
    if (this.player.lastShot >= this.player.fireRate && this.enemies.length > 0) {
        const closest = this.findClosestEnemy();
        if (closest) {
            this.shootAt(closest);
            this.player.lastShot = 0;
        }
    }
};

game.findClosestEnemy = function() {
    let closest = null;
    let minDist = Infinity;
    
    // Check regular enemies
    this.enemies.forEach(enemy => {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDist) {
            minDist = dist;
            closest = enemy;
        }
    });
    
    // Check bosses (prioritize them if close)
    this.bosses.forEach(boss => {
        const dx = boss.x - this.player.x;
        const dy = boss.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDist) {
            minDist = dist;
            closest = boss;
        }
    });
    
    return closest;
};

game.shootAt = function(target) {
    // Limit projectiles for performance
    if (this.projectiles.length >= (this.maxProjectiles || 500)) return;
    
    const angleOffset = Math.PI / 8;
    const numProj = this.player.projectileCount;
    const startAngle = -angleOffset * (numProj - 1) / 2;
    
    // Play shoot sound (limit clone frequency for performance)
    if (!this.lastShootSound || Date.now() - this.lastShootSound > 100) {
        const sound = document.getElementById('shootSound');
        if (sound) {
            sound.currentTime = 0;
            sound.volume = (this.sfxVolume || 0.5) * (this.masterVolume || 0.5) * 0.15;
            sound.play().catch(e => {});
            this.lastShootSound = Date.now();
        }
    }
    
    // Calculate berserk damage bonus (1% per 5% HP missing)
    const healthPercent = this.player.health / this.player.maxHealth;
    const hpMissingPercent = (1 - healthPercent) * 100;
    // Berserker class gets 1.5% bonus per 5% HP missing (up to 2.5x at 10% HP)
    const berserkerClassBonus = this.player.isBerserker ? (hpMissingPercent / 5) * 0.015 : 0;
    const skillBerserkBonus = ((hpMissingPercent / 5) * 0.01 * (this.skills.berserk || 0));
    const berserkBonus = 1 + berserkerClassBonus + skillBerserkBonus;
    
    for (let i = 0; i < numProj; i++) {
        const dx = target.x - this.player.x;
        const dy = target.y - this.player.y;
        const baseAngle = Math.atan2(dy, dx);
        const angle = baseAngle + startAngle + (angleOffset * i);
        
        // Critical hit check
        const isCrit = Math.random() < this.player.critChance;
        const critMultiplier = isCrit ? 2 : 1;
        
        this.projectiles.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * this.player.projectileSpeed,
            vy: Math.sin(angle) * this.player.projectileSpeed,
            radius: 5,
            damage: this.player.damage * critMultiplier * berserkBonus,
            distance: 0,
            maxDistance: this.player.projectileRange,
            hasAoE: this.player.hasAoE,
            aoePercent: this.player.aoePercent || 0.5,
            pierceCount: this.player.pierceCount,
            pierced: 0,
            homingStrength: this.player.homingStrength,
            isCrit: isCrit
        });
    }
};
