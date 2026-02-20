game.spawnEnemies = function() {
    // Cap enemy count for performance
    if (this.enemies.length >= this.maxEnemies) return;
    
    const baseSpawnRate = 0.03;
    const minutesElapsed = this.time / 60000;
    // Spawn rate increases more aggressively over time
    const timeMultiplier = 1 + (minutesElapsed * 3) + Math.pow(minutesElapsed * 0.5, 1.5);
    // Apply swarm event spawn boost if active
    const swarmBoost = this.swarmSpawnBoost || 1;
    const spawnRate = baseSpawnRate * timeMultiplier * swarmBoost;
    
    if (Math.random() < spawnRate) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch(side) {
            case 0: x = Math.random() * MAP_WIDTH; y = -30; break;
            case 1: x = MAP_WIDTH + 30; y = Math.random() * MAP_HEIGHT; break;
            case 2: x = Math.random() * MAP_WIDTH; y = MAP_HEIGHT + 30; break;
            case 3: x = -30; y = Math.random() * MAP_HEIGHT; break;
        }

        // Only spawn goblins in test zone
        let enemyType;
        if (this.mode === 'testzone') {
            enemyType = this.enemyTypes.find(e => e.name === 'goblin');
            if (!enemyType) return;
        } else {
            enemyType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        }

        // Filter for Story Mode Zones
        if (this.mode === 'story') {
            const config = this.getStoryConfig();
            const allowedEnemies = config.enemies;
            if (!allowedEnemies.includes(enemyType.name)) {
                if (Math.random() > 0.1) return;
            }
        }

        const baseSpeed = enemyType.speed;
        const minutesElapsed = this.time / 60000;
        const speedMultiplier = 1 + (minutesElapsed * 0.15);
        const healthMultiplier = 1 + (minutesElapsed * 0.25);
        const damageMultiplier = 1 + (minutesElapsed * 0.20);
        const eliteChance = Math.min(0.30, 0.02 + (minutesElapsed * 0.03));
        const isElite = Math.random() < eliteChance;
        const scaledHealth = Math.ceil(enemyType.health * healthMultiplier);
        const scaledDamage = Math.ceil(enemyType.damage * damageMultiplier);
        let enemy = {
            x, y,
            type: enemyType.name,
            radius: enemyType.radius,
            speed: baseSpeed * speedMultiplier,
            health: scaledHealth,
            maxHealth: scaledHealth,
            damage: scaledDamage,
            color: enemyType.color,
            secondaryColor: enemyType.secondaryColor,
            lastSummon: 0,
            summonCooldown: 5000
        };
        if (isElite && this.makeElite) {
            enemy = this.makeElite(enemy);
        }
        this.enemies.push(enemy);
    }
};

