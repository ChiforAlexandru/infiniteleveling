game.updateProjectiles = function(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        if (!p) continue;

        // Homing logic
        if (p.homingStrength > 0) {
            const closest = this.findClosestEnemy();
            if (closest) {
                const dx = closest.x - p.x;
                const dy = closest.y - p.y;
                const angleToEnemy = Math.atan2(dy, dx);
                const currentAngle = Math.atan2(p.vy, p.vx);

                let angleDiff = angleToEnemy - currentAngle;
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

                const turnRate = p.homingStrength * 0.1;
                const newAngle = currentAngle + Math.max(-turnRate, Math.min(turnRate, angleDiff));

                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                p.vx = Math.cos(newAngle) * speed;
                p.vy = Math.sin(newAngle) * speed;
            }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.distance += Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        if (p.distance > p.maxDistance) {
            this.projectiles.splice(i, 1);
        }
    }
};

game.updateParticles = function(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= deltaTime / 1000;
        if (p.life <= 0 || this.particles.length > this.maxParticles) {
            this.particles.splice(i, 1);
        }
    }
};

game.createExplosion = function(x, y, color, particleCount = 8) {
    // Reduce particles based on current count
    const count = this.particles.length > this.maxParticles * 0.7 ? 
        Math.ceil(particleCount / 2) : particleCount;
    
    for (let i = 0; i < count; i++) {
        if (this.particles.length >= this.maxParticles) break;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1,
            life: 0.4,
            color: color
        });
    }
};

game.updateXpOrbs = function(deltaTime) {
    // Limit XP orbs for performance
    while (this.xpOrbs.length > this.maxXpOrbs) {
        // Merge oldest orbs
        const removed = this.xpOrbs.shift();
        if (this.xpOrbs.length > 0) {
            this.xpOrbs[0].value += removed.value;
        }
    }
    
    const attractDist = 100 * this.player.magnetRange;
    const attractDistSq = attractDist * attractDist;
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
        const orb = this.xpOrbs[i];
        const dx = playerX - orb.x;
        const dy = playerY - orb.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < attractDistSq || orb.attractSpeed) {
            const dist = Math.sqrt(distSq);
            orb.attractSpeed = (orb.attractSpeed || 5) + 0.5;
            orb.x += (dx / dist) * orb.attractSpeed;
            orb.y += (dy / dist) * orb.attractSpeed;
        }
    }
};

game.spawnXpOrb = function(x, y, value) {
    this.xpOrbs.push({ x, y, value, radius: 5, attractSpeed: 0 });
};

game.gainXp = function(amount) {
    // Reduce skill tree experience gain by 50%
    const xpGainBonus = 1 + ((this.skills.xpgain || 0) * 0.1);
    const relicXpBonus = this.player.xpMultiplier || 1;
    this.xp += amount * xpGainBonus * relicXpBonus * 0.5;

    if (!this.paused && this.xp >= this.xpNeeded) {
        this.levelUp();
    }
};

game.levelUp = function() {
    this.level++;
    this.xp -= this.xpNeeded;
    const levelReduction = 1 - ((this.skills.levelbonus || 0) * 0.05);
    // Exponential XP scaling: base * (1.15^level) - gets much harder at higher levels
    const baseXp = 10;
    const scalingFactor = Math.pow(1.15, this.level);
    this.xpNeeded = Math.ceil(baseXp * scalingFactor * levelReduction);

    const sound = document.getElementById('levelUpSound');
    if (sound) {
        sound.currentTime = 0;
        sound.volume = (this.sfxVolume || 0.5) * (this.masterVolume || 0.5) * 0.5;
        sound.play();
    }

    this.showLevelUpScreen();
};

game.showLevelUpScreen = function() {
    this.paused = true;
    const screen = document.getElementById('levelUpScreen');
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';

    // Default 4 choices (always 4 now)
    const numChoices = 4;
    const powerUps = this.getPowerUpChoices(numChoices);

    powerUps.forEach(p => {
        const card = document.createElement('div');
        card.className = 'power-card';
        if (p.isCursed) {
            card.classList.add('cursed');
        }
        // Add image element, fallback to alt text if not found
        let imgSrc = p.imgSrc || p.image || p.classImg || '';
        if (!imgSrc && p.name) {
            // Try to guess image path from name
            imgSrc = `Images/sprites/${p.name.replace(/\s+/g, '')}64.png`;
        }
        card.innerHTML = `
            <img class="card-img" src="${imgSrc}" alt="${p.name}" onerror="this.style.display='none';" style="width:64px;height:64px;margin:auto;display:block;" />
            <div class="card-title">${p.name}</div>
            <div class="card-desc">${p.description}</div>
            <div class="card-stats">${p.stats}</div>
        `;
        card.onclick = () => this.selectPowerUp(p);
        container.appendChild(card);
    });

    // Add reroll button if player has reroll charges
    const rerollCharges = (this.skills.reroll || 0) - (this.rerollsUsed || 0);
    if (rerollCharges > 0) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.gridColumn = '1 / -1';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginTop = '20px';
        
        const rerollBtn = document.createElement('button');
        rerollBtn.className = 'reroll-button';
        rerollBtn.textContent = `🔄 Reroll (${rerollCharges})`;
        rerollBtn.onclick = () => {
            this.rerollsUsed = (this.rerollsUsed || 0) + 1;
            this.showLevelUpScreen();
        };
        buttonContainer.appendChild(rerollBtn);
        container.appendChild(buttonContainer);
    }

    screen.style.display = 'flex';
};

