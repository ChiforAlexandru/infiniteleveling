// ==================== TEST ZONE MAP ====================
game.testZoneConfig = {
    name: 'Test Zone',
    width: 800,
    height: 800,
    background: '#222244',
    enemies: ['goblin', 'zombie', 'skeleton', 'slime'],
    // Add more test features as needed
    features: [
        { type: 'obstacle', x: 400, y: 400, radius: 60 },
        { type: 'obstacle', x: 200, y: 200, radius: 30 },
        { type: 'obstacle', x: 600, y: 600, radius: 30 },
        { type: 'healing', x: 400, y: 100, radius: 20 },
        { type: 'spawn', x: 400, y: 700, radius: 20 }
    ]
};
game.characters = [
    { name: 'Survivor', description: 'Balanced stats', stats: { hp: 100, speed: 3, damage: 10, fireRate: 500 }, spriteKey: 'survivor' },
    { name: 'Tank', description: 'High HP, Slow', stats: { hp: 160, speed: 2.2, damage: 12, fireRate: 600 }, spriteKey: 'survivor' },
    { name: 'Scout', description: 'Fast, Low HP', stats: { hp: 60, speed: 4.2, damage: 8, fireRate: 400 }, spriteKey: 'survivor' },
    { name: 'Sniper', description: 'High DMG, Slow', stats: { hp: 70, speed: 2.8, damage: 25, fireRate: 900 }, spriteKey: 'survivor' },
    { name: 'Necromancer', description: '50% chance to spawn skeleton minion on kill! Minions deal damage and fade away.', stats: { hp: 90, speed: 3, damage: 11, fireRate: 550 }, spriteKey: 'necromancer', color: '#9966ff' },
    { name: 'Summoner', description: 'Starts with 2 permanent minions that fight for you! Minions respawn after death.', stats: { hp: 70, speed: 2.8, damage: 8, fireRate: 600 }, spriteKey: 'survivor', color: '#44aaff' },
    { name: 'Berserker', description: 'Rage Mode! Damage increases as HP decreases. At 10% HP, deal 2.5x damage!', stats: { hp: 120, speed: 3.2, damage: 12, fireRate: 450 }, spriteKey: 'survivor', color: '#ff4444' },
    { name: 'Vampire', description: 'No passive regen. Heal 3% of damage dealt. Lifesteal increases with kills.', stats: { hp: 80, speed: 3.4, damage: 14, fireRate: 480 }, spriteKey: 'survivor', color: '#880044' }
];