game.updateEnemies = function(deltaTime) {
    const slowMultiplier = 1 - ((this.skills.slowenemies || 0) * 0.05);
    
    this.enemies.forEach((enemy, index) => {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Initialize behavior timers
        if (enemy.lastBehavior === undefined) enemy.lastBehavior = 0;
        
        // Update elite mutations (regen, teleport, berserker, etc.)
        if (enemy.isElite && this.updateMutatedEnemy) {
            this.updateMutatedEnemy(enemy, deltaTime);
        }
        
        // Handle special behaviors
        const enemyType = this.enemyTypes.find(e => e.name === enemy.type);
        if (enemyType && enemyType.behavior) {
            this.handleEnemyBehavior(enemy, enemyType, dx, dy, dist, deltaTime);
        }
        
        // Don't move if frozen or charging
        if (!enemy.isFrozen && !enemy.isCharging && !enemy.isShielding) {
            // Apply ice slow
            const iceSlowMultiplier = 1 - (enemy.iceSlowed || 0);
            // Apply berserker speed boost if applicable
            const berserkMultiplier = enemy.berserkMultiplier || 1;
            
            enemy.x += (dx / dist) * enemy.speed * slowMultiplier * iceSlowMultiplier * berserkMultiplier;
            enemy.y += (dy / dist) * enemy.speed * slowMultiplier * iceSlowMultiplier * berserkMultiplier;
        }
        
        // Update charge movement
        if (enemy.isCharging && enemy.chargeTarget) {
            const cdx = enemy.chargeTarget.x - enemy.x;
            const cdy = enemy.chargeTarget.y - enemy.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            
            if (cdist > 10) {
                enemy.x += (cdx / cdist) * (enemyType?.chargeSpeed || 8);
                enemy.y += (cdy / cdist) * (enemyType?.chargeSpeed || 8);
            } else {
                enemy.isCharging = false;
                enemy.chargeTarget = null;
            }
        }

        // Necromancer summoning logic
        if (enemy.type === 'necromancer') {
            if (this.time - (enemy.lastSummon || 0) > (enemy.summonCooldown || 5000)) {
                enemy.lastSummon = this.time;
                this.summonSkeletons(enemy);
            }
        }
        
        if (enemy.health <= 0) {
            // Handle splitter behavior on death
            if (enemyType && enemyType.behavior === 'split' && !enemy.isSplit) {
                this.splitEnemy(enemy, enemyType);
            }
            
            // Handle splitter mutation on death (different from behavior)
            if (enemy.splitsOnDeath && !enemy.isSplit && enemy.splitCount > 0) {
                for (let i = 0; i < enemy.splitCount; i++) {
                    const angle = (i / enemy.splitCount) * Math.PI * 2;
                    const splitEnemy = {
                        x: enemy.x + Math.cos(angle) * 30,
                        y: enemy.y + Math.sin(angle) * 30,
                        type: enemy.type,
                        radius: enemy.radius * 0.6,
                        speed: enemy.speed * 1.2,
                        health: enemy.maxHealth * 0.3,
                        maxHealth: enemy.maxHealth * 0.3,
                        damage: enemy.damage * 0.5,
                        color: enemy.color,
                        secondaryColor: enemy.secondaryColor,
                        isSplit: true,
                        isElite: false // Split enemies are not elite
                    };
                    this.enemies.push(splitEnemy);
                }
            }
            
            // Handle bomber explosion on death
            if (enemyType && enemyType.behavior === 'explode') {
                this.explodeEnemy(enemy, enemyType);
            }
            
            this.kills++;
            
            // Track story mode progress
            if (this.mode === 'story') {
                this.storyEnemiesKilled = (this.storyEnemiesKilled || 0) + 1;
            }
            
            // Register kill for streak system
            const streakBonus = this.registerKill ? this.registerKill(enemy, enemy.isElite, false) : 0;
            
            // Elite enemies drop more XP
            const eliteMultiplier = enemy.isElite ? 3 : 1;
            const xpValue = 1 * (1 + ((this.skills.bossxp || 0) * 0.15)) * eliteMultiplier * (1 + streakBonus);
            this.spawnXpOrb(enemy.x, enemy.y, xpValue);
            this.createExplosion(enemy.x, enemy.y, enemy.isElite ? enemy.eliteColor : enemy.color);
            
            // Screen shake on elite kill
            if (enemy.isElite && this.triggerScreenShake) {
                this.triggerScreenShake(8, 200);
            }
            
            // Try to drop a relic (elite enemies have better chance)
            if (this.tryDropRelic) {
                this.tryDropRelic(enemy.x, enemy.y, enemy.isElite);
            }
            
            // Necromancer spawn minion on kill (50% chance)
            if (this.player.isNecromancer && Math.random() < 0.5) {
                this.spawnNecromancerMinion(enemy.x, enemy.y);
            }
            
            // Vampire gets lifesteal bonus per kill (0.1% per kill, up to 5% bonus)
            if (this.player.isVampire) {
                this.player.vampireKillBonus = Math.min(0.05, (this.player.vampireKillBonus || 0) + 0.001);
            }
            
            this.enemies.splice(index, 1);
        }
    });
};

