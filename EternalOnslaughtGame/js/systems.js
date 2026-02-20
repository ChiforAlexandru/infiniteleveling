// ==================== SPRITE ANIMATION SYSTEM ====================
game.spriteAnimations = {
    survivor: {
        idle: { frames: 1, frameTime: 150, row: 0 },
        walk: { frames: 1, frameTime: 90, row: 1 },
        attack: { frames: 1, frameTime: 60, row: 2 }
    },
    necromancer: {
        idle: { frames: 1, frameTime: 200, row: 0 },
        walk: { frames: 1, frameTime: 100, row: 0 },
        attack: { frames: 1, frameTime: 80, row: 0 }
    }
};

game.loadSprites = function() {
    const spriteConfigs = [
        { key: 'survivor', src: 'images/sprites/survivor.png', cols: 7, rows: 3, autoDetectFrameSize: true },
        { key: 'necromancer', src: 'images/sprites/Necromancer64.png', frameWidth: 64, frameHeight: 64, singleFrame: true },
        { key: 'goblin', src: 'images/sprites/GoblinWalk.png', frameWidth: 32, frameHeight: 32, singleFrame: true }
    ];
    
    let loadedCount = 0;
    const totalSprites = spriteConfigs.length;
    
    spriteConfigs.forEach(config => {
        const img = new Image();
        img.onload = () => {
            let frameWidth = config.frameWidth || 64;
            let frameHeight = config.frameHeight || 64;
            
            // Single frame sprite - use entire image as one frame
            if (config.singleFrame) {
                frameWidth = img.width;
                frameHeight = img.height;
                console.log(`Sprite ${config.key}: single frame ${frameWidth}x${frameHeight}`);
                this.spriteAnimations[config.key] = {
                    idle: { frames: 1, frameTime: 200, row: 0 },
                    walk: { frames: 1, frameTime: 100, row: 0 },
                    attack: { frames: 1, frameTime: 80, row: 0 }
                };
            }
            // Auto-detect frame size from cols/rows
            else if (config.autoDetectFrameSize && config.cols && config.rows) {
                frameWidth = Math.floor(img.width / config.cols);
                frameHeight = Math.floor(img.height / config.rows);
                console.log(`Sprite ${config.key}: image ${img.width}x${img.height}, ${config.cols}x${config.rows} grid, frame size ${frameWidth}x${frameHeight}`);
            }
            // Auto-detect sprite layout based on image dimensions
            else if (config.autoDetect) {
                console.log(`Sprite ${config.key}: actual size ${img.width}x${img.height}`);
                
                // Check if this appears to be a single large sprite (square/near-square, not obviously tiled)
                const aspectRatio = img.width / img.height;
                const isSquareish = aspectRatio >= 0.8 && aspectRatio <= 1.2;
                const notPerfectMultiple = (img.width % 64 !== 0) || (img.height % 64 !== 0);
                const isSingleHighResSprite = isSquareish && (notPerfectMultiple || (img.width <= 256 && img.height <= 256));
                
                // Use actual image size if smaller than expected frame size OR appears to be a single hi-res sprite
                if (img.width <= 64 && img.height <= 64 || isSingleHighResSprite) {
                    // Single image - use entire image as one frame
                    frameWidth = img.width;
                    frameHeight = img.height;
                    console.log(`Treating ${config.key} as single sprite: ${frameWidth}x${frameHeight}`);
                    this.spriteAnimations[config.key] = {
                        idle: { frames: 1, frameTime: 200, row: 0 },
                        walk: { frames: 1, frameTime: 100, row: 0 },
                        attack: { frames: 1, frameTime: 80, row: 0 }
                    };
                } else {
                    const cols = Math.max(1, Math.floor(img.width / 64));
                    const rows = Math.max(1, Math.floor(img.height / 64));
                    
                    console.log(`Detected ${cols}x${rows} frames`);
                    
                    if (cols === 1 && rows === 1) {
                        frameWidth = img.width;
                        frameHeight = img.height;
                        this.spriteAnimations[config.key] = {
                            idle: { frames: 1, frameTime: 200, row: 0 },
                            walk: { frames: 1, frameTime: 100, row: 0 },
                            attack: { frames: 1, frameTime: 80, row: 0 }
                        };
                    } else if (rows === 1 && cols > 1) {
                        this.spriteAnimations[config.key] = {
                            idle: { frames: cols, frameTime: 200, row: 0 },
                            walk: { frames: cols, frameTime: 100, row: 0 },
                            attack: { frames: cols, frameTime: 80, row: 0 }
                        };
                    } else if (rows >= 3) {
                        this.spriteAnimations[config.key] = {
                            idle: { frames: cols, frameTime: 200, row: 0 },
                            walk: { frames: cols, frameTime: 100, row: 1 },
                            attack: { frames: cols, frameTime: 80, row: 2 }
                        };
                    } else {
                        this.spriteAnimations[config.key] = {
                            idle: { frames: cols, frameTime: 200, row: 0 },
                            walk: { frames: cols, frameTime: 100, row: Math.min(1, rows - 1) },
                            attack: { frames: cols, frameTime: 80, row: 0 }
                        };
                    }
                }
            }
            
            this.sprites[config.key] = {
                image: img,
                frameWidth: frameWidth,
                frameHeight: frameHeight,
                loaded: true
            };
            loadedCount++;
            if (loadedCount >= totalSprites) {
                this.spritesLoaded = true;
                console.log('All sprites loaded');
            }
        };
        img.onerror = () => {
            console.log(`Sprite ${config.key} not found, using fallback`);
            this.sprites[config.key] = { loaded: false };
            loadedCount++;
            if (loadedCount >= totalSprites) {
                this.spritesLoaded = true;
            }
        };
        img.src = config.src;
    });
};

game.updatePlayerAnimation = function(deltaTime) {
    if (!this.player) return;
    
    // Determine animation state based on movement
    const isMoving = Math.abs(this.player.vx) > 0.1 || Math.abs(this.player.vy) > 0.1;
    const newState = isMoving ? 'walk' : 'idle';
    
    // Update facing direction
    if (this.player.vx > 0.1) {
        this.player.facingRight = true;
    } else if (this.player.vx < -0.1) {
        this.player.facingRight = false;
    }
    
    // Check for state change
    if (newState !== this.player.animState) {
        this.player.animState = newState;
        this.player.animFrame = 0;
        this.player.animTimer = 0;
    }
    
    // Update animation timer
    const spriteKey = this.player.spriteKey || 'survivor';
    const animConfig = this.spriteAnimations[spriteKey];
    if (!animConfig) return;
    
    const stateConfig = animConfig[this.player.animState];
    if (!stateConfig) return;
    
    this.player.animTimer += deltaTime;
    if (this.player.animTimer >= stateConfig.frameTime) {
        this.player.animTimer = 0;
        this.player.animFrame = (this.player.animFrame + 1) % stateConfig.frames;
    }
};

game.drawPlayerSprite = function(ctx) {
    if (!this.player) return;
    
    const spriteKey = this.player.spriteKey || 'survivor';
    const spriteData = this.sprites[spriteKey];
    
    // If sprite not loaded, draw fallback
    if (!spriteData || !spriteData.loaded) {
        this.drawPlayerFallback(ctx);
        return;
    }
    
    const animConfig = this.spriteAnimations[spriteKey];
    if (!animConfig) {
        this.drawPlayerFallback(ctx);
        return;
    }
    
    const stateConfig = animConfig[this.player.animState];
    if (!stateConfig) {
        this.drawPlayerFallback(ctx);
        return;
    }
    
    // Calculate sprite frame position
    const frameX = this.player.animFrame * spriteData.frameWidth;
    const frameY = stateConfig.row * spriteData.frameHeight;
    
    // Animation effects even for single-frame sprites
    const isMoving = Math.abs(this.player.vx) > 0.1 || Math.abs(this.player.vy) > 0.1;
    const animTime = this.time * 0.008;
    const bobAmount = isMoving ? Math.sin(animTime * 10) * 1 : Math.sin(animTime * 2) * 0.5;
    const scaleX = isMoving ? 1.0 + Math.sin(animTime * 10) * 0.02 : 1.0;
    const scaleY = isMoving ? 1.0 - Math.sin(animTime * 10) * 0.02 : 1.0;
    
    // Scale factor to make sprite visible (target ~80px display size)
    const displayScale = 80 / Math.max(spriteData.frameWidth, spriteData.frameHeight);
    
    // Draw shadow (moves/scales with movement)
    const shadowScale = isMoving ? 1.1 : 1.0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.player.x, this.player.y + 35, 26 * shadowScale, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Handle invulnerability flashing
    if (this.player.invulnerable > 0 && Math.floor(this.player.invulnerable / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // Draw sprite (flip if facing left, apply animation effects)
    const drawWidth = spriteData.frameWidth * scaleX * displayScale;
    const drawHeight = spriteData.frameHeight * scaleY * displayScale;
    
    ctx.save();
    ctx.translate(this.player.x, this.player.y + bobAmount);
    
    if (!this.player.facingRight) {
        ctx.scale(-1, 1);
    }
    
    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Add glow effect behind sprite
    const char = this.characters[this.selectedCharacterIndex];
    const glowColor = char && char.color ? char.color : '#9966ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = glowColor;
    
    // Debug: log frame info once
    if (!spriteData.debugLogged) {
        console.log(`Drawing ${spriteKey}: frame ${this.player.animFrame}, state ${this.player.animState}, frameX=${frameX}, frameY=${frameY}, frameW=${spriteData.frameWidth}, frameH=${spriteData.frameHeight}, imgW=${spriteData.image.width}, imgH=${spriteData.image.height}`);
        spriteData.debugLogged = true;
    }
    
    // Always use clipped drawing for sprite sheets
    ctx.drawImage(
        spriteData.image,
        frameX, frameY,
        spriteData.frameWidth, spriteData.frameHeight,
        -drawWidth / 2, -drawHeight / 2,
        drawWidth, drawHeight
    );
    
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.globalAlpha = 1;
};

game.drawPlayerFallback = function(ctx) {
    const p = this.player;
    const char = this.characters[this.selectedCharacterIndex];
    const playerColor = char && char.color ? char.color : '#00ffff';
    const isNecromancer = char && char.name === 'Necromancer';
    
    // Animation parameters
    const isMoving = Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1;
    const animTime = this.time * 0.008;
    const bobAmount = isMoving ? Math.sin(animTime * 8) * 2 : Math.sin(animTime * 2) * 0.5;
    const legSwing = isMoving ? Math.sin(animTime * 10) * 0.4 : 0;
    const armSwing = isMoving ? Math.sin(animTime * 10) * 0.3 : Math.sin(animTime * 2) * 0.05;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 22, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Invulnerability flash
    if (p.invulnerable > 0 && Math.floor(p.invulnerable / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    const facing = p.facingRight ? 1 : -1;
    ctx.save();
    ctx.translate(p.x, p.y + bobAmount);
    
    // Character colors
    const skinColor = isNecromancer ? '#9966aa' : '#ffcc99';
    const bodyColor = playerColor;
    const darkBody = isNecromancer ? '#1a0a2a' : '#333355';
    
    // Legs (draw behind body)
    ctx.fillStyle = darkBody;
    // Left leg
    ctx.save();
    ctx.translate(-5, 8);
    ctx.rotate(legSwing);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-2, 12, 4, 4); // foot
    ctx.restore();
    // Right leg
    ctx.save();
    ctx.translate(5, 8);
    ctx.rotate(-legSwing);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-2, 12, 4, 4); // foot
    ctx.restore();
    
    // Body
    ctx.fillStyle = bodyColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = playerColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Body detail/armor
    ctx.fillStyle = darkBody;
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.fillStyle = skinColor;
    // Left arm
    ctx.save();
    ctx.translate(-12, -4);
    ctx.rotate(-armSwing + 0.2);
    ctx.fillRect(-2, 0, 5, 12);
    ctx.restore();
    // Right arm (front)
    ctx.save();
    ctx.translate(12, -4);
    ctx.rotate(armSwing - 0.2);
    ctx.fillRect(-3, 0, 5, 12);
    ctx.restore();
    
    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -18, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair/hood
    if (isNecromancer) {
        // Hood
        ctx.fillStyle = '#2a1a3a';
        ctx.beginPath();
        ctx.arc(0, -20, 12, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-12, -20, 24, 5);
        // Glowing eyes
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff00ff';
        ctx.fillRect(-5 * facing - 2, -20, 3, 2);
        ctx.fillRect(2 * facing, -20, 3, 2);
        ctx.shadowBlur = 0;
    } else {
        // Hair
        ctx.fillStyle = '#553322';
        ctx.beginPath();
        ctx.arc(0, -21, 10, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5 * facing - 2, -19, 4, 3);
        ctx.fillRect(2 * facing, -19, 4, 3);
        ctx.fillStyle = '#333333';
        ctx.fillRect(-4 * facing - 1, -18, 2, 2);
        ctx.fillRect(3 * facing, -18, 2, 2);
    }
    
    // Weapon glow effect
    ctx.strokeStyle = playerColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = playerColor;
    ctx.beginPath();
    ctx.moveTo(12 * facing, 8);
    ctx.lineTo(18 * facing, 14);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.restore();
    ctx.globalAlpha = 1;
};

// ==================== SCREEN SHAKE ====================
game.triggerScreenShake = function(intensity, duration) {
    // Rate limit screen shakes for performance
    if (this.lastScreenShake && Date.now() - this.lastScreenShake < 50) return;
    this.lastScreenShake = Date.now();
    
    this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
    this.screenShake.duration = Math.max(this.screenShake.duration, duration);
};

game.updateScreenShake = function(deltaTime) {
    if (this.screenShake.duration > 0) {
        this.screenShake.duration -= deltaTime;
        if (this.screenShake.duration <= 0) {
            this.screenShake.intensity = 0;
        }
    }
};

game.getScreenShakeOffset = function() {
    if (this.screenShake.intensity <= 0) return { x: 0, y: 0 };
    const angle = Math.random() * Math.PI * 2;
    const magnitude = this.screenShake.intensity * (this.screenShake.duration / 100);
    return {
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude
    };
};

// ==================== DAMAGE NUMBERS ====================
game.spawnDamageNumber = function(x, y, damage, isCrit = false, isHeal = false) {
    // Limit damage numbers for performance
    if (this.damageNumbers.length >= (this.maxDamageNumbers || 30)) {
        // Remove oldest
        this.damageNumbers.shift();
    }
    
    // Skip small damage numbers unless crit
    if (!isCrit && !isHeal && damage < 5) return;
    
    this.damageNumbers.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        damage: Math.round(damage),
        isCrit: isCrit,
        isHeal: isHeal,
        life: 800,
        maxLife: 800,
        vy: -2,
        scale: isCrit ? 1.5 : 1
    });
};