game.getPowerUpChoices = function(count) {
    // Support both old and new zone powerup ids
    const baseZoneIds = ['firezone', 'icezone', 'electriczone', 'waterzone', 'firetrail', 'icepath', 'shockfield', 'waterwake'];
    // Map upgrades to their base zone ids (old and new)
    const upgradeToBase = {
        firezone_area: ['firezone', 'firetrail'],
        firezone_damage: ['firezone', 'firetrail'],
        icezone_area: ['icezone', 'icepath'],
        icezone_slow: ['icezone', 'icepath'],
        electriczone_area: ['electriczone', 'shockfield'],
        electriczone_damage: ['electriczone', 'shockfield'],
        waterzone_area: ['waterzone', 'waterwake']
    };
    const collected = this.collectedPowerUps || [];
    const available = this.powerUps.filter(p => {
        // Only offer a specific base zone powerup if it hasn't been collected (support both ids)
        if (baseZoneIds.includes(p.id) && collected.includes(p.id)) return false;
        // Only offer zone upgrade cards if base zone is collected (support both ids)
        if (p.isZoneUpgrade) {
            const baseIds = upgradeToBase[p.id] || [p.baseZone];
            if (!collected.some(id => baseIds.includes(id))) return false;
            // Zone upgrades can now be offered indefinitely (do not filter by collected)
        }
        if (p.id === 'aoe' && this.player.hasAoE) return false;
        return true;
    });
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

game.selectPowerUp = function(powerUp) {
    if (!this.paused) return;
    try {
        console.log('Applying power-up:', powerUp.name);
        powerUp.apply(this.player);
        console.log('Power-up applied successfully');
        
        // Track collected power-ups for evolution system
        if (this.collectedPowerUps) {
            this.collectedPowerUps.push(powerUp.id);
        }
        if (this.runStats) {
            this.runStats.powerUpsCollected++;
        }
        
        // Check for weapon evolutions
        if (this.checkEvolutions) {
            this.checkEvolutions();
        }
    } catch (e) {
        console.error('Error applying power-up:', e);
        alert('Error applying power-up: ' + e.message);
    }
    this.paused = false;
    this.rerollsUsed = 0; // Reset reroll counter for next level
    document.getElementById('levelUpScreen').style.display = 'none';
    console.log('Resume game after power-up selection');
    
    // Check if we have enough XP for another level immediately
    if (this.xp >= this.xpNeeded) {
        this.levelUp();
    }
};

game.updateZones = function(deltaTime) {
    for (let i = this.zones.length - 1; i >= 0; i--) {
        const zone = this.zones[i];
        zone.life -= deltaTime;
        zone.age = (zone.age || 0) + deltaTime;

        if (zone.life <= 0) {
            this.zones.splice(i, 1);
            continue;
        }

        if (zone.lastDamage > 0) {
            zone.lastDamage -= deltaTime;
        } else {
            zone.lastDamage = 1000;

            const checkZoneCollision = (enemy) => {
                const dx = enemy.x - zone.x;
                const dy = enemy.y - zone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < zone.radius + enemy.radius) {
                    if (zone.type === 'fire' || zone.type === 'electric') {
                        enemy.health -= zone.damage;
                    }
                    if (zone.type === 'ice') {
                        enemy.iceSlowed = zone.slow;
                    }
                }
            };

            this.enemies.forEach(checkZoneCollision);
            this.bosses.forEach(checkZoneCollision);
        }
    }
};