game.summonSkeletons = function(necromancer) {
    const skeletonType = this.enemyTypes.find(e => e.name === 'skeleton');
    if (!skeletonType) return;

    const numSkeletons = 2; // Summon 2 skeletons
    for (let i = 0; i < numSkeletons; i++) {
        if (this.enemies.length >= this.maxEnemies) break;

        const angle = Math.random() * Math.PI * 2;
        const distance = 50;
        const x = necromancer.x + Math.cos(angle) * distance;
        const y = necromancer.y + Math.sin(angle) * distance;

        this.enemies.push({
            x, y,
            type: skeletonType.name,
            radius: skeletonType.radius,
            speed: skeletonType.speed,
            health: skeletonType.health,
            maxHealth: skeletonType.health,
            damage: skeletonType.damage,
            color: skeletonType.color,
            secondaryColor: skeletonType.secondaryColor
        });

        // Add a particle effect for summoning
        this.createExplosion(x, y, '#58007a');
    }
};

game.checkBossSpawn = function() {
    // In story mode, maybe spawn boss at the very end? 
    // For now, let's disable random boss spawns in story mode to keep it simple survival
    // Or spawn one at 90% duration
    if (this.mode === 'story') return;

    if (this.time >= this.nextBossTime && this.bosses.length === 0) {
        this.spawnBoss();
        this.nextBossTime = this.time + this.bossSpawnInterval;
        
        // Transition to boss music
        this.transitionToBossMusic();
    }
};

game.spawnBoss = function() {
    const bossType = this.bossTypes[Math.floor(Math.random() * this.bossTypes.length)];
    const minutesElapsed = this.time / 60000;
    
    // Aggressive boss scaling
    const healthMultiplier = 1 + (minutesElapsed * 0.5) + Math.pow(minutesElapsed * 0.2, 1.5);
    const damageMultiplier = 1 + (minutesElapsed * 0.25);
    const speedMultiplier = 1 + (minutesElapsed * 0.1);
    
    // Show warning
    const warning = document.createElement('div');
    warning.className = 'boss-warning';
    warning.textContent = 'WARNING: BOSS INCOMING!';
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 2000);
    
    // Spawn boss from random edge
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
        case 0: x = Math.random() * MAP_WIDTH; y = -50; break;
        case 1: x = MAP_WIDTH + 50; y = Math.random() * MAP_HEIGHT; break;
        case 2: x = Math.random() * MAP_WIDTH; y = MAP_HEIGHT + 50; break;
        case 3: x = -50; y = Math.random() * MAP_HEIGHT; break;
    }
    
    const scaledHealth = Math.ceil(bossType.health * healthMultiplier);
    
    const boss = {
        x, y,
        name: bossType.name,
        radius: bossType.radius,
        health: scaledHealth,
        maxHealth: scaledHealth,
        speed: bossType.speed * speedMultiplier,
        damage: Math.ceil(bossType.damage * damageMultiplier),
        color: bossType.color,
        xpReward: bossType.xpReward,
        isBoss: true
    };
    
    this.bosses.push(boss);
    document.getElementById('bossHealthContainer').style.display = 'block';
    document.getElementById('bossName').textContent = boss.name;
};