game.powerUps = [
        // --- Zone Upgrades ---
        {
            id: 'firezone_area',
            name: 'Flame Trail: Area Up',
            description: 'Increase fire zone area by 30%',
            stats: '+30% Fire Zone Area',
            apply: (player) => { player.fireZoneRadius = (player.fireZoneRadius || 25) * 1.3; },
            isZoneUpgrade: true,
            baseZone: 'firezone'
        },
        {
            id: 'firezone_damage',
            name: 'Flame Trail: Damage Up',
            description: 'Increase fire zone damage by 3/sec',
            stats: '+3 Fire Zone Damage',
            apply: (player) => { player.fireZoneDamage = (player.fireZoneDamage || 5) + 3; },
            isZoneUpgrade: true,
            baseZone: 'firezone'
        },
        {
            id: 'icezone_area',
            name: 'Frost Path: Area Up',
            description: 'Increase ice zone area by 30%',
            stats: '+30% Ice Zone Area',
            apply: (player) => { player.iceZoneRadius = (player.iceZoneRadius || 25) * 1.3; },
            isZoneUpgrade: true,
            baseZone: 'icezone'
        },
        {
            id: 'icezone_slow',
            name: 'Frost Path: Slow Up',
            description: 'Increase ice zone slow by 10%',
            stats: '+10% Ice Zone Slow',
            apply: (player) => { player.iceZoneSlow = Math.min((player.iceZoneSlow || 0.5) + 0.1, 0.9); },
            isZoneUpgrade: true,
            baseZone: 'icezone'
        },
        {
            id: 'electriczone_area',
            name: 'Lightning Field: Area Up',
            description: 'Increase electric zone area by 30%',
            stats: '+30% Electric Zone Area',
            apply: (player) => { player.electricZoneRadius = (player.electricZoneRadius || 25) * 1.3; },
            isZoneUpgrade: true,
            baseZone: 'electriczone'
        },
        {
            id: 'electriczone_damage',
            name: 'Lightning Field: Damage Up',
            description: 'Increase electric zone damage by 4/sec',
            stats: '+4 Electric Zone Damage',
            apply: (player) => { player.electricZoneDamage = (player.electricZoneDamage || 8) + 4; },
            isZoneUpgrade: true,
            baseZone: 'electriczone'
        },
        {
            id: 'waterzone_area',
            name: 'Aqua Wake: Area Up',
            description: 'Increase water zone area by 30%',
            stats: '+30% Water Zone Area',
            apply: (player) => { player.waterZoneRadius = (player.waterZoneRadius || 25) * 1.3; },
            isZoneUpgrade: true,
            baseZone: 'waterzone'
        },
        // Add more waterzone upgrades as needed
    {
        id: 'damage',
        name: 'Plasma Rounds',
        description: 'Increase damage by 5%',
        stats: '+5% Damage',
        apply: (player) => player.damage *= 1.05
    },
    {
        id: 'speed',
        name: 'Neural Boost',
        description: 'Increase movement speed by 5%',
        stats: '+5% Speed',
        apply: (player) => player.speed *= 1.05
    },
    {
        id: 'firerate',
        name: 'Overclocked Core',
        description: 'Increase fire rate by 5%',
        stats: '+5% Fire Rate',
        apply: (player) => player.fireRate *= 0.95
    },
    {
        id: 'projectiles',
        name: 'Split Shot',
        description: 'Fire +1 additional projectile',
        stats: '+1 Projectile',
        apply: (player) => player.projectileCount += 1
    },
    {
        id: 'health',
        name: 'Regenerative Shield',
        description: 'Restore 20 HP and increase max HP by 10',
        stats: '+20 HP, +10 Max HP',
        apply: (player) => {
            player.maxHealth += 10;
            player.health = Math.min(player.health + 20, player.maxHealth);
        }
    },
    {
        id: 'range',
        name: 'Extended Barrel',
        description: 'Increase projectile range by 10%',
        stats: '+10% Range',
        apply: (player) => player.projectileRange *= 1.10
    },
    {
        id: 'projectilespeed',
        name: 'Accelerator',
        description: 'Increase projectile speed by 8%',
        stats: '+8% Proj Speed',
        apply: (player) => player.projectileSpeed *= 1.08
    },
    {
        id: 'aoe',
        name: 'Explosive Rounds',
        description: 'Projectiles deal AoE damage',
        stats: 'AoE Damage',
        apply: (player) => player.hasAoE = true
    },
    {
        id: 'magnet_instant',
        name: 'Vacuum Magnet',
        description: 'Instantly pulls all XP orbs to you',
        stats: 'Collect All XP',
        apply: (player) => {
            if (game && game.xpOrbs) {
                game.xpOrbs.forEach(orb => {
                    orb.attractSpeed = 50; // High speed to pull instantly
                });
            }
        }
    },
    // Zone power-ups
    {
        id: 'firetrail',
        name: 'Flame Trail',
        description: 'Leave burning zones behind you',
        stats: '5 Damage/Sec',
        apply: (player) => {
            player.hasFireZone = true;
            player.fireZoneDamage = (player.fireZoneDamage || 5) + 3;
        }
    },
    {
        id: 'icepath',
        name: 'Frost Path',
        description: 'Leave freezing zones that slow enemies',
        stats: '50% Slow',
        apply: (player) => {
            player.hasIceZone = true;
            player.iceZoneSlow = Math.min((player.iceZoneSlow || 0.5) + 0.1, 0.8);
        }
    },
    {
        id: 'shockfield',
        name: 'Electric Field',
        description: 'Leave electric zones that zap enemies',
        stats: '8 Damage/Sec',
        apply: (player) => {
            player.hasElectricZone = true;
            player.electricZoneDamage = (player.electricZoneDamage || 8) + 4;
        }
    },
    {
        id: 'waterwake',
        name: 'Water Wake',
        description: 'Leave water zones that wet enemies',
        stats: 'Wet Effect',
        apply: (player) => {
            player.hasWaterZone = true;
        }
    },
    // Cursed Items
    {
        id: 'cursed_blade',
        name: 'Cursed Blade',
        description: 'Massive damage boost, but reduces Max HP',
        stats: '+50% Damage, -25% Max HP',
        isCursed: true,
        apply: (player) => {
            player.damage *= 1.5;
            player.maxHealth *= 0.75;
            if (player.health > player.maxHealth) player.health = player.maxHealth;
        }
    },
    {
        id: 'heavy_plate',
        name: 'Heavy Plate',
        description: 'Massive HP boost, but reduces speed',
        stats: '+50% Max HP, -15% Speed',
        isCursed: true,
        apply: (player) => {
            player.maxHealth *= 1.5;
            player.health = Math.min(player.health + (player.maxHealth * 0.33), player.maxHealth);
            player.speed *= 0.85;
        }
    },
    {
        id: 'glass_cannon',
        name: 'Glass Cannon',
        description: 'Double critical chance, but take more damage',
        stats: '+20% Crit Chance, +30% Dmg Taken',
        isCursed: true,
        apply: (player) => {
            player.critChance += 0.20;
            player.damageTakenMultiplier = (player.damageTakenMultiplier || 1) + 0.3;
        }
    }
];