game.updateDamageNumbers = function(deltaTime) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
        const dn = this.damageNumbers[i];
        dn.life -= deltaTime;
        dn.y += dn.vy;
        dn.vy *= 0.98;
        
        if (dn.life <= 0) {
            this.damageNumbers.splice(i, 1);
        }
    }
};

game.drawDamageNumbers = function() {
    this.damageNumbers.forEach(dn => {
        const alpha = Math.min(1, dn.life / 300);
        const scale = dn.scale * (1 + (1 - dn.life / dn.maxLife) * 0.3);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${Math.round(16 * scale)}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        
        if (dn.isHeal) {
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
        } else if (dn.isCrit) {
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffaa00';
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
        }
        ctx.shadowBlur = 5;
        
        ctx.fillText(dn.damage, dn.x, dn.y);
        ctx.restore();
    });
};

// ==================== KILL STREAK ====================
game.registerKill = function(enemy, isElite = false, isBoss = false) {
    const now = Date.now();
    
    // Update kill streak
    if (now - this.lastKillTime < this.killStreakTimeout) {
        this.killStreak++;
    } else {
        this.killStreak = 1;
    }
    this.lastKillTime = now;
    
    // Track highest streak
    if (this.killStreak > this.highestStreak) {
        this.highestStreak = this.killStreak;
    }
    if (this.killStreak > this.runStats.maxKillStreak) {
        this.runStats.maxKillStreak = this.killStreak;
    }
    
    // Bonus XP for streaks
    let streakBonus = 0;
    if (this.killStreak >= 50) streakBonus = 0.5;
    else if (this.killStreak >= 25) streakBonus = 0.3;
    else if (this.killStreak >= 10) streakBonus = 0.15;
    else if (this.killStreak >= 5) streakBonus = 0.05;
    
    // Update bestiary
    if (!this.bestiary[enemy.type]) {
        this.bestiary[enemy.type] = { kills: 0, firstKill: Date.now() };
    }
    this.bestiary[enemy.type].kills++;
    
    // Track stats
    if (isElite) this.runStats.elitesKilled++;
    if (isBoss) this.runStats.bossesKilled++;
    
    // Check achievements
    this.checkAchievements();
    
    return streakBonus;
};

game.drawKillStreak = function() {
    if (this.killStreak < 5) return;
    
    const elapsed = Date.now() - this.lastKillTime;
    if (elapsed > this.killStreakTimeout) {
        this.killStreak = 0;
        return;
    }
    
    // Draw streak UI
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const alpha = 1 - (elapsed / this.killStreakTimeout);
    ctx.globalAlpha = alpha;
    
    let color = '#ffffff';
    let text = `${this.killStreak}x STREAK`;
    if (this.killStreak >= 50) {
        color = '#ff00ff';
        text = `${this.killStreak}x GODLIKE!`;
    } else if (this.killStreak >= 25) {
        color = '#ff6600';
        text = `${this.killStreak}x UNSTOPPABLE!`;
    } else if (this.killStreak >= 10) {
        color = '#ffff00';
        text = `${this.killStreak}x RAMPAGE!`;
    }
    
    ctx.font = 'bold 28px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillText(text, canvas.width / 2, 150);
    
    ctx.restore();
};

// ==================== ELITE ENEMIES ====================
game.makeElite = function(enemy) {
    enemy.isElite = true;
    enemy.health *= 3;
    enemy.maxHealth *= 3;
    enemy.damage *= 1.5;
    enemy.radius *= 1.3;
    enemy.speed *= 0.9;
    enemy.eliteColor = ['#ffaa00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 3)];
    
    // Apply mutations in story mode level 50+
    if (this.applyEliteMutation) {
        this.applyEliteMutation(enemy);
    }
    
    return enemy;
};

game.drawEliteAura = function(enemy) {
    if (!enemy.isElite) return;
    
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = `${enemy.eliteColor}${Math.round(pulse * 40).toString(16).padStart(2, '0')}`;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = enemy.eliteColor;
    ctx.lineWidth = 2;
    ctx.stroke();
};

// ==================== ACHIEVEMENTS ====================
game.achievementList = [
    { id: 'first_blood', name: 'First Blood', desc: 'Kill your first enemy', check: (g) => g.kills >= 1, reward: 5 },
    { id: 'centurion', name: 'Centurion', desc: 'Kill 100 enemies in one run', check: (g) => g.kills >= 100, reward: 20 },
    { id: 'slayer', name: 'Slayer', desc: 'Kill 500 enemies in one run', check: (g) => g.kills >= 500, reward: 50 },
    { id: 'genocide', name: 'Exterminator', desc: 'Kill 1000 enemies in one run', check: (g) => g.kills >= 1000, reward: 100 },
    { id: 'level10', name: 'Getting Stronger', desc: 'Reach level 10', check: (g) => g.level >= 10, reward: 10 },
    { id: 'level25', name: 'Veteran', desc: 'Reach level 25', check: (g) => g.level >= 25, reward: 30 },
    { id: 'level50', name: 'Elite', desc: 'Reach level 50', check: (g) => g.level >= 50, reward: 75 },
    { id: 'survivor5', name: 'Survivor', desc: 'Survive 5 minutes', check: (g) => g.time >= 300000, reward: 15 },
    { id: 'survivor10', name: 'Endurance', desc: 'Survive 10 minutes', check: (g) => g.time >= 600000, reward: 40 },
    { id: 'survivor20', name: 'Immortal', desc: 'Survive 20 minutes', check: (g) => g.time >= 1200000, reward: 100 },
    { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Kill a boss', check: (g) => g.runStats.bossesKilled >= 1, reward: 25 },
    { id: 'boss_hunter', name: 'Boss Hunter', desc: 'Kill 5 bosses in one run', check: (g) => g.runStats.bossesKilled >= 5, reward: 75 },
    { id: 'streak10', name: 'Combo Starter', desc: 'Get a 10 kill streak', check: (g) => g.highestStreak >= 10, reward: 10 },
    { id: 'streak25', name: 'Combo Master', desc: 'Get a 25 kill streak', check: (g) => g.highestStreak >= 25, reward: 25 },
    { id: 'streak50', name: 'Godlike', desc: 'Get a 50 kill streak', check: (g) => g.highestStreak >= 50, reward: 50 },
    { id: 'elite_hunter', name: 'Elite Hunter', desc: 'Kill 10 elite enemies', check: (g) => g.runStats.elitesKilled >= 10, reward: 30 },
    { id: 'tank_main', name: 'Tank Main', desc: 'Win a run as Tank', check: (g) => g.characters[g.selectedCharacterIndex]?.name === 'Tank' && g.time >= 600000, reward: 20 },
    { id: 'scout_main', name: 'Scout Main', desc: 'Win a run as Scout', check: (g) => g.characters[g.selectedCharacterIndex]?.name === 'Scout' && g.time >= 600000, reward: 20 },
    { id: 'sniper_main', name: 'Sniper Main', desc: 'Win a run as Sniper', check: (g) => g.characters[g.selectedCharacterIndex]?.name === 'Sniper' && g.time >= 600000, reward: 20 }
];

game.checkAchievements = function() {
    this.achievementList.forEach(ach => {
        if (!this.achievements[ach.id] && ach.check(this)) {
            this.achievements[ach.id] = { unlocked: true, date: Date.now() };
            localStorage.setItem('achievements', JSON.stringify(this.achievements));
            this.showAchievementPopup(ach);
            this.trueXp += ach.reward;
            localStorage.setItem('trueXp', this.trueXp);
        }
    });
};

game.showAchievementPopup = function(ach) {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-reward">+${ach.reward} True XP</div>
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 100);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 3000);
};