game.updateBosses = function(deltaTime) {
    const slowMultiplier = 1 - ((this.skills.slowenemies || 0) * 0.05);
    
    this.bosses.forEach((boss, index) => {
        // Don't move if frozen
        if (!boss.isFrozen) {
            const dx = this.player.x - boss.x;
            const dy = this.player.y - boss.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Apply ice slow
            const iceSlowMultiplier = 1 - (boss.iceSlowed || 0);
            
            boss.x += (dx / dist) * boss.speed * slowMultiplier * iceSlowMultiplier;
            boss.y += (dy / dist) * boss.speed * slowMultiplier * iceSlowMultiplier;
        }
        
        if (boss.health <= 0) {
            this.kills++;
            
            // Track story mode boss kills
            if (this.mode === 'story') {
                this.storyBossesKilled = (this.storyBossesKilled || 0) + 1;
            }
            
            const xpMultiplier = 1 + ((this.skills.bossxp || 0) * 0.15);
            
            // Spawn lots of XP
            for (let i = 0; i < boss.xpReward; i++) {
                const angle = (Math.PI * 2 * i) / boss.xpReward;
                const distance = Math.random() * 50 + 30;
                this.spawnXpOrb(
                    boss.x + Math.cos(angle) * distance,
                    boss.y + Math.sin(angle) * distance,
                    1 * xpMultiplier
                );
            }
            this.createExplosion(boss.x, boss.y, boss.color);
            // Extra particles for boss death
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 3;
                this.particles.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 5 + 3,
                    life: 1,
                    color: boss.color
                });
            }
            this.bosses.splice(index, 1);
            this.spawnChest(boss.x, boss.y); // Boss drops chest
            
            // Bosses have guaranteed better relic drop chance
            if (this.tryDropRelic) {
                this.tryDropRelic(boss.x, boss.y, true);
            }
            
            document.getElementById('bossHealthContainer').style.display = 'none';
            
            // Transition back to normal music if no more bosses
            if (this.bosses.length === 0) {
                this.transitionToNormalMusic();
            }
        }
    });
    
    // Update boss health bar
    if (this.bosses.length > 0) {
        const boss = this.bosses[0];
        const healthPercent = (boss.health / boss.maxHealth) * 100;
        document.getElementById('bossBar').style.width = `${healthPercent}%`;
    }
};

game.spawnNecromancerMinion = function(x, y) {
    const minion = {
        x: x,
        y: y,
        radius: 8,
        speed: 4,
        damage: this.player.damage * 0.6,
        health: 15,
        maxHealth: 15,
        color: '#8B4789',
        secondaryColor: '#D4A0D4',
        lifespan: 8000, // 8 seconds in milliseconds
        spawnTime: this.time,
        isMinion: true,
        type: 'necromancer-minion',
        lastHit: {}
    };
    this.player.minions.push(minion);
};

game.updateNecromancerMinions = function(deltaTime) {
    if (!this.player.isNecromancer) return;
    
    for (let i = this.player.minions.length - 1; i >= 0; i--) {
        const minion = this.player.minions[i];
        const age = this.time - minion.spawnTime;
        
        // Remove minion if it's expired
        if (age > minion.lifespan) {
            this.player.minions.splice(i, 1);
            continue;
        }
        
        // Fade out the minion as it ages
        minion.opacity = Math.max(0, 1 - (age / minion.lifespan));
        
        // Find closest enemy and move towards it
        let closest = null;
        let closestDist = Infinity;
        
        for (const enemy of this.enemies) {
            const dx = enemy.x - minion.x;
            const dy = enemy.y - minion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < closestDist && dist < 300) {
                closestDist = dist;
                closest = enemy;
            }
        }
        
        // Move towards closest enemy
        if (closest) {
            const dx = closest.x - minion.x;
            const dy = closest.y - minion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            minion.x += (dx / dist) * minion.speed;
            minion.y += (dy / dist) * minion.speed;
            
            // Attack closest enemy if in contact
            if (dist < minion.radius + closest.radius) {
                const now = this.time;
                if (!minion.lastHit[closest] || now - minion.lastHit[closest] > 500) {
                    closest.health -= minion.damage;
                    minion.lastHit[closest] = now;
                }
            }
        }
    }
};

// ==================== SUMMONER PERMANENT MINIONS ====================
game.initSummonerMinions = function() {
    if (!this.player.isSummoner) return;
    
    // Spawn 2 permanent minions
    for (let i = 0; i < 2; i++) {
        this.spawnSummonerMinion(i);
    }
};