game.bossTypes = [
    {
        name: 'TITAN BEHEMOTH',
        color: '#ff3366',
        radius: 40,
        health: 500,
        speed: 0.8,
        damage: 25,
        xpReward: 20
    },
    {
        name: 'VOID CRUSHER',
        color: '#9933ff',
        radius: 35,
        health: 400,
        speed: 1.2,
        damage: 20,
        xpReward: 18
    },
    {
        name: 'PLASMA TYRANT',
        color: '#ff9900',
        radius: 38,
        health: 450,
        speed: 1.0,
        damage: 22,
        xpReward: 19
    },
    {
        name: 'OMEGA DESTROYER',
        color: '#00ff88',
        radius: 45,
        health: 600,
        speed: 0.6,
        damage: 30,
        xpReward: 25
    }
];

game.enemyTypes = [
    {
        name: 'zombie',
        color: '#88cc88',
        secondaryColor: '#556655',
        health: 30,
        speed: 1.3,
        damage: 10,
        radius: 14
    },
    {
        name: 'skeleton',
        color: '#dddddd',
        secondaryColor: '#888888',
        health: 20,
        speed: 2.0,
        damage: 8,
        radius: 12
    },
    {
        name: 'slime',
        color: '#66ff66',
        secondaryColor: '#44dd44',
        health: 40,
        speed: 0.9,
        damage: 12,
        radius: 16
    },
    {
        name: 'ghost',
        color: '#aaaaff',
        secondaryColor: '#7777cc',
        health: 15,
        speed: 2.5,
        damage: 15,
        radius: 13
    },
    {
        name: 'demon',
        color: '#cc2222',
        secondaryColor: '#881111',
        health: 50,
        speed: 1.1,
        damage: 18,
        radius: 17
    },
    {
        name: 'imp',
        color: '#ff6633',
        secondaryColor: '#cc3311',
        health: 25,
        speed: 1.8,
        damage: 12,
        radius: 11
    },
    {
        name: 'wraith',
        color: '#663399',
        secondaryColor: '#441166',
        health: 35,
        speed: 1.6,
        damage: 14,
        radius: 15
    },
    {
        name: 'golem',
        color: '#996633',
        secondaryColor: '#664422',
        health: 80,
        speed: 0.7,
        damage: 20,
        radius: 20
    },
    {
        name: 'bat',
        color: '#333333',
        secondaryColor: '#111111',
        health: 12,
        speed: 3.0,
        damage: 6,
        radius: 9
    },
    {
        name: 'spider',
        color: '#442244',
        secondaryColor: '#221122',
        health: 22,
        speed: 2.2,
        damage: 10,
        radius: 12
    },
    {
        name: 'orc',
        color: '#669944',
        secondaryColor: '#445522',
        health: 45,
        speed: 1.4,
        damage: 16,
        radius: 16
    },
    {
        name: 'vampire',
        color: '#990000',
        secondaryColor: '#660000',
        health: 55,
        speed: 1.5,
        damage: 17,
        radius: 15
    },
    {
        name: 'goblin',
        color: '#339933',
        secondaryColor: '#226622',
        health: 28,
        speed: 2.1,
        damage: 9,
        radius: 11
    },
    {
        name: 'werewolf',
        color: '#8B4513', // SaddleBrown
        secondaryColor: '#A0522D', // Sienna
        health: 60,
        speed: 1.9,
        damage: 19,
        radius: 18
    },
    {
        name: 'troll',
        color: '#2E8B57', // SeaGreen
        secondaryColor: '#228B22', // ForestGreen
        health: 100,
        speed: 0.6,
        damage: 22,
        radius: 22
    },
    {
        name: 'necromancer',
        color: '#58007a', // Dark purple
        secondaryColor: '#2c003d',
        health: 70,
        speed: 0.8,
        damage: 5,
        radius: 16
    },
    // Special behavior enemies
    {
        name: 'charger',
        color: '#ff4400',
        secondaryColor: '#aa2200',
        health: 35,
        speed: 1.0,
        damage: 25,
        radius: 15,
        behavior: 'charge',
        chargeCooldown: 3000,
        chargeSpeed: 8
    },
    {
        name: 'blinker',
        color: '#00ffff',
        secondaryColor: '#0099aa',
        health: 25,
        speed: 1.5,
        damage: 12,
        radius: 12,
        behavior: 'teleport',
        teleportCooldown: 4000,
        teleportRange: 200
    },
    {
        name: 'splitter',
        color: '#88ff88',
        secondaryColor: '#44aa44',
        health: 60,
        speed: 0.8,
        damage: 8,
        radius: 20,
        behavior: 'split',
        splitCount: 2
    },
    {
        name: 'bomber',
        color: '#ff8800',
        secondaryColor: '#cc5500',
        health: 20,
        speed: 2.0,
        damage: 5,
        radius: 10,
        behavior: 'explode',
        explosionRadius: 80,
        explosionDamage: 30
    },
    {
        name: 'shield_bearer',
        color: '#4488ff',
        secondaryColor: '#2255cc',
        health: 80,
        speed: 0.9,
        damage: 15,
        radius: 18,
        behavior: 'shield',
        shieldCooldown: 5000,
        shieldDuration: 2000
    }
];

