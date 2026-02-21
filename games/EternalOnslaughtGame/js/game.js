// Start the test zone map
// ...existing code...

// ...existing code...

// Start the test zone map (must be after game object and all assignments are defined)
setTimeout(function() {
    game.startTestZone = function() {
            this.mode = 'testzone';
            this.currentMap = game.testZoneConfig;
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('gameOverScreen').style.display = 'none';
            document.getElementById('victoryScreen').style.display = 'none';
            document.getElementById('relicScreen').style.display = 'none';
            document.getElementById('hud').style.display = 'block';
            this.running = false;
            this.init();
            // Center player in test zone
            this.player.x = this.currentMap.width / 2;
            this.player.y = this.currentMap.height / 2;
            this.playMusic && this.playMusic();
            this.gameLoop && this.gameLoop();
    };
}, 0);
const game = {
    running: false,
    paused: false,
    player: null,
    enemies: [],
    projectiles: [],
    particles: [],
    xpOrbs: [],
    bosses: [],
    zones: [],
    chests: [],
    damageNumbers: [],
    nextBossTime: 30000,
    bossSpawnInterval: 45000,
    lastZoneSpawn: 0,
    zoneSpawnInterval: 300,
    level: 1,
    xp: 0,
    xpNeeded: 10,
    time: 0,
    kills: 0,
    trueXp: parseInt(localStorage.getItem('trueXp') || '0'),
    skills: JSON.parse(localStorage.getItem('skills') || '{}'),
    animationFrameId: null,
    lastFrame: null,
    isBossMusic: false,
    masterVolume: localStorage.getItem('masterVolume') !== null ? parseInt(localStorage.getItem('masterVolume')) / 100 : 0.5,
    musicVolume: localStorage.getItem('musicVolume') !== null ? Math.min(parseInt(localStorage.getItem('musicVolume')) / 100 * 2.5, 1.0) : 0.5,
    sfxVolume: localStorage.getItem('sfxVolume') !== null ? Math.min(parseInt(localStorage.getItem('sfxVolume')) / 100 * 2.5, 1.0) : 0.5,
    musicFadeInterval: null,
    mode: 'endless',
    storyLevel: 1,
    maxStoryLevel: parseInt(localStorage.getItem('maxStoryLevel') || '1'),
    selectedCharacterIndex: 0,
    maxEnemies: 300,
    maxParticles: 200,
    maxZones: 40,
    maxProjectiles: 500,
    maxDamageNumbers: 30,
    maxXpOrbs: 200,
    
    // Screen shake
    screenShake: { intensity: 0, duration: 0 },
    
    // Gamepad support
    gamepadIndex: null,
    gamepadDeadzone: 0.15,
    gamepadButtonStates: {},
    gamepadConnected: false,
    
    // Kill streak system
    killStreak: 0,
    lastKillTime: 0,
    killStreakTimeout: 2000,
    highestStreak: 0,
    
    // Run statistics
    runStats: {
        damageDealt: 0,
        damageTaken: 0,
        xpCollected: 0,
        powerUpsCollected: 0,
        bossesKilled: 0,
        elitesKilled: 0,
        maxKillStreak: 0
    },
    
    // Achievements
    achievements: JSON.parse(localStorage.getItem('achievements') || '{}'),
    
    // Unlocks - ensure Necromancer is always unlocked
    unlockedCharacters: (function() {
        let chars = JSON.parse(localStorage.getItem('unlockedCharacters') || '["Survivor"]');
        if (!chars.includes('Necromancer')) {
            chars.push('Necromancer');
            localStorage.setItem('unlockedCharacters', JSON.stringify(chars));
        }
        return chars;
    })(),
    
    // Daily challenge
    dailyChallenge: null,
    lastDailyDate: localStorage.getItem('lastDailyDate') || '',
    
    // Prestige
    prestigeLevel: parseInt(localStorage.getItem('prestigeLevel') || '0'),
    prestigeMultiplier: 1,
    
    // Bestiary
    bestiary: JSON.parse(localStorage.getItem('bestiary') || '{}'),
    
    // Endless mode leaderboard
    leaderboard: JSON.parse(localStorage.getItem('leaderboard') || '[]'),
    
    // Ground relics (relics dropped but not picked up)
    groundRelics: [],
    maxGroundRelics: 50,
    relicLifetime: 60000, // 1 minute
    
    // Relic pickup filter (false = don't pick up)
    relicFilter: JSON.parse(localStorage.getItem('relicFilter') || '{"common":true,"uncommon":true,"epic":true,"legendary":true,"mythic":true}'),
    
    // Run History
    runHistory: JSON.parse(localStorage.getItem('runHistory') || '[]'),
    
    // Event System
    currentEvent: null,
    eventEndTime: 0,
    lastEventTime: 0,
    eventCooldown: 60000, // 1 minute between events
    
    // Weekly Raid Boss
    raidBoss: JSON.parse(localStorage.getItem('raidBoss') || 'null'),
    raidBossWeek: localStorage.getItem('raidBossWeek') || '',
    raidDamageDealt: parseInt(localStorage.getItem('raidDamageDealt') || '0'),
    
    // Sprite Animation System
    sprites: {},
    spritesLoaded: false,
    
    // Arrays to be populated by data.js
    characters: [],
    powerUps: [],
    bossTypes: [],
    enemyTypes: [],
    skillTree: [],
    zoneConfig: {},
    achievementList: [],
    dailyChallenges: []
};