game.spawnSummonerMinion = function(slot) {
    const angle = (slot / 2) * Math.PI * 2;
    const offsetX = Math.cos(angle) * 50;
    const offsetY = Math.sin(angle) * 50;
    
    const minion = {
        x: this.player.x + offsetX,
        y: this.player.y + offsetY,
        radius: 12,
        speed: 5,
        damage: this.player.damage * 0.4,
        health: 30,
        maxHealth: 30,
        color: '#44aaff',
        secondaryColor: '#2266cc',
        isPermanent: true,
        slot: slot,
        isMinion: true,
        type: 'summoner-minion',
        lastHit: {},
        lastAttack: 0,
        attackCooldown: 800
    };
    this.player.permanentMinions[slot] = minion;
};

game.updateSummonerMinions = function(deltaTime) {
    if (!this.player.isSummoner) return;
    
    // Handle respawn timer for dead minions
    if (this.player.minionRespawnTimer > 0) {
        this.player.minionRespawnTimer -= deltaTime;
        if (this.player.minionRespawnTimer <= 0) {
            // Respawn any dead minions
            for (let i = 0; i < 2; i++) {
                if (!this.player.permanentMinions[i] || this.player.permanentMinions[i].health <= 0) {
                    this.spawnSummonerMinion(i);
                }
            }
        }
    }
    
    // Update each permanent minion
    for (let i = 0; i < this.player.permanentMinions.length; i++) {
        const minion = this.player.permanentMinions[i];
        if (!minion || minion.health <= 0) {
            // Start respawn timer if not already running
            if (this.player.minionRespawnTimer <= 0) {
                this.player.minionRespawnTimer = 5000; // 5 second respawn
            }
            continue;
        }
        
        minion.opacity = 1; // Always fully visible
        
        // Update minion damage to scale with player
        minion.damage = this.player.damage * 0.4;
        
        // Find closest enemy
        let closest = null;
        let closestDist = Infinity;
        
        for (const enemy of this.enemies) {
            const dx = enemy.x - minion.x;
            const dy = enemy.y - minion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < closestDist && dist < 400) {
                closestDist = dist;
                closest = enemy;
            }
        }
        
        // Also check bosses
        for (const boss of this.bosses) {
            const dx = boss.x - minion.x;
            const dy = boss.y - minion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < closestDist && dist < 400) {
                closestDist = dist;
                closest = boss;
            }
        }
        
        // Move towards closest enemy or follow player
        if (closest) {
            const dx = closest.x - minion.x;
            const dy = closest.y - minion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            minion.x += (dx / dist) * minion.speed;
            minion.y += (dy / dist) * minion.speed;
            
            // Attack closest enemy if in range
            if (dist < minion.radius + closest.radius + 10) {
                const now = this.time;
                if (now - minion.lastAttack > minion.attackCooldown) {
                    closest.health -= minion.damage;
                    minion.lastAttack = now;
                    // Track damage
                    if (this.runStats) this.runStats.damageDealt += minion.damage;
                }
            }
        } else {
            // Follow player if no enemy nearby
            const dx = this.player.x - minion.x;
            const dy = this.player.y - minion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Orbit around player at fixed distance
            const orbitDist = 60;
            const angle = (i / 2) * Math.PI * 2 + (this.time / 1000);
            const targetX = this.player.x + Math.cos(angle) * orbitDist;
            const targetY = this.player.y + Math.sin(angle) * orbitDist;
            
            const tdx = targetX - minion.x;
            const tdy = targetY - minion.y;
            const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
            
            if (tdist > 5) {
                minion.x += (tdx / tdist) * minion.speed * 0.5;
                minion.y += (tdy / tdist) * minion.speed * 0.5;
            }
        }
        
        // Keep minion in map bounds
        minion.x = Math.max(0, Math.min(MAP_WIDTH, minion.x));
        minion.y = Math.max(0, Math.min(MAP_HEIGHT, minion.y));
        
        // Check if minion takes damage from enemies (contact damage)
        this.enemies.forEach(enemy => {
            const dx = enemy.x - minion.x;
            const dy = enemy.y - minion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minion.radius + enemy.radius) {
                minion.health -= enemy.damage * 0.1 * (deltaTime / 1000);
            }
        });
    }
};