game.zoneConfig = {
    forest: { bg: '#051005', grid: '#103010', name: 'Dark Forest', enemies: ['zombie', 'skeleton', 'bat', 'spider', 'goblin', 'orc', 'werewolf', 'troll', 'necromancer', 'charger', 'splitter'] },
    ice: { bg: '#051015', grid: '#103040', name: 'Frozen Wasteland', enemies: ['slime', 'ghost', 'wraith', 'bat', 'skeleton', 'troll', 'blinker'] },
    volcano: { bg: '#150505', grid: '#401010', name: 'Molten Core', enemies: ['demon', 'imp', 'golem', 'bat', 'orc', 'charger', 'bomber'] },
    demon: { bg: '#100510', grid: '#301030', name: 'Abyssal Plane', enemies: ['demon', 'imp', 'wraith', 'vampire', 'werewolf', 'ghost', 'necromancer', 'blinker', 'shield_bearer'] },
    angel: { bg: '#101010', grid: '#303020', name: 'Celestial Sanctum', enemies: ['ghost', 'golem', 'slime', 'wraith', 'shield_bearer'] } 
};

game.skillTree = [
    // Tier 1 - Basic Stats (Cost: 1)
    {
        id: 'maxhp1',
        name: 'Fortified Core',
        description: 'Increase starting max HP by 10',
        maxLevel: 10,
        cost: 1
    },
    {
        id: 'damage1',
        name: 'Weapons Training',
        description: 'Increase starting damage by 5%',
        maxLevel: 10,
        cost: 1
    },
    {
        id: 'speed1',
        name: 'Agility Boost',
        description: 'Increase starting movement speed by 5%',
        maxLevel: 10,
        cost: 1
    },
    {
        id: 'firerate1',
        name: 'Rapid Fire',
        description: 'Increase starting fire rate by 5%',
        maxLevel: 10,
        cost: 1
    },
    {
        id: 'projrange',
        name: 'Long Shot',
        description: 'Increase starting projectile range by 8%',
        maxLevel: 8,
        cost: 1
    },
    {
        id: 'projspeed',
        name: 'Velocity Enhancer',
        description: 'Increase starting projectile speed by 6%',
        maxLevel: 8,
        cost: 1
    },
    
    // Tier 2 - Progression & Economy (Cost: 2)
    {
        id: 'xpgain',
        name: 'Experience Hunter',
        description: 'Gain 10% more XP from kills',
        maxLevel: 5,
        cost: 2
    },
    {
        id: 'truexp',
        name: 'Meta Progression',
        description: 'Gain 15% more True XP after runs',
        maxLevel: 5,
        cost: 2
    },
    {
        id: 'levelbonus',
        name: 'Quick Learner',
        description: 'Reduce XP needed to level up by 5%',
        maxLevel: 5,
        cost: 2
    },
    {
        id: 'startlevel',
        name: 'Head Start',
        description: 'Start each run at level 2 (stacks)',
        maxLevel: 3,
        cost: 2
    },
    
    // Tier 3 - Combat Mastery (Cost: 3)
    {
        id: 'critchance',
        name: 'Critical Strike',
        description: '3% chance to deal double damage',
        maxLevel: 8,
        cost: 3
    },
    {
        id: 'pierce',
        name: 'Armor Penetration',
        description: 'Projectiles pierce through 1 enemy',
        maxLevel: 3,
        cost: 3
    },
    {
        id: 'multihit',
        name: 'Chain Lightning',
        description: 'Projectiles can hit the same enemy multiple times',
        maxLevel: 1,
        cost: 3
    },
    {
        id: 'homingshot',
        name: 'Guided Missiles',
        description: 'Projectiles slightly home toward enemies',
        maxLevel: 5,
        cost: 3
    },
    
    // Tier 4 - Survival & Defense (Cost: 2-3)
    {
        id: 'regen',
        name: 'Regeneration',
        description: 'Regenerate 0.25 HP per second',
        maxLevel: 8,
        cost: 2
    },
    {
        id: 'invuln',
        name: 'Extended Immunity',
        description: 'Invulnerability time +15% after being hit',
        maxLevel: 5,
        cost: 2
    },
    {
        id: 'dodge',
        name: 'Evasion',
        description: '5% chance to completely dodge damage',
        maxLevel: 5,
        cost: 3
    },
    {
        id: 'thorns',
        name: 'Reflective Plating',
        description: 'Reflect 10% of damage taken back to attackers',
        maxLevel: 5,
        cost: 3
    },
    
    // Tier 5 - Special Abilities (Cost: 4)
    {
        id: 'explosion',
        name: 'Explosive Entry',
        description: 'All projectiles start with 8% AoE splash',
        maxLevel: 5,
        cost: 4
    },
    {
        id: 'multiproj',
        name: 'Additional Ammunition',
        description: 'Start with +1 projectile per shot',
        maxLevel: 2,
        cost: 4
    },
    {
        id: 'magnet',
        name: 'XP Magnetism',
        description: 'XP orbs are attracted from 25% further',
        maxLevel: 6,
        cost: 4
    },
    {
        id: 'killaura',
        name: 'Damage Aura',
        description: 'Enemies near you take 1 damage per second',
        maxLevel: 10,
        cost: 4
    },
    
    // Tier 6 - Boss Mastery (Cost: 5)
    {
        id: 'bossdmg',
        name: 'Giant Slayer',
        description: 'Deal 10% more damage to bosses',
        maxLevel: 8,
        cost: 5
    },
    {
        id: 'bossdefense',
        name: 'Titan Resistance',
        description: 'Take 10% less damage from bosses',
        maxLevel: 6,
        cost: 5
    },
    {
        id: 'bossxp',
        name: 'Trophy Hunter',
        description: 'Bosses drop 15% more XP',
        maxLevel: 5,
        cost: 5
    },
    
    // Tier 7 - Elite Upgrades (Cost: 6-8)
    {
        id: 'maxpower',
        name: 'Power Overwhelming',
        description: 'All stats increased by 3%',
        maxLevel: 10,
        cost: 6
    },
    {
        id: 'revival',
        name: 'Second Chance',
        description: 'Revive once per run with 50% HP',
        maxLevel: 1,
        cost: 8
    },
    {
        id: 'luckycard',
        name: 'Lucky Draw',
        description: 'Get 4 power-up choices instead of 3',
        maxLevel: 1,
        cost: 7
    },
    {
        id: 'reroll',
        name: 'Reroll',
        description: 'Get +1 reroll at each level-up (re-choose power-ups)',
        maxLevel: 5,
        cost: 6
    },
    {
        id: 'cooldown',
        name: 'Time Compression',
        description: 'All cooldowns reduced by 6%',
        maxLevel: 5,
        cost: 6
    },
    {
        id: 'slowenemies',
        name: 'Time Dilation Field',
        description: 'Enemies move 5% slower',
        maxLevel: 8,
        cost: 6
    },
    
    // Tier 8 - Legendary (Cost: 10+)
    {
        id: 'orbital',
        name: 'Orbital Cannon',
        description: 'Spawn an orbiting projectile that damages enemies',
        maxLevel: 3,
        cost: 10
    },
    {
        id: 'berserk',
        name: 'Berserker Rage',
        description: 'Gain 1% damage for every 5% HP missing',
        maxLevel: 5,
        cost: 10
    },
    {
        id: 'vampiric',
        name: 'Life Steal',
        description: 'Heal for 2% of damage dealt',
        maxLevel: 5,
        cost: 12
    },
    {
        id: 'nuke',
        name: 'Nuclear Option',
        description: 'Every 30 seconds, unleash massive explosion',
        maxLevel: 3,
        cost: 15
    },
    
    // Tier 9 - Elemental Zones (Cost: 8-12)
    {
        id: 'firezone',
        name: 'Flame Trail',
        description: 'Leave fire zones that deal 5 damage/sec',
        maxLevel: 5,
        cost: 8
    },
    {
        id: 'icezone',
        name: 'Frost Path',
        description: 'Leave ice zones that slow enemies by 40%',
        maxLevel: 5,
        cost: 8
    },
    {
        id: 'electriczone',
        name: 'Lightning Field',
        description: 'Leave electric zones that deal 8 damage/sec',
        maxLevel: 5,
        cost: 10
    },
    {
        id: 'waterzone',
        name: 'Aqua Wake',
        description: 'Leave water zones that apply wet status',
        maxLevel: 3,
        cost: 6
    },
    
    // Tier 10 - Weapon Unlocks (Cost: 12-15)
    {
        id: 'flamethrower',
        name: 'Flamethrower Weapon',
        description: 'Unlock flamethrower that shoots continuous fire',
        maxLevel: 1,
        cost: 12
    },
    {
        id: 'icespear',
        name: 'Ice Spear Weapon',
        description: 'Unlock ice spears that pierce and slow',
        maxLevel: 1,
        cost: 12
    },
    {
        id: 'lightning',
        name: 'Lightning Bolt Weapon',
        description: 'Unlock lightning that chains between enemies',
        maxLevel: 1,
        cost: 15
    },
    {
        id: 'waterwave',
        name: 'Water Wave Weapon',
        description: 'Unlock water waves that push and wet enemies',
        maxLevel: 1,
        cost: 10
    }
];