game.spawnZones = function(deltaTime) {
    this.lastZoneSpawn += deltaTime;
    if (this.lastZoneSpawn < this.zoneSpawnInterval) return;

    this.lastZoneSpawn = 0;

    const getZoneRadius = (type) => {
        if (type === 'fire') return this.player.fireZoneRadius || 25;
        if (type === 'ice') return this.player.iceZoneRadius || 25;
        if (type === 'electric') return this.player.electricZoneRadius || 25;
        if (type === 'water') return this.player.waterZoneRadius || 25;
        return 25;
    };
    const createZone = (type, damage, slow) => {
        if (this.zones.length < this.maxZones) {
            this.zones.push({
                x: this.player.x,
                y: this.player.y,
                radius: getZoneRadius(type),
                life: 3000,
                maxLife: 3000,
                age: 0,
                type: type,
                damage: damage,
                slow: slow,
                lastDamage: 0
            });
        }
    };

    if (this.player.hasFireZone) createZone('fire', this.player.fireZoneDamage);
    if (this.player.hasIceZone) createZone('ice', 0, this.player.iceZoneSlow);
    if (this.player.hasElectricZone) createZone('electric', this.player.electricZoneDamage);
    if (this.player.hasWaterZone) createZone('water');
};

game.updateChests = function(deltaTime) {
    for (let i = this.chests.length - 1; i >= 0; i--) {
        const chest = this.chests[i];
        
        // Handle cursed chest lifespan
        if (chest.isCursed && chest.lifespan) {
            const age = this.time - chest.spawnTime;
            if (age > chest.lifespan) {
                this.chests.splice(i, 1);
                continue;
            }
        }
        
        // Check player collision with chest
        const dx = this.player.x - chest.x;
        const dy = this.player.y - chest.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.player.radius + (chest.radius || 20)) {
            if (chest.isCursed) {
                if (this.openCursedChest) {
                    this.openCursedChest(chest);
                }
                this.chests.splice(i, 1);
            } else {
                this.openChest(i);
            }
        }
    }
};

game.spawnChest = function(x, y) {
    this.chests.push({ x, y });
};

game.openChest = function(chestIndex) {
    this.paused = true;
    this.chests.splice(chestIndex, 1);

    const screen = document.getElementById('chestScreen');
    const container = document.getElementById('chestItems');
    container.innerHTML = '';

    const powerUps = this.getPowerUpChoices(3); // Chests give 3 items

    powerUps.forEach(p => {
        p.apply(this.player); // Apply all powerups from chest
        const card = document.createElement('div');
        card.className = 'power-card';
        if (p.isCursed) {
            card.classList.add('cursed');
        }
        card.innerHTML = `
            <img class="card-img" src="${imgSrc}" alt="${p.name}" onerror="this.style.display='none';" style="width:64px;height:64px;margin:auto;display:block;" />
            <div class="card-title">${p.name}</div>
            <div class="card-desc">${p.description}</div>
            <div class="card-stats">${p.stats}</div>
        `;
        container.appendChild(card);
    });

    screen.style.display = 'flex';
};

game.closeChestScreen = function() {
    this.paused = false;
    document.getElementById('chestScreen').style.display = 'none';
};