// ==================== ENEMY SPECIAL BEHAVIORS ====================
game.handleEnemyBehavior = function(enemy, enemyType, dx, dy, dist, deltaTime) {
    const now = this.time;
    
    switch (enemyType.behavior) {
        case 'charge':
            // Charge at player periodically
            if (!enemy.isCharging && now - enemy.lastBehavior > enemyType.chargeCooldown) {
                enemy.lastBehavior = now;
                enemy.isCharging = true;
                enemy.chargeTarget = { x: this.player.x, y: this.player.y };
                // Visual indicator
                this.createExplosion(enemy.x, enemy.y, '#ff4400');
            }
            break;
            
        case 'teleport':
            // Teleport close to player periodically
            if (now - enemy.lastBehavior > enemyType.teleportCooldown && dist > 100) {
                enemy.lastBehavior = now;
                const angle = Math.random() * Math.PI * 2;
                const teleportDist = 50 + Math.random() * 100;
                enemy.x = this.player.x + Math.cos(angle) * teleportDist;
                enemy.y = this.player.y + Math.sin(angle) * teleportDist;
                // Clamp to map bounds
                enemy.x = Math.max(0, Math.min(MAP_WIDTH, enemy.x));
                enemy.y = Math.max(0, Math.min(MAP_HEIGHT, enemy.y));
                // Visual effect
                this.createExplosion(enemy.x, enemy.y, '#00ffff');
            }
            break;
            
        case 'shield':
            // Periodically become invulnerable
            if (!enemy.isShielding && now - enemy.lastBehavior > enemyType.shieldCooldown) {
                enemy.lastBehavior = now;
                enemy.isShielding = true;
                enemy.shieldEndTime = now + enemyType.shieldDuration;
            }
            // End shield
            if (enemy.isShielding && now >= enemy.shieldEndTime) {
                enemy.isShielding = false;
            }
            break;
    }
};

game.splitEnemy = function(enemy, enemyType) {
    const splitCount = enemyType.splitCount || 2;
    
    for (let i = 0; i < splitCount; i++) {
        const angle = (Math.PI * 2 / splitCount) * i;
        const splitEnemy = {
            x: enemy.x + Math.cos(angle) * 30,
            y: enemy.y + Math.sin(angle) * 30,
            type: enemy.type,
            radius: enemy.radius * 0.6,
            speed: enemy.speed * 1.3,
            health: enemy.maxHealth * 0.3,
            maxHealth: enemy.maxHealth * 0.3,
            damage: enemy.damage * 0.5,
            color: enemy.color,
            secondaryColor: enemy.secondaryColor,
            isSplit: true // Prevent infinite splitting
        };
        this.enemies.push(splitEnemy);
        this.createExplosion(splitEnemy.x, splitEnemy.y, enemy.color);
    }
};

game.explodeEnemy = function(enemy, enemyType) {
    const radius = enemyType.explosionRadius || 80;
    const damage = enemyType.explosionDamage || 30;
    
    // Check if player is in explosion radius
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < radius) {
        const damageMultiplier = this.player.damageTakenMultiplier || 1;
        const damageReduction = 1 - (this.player.damageReduction || 0);
        const finalDamage = damage * damageMultiplier * damageReduction;
        this.player.health -= finalDamage;
        if (this.runStats) this.runStats.damageTaken += finalDamage;
        if (this.triggerScreenShake) this.triggerScreenShake(15, 300);
    }
    
    // Visual explosion effect
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i;
        this.particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            life: 500,
            color: '#ff8800',
            radius: 8
        });
    }
};