// ============================================
// RELIC SYSTEM
// ============================================

game.relicRarities = {
    common: { name: 'Common', color: '#888888', bgColor: '#2a2a2a', dropChance: 0.0016, multiplier: 1 },
    uncommon: { name: 'Uncommon', color: '#44dd44', bgColor: '#1a3a1a', dropChance: 0.00016, multiplier: 1.5 },
    epic: { name: 'Epic', color: '#aa44ff', bgColor: '#2a1a3a', dropChance: 0.00003, multiplier: 2.5 },
    legendary: { name: 'Legendary', color: '#ff8800', bgColor: '#3a2a1a', dropChance: 0.000002, multiplier: 4 },
    mythic: { name: 'Mythic', color: '#ff4444', bgColor: '#3a1a1a', dropChance: 0.000000134, multiplier: 7 }
};

game.relicTypes = [
    {
        id: 'power',
        name: 'Power Crystal',
        icon: '💎',
        description: 'Increases damage',
        effect: (player, power) => { player.damage *= (1 + 0.03 * power); },
        baseValue: 3
    },
    {
        id: 'vitality',
        name: 'Heart Stone',
        icon: '❤️',
        description: 'Increases max HP',
        effect: (player, power) => { 
            player.maxHealth += 5 * power; 
            player.health += 5 * power;
        },
        baseValue: 5
    },
    {
        id: 'swiftness',
        name: 'Wind Essence',
        icon: '💨',
        description: 'Increases movement speed',
        effect: (player, power) => { player.speed *= (1 + 0.02 * power); },
        baseValue: 2
    },
    {
        id: 'fury',
        name: 'Rage Shard',
        icon: '🔥',
        description: 'Increases fire rate',
        effect: (player, power) => { player.fireRate *= (1 - 0.02 * power); },
        baseValue: 2
    },
    {
        id: 'fortune',
        name: 'Lucky Coin',
        icon: '🍀',
        description: 'Increases XP gain',
        effect: (player, power) => { player.xpMultiplier = (player.xpMultiplier || 1) * (1 + 0.05 * power); },
        baseValue: 5
    },
    {
        id: 'protection',
        name: 'Guardian Shield',
        icon: '🛡️',
        description: 'Reduces damage taken',
        effect: (player, power) => { player.damageReduction = (player.damageReduction || 0) + 0.02 * power; },
        baseValue: 2
    },
    {
        id: 'precision',
        name: 'Eagle Eye',
        icon: '🎯',
        description: 'Increases projectile range',
        effect: (player, power) => { player.projectileRange *= (1 + 0.05 * power); },
        baseValue: 5
    },
    {
        id: 'vampirism',
        name: 'Blood Ruby',
        icon: '🩸',
        description: 'Life steal on hit',
        effect: (player, power) => { player.vampiric = (player.vampiric || 0) + 0.01 * power; },
        baseValue: 1
    },
    {
        id: 'thorns',
        name: 'Spike Opal',
        icon: '⚔️',
        description: 'Reflects damage to attackers',
        effect: (player, power) => { player.thornsDamage = (player.thornsDamage || 0) + 2 * power; },
        baseValue: 2
    },
    {
        id: 'magnetism',
        name: 'Lodestone',
        icon: '🧲',
        description: 'Increases pickup range',
        effect: (player, power) => { player.magnetRange *= (1 + 0.1 * power); },
        baseValue: 10
    }
];