game.checkCollisions = function() {
    // Projectile vs Enemy/Boss
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        if (!p) continue;
        let hit = false;

        const checkHit = (enemy) => {
            if (hit && p.pierceCount <= p.pierced) return;
            const dx = enemy.x - p.x;
            const dy = enemy.y - p.y;
            const distSq = dx * dx + dy * dy;
            const hitDistSq = (enemy.radius + p.radius) * (enemy.radius + p.radius);

            if (distSq < hitDistSq) {
                // Check if enemy is shielding
                if (enemy.isShielding) {
                    // Blocked by shield - visual feedback
                    if (this.spawnDamageNumber) {
                        this.spawnDamageNumber(enemy.x, enemy.y - 20, 0, false, false);
                    }
                    hit = true;
                    p.pierced++;
                    if (p.pierceCount < p.pierced) {
                        this.projectiles.splice(i, 1);
                    }
                    return;
                }
                
                let damage = p.damage * (enemy.isBoss ? this.player.bossDamageBonus : 1);
                
                // Handle mutation shield (separate from behavior shield)
                if (enemy.shield > 0) {
                    const shieldDamage = Math.min(damage, enemy.shield);
                    enemy.shield -= shieldDamage;
                    damage -= shieldDamage;
                    // Visual feedback for shield hit
                    if (this.spawnDamageNumber) {
                        this.spawnDamageNumber(enemy.x, enemy.y - 30, shieldDamage, false, false);
                    }
                }
                
                if (damage > 0) {
                    enemy.health -= damage;
                    
                    // Handle thorny mutation (reflects damage back)
                    if (enemy.thornsDamage && enemy.thornsDamage > 0) {
                        this.player.health -= enemy.thornsDamage;
                    }
                    
                    // Handle vampiric mutation (heals on being hit... wait that's wrong, it's heals on dealing damage to player)
                }
                
                // Track damage dealt
                if (this.runStats) this.runStats.damageDealt += p.damage;
                
                // Track raid boss damage
                if (enemy.isRaidBoss && this.damageRaidBoss) {
                    this.damageRaidBoss(damage > 0 ? damage : p.damage);
                }
                
                // Spawn damage number
                if (this.spawnDamageNumber && damage > 0) {
                    this.spawnDamageNumber(enemy.x, enemy.y, damage, p.isCrit);
                }
                
                // Screen shake on hit
                if (this.triggerScreenShake) {
                    this.triggerScreenShake(p.isCrit ? 4 : 2, 50);
                }
                
                // Lifesteal (enhanced for Vampire class)
                let lifestealAmount = this.player.vampiric;
                if (this.player.isVampire) {
                    // Vampire base 3% + 0.1% per kill (up to 8%)
                    lifestealAmount = Math.min(0.08, this.player.vampireLifesteal + (this.player.vampireKillBonus || 0));
                }
                if (lifestealAmount > 0 && damage > 0) {
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + (damage * lifestealAmount));
                }
                hit = true;
                p.pierced++;
                if (p.pierceCount < p.pierced) {
                    this.projectiles.splice(i, 1);
                }
            }
        };

        this.bosses.forEach(checkHit);
        if (this.projectiles[i]) { // Check if projectile still exists
            this.enemies.forEach(checkHit);
        }
    }

    // Player vs Enemy/Boss
    if (this.player.invulnerable <= 0) {
        let tookDamage = false;
        const checkPlayerCollision = (enemy) => {
            if (tookDamage) return;
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distSq = dx * dx + dy * dy;
            const hitDistSq = (enemy.radius + this.player.radius) * (enemy.radius + this.player.radius);

            if (distSq < hitDistSq) {
                if (Math.random() > this.player.dodgeChance) {
                    const damageReduction = 1 - (this.player.damageReduction || 0);
                    const damageTaken = enemy.damage * this.player.damageTakenMultiplier * (enemy.isBoss ? this.player.bossDefenseBonus : 1) * damageReduction;
                    this.player.health -= damageTaken;
                    
                    // Track damage taken
                    if (this.runStats) this.runStats.damageTaken += damageTaken;
                    
                    // Screen shake when hit
                    if (this.triggerScreenShake) {
                        this.triggerScreenShake(10, 150);
                    }
                    
                    // Handle vampiric mutation (enemy heals when dealing damage)
                    if (enemy.vampiric) {
                        enemy.health = Math.min(enemy.maxHealth, enemy.health + damageTaken * 0.3);
                    }
                    
                    // Apply thorns damage (includes relic thorns)
                    const totalThorns = (this.player.thorns || 0) + (this.player.thornsDamage || 0);
                    if (totalThorns > 0) {
                        enemy.health -= totalThorns;
                    }
                }
                this.player.invulnerable = 500 * this.player.invulnBonus;
                tookDamage = true;
            }
        };

        this.enemies.forEach(checkPlayerCollision);
        this.bosses.forEach(checkPlayerCollision);
    }

    // Player vs XP Orb
    const orbPickupDistSq = (this.player.radius + 5) * (this.player.radius + 5);
    for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
        const orb = this.xpOrbs[i];
        const dx = orb.x - this.player.x;
        const dy = orb.y - this.player.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < orbPickupDistSq) {
            this.gainXp(orb.value);
            // Track XP collected
            if (this.runStats) this.runStats.xpCollected += orb.value;
            this.xpOrbs.splice(i, 1);
        }
    }

    // Player vs Chest
    const chestPickupDistSq = (this.player.radius + 20) * (this.player.radius + 20);
    for (let i = this.chests.length - 1; i >= 0; i--) {
        const chest = this.chests[i];
        const dx = chest.x - this.player.x;
        const dy = chest.y - this.player.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < chestPickupDistSq) {
            this.openChest(i);
        }
    }
};

game.updateHUD = function() {
    document.getElementById('hpText').textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;
    document.getElementById('hpBar').style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;

    document.getElementById('xpText').textContent = `${Math.floor(this.xp)}`;
    document.getElementById('xpNeeded').textContent = this.xpNeeded;
    document.getElementById('xpBar').style.width = `${(this.xp / this.xpNeeded) * 100}%`;

    document.getElementById('levelText').textContent = this.level;

    const minutes = Math.floor(this.time / 60000);
    const seconds = Math.floor((this.time % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('timeText').textContent = `${minutes}:${seconds}`;

    document.getElementById('killsText').textContent = this.kills;

    if (this.mode === 'story') {
        const storyText = document.getElementById('storyLevelText');
        storyText.textContent = `(L${this.storyLevel})`;
        storyText.style.display = 'inline';
    } else {
        document.getElementById('storyLevelText').style.display = 'none';
    }
};