game.showAchievements = function() {
    document.getElementById('achievementsScreen').style.display = 'flex';
    this.renderAchievements();
};

game.hideAchievements = function() {
    document.getElementById('achievementsScreen').style.display = 'none';
};

game.renderAchievements = function() {
    const container = document.getElementById('achievementsGrid');
    if (!container) return;
    
    let html = '';
    this.achievementList.forEach(ach => {
        const unlocked = this.achievements[ach.id];
        html += `
            <div class="achievement-entry ${unlocked ? 'unlocked' : ''}">
                <div class="name">${ach.name}</div>
                <div class="desc">${ach.desc}</div>
                <div class="reward">${unlocked ? '✓ Unlocked' : `Reward: ${ach.reward} True XP`}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
};

// ==================== DAILY CHALLENGES ====================
game.dailyChallenges = [
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Kill 200 enemies in under 3 minutes', modifier: { speed: 1.5 }, goal: (g) => g.kills >= 200 && g.time < 180000, progress: (g) => ({ current: g.kills, target: 200, extra: g.time < 180000 ? '' : ' (time exceeded)' }), reward: 50, relicReward: { rarity: 'uncommon' } },
    { id: 'glass_run', name: 'Glass Cannon Run', desc: 'Reach level 20 with 50% HP', modifier: { maxHpMult: 0.5, damageMult: 2 }, goal: (g) => g.level >= 20, progress: (g) => ({ current: g.level, target: 20 }), reward: 75, relicReward: { rarity: 'epic' } },
    { id: 'pacifist_start', name: 'Slow Start', desc: 'Reach level 15 without power-ups for first 2 minutes', modifier: { noPowerUps: 120000 }, goal: (g) => g.level >= 15, progress: (g) => ({ current: g.level, target: 15 }), reward: 60, relicReward: { rarity: 'uncommon' } },
    { id: 'boss_rush', name: 'Boss Blitz', desc: 'Kill 3 bosses', modifier: { bossSpawnRate: 0.5 }, goal: (g) => g.runStats.bossesKilled >= 3, progress: (g) => ({ current: g.runStats.bossesKilled || 0, target: 3 }), reward: 100, relicReward: { rarity: 'legendary' } },
    { id: 'elite_slayer', name: 'Elite Slayer', desc: 'Kill 15 elite enemies', modifier: { eliteRate: 0.3 }, goal: (g) => g.runStats.elitesKilled >= 15, progress: (g) => ({ current: g.runStats.elitesKilled || 0, target: 15 }), reward: 80, relicReward: { rarity: 'epic' } }
];

game.generateDailyChallenge = function() {
    const today = new Date().toDateString();
    if (this.lastDailyDate === today && this.dailyChallenge) {
        return this.dailyChallenge;
    }
    
    // Use date as seed for consistent daily
    const seed = new Date().getDate() + new Date().getMonth() * 31;
    const challenge = this.dailyChallenges[seed % this.dailyChallenges.length];
    
    this.dailyChallenge = challenge;
    this.lastDailyDate = today;
    localStorage.setItem('lastDailyDate', today);
    
    return challenge;
};

game.startDailyChallenge = function() {
    this.generateDailyChallenge();
    this.mode = 'daily';
    this.activeDailyModifiers = this.dailyChallenge.modifier;
    this.startGame();
};

game.updateDailyBanner = function() {
    const challenge = this.generateDailyChallenge();
    const banner = document.getElementById('dailyChallengeBanner');
    const nameEl = document.getElementById('dailyChallengeName');
    const descEl = document.getElementById('dailyChallengeDesc');
    
    if (banner && nameEl && descEl) {
        nameEl.textContent = challenge.name;
        descEl.textContent = challenge.desc;
        banner.style.display = 'block';
    }
};

// Daily Challenge Progress Tracking
game.initDailyChallengeHud = function() {
    if (this.mode !== 'daily' || !this.dailyChallenge) return;
    
    this.dailyChallengeCompleted = false;
    
    const hud = document.getElementById('dailyChallengeHud');
    const nameEl = document.getElementById('dailyHudName');
    const rewardEl = document.getElementById('dailyHudReward');
    
    if (hud && nameEl) {
        nameEl.textContent = this.dailyChallenge.name;
        
        // Show relic reward info
        if (this.dailyChallenge.relicReward) {
            const rarityInfo = this.relicRarities[this.dailyChallenge.relicReward.rarity];
            rewardEl.innerHTML = `Reward: <span style="color: ${rarityInfo.color}">${rarityInfo.name} Relic</span>`;
        }
        
        hud.style.display = 'block';
        hud.classList.remove('complete');
    }
    
    this.updateDailyChallengeHud();
};

game.updateDailyChallengeHud = function() {
    if (this.mode !== 'daily' || !this.dailyChallenge || !this.dailyChallenge.progress) return;
    
    const hud = document.getElementById('dailyChallengeHud');
    const progressText = document.getElementById('dailyHudProgressText');
    const extraText = document.getElementById('dailyHudExtra');
    const bar = document.getElementById('dailyHudBar');
    
    if (!hud || !progressText || !bar) return;
    
    // Get progress from the challenge's progress function
    const progress = this.dailyChallenge.progress(this);
    const percent = Math.min((progress.current / progress.target) * 100, 100);
    
    progressText.textContent = `${progress.current}/${progress.target}`;
    if (extraText) extraText.textContent = progress.extra || '';
    bar.style.width = `${percent}%`;
    
    // Check if completed
    if (!this.dailyChallengeCompleted && this.dailyChallenge.goal(this)) {
        this.completeDailyChallenge();
    }
};

game.completeDailyChallenge = function() {
    if (this.dailyChallengeCompleted) return;
    this.dailyChallengeCompleted = true;
    
    const hud = document.getElementById('dailyChallengeHud');
    const bar = document.getElementById('dailyHudBar');
    const progressText = document.getElementById('dailyHudProgressText');
    
    if (hud) {
        hud.classList.add('complete');
    }
    if (bar) {
        bar.classList.add('complete');
        bar.style.width = '100%';
    }
    if (progressText) {
        progressText.textContent = 'COMPLETE!';
    }
    
    // Award relic reward
    this.awardDailyChallengeRelic();
    
    // Award XP reward
    if (this.dailyChallenge.reward) {
        this.trueXp += this.dailyChallenge.reward;
        localStorage.setItem('trueXp', this.trueXp);
    }
    
    // Mark as completed for today
    const today = new Date().toDateString();
    localStorage.setItem('dailyChallengeCompletedDate', today);
};

game.awardDailyChallengeRelic = function() {
    if (!this.dailyChallenge.relicReward) return;
    
    if (!this.relicInventory) this.initRelicSystem();
    
    // Get random relic type
    const randomType = this.relicTypes[Math.floor(Math.random() * this.relicTypes.length)];
    const rarity = this.dailyChallenge.relicReward.rarity;
    
    // Add to inventory
    this.relicInventory.push({ typeId: randomType.id, rarity: rarity });
    this.saveRelicData();
    
    // Show notification
    this.showRelicDrop({ typeId: randomType.id, rarity: rarity });
};

game.hideDailyChallengeHud = function() {
    const hud = document.getElementById('dailyChallengeHud');
    if (hud) {
        hud.style.display = 'none';
        hud.classList.remove('complete');
    }
};

// ==================== WEAPON EVOLUTION ====================
game.weaponEvolutions = [
    {
        id: 'plasma_storm',
        name: 'Plasma Storm',
        requires: ['damage', 'damage', 'aoe'],
        description: 'Projectiles create chain lightning',
        effect: (player) => {
            player.hasChainLightning = true;
            player.chainLightningDamage = player.damage * 0.5;
        }
    },
    {
        id: 'frozen_barrage',
        name: 'Frozen Barrage',
        requires: ['projectiles', 'projectiles', 'icepath'],
        description: 'Extra projectiles that freeze',
        effect: (player) => {
            player.projectileCount += 2;
            player.projectilesFreeze = true;
        }
    },
    {
        id: 'inferno_core',
        name: 'Inferno Core',
        requires: ['firerate', 'firerate', 'firetrail'],
        description: 'Massive fire rate, burning shots',
        effect: (player) => {
            player.fireRate *= 0.5;
            player.projectilesBurn = true;
        }
    },
    {
        id: 'void_cannon',
        name: 'Void Cannon',
        requires: ['range', 'range', 'projectilespeed'],
        description: 'Piercing shots that grow stronger',
        effect: (player) => {
            player.pierceCount += 3;
            player.projectileGrowth = true;
        }
    }
];

game.collectedPowerUps = [];

game.checkEvolutions = function() {
    this.weaponEvolutions.forEach(evo => {
        if (this.player[`has_${evo.id}`]) return;
        
        const counts = {};
        this.collectedPowerUps.forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
        });
        
        const hasAll = evo.requires.every(req => {
            const needed = evo.requires.filter(r => r === req).length;
            return (counts[req] || 0) >= needed;
        });
        
        if (hasAll) {
            this.player[`has_${evo.id}`] = true;
            evo.effect(this.player);
            this.showEvolutionPopup(evo);
        }
    });
};

game.showEvolutionPopup = function(evo) {
    const popup = document.createElement('div');
    popup.className = 'evolution-popup';
    popup.innerHTML = `
        <div class="evolution-icon">⚡</div>
        <div class="evolution-text">
            <div class="evolution-title">WEAPON EVOLVED!</div>
            <div class="evolution-name">${evo.name}</div>
            <div class="evolution-desc">${evo.description}</div>
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 100);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 4000);
};

// ==================== PRESTIGE SYSTEM ====================
game.getPrestigeBonus = function() {
    return 1 + (this.prestigeLevel * 0.1);
};

game.canPrestige = function() {
    return this.trueXp >= this.getPrestigeCost();
};

game.getPrestigeCost = function() {
    return Math.floor(500 * Math.pow(2, this.prestigeLevel));
};

game.doPrestige = function() {
    if (!this.canPrestige()) return;
    
    this.prestigeLevel++;
    this.prestigeMultiplier = this.getPrestigeBonus();
    
    // Reset progress
    this.trueXp = 0;
    this.skills = {};
    
    // Save
    localStorage.setItem('prestigeLevel', this.prestigeLevel);
    localStorage.setItem('trueXp', '0');
    localStorage.setItem('skills', '{}');
    
    this.updateSkillTreeUI();
};