// ============================================
// RELIC SETS - Bonus for equipping matching relics
// ============================================

game.relicSets = [
    {
        id: 'warrior',
        name: 'Warrior\'s Might',
        icon: '⚔️',
        relicTypes: ['power', 'fury', 'precision'],
        bonuses: {
            2: { name: '+10% Damage', effect: (player) => { player.damage *= 1.10; } },
            3: { name: '+25% Damage, +15% Fire Rate', effect: (player) => { player.damage *= 1.25; player.fireRate *= 0.85; } }
        }
    },
    {
        id: 'guardian',
        name: 'Guardian\'s Resolve',
        icon: '🛡️',
        relicTypes: ['vitality', 'protection', 'thorns'],
        bonuses: {
            2: { name: '+15% Max HP', effect: (player) => { player.maxHealth *= 1.15; player.health = player.maxHealth; } },
            3: { name: '+30% Max HP, +20% Damage Reduction', effect: (player) => { player.maxHealth *= 1.30; player.health = player.maxHealth; player.damageReduction = (player.damageReduction || 0) + 0.20; } }
        }
    },
    {
        id: 'hunter',
        name: 'Hunter\'s Instinct',
        icon: '🎯',
        relicTypes: ['swiftness', 'precision', 'magnetism'],
        bonuses: {
            2: { name: '+15% Speed', effect: (player) => { player.speed *= 1.15; } },
            3: { name: '+25% Speed, +50% Pickup Range', effect: (player) => { player.speed *= 1.25; player.magnetRange *= 1.50; } }
        }
    },
    {
        id: 'vampire',
        name: 'Vampire\'s Embrace',
        icon: '🩸',
        relicTypes: ['vampirism', 'thorns', 'fury'],
        bonuses: {
            2: { name: '+3% Life Steal', effect: (player) => { player.vampiric = (player.vampiric || 0) + 0.03; } },
            3: { name: '+6% Life Steal, +50% Thorns', effect: (player) => { player.vampiric = (player.vampiric || 0) + 0.06; player.thornsDamage = (player.thornsDamage || 0) * 1.5; } }
        }
    },
    {
        id: 'fortune',
        name: 'Fortune\'s Favor',
        icon: '🍀',
        relicTypes: ['fortune', 'magnetism', 'vitality'],
        bonuses: {
            2: { name: '+20% XP Gain', effect: (player) => { player.xpMultiplier = (player.xpMultiplier || 1) * 1.20; } },
            3: { name: '+40% XP Gain, +10% All Stats', effect: (player) => { player.xpMultiplier = (player.xpMultiplier || 1) * 1.40; player.damage *= 1.10; player.speed *= 1.10; player.maxHealth *= 1.10; } }
        }
    }
];