// ==================== MINI-MAP ====================
game.drawMiniMap = function() {
    const mapSize = 150;
    const mapX = canvas.width - mapSize - 20;
    const mapY = 90; // Below HUD bar
    const scale = mapSize / MAP_WIDTH;
    
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);
    
    // Enemies (red dots)
    ctx.fillStyle = '#ff3333';
    this.enemies.forEach(enemy => {
        const ex = mapX + enemy.x * scale;
        const ey = mapY + enemy.y * scale;
        ctx.beginPath();
        ctx.arc(ex, ey, enemy.isElite ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Bosses (larger red)
    ctx.fillStyle = '#ff0000';
    this.bosses.forEach(boss => {
        const bx = mapX + boss.x * scale;
        const by = mapY + boss.y * scale;
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // XP orbs (green dots)
    ctx.fillStyle = '#00ff00';
    this.xpOrbs.forEach(orb => {
        const ox = mapX + orb.x * scale;
        const oy = mapY + orb.y * scale;
        ctx.beginPath();
        ctx.arc(ox, oy, 1, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Player (cyan)
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 5;
    const px = mapX + this.player.x * scale;
    const py = mapY + this.player.y * scale;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
};

// ==================== RUN STATISTICS ====================
game.resetRunStats = function() {
    this.runStats = {
        damageDealt: 0,
        damageTaken: 0,
        xpCollected: 0,
        powerUpsCollected: 0,
        bossesKilled: 0,
        elitesKilled: 0,
        maxKillStreak: 0
    };
    this.killStreak = 0;
    this.highestStreak = 0;
    this.collectedPowerUps = [];
};

game.showRunStats = function() {
    const statsHtml = `
        <div class="run-stats-content">
            <h3>Run Statistics</h3>
            <div class="stat-row"><span>Damage Dealt:</span><span>${Math.round(this.runStats.damageDealt).toLocaleString()}</span></div>
            <div class="stat-row"><span>Damage Taken:</span><span>${Math.round(this.runStats.damageTaken).toLocaleString()}</span></div>
            <div class="stat-row"><span>XP Collected:</span><span>${Math.round(this.runStats.xpCollected).toLocaleString()}</span></div>
            <div class="stat-row"><span>Power-ups:</span><span>${this.runStats.powerUpsCollected}</span></div>
            <div class="stat-row"><span>Bosses Killed:</span><span>${this.runStats.bossesKilled}</span></div>
            <div class="stat-row"><span>Elites Killed:</span><span>${this.runStats.elitesKilled}</span></div>
            <div class="stat-row"><span>Max Kill Streak:</span><span>${this.runStats.maxKillStreak}</span></div>
        </div>
    `;
    
    const statsContainer = document.getElementById('runStatsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = statsHtml;
    }
};

// ==================== BESTIARY ====================
game.showBestiary = function() {
    document.getElementById('bestiaryScreen').style.display = 'flex';
    this.renderBestiary();
};

game.hideBestiary = function() {
    document.getElementById('bestiaryScreen').style.display = 'none';
};

game.renderBestiary = function() {
    const container = document.getElementById('bestiaryGrid');
    if (!container) return;
    
    let html = '';
    this.enemyTypes.forEach(enemy => {
        const data = this.bestiary[enemy.name] || { kills: 0 };
        const discovered = data.kills > 0;
        
        html += `
            <div class="bestiary-entry ${discovered ? 'discovered' : 'unknown'}">
                <div class="bestiary-icon" style="background: ${discovered ? enemy.color : '#333'}"></div>
                <div class="bestiary-name">${discovered ? enemy.name.toUpperCase() : '???'}</div>
                <div class="bestiary-kills">${discovered ? `Kills: ${data.kills}` : 'Not discovered'}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
};

// ==================== CREDITS ====================
game.showCredits = function() {
    document.getElementById('creditsScreen').style.display = 'flex';
    // Reset scroll animation to start from beginning
    const scrollEl = document.getElementById('creditsScroll');
    if (scrollEl) {
        scrollEl.style.animation = 'none';
        scrollEl.offsetHeight; // Trigger reflow
        scrollEl.style.animation = 'creditsScroll 60s linear infinite';
    }
};

game.hideCredits = function() {
    document.getElementById('creditsScreen').style.display = 'none';
};

// ==================== BOSS RUSH MODE ====================
game.startBossRush = function() {
    this.mode = 'bossrush';
    this.bossRushWave = 0;
    this.bossSpawnInterval = 5000;
    this.nextBossTime = 3000;
    this.startGame();
};

// Save bestiary on game over
game.saveBestiary = function() {
    localStorage.setItem('bestiary', JSON.stringify(this.bestiary));
};

// ==================== CURSED CHESTS ====================
game.cursedChestSpawnTime = 120000; // First chest at 2 minutes
game.lastCursedChestTime = 0;
game.cursedChestInterval = 90000; // Every 90 seconds after

game.checkCursedChestSpawn = function() {
    if (this.time >= this.cursedChestSpawnTime && 
        this.time - this.lastCursedChestTime >= this.cursedChestInterval) {
        this.spawnCursedChest();
        this.lastCursedChestTime = this.time;
    }
};

game.spawnCursedChest = function() {
    // Spawn chest near but not on the player
    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 200;
    let x = this.player.x + Math.cos(angle) * distance;
    let y = this.player.y + Math.sin(angle) * distance;
    
    // Clamp to map bounds
    x = Math.max(50, Math.min(MAP_WIDTH - 50, x));
    y = Math.max(50, Math.min(MAP_HEIGHT - 50, y));
    
    const chest = {
        x, y,
        radius: 25,
        isCursed: true,
        lifespan: 30000, // Despawns after 30 seconds
        spawnTime: this.time,
        collected: false
    };
    
    this.chests.push(chest);
    
    // Warning notification
    this.showCursedChestWarning();
};

game.showCursedChestWarning = function() {
    const warning = document.createElement('div');
    warning.className = 'cursed-chest-warning';
    warning.innerHTML = '⚠️ CURSED CHEST SPAWNED! ⚠️';
    document.body.appendChild(warning);
    
    setTimeout(() => warning.remove(), 3000);
};

game.openCursedChest = function(chest) {
    if (chest.collected) return;
    chest.collected = true;
    
    // Get cursed items only
    const cursedItems = this.powerUps.filter(p => p.isCursed);
    if (cursedItems.length === 0) return;
    
    // Pick 2-3 random cursed items to offer
    const numItems = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...cursedItems].sort(() => Math.random() - 0.5);
    const offerings = shuffled.slice(0, numItems);
    
    // Show cursed chest selection UI
    this.showCursedChestUI(offerings);
};

game.showCursedChestUI = function(offerings) {
    this.paused = true;
    
    const container = document.createElement('div');
    container.className = 'cursed-chest-screen';
    container.id = 'cursedChestScreen';
    
    let html = `
        <div class="cursed-title">☠️ CURSED CHEST ☠️</div>
        <div class="cursed-subtitle">Choose your curse... or walk away</div>
        <div class="cursed-items">
    `;
    
    offerings.forEach((item, i) => {
        html += `
            <div class="power-card cursed" onclick="game.selectCursedItem(${i})">
                <div class="card-title">${item.name}</div>
                <div class="card-desc">${item.description}</div>
                <div class="card-stats">${item.stats}</div>
            </div>
        `;
    });
    
    html += `
        </div>
        <button class="button skip-cursed" onclick="game.skipCursedChest()">Walk Away</button>
    `;
    
    container.innerHTML = html;
    document.body.appendChild(container);
    
    this.cursedOfferings = offerings;
};

game.selectCursedItem = function(index) {
    const item = this.cursedOfferings[index];
    if (item && item.apply) {
        item.apply(this.player);
        if (this.runStats) this.runStats.powerUpsCollected++;
    }
    this.closeCursedChestUI();
};

game.skipCursedChest = function() {
    this.closeCursedChestUI();
};

game.closeCursedChestUI = function() {
    const screen = document.getElementById('cursedChestScreen');
    if (screen) screen.remove();
    this.cursedOfferings = null;
    this.paused = false;
};

// ==================== SYNERGY INDICATORS ====================
game.getSynergyProgress = function() {
    const progress = [];
    
    this.weaponEvolutions.forEach(evo => {
        if (this.player && this.player[`has_${evo.id}`]) return; // Already evolved
        
        const counts = {};
        (this.collectedPowerUps || []).forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
        });
        
        // Count how many requirements are met
        const uniqueReqs = [...new Set(evo.requires)];
        let totalNeeded = 0;
        let totalHave = 0;
        
        uniqueReqs.forEach(req => {
            const needed = evo.requires.filter(r => r === req).length;
            const have = Math.min(counts[req] || 0, needed);
            totalNeeded += needed;
            totalHave += have;
        });
        
        if (totalHave > 0) {
            progress.push({
                name: evo.name,
                description: evo.description,
                progress: totalHave / totalNeeded,
                requires: evo.requires,
                counts: counts
            });
        }
    });
    
    return progress.sort((a, b) => b.progress - a.progress);
};

game.drawSynergyIndicators = function() {
    const progress = this.getSynergyProgress();
    if (progress.length === 0) return;
    
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const startY = 200;
    const indicatorHeight = 50;
    
    progress.slice(0, 3).forEach((syn, i) => {
        const y = startY + i * (indicatorHeight + 10);
        
        // Background
        ctx.fillStyle = 'rgba(50, 0, 100, 0.7)';
        ctx.fillRect(10, y, 180, indicatorHeight);
        
        // Border
        ctx.strokeStyle = syn.progress >= 1 ? '#ff00ff' : '#6644aa';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, y, 180, indicatorHeight);
        
        // Progress bar
        ctx.fillStyle = syn.progress >= 1 ? '#ff00ff' : '#aa66ff';
        ctx.fillRect(15, y + indicatorHeight - 12, 170 * syn.progress, 8);
        
        // Name
        ctx.font = 'bold 12px Orbitron, monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(syn.name, 15, y + 18);
        
        // Progress percentage
        ctx.font = '10px Chakra Petch, monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`${Math.round(syn.progress * 100)}%`, 15, y + 32);
    });
    
    ctx.restore();
};

// ==================== UNLOCKABLE CHARACTERS ====================
game.characterUnlocks = {
    'Survivor': { requirement: null, unlocked: true },
    'Tank': { requirement: { type: 'kills', amount: 500 }, description: 'Kill 500 enemies total' },
    'Scout': { requirement: { type: 'time', amount: 600000 }, description: 'Survive 10 minutes in one run' },
    'Sniper': { requirement: { type: 'level', amount: 25 }, description: 'Reach level 25 in one run' },
    'Necromancer': { requirement: null, unlocked: true },
    'Summoner': { requirement: { type: 'kills', amount: 2000 }, description: 'Kill 2000 enemies total' },
    'Berserker': { requirement: { type: 'level', amount: 35 }, description: 'Reach level 35 in one run' },
    'Vampire': { requirement: { type: 'time', amount: 900000 }, description: 'Survive 15 minutes in one run' }
};

game.totalStats = JSON.parse(localStorage.getItem('totalStats') || '{"kills":0,"timeAlive":0,"maxLevel":0}');

game.updateTotalStats = function() {
    this.totalStats.kills += this.kills;
    this.totalStats.timeAlive = Math.max(this.totalStats.timeAlive, this.time);
    this.totalStats.maxLevel = Math.max(this.totalStats.maxLevel, this.level);
    localStorage.setItem('totalStats', JSON.stringify(this.totalStats));
    
    this.checkCharacterUnlocks();
};

game.checkCharacterUnlocks = function() {
    Object.keys(this.characterUnlocks).forEach(charName => {
        const unlock = this.characterUnlocks[charName];
        if (this.unlockedCharacters.includes(charName)) return;
        if (!unlock.requirement) return;
        if (unlock.requirement.type === 'premium') return;
        
        let unlocked = false;
        
        switch (unlock.requirement.type) {
            case 'kills':
                unlocked = this.totalStats.kills >= unlock.requirement.amount;
                break;
            case 'time':
                unlocked = this.totalStats.timeAlive >= unlock.requirement.amount;
                break;
            case 'level':
                unlocked = this.totalStats.maxLevel >= unlock.requirement.amount;
                break;
        }
        
        if (unlocked) {
            this.unlockedCharacters.push(charName);
            localStorage.setItem('unlockedCharacters', JSON.stringify(this.unlockedCharacters));
            this.showCharacterUnlockPopup(charName);
        }
    });
};

game.showCharacterUnlockPopup = function(charName) {
    const popup = document.createElement('div');
    popup.className = 'character-unlock-popup';
    popup.innerHTML = `
        <div class="unlock-icon">🎉</div>
        <div class="unlock-text">
            <div class="unlock-title">CHARACTER UNLOCKED!</div>
            <div class="unlock-name">${charName}</div>
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 100);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 4000);
};

game.isCharacterUnlocked = function(charName) {
    return this.unlockedCharacters.includes(charName);
};

// ==================== RELIC SYSTEM ====================

game.initRelicSystem = function() {
    // Load relic inventory from localStorage
    this.relicInventory = JSON.parse(localStorage.getItem('relicInventory') || '[]');
    this.equippedRelics = JSON.parse(localStorage.getItem('equippedRelics') || '[null,null,null,null,null]');
    
    // Combine state
    this.combineSlot1 = null;
    this.combineSlot2 = null;
    this.activeCombineSlot = null;
    this.currentRelicFilter = 'all';
};

game.saveRelicData = function() {
    localStorage.setItem('relicInventory', JSON.stringify(this.relicInventory));
    localStorage.setItem('equippedRelics', JSON.stringify(this.equippedRelics));
};

game.showRelicStorage = function() {
    if (!this.relicInventory) this.initRelicSystem();
    document.getElementById('relicScreen').style.display = 'flex';
    document.getElementById('startScreen').style.display = 'none';
    this.switchRelicTab('inventory');
};

game.hideRelicStorage = function() {
    document.getElementById('relicScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
};

game.switchRelicTab = function(tab) {
    // Update tab buttons
    document.querySelectorAll('.relic-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('relicTab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    
    // Hide all tabs
    document.getElementById('relicInventoryTab').style.display = 'none';
    document.getElementById('relicCombineTab').style.display = 'none';
    document.getElementById('relicEquippedTab').style.display = 'none';
    
    // Show selected tab
    document.getElementById('relic' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Tab').style.display = 'block';
    
    // Render tab content
    if (tab === 'inventory') this.renderRelicInventory();
    if (tab === 'combine') this.renderCombineTab();
    if (tab === 'equipped') this.renderEquippedTab();
};

game.filterRelics = function(filter) {
    this.currentRelicFilter = filter;
    document.querySelectorAll('.relic-filter').forEach(f => f.classList.remove('active'));
    document.querySelector(`.relic-filter[data-filter="${filter}"]`).classList.add('active');
    this.renderRelicInventory();
};

game.renderRelicInventory = function() {
    const grid = document.getElementById('relicInventoryGrid');
    const filter = this.currentRelicFilter;
    
    // Group relics by type and rarity
    const grouped = {};
    this.relicInventory.forEach((relic, idx) => {
        const key = `${relic.typeId}_${relic.rarity}`;
        if (!grouped[key]) {
            grouped[key] = { ...relic, count: 0, indices: [] };
        }
        grouped[key].count++;
        grouped[key].indices.push(idx);
    });
    
    // Filter
    let relics = Object.values(grouped);
    if (filter !== 'all') {
        relics = relics.filter(r => r.rarity === filter);
    }
    
    // Sort by rarity (mythic first)
    const rarityOrder = ['mythic', 'legendary', 'epic', 'uncommon', 'common'];
    relics.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
    
    // Update stats
    document.getElementById('relicTotalCount').textContent = this.relicInventory.length;
    const equippedCount = this.equippedRelics.filter(r => r !== null).length;
    document.getElementById('relicEquippedCount').textContent = equippedCount;
    
    if (relics.length === 0) {
        grid.innerHTML = `
            <div class="relic-empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">💎</div>
                <div class="empty-text">${filter === 'all' ? 'No relics yet! Defeat enemies to find relics.' : 'No ' + filter + ' relics found.'}</div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = relics.map(relic => {
        const type = this.relicTypes.find(t => t.id === relic.typeId);
        const rarityInfo = this.relicRarities[relic.rarity];
        const isEquipped = this.equippedRelics.some(e => e && e.typeId === relic.typeId && e.rarity === relic.rarity);
        
        return `
            <div class="relic-card ${relic.rarity} ${isEquipped ? 'equipped' : ''}" 
                 onclick="game.selectRelicForEquip('${relic.typeId}', '${relic.rarity}')"
                 title="${type.description}">
                <div class="relic-icon">${type.icon}</div>
                <div class="relic-name">${type.name}</div>
                <div class="relic-rarity">${rarityInfo.name}</div>
                <div class="relic-effect">+${Math.round(type.baseValue * rarityInfo.multiplier)}% ${type.description.split(' ').slice(1).join(' ')}</div>
                ${relic.count > 1 ? `<div class="relic-count">x${relic.count}</div>` : ''}
            </div>
        `;
    }).join('');
};

game.selectRelicForEquip = function(typeId, rarity) {
    // Find empty slot or replace
    const emptySlotIdx = this.equippedRelics.findIndex(r => r === null);
    const alreadyEquipped = this.equippedRelics.findIndex(r => r && r.typeId === typeId && r.rarity === rarity);
    
    if (alreadyEquipped !== -1) {
        // Unequip
        this.equippedRelics[alreadyEquipped] = null;
    } else if (emptySlotIdx !== -1) {
        // Equip to empty slot
        this.equippedRelics[emptySlotIdx] = { typeId, rarity };
    } else {
        // No empty slots
        alert('All relic slots are full! Unequip a relic first.');
        return;
    }
    
    this.saveRelicData();
    this.renderRelicInventory();
};

game.renderEquippedTab = function() {
    const slotsContainer = document.getElementById('equippedSlots');
    const bonusContainer = document.getElementById('equippedTotalBonus');
    
    slotsContainer.innerHTML = this.equippedRelics.map((relic, idx) => {
        if (!relic) {
            return `
                <div class="equipped-slot" data-slot="${idx}" onclick="game.unequipRelic(${idx})">
                    <div style="color: #444; font-size: 30px;">+</div>
                    <div style="color: #444; font-size: 10px;">Empty</div>
                </div>
            `;
        }
        
        const type = this.relicTypes.find(t => t.id === relic.typeId);
        const rarityInfo = this.relicRarities[relic.rarity];
        
        return `
            <div class="equipped-slot filled ${relic.rarity}" 
                 style="--relic-color: ${rarityInfo.color}; --relic-bg: ${rarityInfo.bgColor}"
                 data-slot="${idx}" 
                 onclick="game.unequipRelic(${idx})">
                <div class="relic-icon">${type.icon}</div>
                <div class="relic-name">${type.name}</div>
                <div class="relic-rarity" style="color: ${rarityInfo.color}">${rarityInfo.name}</div>
            </div>
        `;
    }).join('');
    
    // Calculate total bonuses
    const bonuses = {};
    this.equippedRelics.forEach(relic => {
        if (!relic) return;
        const type = this.relicTypes.find(t => t.id === relic.typeId);
        const rarityInfo = this.relicRarities[relic.rarity];
        const value = type.baseValue * rarityInfo.multiplier;
        
        if (!bonuses[type.id]) {
            bonuses[type.id] = { name: type.description, value: 0 };
        }
        bonuses[type.id].value += value;
    });
    
    // Get active relic sets
    const activeSets = this.getActiveRelicSets ? this.getActiveRelicSets() : [];
    
    let html = '';
    
    // Show active sets first
    if (activeSets.length > 0) {
        html += `
            <div class="equipped-bonus-title">⚔️ Active Set Bonuses</div>
            ${activeSets.map(set => `
                <div class="relic-set-active">
                    <div class="relic-set-icon">${set.icon}</div>
                    <div class="relic-set-info">
                        <div class="relic-set-name">${set.name} (${set.tier}/3)</div>
                        <div class="relic-set-bonus">${set.bonus.name}</div>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    // Show individual bonuses
    if (Object.keys(bonuses).length === 0) {
        html += `
            <div class="equipped-bonus-title">Total Bonuses</div>
            <div style="text-align: center; color: #666; padding: 20px;">No relics equipped</div>
        `;
    } else {
        html += `
            <div class="equipped-bonus-title" style="margin-top: 15px;">Total Bonuses</div>
            ${Object.values(bonuses).map(b => `
                <div class="equipped-bonus-item">
                    ${b.name}
                    <span class="equipped-bonus-value">+${Math.round(b.value * 10) / 10}%</span>
                </div>
            `).join('')}
        `;
    }
    
    bonusContainer.innerHTML = html;
};

game.unequipRelic = function(slotIdx) {
    if (this.equippedRelics[slotIdx]) {
        this.equippedRelics[slotIdx] = null;
        this.saveRelicData();
        this.renderEquippedTab();
    }
};

// Combine Tab
game.renderCombineTab = function() {
    this.updateCombineSlots();
    this.renderCombineSelectGrid();
};

game.selectCombineSlot = function(slotNum) {
    this.activeCombineSlot = slotNum;
    document.getElementById('combineSlot1').classList.toggle('active', slotNum === 1);
    document.getElementById('combineSlot2').classList.toggle('active', slotNum === 2);
    this.renderCombineSelectGrid();
};

game.renderCombineSelectGrid = function() {
    const grid = document.getElementById('combineSelectGrid');
    
    if (!this.activeCombineSlot) {
        grid.innerHTML = '<div style="text-align: center; color: #666; grid-column: 1/-1;">Click a slot above to select a relic</div>';
        return;
    }
    
    // Get available relics for combining (need at least 2 of same type+rarity, exclude mythic)
    const grouped = {};
    this.relicInventory.forEach((relic, idx) => {
        if (relic.rarity === 'mythic') return; // Can't combine mythic
        const key = `${relic.typeId}_${relic.rarity}`;
        if (!grouped[key]) {
            grouped[key] = { ...relic, count: 0, indices: [] };
        }
        grouped[key].count++;
        grouped[key].indices.push(idx);
    });
    
    // Filter for relics with count >= 2 (or count >= 1 if adding to second slot with same type)
    let available = Object.values(grouped);
    
    // If slot 1 is filled, only show same type+rarity for slot 2
    if (this.activeCombineSlot === 2 && this.combineSlot1) {
        available = available.filter(r => 
            r.typeId === this.combineSlot1.typeId && 
            r.rarity === this.combineSlot1.rarity &&
            r.count >= (this.combineSlot1 ? 2 : 1)
        );
    } else {
        available = available.filter(r => r.count >= 2);
    }
    
    if (available.length === 0) {
        grid.innerHTML = '<div style="text-align: center; color: #666; grid-column: 1/-1;">No relics available to combine (need 2+ of the same type & rarity)</div>';
        return;
    }
    
    const rarityOrder = ['common', 'uncommon', 'epic', 'legendary'];
    available.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
    
    grid.innerHTML = available.map(relic => {
        const type = this.relicTypes.find(t => t.id === relic.typeId);
        const rarityInfo = this.relicRarities[relic.rarity];
        
        return `
            <div class="relic-card ${relic.rarity}" 
                 onclick="game.addToCombineSlot('${relic.typeId}', '${relic.rarity}')"
                 style="padding: 10px;">
                <div class="relic-icon" style="font-size: 24px;">${type.icon}</div>
                <div class="relic-name">${type.name}</div>
                <div class="relic-rarity">${rarityInfo.name}</div>
                <div class="relic-count">x${relic.count}</div>
            </div>
        `;
    }).join('');
};

game.addToCombineSlot = function(typeId, rarity) {
    const relic = { typeId, rarity };
    
    if (this.activeCombineSlot === 1) {
        this.combineSlot1 = relic;
        this.combineSlot2 = null; // Reset slot 2 when changing slot 1
    } else {
        this.combineSlot2 = relic;
    }
    
    this.activeCombineSlot = null;
    this.updateCombineSlots();
    this.renderCombineSelectGrid();
};

game.updateCombineSlots = function() {
    const slot1 = document.getElementById('combineSlot1');
    const slot2 = document.getElementById('combineSlot2');
    const result = document.getElementById('combineResult');
    const button = document.getElementById('combineButton');
    
    // Slot 1
    if (this.combineSlot1) {
        const type = this.relicTypes.find(t => t.id === this.combineSlot1.typeId);
        const rarityInfo = this.relicRarities[this.combineSlot1.rarity];
        slot1.classList.add('filled');
        slot1.style.borderColor = rarityInfo.color;
        slot1.innerHTML = `
            <div style="font-size: 30px; filter: drop-shadow(0 0 5px ${rarityInfo.color})">${type.icon}</div>
            <div style="font-size: 10px; color: ${rarityInfo.color}">${type.name}</div>
            <div style="font-size: 9px; color: ${rarityInfo.color}">${rarityInfo.name}</div>
        `;
    } else {
        slot1.classList.remove('filled');
        slot1.style.borderColor = '#555';
        slot1.innerHTML = `
            <div class="combine-slot-label">Slot 1</div>
            <div class="combine-slot-content">Click to select</div>
        `;
    }
    
    // Slot 2
    if (this.combineSlot2) {
        const type = this.relicTypes.find(t => t.id === this.combineSlot2.typeId);
        const rarityInfo = this.relicRarities[this.combineSlot2.rarity];
        slot2.classList.add('filled');
        slot2.style.borderColor = rarityInfo.color;
        slot2.innerHTML = `
            <div style="font-size: 30px; filter: drop-shadow(0 0 5px ${rarityInfo.color})">${type.icon}</div>
            <div style="font-size: 10px; color: ${rarityInfo.color}">${type.name}</div>
            <div style="font-size: 9px; color: ${rarityInfo.color}">${rarityInfo.name}</div>
        `;
    } else {
        slot2.classList.remove('filled');
        slot2.style.borderColor = '#555';
        slot2.innerHTML = `
            <div class="combine-slot-label">Slot 2</div>
            <div class="combine-slot-content">Click to select</div>
        `;
    }
    
    // Result preview
    const canCombine = this.combineSlot1 && this.combineSlot2 && 
                       this.combineSlot1.typeId === this.combineSlot2.typeId &&
                       this.combineSlot1.rarity === this.combineSlot2.rarity;
    
    if (canCombine) {
        const type = this.relicTypes.find(t => t.id === this.combineSlot1.typeId);
        const nextRarity = this.getNextRarity(this.combineSlot1.rarity);
        const rarityInfo = this.relicRarities[nextRarity];
        
        result.style.borderColor = rarityInfo.color;
        result.innerHTML = `
            <div style="font-size: 30px; filter: drop-shadow(0 0 10px ${rarityInfo.color})">${type.icon}</div>
            <div style="font-size: 10px; color: ${rarityInfo.color}">${type.name}</div>
            <div style="font-size: 9px; color: ${rarityInfo.color}">${rarityInfo.name}</div>
        `;
        button.disabled = false;
    } else {
        result.style.borderColor = '#aa66ff';
        result.innerHTML = `
            <div class="combine-slot-label">Result</div>
            <div class="combine-slot-content">???</div>
        `;
        button.disabled = true;
    }
};

game.getNextRarity = function(currentRarity) {
    const order = ['common', 'uncommon', 'epic', 'legendary', 'mythic'];
    const idx = order.indexOf(currentRarity);
    return idx < order.length - 1 ? order[idx + 1] : currentRarity;
};

game.combineRelics = function() {
    if (!this.combineSlot1 || !this.combineSlot2) return;
    if (this.combineSlot1.typeId !== this.combineSlot2.typeId) return;
    if (this.combineSlot1.rarity !== this.combineSlot2.rarity) return;
    
    // Find and remove 2 relics of matching type+rarity
    const match1 = this.relicInventory.findIndex(r => 
        r.typeId === this.combineSlot1.typeId && r.rarity === this.combineSlot1.rarity
    );
    if (match1 === -1) return;
    this.relicInventory.splice(match1, 1);
    
    const match2 = this.relicInventory.findIndex(r => 
        r.typeId === this.combineSlot1.typeId && r.rarity === this.combineSlot1.rarity
    );
    if (match2 === -1) return;
    this.relicInventory.splice(match2, 1);
    
    // Add new combined relic
    const newRarity = this.getNextRarity(this.combineSlot1.rarity);
    this.relicInventory.push({
        typeId: this.combineSlot1.typeId,
        rarity: newRarity
    });
    
    // Clear slots
    this.combineSlot1 = null;
    this.combineSlot2 = null;
    
    this.saveRelicData();
    
    // Show the new relic
    const type = this.relicTypes.find(t => t.id === this.combineSlot1?.typeId || this.relicInventory[this.relicInventory.length - 1].typeId);
    this.showRelicDrop(this.relicInventory[this.relicInventory.length - 1]);
    
    // Refresh UI
    setTimeout(() => {
        this.renderCombineTab();
    }, 2500);
};

// Relic Drop System
game.tryDropRelic = function(x, y, isBoss = false) {
    // Boss has higher drop rate
    const bossMultiplier = isBoss ? 5 : 1;
    
    // Roll for each rarity from mythic to common
    const rarities = ['mythic', 'legendary', 'epic', 'uncommon', 'common'];
    
    for (const rarity of rarities) {
        const dropChance = this.relicRarities[rarity].dropChance * bossMultiplier;
        if (Math.random() < dropChance) {
            // Check if filter allows this rarity
            if (!this.relicFilter[rarity]) return false;
            
            // Drop this rarity on the ground
            const randomType = this.relicTypes[Math.floor(Math.random() * this.relicTypes.length)];
            this.spawnGroundRelic(x, y, randomType.id, rarity);
            return true;
        }
    }
    return false;
};

game.dropRelic = function(typeId, rarity, x, y) {
    // If x and y provided, spawn on ground; otherwise add directly to inventory
    if (x !== undefined && y !== undefined) {
        this.spawnGroundRelic(x, y, typeId, rarity);
    } else {
        if (!this.relicInventory) this.initRelicSystem();
        
        // Add to inventory directly
        this.relicInventory.push({ typeId, rarity });
        this.saveRelicData();
        
        // Show notification
        this.showRelicDrop({ typeId, rarity });
    }
};

game.showRelicDrop = function(relic) {
    const notification = document.getElementById('relicDropNotification');
    const type = this.relicTypes.find(t => t.id === relic.typeId);
    const rarityInfo = this.relicRarities[relic.rarity];
    
    // Update content
    document.getElementById('relicDropIcon').textContent = type.icon;
    document.getElementById('relicDropName').textContent = type.name;
    document.getElementById('relicDropRarity').textContent = rarityInfo.name;
    
    // Set rarity class for colors
    notification.className = 'relic-drop-notification ' + relic.rarity;
    notification.style.setProperty('--drop-color', rarityInfo.color);
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide after delay
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
};

// Apply equipped relics to player
game.applyEquippedRelics = function(player) {
    if (!this.relicInventory) this.initRelicSystem();
    
    this.equippedRelics.forEach(relic => {
        if (!relic) return;
        
        const type = this.relicTypes.find(t => t.id === relic.typeId);
        const rarityInfo = this.relicRarities[relic.rarity];
        const power = rarityInfo.multiplier;
        
        if (type && type.effect) {
            type.effect(player, power);
        }
    });
    
    // Apply relic set bonuses
    this.applyRelicSetBonuses(player);
};

// ==================== RELIC SETS ====================
game.applyRelicSetBonuses = function(player) {
    if (!this.relicSets || !this.equippedRelics) return;
    
    this.relicSets.forEach(set => {
        const matchingCount = this.equippedRelics.filter(relic => 
            relic && set.relicTypes.includes(relic.typeId)
        ).length;
        
        // Apply highest tier bonus
        if (matchingCount >= 3 && set.bonuses[3]) {
            set.bonuses[3].effect(player);
        } else if (matchingCount >= 2 && set.bonuses[2]) {
            set.bonuses[2].effect(player);
        }
    });
};

game.getActiveRelicSets = function() {
    if (!this.relicSets || !this.equippedRelics) return [];
    
    const activeSets = [];
    
    this.relicSets.forEach(set => {
        const matchingCount = this.equippedRelics.filter(relic => 
            relic && set.relicTypes.includes(relic.typeId)
        ).length;
        
        if (matchingCount >= 2) {
            const tier = matchingCount >= 3 ? 3 : 2;
            activeSets.push({
                ...set,
                tier,
                bonus: set.bonuses[tier]
            });
        }
    });
    
    return activeSets;
};

// ==================== ENDLESS LEADERBOARD ====================
game.initLeaderboard = function() {
    this.leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
};

game.saveLeaderboardEntry = function() {
    if (this.mode !== 'endless') return;
    
    const entry = {
        time: this.time,
        kills: this.kills,
        level: this.level,
        character: this.characters[this.selectedCharacterIndex]?.name || 'Survivor',
        date: new Date().toISOString(),
        wave: Math.floor(this.time / 60000) + 1
    };
    
    this.leaderboard.push(entry);
    
    // Sort by time survived (descending)
    this.leaderboard.sort((a, b) => b.time - a.time);
    
    // Keep only top 10
    this.leaderboard = this.leaderboard.slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
};

game.showLeaderboard = function() {
    document.getElementById('leaderboardScreen').style.display = 'flex';
    this.renderLeaderboard();
};

game.hideLeaderboard = function() {
    document.getElementById('leaderboardScreen').style.display = 'none';
};

game.renderLeaderboard = function() {
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    
    if (this.leaderboard.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">No runs recorded yet. Play Endless Mode!</div>';
        return;
    }
    
    container.innerHTML = this.leaderboard.map((entry, idx) => {
        const minutes = Math.floor(entry.time / 60000);
        const seconds = Math.floor((entry.time % 60000) / 1000);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
        
        return `
            <div class="leaderboard-entry ${idx < 3 ? 'top-' + (idx + 1) : ''}">
                <div class="leaderboard-rank">${medal}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-character">${entry.character}</div>
                    <div class="leaderboard-date">${new Date(entry.date).toLocaleDateString()}</div>
                </div>
                <div class="leaderboard-stats">
                    <div class="leaderboard-time">⏱️ ${timeStr}</div>
                    <div class="leaderboard-kills">👾 ${entry.kills}</div>
                    <div class="leaderboard-level">Lvl ${entry.level}</div>
                </div>
            </div>
        `;
    }).join('');
};

// ==================== GROUND RELICS ====================
game.spawnGroundRelic = function(x, y, typeId, rarity) {
    // Check if filter allows this rarity
    if (!this.relicFilter[rarity]) return false;
    
    // Limit ground relics
    if (this.groundRelics.length >= this.maxGroundRelics) {
        // Remove oldest
        this.groundRelics.shift();
    }
    
    this.groundRelics.push({
        x, y,
        typeId,
        rarity,
        spawnTime: Date.now(),
        lifetime: this.relicLifetime,
        attractSpeed: 0,
        radius: 12
    });
    
    return true;
};

game.updateGroundRelics = function(deltaTime) {
    const now = Date.now();
    const attractDist = 80 * this.player.magnetRange;
    const attractDistSq = attractDist * attractDist;
    const playerX = this.player.x;
    const playerY = this.player.y;
    const collectDist = 25;
    
    for (let i = this.groundRelics.length - 1; i >= 0; i--) {
        const relic = this.groundRelics[i];
        
        // Check expiration
        if (now - relic.spawnTime > relic.lifetime) {
            this.groundRelics.splice(i, 1);
            continue;
        }
        
        // Magnet attraction
        const dx = playerX - relic.x;
        const dy = playerY - relic.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < attractDistSq || relic.attractSpeed > 0) {
            const dist = Math.sqrt(distSq);
            relic.attractSpeed = (relic.attractSpeed || 3) + 0.3;
            relic.x += (dx / dist) * relic.attractSpeed;
            relic.y += (dy / dist) * relic.attractSpeed;
            
            // Collection
            if (dist < collectDist) {
                this.collectGroundRelic(relic);
                this.groundRelics.splice(i, 1);
            }
        }
    }
};

game.collectGroundRelic = function(relic) {
    if (!this.relicInventory) this.initRelicSystem();
    
    // Add to inventory
    this.relicInventory.push({ typeId: relic.typeId, rarity: relic.rarity });
    this.saveRelicData();
    
    // Show notification
    this.showRelicDrop({ typeId: relic.typeId, rarity: relic.rarity });
};

game.drawGroundRelics = function() {
    const now = Date.now();
    
    this.groundRelics.forEach(relic => {
        const type = this.relicTypes.find(t => t.id === relic.typeId);
        const rarityInfo = this.relicRarities[relic.rarity];
        
        // Calculate remaining lifetime for fading
        const elapsed = now - relic.spawnTime;
        const remaining = relic.lifetime - elapsed;
        const fadeStart = 10000; // Start fading at 10 seconds remaining
        const alpha = remaining < fadeStart ? remaining / fadeStart : 1;
        
        // Draw glow
        const pulse = Math.sin(now / 200) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(relic.x, relic.y, relic.radius * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(relic.x, relic.y, 0, relic.x, relic.y, relic.radius * 2);
        gradient.addColorStop(0, `${rarityInfo.color}${Math.round(pulse * 50 * alpha).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw icon
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(type.icon, relic.x, relic.y);
        ctx.restore();
        
        // Draw expiration indicator when low
        if (remaining < fadeStart) {
            ctx.beginPath();
            ctx.arc(relic.x, relic.y - 18, 5, 0, Math.PI * 2);
            ctx.fillStyle = remaining < 5000 ? '#ff4444' : '#ffaa00';
            ctx.globalAlpha = alpha * (Math.sin(now / 100) * 0.5 + 0.5);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    });
};

// ==================== RELIC FILTER ====================
game.showRelicFilter = function() {
    document.getElementById('relicFilterScreen').style.display = 'flex';
    this.renderRelicFilter();
};

game.hideRelicFilter = function() {
    document.getElementById('relicFilterScreen').style.display = 'none';
};

game.renderRelicFilter = function() {
    const container = document.getElementById('relicFilterOptions');
    if (!container) return;
    
    const rarities = ['common', 'uncommon', 'epic', 'legendary', 'mythic'];
    
    container.innerHTML = rarities.map(rarity => {
        const info = this.relicRarities[rarity];
        const checked = this.relicFilter[rarity];
        
        return `
            <div class="relic-filter-option ${rarity}" onclick="game.toggleRelicFilter('${rarity}')">
                <div class="relic-filter-checkbox ${checked ? 'checked' : ''}">
                    ${checked ? '✓' : ''}
                </div>
                <div class="relic-filter-label" style="color: ${info.color}">
                    ${info.name}
                </div>
                <div class="relic-filter-status">
                    ${checked ? 'Collecting' : 'Ignoring'}
                </div>
            </div>
        `;
    }).join('');
};

game.toggleRelicFilter = function(rarity) {
    this.relicFilter[rarity] = !this.relicFilter[rarity];
    localStorage.setItem('relicFilter', JSON.stringify(this.relicFilter));
    this.renderRelicFilter();
};

// ==================== ELITE MUTATIONS ====================
game.applyEliteMutation = function(enemy) {
    if (!this.eliteMutations || this.eliteMutations.length === 0) return;
    
    // Only apply mutations in story mode level 50+
    if (this.mode !== 'story' || this.storyLevel < 50) return;
    
    // Higher levels = more mutations possible
    const maxMutations = this.storyLevel >= 90 ? 3 : this.storyLevel >= 70 ? 2 : 1;
    const numMutations = Math.floor(Math.random() * maxMutations) + 1;
    
    enemy.mutations = [];
    
    const availableMutations = [...this.eliteMutations];
    for (let i = 0; i < numMutations && availableMutations.length > 0; i++) {
        const idx = Math.floor(Math.random() * availableMutations.length);
        const mutation = availableMutations.splice(idx, 1)[0];
        
        mutation.apply(enemy);
        enemy.mutations.push(mutation);
    }
};

game.updateMutatedEnemy = function(enemy, deltaTime) {
    if (!enemy.mutations) return;
    
    // Shield regeneration
    if (enemy.maxShield && enemy.shield < enemy.maxShield) {
        enemy.shield = Math.min(enemy.maxShield, enemy.shield + (enemy.shieldRegen || 0) * deltaTime / 1000);
    }
    
    // Health regeneration
    if (enemy.healthRegen && enemy.health < enemy.maxHealth) {
        enemy.health = Math.min(enemy.maxHealth, enemy.health + enemy.healthRegen * deltaTime / 1000);
    }
    
    // Berserker speed boost
    if (enemy.berserker) {
        const healthPercent = enemy.health / enemy.maxHealth;
        enemy.berserkMultiplier = 1 + (1 - healthPercent) * 1.5; // Up to 2.5x speed at low health
    }
    
    // Teleporter
    if (enemy.canTeleport) {
        const now = Date.now();
        if (now - (enemy.lastTeleport || 0) > enemy.teleportCooldown) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 200) {
                // Teleport closer to player
                const angle = Math.atan2(dy, dx);
                enemy.x = this.player.x - Math.cos(angle) * 150;
                enemy.y = this.player.y - Math.sin(angle) * 150;
                enemy.lastTeleport = now;
                
                // Visual effect
                this.createExplosion(enemy.x, enemy.y, '#9400d3', 6);
            }
        }
    }
};

game.drawMutationIndicators = function(enemy) {
    if (!enemy.mutations || enemy.mutations.length === 0) return;
    
    // Draw mutation icons above enemy
    const startX = enemy.x - ((enemy.mutations.length - 1) * 10);
    enemy.mutations.forEach((mutation, idx) => {
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mutation.icon, startX + idx * 20, enemy.y - enemy.radius - 15);
    });
    
    // Draw shield bar if has shield
    if (enemy.maxShield) {
        const shieldPercent = enemy.shield / enemy.maxShield;
        const barWidth = enemy.radius * 2;
        const barHeight = 4;
        const barY = enemy.y - enemy.radius - 8;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth * shieldPercent, barHeight);
    }
};

// ==================== WEEKLY RAID BOSS ====================
game.getCurrentWeek = function() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return `${now.getFullYear()}-W${Math.floor(diff / oneWeek)}`;
};

game.initRaidBoss = function() {
    const currentWeek = this.getCurrentWeek();
    
    if (this.raidBossWeek !== currentWeek) {
        // New week, new boss!
        this.raidBossWeek = currentWeek;
        this.raidDamageDealt = 0;
        
        // Select a random boss
        const bossType = this.raidBossTypes[Math.floor(Math.random() * this.raidBossTypes.length)];
        this.raidBoss = {
            ...bossType,
            currentHealth: bossType.baseHealth,
            totalDamageDealt: 0
        };
        
        localStorage.setItem('raidBossWeek', this.raidBossWeek);
        localStorage.setItem('raidBoss', JSON.stringify(this.raidBoss));
        localStorage.setItem('raidDamageDealt', '0');
    }
};

game.showRaidBoss = function() {
    this.initRaidBoss();
    document.getElementById('raidBossScreen').style.display = 'flex';
    this.renderRaidBossInfo();
};

game.hideRaidBoss = function() {
    document.getElementById('raidBossScreen').style.display = 'none';
};

game.renderRaidBossInfo = function() {
    if (!this.raidBoss) return;
    
    const healthPercent = (this.raidBoss.currentHealth / this.raidBoss.baseHealth * 100).toFixed(2);
    const healthFormatted = this.formatNumber(this.raidBoss.currentHealth);
    const maxHealthFormatted = this.formatNumber(this.raidBoss.baseHealth);
    const yourDamage = this.formatNumber(this.raidDamageDealt);
    
    document.getElementById('raidBossName').textContent = this.raidBoss.name;
    document.getElementById('raidBossIcon').textContent = this.raidBoss.icon;
    document.getElementById('raidBossHealth').textContent = `${healthFormatted} / ${maxHealthFormatted}`;
    document.getElementById('raidBossHealthBar').style.width = `${healthPercent}%`;
    document.getElementById('raidYourDamage').textContent = yourDamage;
    
    // Check if defeated
    if (this.raidBoss.currentHealth <= 0) {
        document.getElementById('raidBossStatus').textContent = '🏆 DEFEATED!';
        document.getElementById('raidBossFightBtn').style.display = 'none';
    } else {
        document.getElementById('raidBossStatus').textContent = 'ACTIVE';
        document.getElementById('raidBossFightBtn').style.display = 'block';
    }
};

game.formatNumber = function(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
};

game.startRaidBossFight = function() {
    this.hideRaidBoss();
    this.mode = 'raid';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    
    // Initialize the game with the raid boss
    this.running = false;
    this.init();
    
    // Spawn the raid boss immediately
    this.spawnRaidBoss();
    
    this.playMusic();
};

game.spawnRaidBoss = function() {
    if (!this.raidBoss) return;
    
    const boss = {
        x: MAP_WIDTH / 2,
        y: MAP_HEIGHT / 2 - 200,
        name: this.raidBoss.name,
        health: this.raidBoss.currentHealth,
        maxHealth: this.raidBoss.baseHealth,
        damage: this.raidBoss.damage,
        speed: this.raidBoss.speed,
        radius: 80,
        color: this.raidBoss.color,
        secondaryColor: this.raidBoss.secondaryColor,
        icon: this.raidBoss.icon,
        isRaidBoss: true,
        attacks: this.raidBoss.attacks,
        lastAttack: 0,
        attackCooldown: 3000,
        phase: 1
    };
    
    this.bosses.push(boss);
    this.showBossUI(this.raidBoss.name, boss.health, boss.maxHealth);
    this.transitionToBossMusic();
};

game.damageRaidBoss = function(damage) {
    if (!this.raidBoss) return;
    
    this.raidBoss.currentHealth = Math.max(0, this.raidBoss.currentHealth - damage);
    this.raidDamageDealt += damage;
    
    localStorage.setItem('raidBoss', JSON.stringify(this.raidBoss));
    localStorage.setItem('raidDamageDealt', this.raidDamageDealt.toString());
    
    // Check for defeat
    if (this.raidBoss.currentHealth <= 0) {
        this.onRaidBossDefeated();
    }
};

game.onRaidBossDefeated = function() {
    // Award rewards
    const rewards = this.raidBoss.rewards;
    
    this.trueXp += rewards.trueXp;
    localStorage.setItem('trueXp', this.trueXp);
    
    // Grant a relic
    if (rewards.relicRarity && this.relicTypes) {
        const randomType = this.relicTypes[Math.floor(Math.random() * this.relicTypes.length)];
        if (!this.relicInventory) this.initRelicSystem();
        this.relicInventory.push({ typeId: randomType.id, rarity: rewards.relicRarity });
        this.saveRelicData();
        this.showRelicDrop({ typeId: randomType.id, rarity: rewards.relicRarity });
    }
};

// ==================== SWARM EVENT SYSTEM ====================
game.eventTypes = [
    {
        id: 'monster_swarm',
        name: 'MONSTER SWARM!',
        description: 'Enemies are swarming! 2x spawn limit!',
        duration: 20000, // 20 seconds
        color: '#ff4444',
        icon: '👹',
        onStart: function(game) {
            game.originalMaxEnemies = game.maxEnemies;
            game.maxEnemies = game.maxEnemies * 2;
            game.swarmSpawnBoost = 3; // Triple spawn rate during event
        },
        onEnd: function(game) {
            game.maxEnemies = game.originalMaxEnemies || 300;
            game.swarmSpawnBoost = 1;
        }
    }
];

game.updateEvents = function(deltaTime) {
    // Check if current event should end
    if (this.currentEvent && this.time >= this.eventEndTime) {
        this.endEvent();
    }
    
    // Try to start a new event (only if no current event and cooldown passed)
    if (!this.currentEvent && this.time - this.lastEventTime >= this.eventCooldown) {
        // Random chance to start event (increases over time)
        const minutesElapsed = this.time / 60000;
        const eventChance = Math.min(0.002, 0.0005 + (minutesElapsed * 0.0002)); // Max 0.2% per tick
        
        if (Math.random() < eventChance) {
            this.startEvent('monster_swarm');
        }
    }
};

game.startEvent = function(eventId) {
    const eventType = this.eventTypes.find(e => e.id === eventId);
    if (!eventType) return;
    
    this.currentEvent = eventType;
    this.eventEndTime = this.time + eventType.duration;
    
    // Call event start callback
    if (eventType.onStart) {
        eventType.onStart(this);
    }
    
    // Show event notification
    this.showEventNotification(eventType);
};

game.endEvent = function() {
    if (!this.currentEvent) return;
    
    // Call event end callback
    if (this.currentEvent.onEnd) {
        this.currentEvent.onEnd(this);
    }
    
    this.lastEventTime = this.time;
    this.currentEvent = null;
};

game.showEventNotification = function(eventType) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'event-notification';
    notification.innerHTML = `
        <div class="event-icon">${eventType.icon}</div>
        <div class="event-text">
            <div class="event-name" style="color: ${eventType.color}">${eventType.name}</div>
            <div class="event-desc">${eventType.description}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
};

// ==================== RUN HISTORY SYSTEM ====================
game.saveRunToHistory = function() {
    const run = {
        id: Date.now(),
        date: new Date().toISOString(),
        character: this.characters[this.selectedCharacterIndex]?.name || 'Unknown',
        mode: this.mode,
        time: this.time,
        kills: this.kills,
        level: this.level,
        damageDealt: Math.round(this.runStats.damageDealt),
        damageTaken: Math.round(this.runStats.damageTaken),
        bossesKilled: this.runStats.bossesKilled,
        elitesKilled: this.runStats.elitesKilled,
        maxStreak: this.runStats.maxKillStreak,
        xpCollected: Math.round(this.runStats.xpCollected),
        powerUps: this.runStats.powerUpsCollected
    };
    
    // Add to history (keep last 50 runs)
    this.runHistory.unshift(run);
    if (this.runHistory.length > 50) {
        this.runHistory = this.runHistory.slice(0, 50);
    }
    
    localStorage.setItem('runHistory', JSON.stringify(this.runHistory));
};

game.showRunHistory = function() {
    document.getElementById('runHistoryScreen').style.display = 'flex';
    this.renderRunHistory();
};

game.hideRunHistory = function() {
    document.getElementById('runHistoryScreen').style.display = 'none';
};

game.renderRunHistory = function() {
    const container = document.getElementById('runHistoryList');
    if (!container) return;
    
    if (this.runHistory.length === 0) {
        container.innerHTML = '<div class="no-history">No runs recorded yet. Play a game to see your history!</div>';
        return;
    }
    
    let html = '';
    this.runHistory.forEach((run, index) => {
        const minutes = Math.floor(run.time / 60000);
        const seconds = Math.floor((run.time % 60000) / 1000).toString().padStart(2, '0');
        const date = new Date(run.date).toLocaleDateString();
        
        const modeColors = {
            'endless': '#00ffcc',
            'story': '#ffaa00',
            'bossrush': '#ff4444',
            'daily': '#aa44ff',
            'raid': '#ff00ff'
        };
        const modeColor = modeColors[run.mode] || '#ffffff';
        
        html += `
            <div class="run-history-entry">
                <div class="run-header">
                    <span class="run-number">#${index + 1}</span>
                    <span class="run-character">${run.character}</span>
                    <span class="run-mode" style="color: ${modeColor}">${run.mode.toUpperCase()}</span>
                    <span class="run-date">${date}</span>
                </div>
                <div class="run-stats-grid">
                    <div class="run-stat">
                        <span class="stat-icon">⏱️</span>
                        <span class="stat-value">${minutes}:${seconds}</span>
                    </div>
                    <div class="run-stat">
                        <span class="stat-icon">💀</span>
                        <span class="stat-value">${run.kills}</span>
                    </div>
                    <div class="run-stat">
                        <span class="stat-icon">⬆️</span>
                        <span class="stat-value">Lvl ${run.level}</span>
                    </div>
                    <div class="run-stat">
                        <span class="stat-icon">⚔️</span>
                        <span class="stat-value">${run.damageDealt.toLocaleString()}</span>
                    </div>
                    <div class="run-stat">
                        <span class="stat-icon">👹</span>
                        <span class="stat-value">${run.bossesKilled} bosses</span>
                    </div>
                    <div class="run-stat">
                        <span class="stat-icon">🔥</span>
                        <span class="stat-value">${run.maxStreak} streak</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
};

game.clearRunHistory = function() {
    if (confirm('Are you sure you want to clear all run history?')) {
        this.runHistory = [];
        localStorage.setItem('runHistory', JSON.stringify(this.runHistory));
        this.renderRunHistory();
    }
};

// ==================== EVENT INDICATOR DRAWING ====================
game.drawEventIndicator = function() {
    if (!this.currentEvent) return;
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const timeLeft = Math.max(0, (this.eventEndTime - this.time) / 1000);
    const text = `${this.currentEvent.icon} ${this.currentEvent.name} - ${Math.ceil(timeLeft)}s`;
    
    ctx.save();
    
    // Draw indicator at top of screen
    const x = canvas.width / 2;
    const y = 30;
    
    // Pulsing background
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(255, 68, 68, ${0.8 * pulse})`;
    ctx.font = 'bold 18px Orbitron, monospace';
    const textWidth = ctx.measureText(text).width;
    
    ctx.beginPath();
    ctx.roundRect(x - textWidth/2 - 20, y - 15, textWidth + 40, 35, 10);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = this.currentEvent.color || '#ff4444';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    
    ctx.restore();
};