// ============================================
// ELITE MUTATIONS - Random modifiers for elites (Story Level 50+)
// ============================================

game.eliteMutations = [
    {
        id: 'shielded',
        name: 'Shielded',
        icon: '🛡️',
        color: '#00aaff',
        description: 'Has a regenerating shield',
        apply: (enemy) => {
            enemy.shield = enemy.maxHealth * 0.5;
            enemy.maxShield = enemy.shield;
            enemy.shieldRegen = enemy.maxShield * 0.02; // 2% regen per second
        }
    },
    {
        id: 'regenerating',
        name: 'Regenerating',
        icon: '💚',
        color: '#00ff88',
        description: 'Slowly regenerates health',
        apply: (enemy) => {
            enemy.healthRegen = enemy.maxHealth * 0.01; // 1% HP per second
        }
    },
    {
        id: 'splitter',
        name: 'Splitter',
        icon: '👥',
        color: '#ff66ff',
        description: 'Splits into 2 smaller enemies on death',
        apply: (enemy) => {
            enemy.splitsOnDeath = true;
            enemy.splitCount = 2;
        }
    },
    {
        id: 'berserker',
        name: 'Berserker',
        icon: '😡',
        color: '#ff4444',
        description: 'Gets faster as health decreases',
        apply: (enemy) => {
            enemy.berserker = true;
        }
    },
    {
        id: 'vampiric',
        name: 'Vampiric',
        icon: '🧛',
        color: '#8b0000',
        description: 'Heals on dealing damage',
        apply: (enemy) => {
            enemy.vampiric = true;
        }
    },
    {
        id: 'thorny',
        name: 'Thorny',
        icon: '🌵',
        color: '#228b22',
        description: 'Reflects damage back to attacker',
        apply: (enemy) => {
            enemy.thornsDamage = 3;
        }
    },
    {
        id: 'teleporter',
        name: 'Teleporter',
        icon: '✨',
        color: '#9400d3',
        description: 'Randomly teleports closer to player',
        apply: (enemy) => {
            enemy.canTeleport = true;
            enemy.teleportCooldown = 3000;
            enemy.lastTeleport = 0;
        }
    },
    {
        id: 'enraged',
        name: 'Enraged',
        icon: '🔥',
        color: '#ff6600',
        description: 'Deals double damage',
        apply: (enemy) => {
            enemy.damage *= 2;
        }
    }
];

// ============================================
// WEEKLY RAID BOSSES
// ============================================

game.raidBossTypes = [
    {
        id: 'world_eater',
        name: 'WORLD EATER',
        icon: '🌍',
        baseHealth: 10000000,
        damage: 50,
        speed: 1,
        color: '#8b0000',
        secondaryColor: '#4a0000',
        attacks: ['slam', 'summon', 'laser'],
        rewards: { trueXp: 5000, relicRarity: 'legendary' }
    },
    {
        id: 'void_titan',
        name: 'VOID TITAN',
        icon: '🌑',
        baseHealth: 15000000,
        damage: 40,
        speed: 0.8,
        color: '#1a0033',
        secondaryColor: '#330066',
        attacks: ['blackhole', 'voidbolt', 'teleport'],
        rewards: { trueXp: 7500, relicRarity: 'legendary' }
    },
    {
        id: 'celestial_dragon',
        name: 'CELESTIAL DRAGON',
        icon: '🐉',
        baseHealth: 12000000,
        damage: 60,
        speed: 1.2,
        color: '#ffd700',
        secondaryColor: '#ff8c00',
        attacks: ['firebreath', 'tailswipe', 'dive'],
        rewards: { trueXp: 6000, relicRarity: 'mythic' }
    },
    {
        id: 'ancient_colossus',
        name: 'ANCIENT COLOSSUS',
        icon: '🗿',
        baseHealth: 20000000,
        damage: 35,
        speed: 0.5,
        color: '#696969',
        secondaryColor: '#2f4f4f',
        attacks: ['stomp', 'rockslide', 'fortify'],
        rewards: { trueXp: 10000, relicRarity: 'mythic' }
    }
];
