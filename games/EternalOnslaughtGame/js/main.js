// Dynamically add Character Stats button after scripts are loaded
window.addEventListener('DOMContentLoaded', function() {
    const btn = document.createElement('button');
    btn.className = 'button';
    btn.innerText = '🧬 Character Stats';
    btn.onclick = function() { game.showStatsScreen(); };
    // Move stats button near bestiary
    const bestiary = document.getElementById('bestiarySection');
    if (bestiary) {
        bestiary.parentNode.insertBefore(btn, bestiary.nextSibling);
    } else {
        // fallback: add to end of startButtons
        const startButtons = document.getElementById('startButtons');
        if (startButtons) {
            startButtons.appendChild(btn);
        }
    }
    // Enhance main menu button visuals
    const startButtons = document.getElementById('startButtons');
    if (startButtons) {
        startButtons.style.display = 'grid';
        startButtons.style.gridTemplateColumns = 'repeat(2, 1fr)';
        startButtons.style.gridTemplateRows = 'repeat(2, auto)';
        startButtons.style.gap = '24px';
        startButtons.style.justifyItems = 'center';
        startButtons.style.alignItems = 'center';
        startButtons.style.padding = '32px 0';
        setTimeout(() => {
            Array.from(startButtons.querySelectorAll('button')).forEach(button => {
                button.style.background = 'linear-gradient(135deg, #1a0a2a 60%, #00ffd0 100%)';
                button.style.color = '#fff';
                button.style.fontWeight = 'bold';
                button.style.fontSize = '1.2em';
                button.style.border = 'none';
                button.style.borderRadius = '16px';
                button.style.boxShadow = '0 4px 24px #00ffd0, 0 2px 8px #000 inset';
                button.style.padding = '18px 32px';
                button.style.margin = '0';
                button.style.transition = 'background 0.3s, box-shadow 0.3s, transform 0.2s';
                button.style.cursor = 'pointer';
                button.onmouseover = () => {
                    button.style.background = 'linear-gradient(135deg, #00ffd0 60%, #1a0a2a 100%)';
                    button.style.boxShadow = '0 8px 32px #00ffd0, 0 2px 8px #000 inset';
                    button.style.transform = 'scale(1.05)';
                };
                button.onmouseout = () => {
                    button.style.background = 'linear-gradient(135deg, #1a0a2a 60%, #00ffd0 100%)';
                    button.style.boxShadow = '0 4px 24px #00ffd0, 0 2px 8px #000 inset';
                    button.style.transform = 'scale(1)';
                };
            });
        }, 100);
    }
});
// Show the Character Stats modal
game.showStatsScreen = function() {
    let html = '';
    // If no class selected, show placeholder
    if (!game.characters || typeof game.selectedCharacterIndex !== 'number' || !game.characters[game.selectedCharacterIndex]) {
        html = '<div style="padding:32px 0;text-align:center;color:#aaa;font-size:1.2em;">Please select a class to display stats.</div>';
    } else {
        // If player is missing, create a temp preview player for stats
        let previewPlayer = game.player;
        if (!previewPlayer || !previewPlayer.maxHealth) {
            // Use the same logic as createPlayer, but do not start a run
            const char = game.characters[game.selectedCharacterIndex];
            const skills = game.skills || {};
            const maxHpBonus = (skills.maxhp1 || 0) * 10;
            const damageBonus = 1 + ((skills.damage1 || 0) * 0.05);
            const speedBonus = 1 + ((skills.speed1 || 0) * 0.05);
            const fireRateBonus = 1 - ((skills.firerate1 || 0) * 0.05);
            const powerBonus = 1 + ((skills.maxpower || 0) * 0.03);
            previewPlayer = {
                maxHealth: (char.stats.hp + maxHpBonus) * powerBonus,
                damage: char.stats.damage * damageBonus * powerBonus,
                speed: char.stats.speed * speedBonus * powerBonus,
                fireRate: (char.stats.fireRate || 500) * fireRateBonus,
                relics: [],
                powerUps: []
            };
        }
        const stats = game.calculateTotalStats(previewPlayer);
        html = '<table style="width:100%;text-align:left;">';
        for (let stat of Object.keys(stats)) {
            html += `<tr><td><b>${stat}</b></td><td>${stats[stat].total}</td><td style='font-size:12px;color:#aaa;'>${stats[stat].breakdown}</td></tr>`;
        }
        html += '</table>';
    }
    document.getElementById('statsBreakdown').innerHTML = html;
    document.getElementById('statsScreen').style.display = 'block';
};

// Hide the Character Stats modal
game.hideStatsScreen = function() {
    document.getElementById('statsScreen').style.display = 'none';
};

// Calculate total stats and their sources
game.calculateTotalStats = function(player) {
    // Defensive: if player is not defined, return empty
    if (!player) return {};

    // Helper to format breakdown
    function breakdownRow(base, skill, relic, powerup) {
        let arr = [];
        if (base !== 0) arr.push(`Base: ${base}`);
        if (skill !== 0) arr.push(`Skill: ${skill > 0 ? '+' : ''}${skill}`);
        if (relic !== 0) arr.push(`Relic: ${relic > 0 ? '+' : ''}${relic}`);
        if (powerup !== 0) arr.push(`PowerUp: ${powerup > 0 ? '+' : ''}${powerup}`);
        return arr.join(', ');
    }

    // --- Base values ---
    let char = game.characters?.[game.selectedCharacterIndex] || {};
    let baseStats = char.stats || {};
    // --- Skill tree bonuses ---
    let skills = game.skills || {};
    // --- Relic bonuses ---
    let relicBonuses = { maxHealth: 0, damage: 0, speed: 0, fireRate: 0 };
    if (player.relics && Array.isArray(player.relics)) {
        for (let relic of player.relics) {
            // Example: each 'health' relic gives +10 maxHealth, etc. Customize as needed.
            if (relic.type === 'health') relicBonuses.maxHealth += 10;
            if (relic.type === 'damage') relicBonuses.damage += 2;
            if (relic.type === 'speed') relicBonuses.speed += 0.1;
            if (relic.type === 'firerate') relicBonuses.fireRate -= 20; // Lower fireRate = faster
        }
    }
    // --- Power-up bonuses (example, if you have a system for these) ---
    let powerupBonuses = { maxHealth: 0, damage: 0, speed: 0, fireRate: 0 };
    if (player.powerUps && Array.isArray(player.powerUps)) {
        for (let pu of player.powerUps) {
            if (pu.type === 'health') powerupBonuses.maxHealth += pu.value;
            if (pu.type === 'damage') powerupBonuses.damage += pu.value;
            if (pu.type === 'speed') powerupBonuses.speed += pu.value;
            if (pu.type === 'firerate') powerupBonuses.fireRate += pu.value;
        }
    }

    // --- Skill tree calculations (examples, adjust as needed) ---
    let skillMaxHp = (skills.maxhp1 || 0) * 10;
    let skillDamage = (skills.damage1 || 0) * 0.05 * (baseStats.damage || 0);
    let skillSpeed = (skills.speed1 || 0) * 0.05 * (baseStats.speed || 0);
    let skillFireRate = (skills.firerate1 || 0) * -0.05 * (baseStats.fireRate || 0);
    let skillRegen = (skills.regen || 0) * 0.25;
    let skillCrit = (skills.critchance || 0) * 0.03;
    let skillRange = (skills.projrange || 0) * 0.08 * (baseStats.range || 400);
    let skillLifesteal = (skills.vampiric || 0) * 0.02;
    let skillExtraDmg = (skills.bossdmg || 0) * 0.10 * (baseStats.damage || 0);

    // --- Calculate totals ---
    let stats = {
        'Max Health': {
            total: Math.round((baseStats.hp || 0) + skillMaxHp + relicBonuses.maxHealth + powerupBonuses.maxHealth),
            breakdown: breakdownRow(baseStats.hp || 0, skillMaxHp, relicBonuses.maxHealth, powerupBonuses.maxHealth)
        },
        'Damage': {
            total: Math.round((baseStats.damage || 0) + skillDamage + relicBonuses.damage + powerupBonuses.damage),
            breakdown: breakdownRow(baseStats.damage || 0, skillDamage, relicBonuses.damage, powerupBonuses.damage)
        },
        'Speed': {
            total: ((baseStats.speed || 0) + skillSpeed + relicBonuses.speed + powerupBonuses.speed).toFixed(2),
            breakdown: breakdownRow(baseStats.speed || 0, skillSpeed, relicBonuses.speed, powerupBonuses.speed)
        },
        'Fire Rate': {
            total: Math.round((baseStats.fireRate || 0) + skillFireRate + relicBonuses.fireRate + powerupBonuses.fireRate),
            breakdown: breakdownRow(baseStats.fireRate || 0, skillFireRate, relicBonuses.fireRate, powerupBonuses.fireRate)
        },
        'Regen': {
            total: ((player.regen || 0) + skillRegen).toFixed(2),
            breakdown: breakdownRow(player.regen || 0, skillRegen, 0, 0)
        },
        'Lifesteal': {
            total: ((player.vampiric || 0) + skillLifesteal).toFixed(2),
            breakdown: breakdownRow(player.vampiric || 0, skillLifesteal, 0, 0)
        },
        'Extra Damage': {
            total: ((player.bossDamageBonus ? (player.bossDamageBonus - 1) * 100 : 0) + (skillExtraDmg ? (skillExtraDmg / (baseStats.damage || 1)) * 100 : 0)).toFixed(1) + '%',
            breakdown: breakdownRow(player.bossDamageBonus ? (player.bossDamageBonus - 1) * 100 : 0, skillExtraDmg ? (skillExtraDmg / (baseStats.damage || 1)) * 100 : 0, 0, 0)
        },
        'Range': {
            total: ((player.projectileRange || baseStats.range || 400) + skillRange).toFixed(0),
            breakdown: breakdownRow(player.projectileRange || baseStats.range || 400, skillRange, 0, 0)
        },
        'Crit Chance': {
            total: (((player.critChance || 0) + skillCrit) * 100).toFixed(1) + '%',
            breakdown: breakdownRow((player.critChance || 0) * 100, skillCrit * 100, 0, 0)
        }
    };
    return stats;
};
// --- Controller Start/Select open menu/skill tree and activate UI nav ---
game._uiMenuOpen = false;
const origPollGamepad = game.pollGamepad;
game.pollGamepad = function() {
    const result = origPollGamepad.call(this) || {x:0,y:0};
    const gp = (navigator.getGamepads && navigator.getGamepads()[this.gamepadIndex]) || null;
    if (gp && !this.uiNav.active) {
        // Start (9) or Select/Back (8) opens menu/skill tree
        if ((gp.buttons[9]?.pressed || gp.buttons[8]?.pressed) && !this._uiMenuOpen) {
            if (document.getElementById('startScreen').style.display === 'flex' || document.getElementById('startScreen').style.display === '') {
                this.activateUiNav('#startScreen button, #startScreen .menu-btn, #characterSelectionContainer .character-option');
            } else if (document.getElementById('skillTreeScreen')?.style.display === 'flex') {
                this.activateUiNav('#skillGrid .skill-item');
            } else if (document.getElementById('hud')?.style.display === 'block') {
                // In gameplay, open pause menu or skill tree
                if (typeof this.showSkillTree === 'function') {
                    this.showSkillTree();
                }
            }
            this._uiMenuOpen = true;
        }
        if (!gp.buttons[9]?.pressed && !gp.buttons[8]?.pressed) this._uiMenuOpen = false;
    }
    return result;
};
// ==================== UI CONTROLLER NAVIGATION ====================
// UI navigation state
game.uiNav = {
    active: false, // true if navigating UI, false if in gameplay
    focusables: [], // Array of focusable elements
    index: 0, // Current focus index
    lastMove: 0, // Timestamp of last navigation
    moveDelay: 180, // ms between moves
};

// Activate UI navigation mode and set focusable elements
game.activateUiNav = function(focusSelector) {
    this.uiNav.active = true;
    this.uiNav.focusables = Array.from(document.querySelectorAll(focusSelector));
    this.uiNav.index = 0;
    this.uiNav.lastMove = 0;
    this.updateUiFocus();
};

// Deactivate UI navigation mode
game.deactivateUiNav = function() {
    this.uiNav.active = false;
    this.clearUiFocus();
};

// Update focus highlight
game.updateUiFocus = function() {
    this.uiNav.focusables.forEach((el, i) => {
        if (i === this.uiNav.index) {
            el.classList.add('ui-focused');
            el.focus && el.focus();
        } else {
            el.classList.remove('ui-focused');
        }
    });
};

// Clear all focus highlights
game.clearUiFocus = function() {
    this.uiNav.focusables.forEach(el => el.classList.remove('ui-focused'));
};

// Move focus (dir: -1 for up/left, 1 for down/right)
game.moveUiFocus = function(dir) {
    if (!this.uiNav.active || this.uiNav.focusables.length === 0) return;
    this.uiNav.index = (this.uiNav.index + dir + this.uiNav.focusables.length) % this.uiNav.focusables.length;
    this.updateUiFocus();
};

// Trigger click/activate on focused element
game.activateUiFocused = function() {
    if (!this.uiNav.active || !this.uiNav.focusables[this.uiNav.index]) return;
    this.uiNav.focusables[this.uiNav.index].click();
};

// Keyboard/gamepad UI navigation handler
window.addEventListener('keydown', function(e) {
    if (!game.uiNav.active) return;
    if (['ArrowUp','w'].includes(e.key)) { game.moveUiFocus(-1); e.preventDefault(); }
    if (['ArrowDown','s'].includes(e.key)) { game.moveUiFocus(1); e.preventDefault(); }
    if (['Enter',' '].includes(e.key)) { game.activateUiFocused(); e.preventDefault(); }
    if (['Escape','Backspace'].includes(e.key)) { game.deactivateUiNav(); e.preventDefault(); }
});

// Gamepad UI navigation polling (call in gameLoop)
game.pollUiGamepad = function() {
    if (!this.uiNav.active) return;
    const gp = (navigator.getGamepads && navigator.getGamepads()[this.gamepadIndex]) || null;
    if (!gp) return;
    const now = Date.now();
    // Up/Down (D-pad or left stick)
    let moved = false;
    if ((gp.buttons[12]?.pressed || gp.axes[1] < -0.5) && now - this.uiNav.lastMove > this.uiNav.moveDelay) {
        this.moveUiFocus(-1); this.uiNav.lastMove = now; moved = true;
    }
    if ((gp.buttons[13]?.pressed || gp.axes[1] > 0.5) && now - this.uiNav.lastMove > this.uiNav.moveDelay) {
        this.moveUiFocus(1); this.uiNav.lastMove = now; moved = true;
    }
    // A button (0) to activate
    if (gp.buttons[0]?.pressed && !this.uiNav._aPressed) {
        this.activateUiFocused();
        this.uiNav._aPressed = true;
    }
    if (!gp.buttons[0]?.pressed) this.uiNav._aPressed = false;
    // B button (1) to close/cancel
    if (gp.buttons[1]?.pressed && !this.uiNav._bPressed) {
        this.deactivateUiNav();
        // Try to close menu if available
        if (typeof this.hideSkillTree === 'function' && document.getElementById('skillTreeScreen')?.style.display === 'flex') {
            this.hideSkillTree();
        }
        if (typeof this.closeCursedChestUI === 'function' && document.querySelector('.cursed-chest-screen')) {
            this.closeCursedChestUI();
        }
        if (typeof this.closePowerUpUI === 'function' && document.querySelector('.powerup-screen')) {
            this.closePowerUpUI();
        }
        if (typeof this.closeClassSelect === 'function' && document.getElementById('classSelectScreen')?.style.display === 'flex') {
            this.closeClassSelect();
        }
        this.uiNav._bPressed = true;
    }
    if (!gp.buttons[1]?.pressed) this.uiNav._bPressed = false;

    // Skill tree scrolling with L/R triggers or bumpers
    if (document.getElementById('skillTreeScreen')?.style.display === 'flex') {
        // Left bumper (4) or trigger (6)
        if ((gp.buttons[4]?.pressed || gp.buttons[6]?.pressed) && !this.uiNav._lPressed) {
            const container = document.getElementById('skillGrid');
            if (container) container.scrollLeft -= 120;
            this.uiNav._lPressed = true;
        }
        if (!(gp.buttons[4]?.pressed || gp.buttons[6]?.pressed)) this.uiNav._lPressed = false;
        // Right bumper (5) or trigger (7)
        if ((gp.buttons[5]?.pressed || gp.buttons[7]?.pressed) && !this.uiNav._rPressed) {
            const container = document.getElementById('skillGrid');
            if (container) container.scrollLeft += 120;
            this.uiNav._rPressed = true;
        }
        if (!(gp.buttons[5]?.pressed || gp.buttons[7]?.pressed)) this.uiNav._rPressed = false;
    }
};


// Patch into gameLoop and add global UI/gamepad polling when not running
const origGameLoop = game.gameLoop;
game.gameLoop = function() {
    if (this.uiNav.active) this.pollUiGamepad();
    origGameLoop.call(this);
};

// UI/gamepad polling loop for when game is not running
function uiNavPollingLoop() {
    if (!game.running && game.uiNav.active) {
        game.pollUiGamepad();
    }
    requestAnimationFrame(uiNavPollingLoop);
}
uiNavPollingLoop();

// Add .ui-focused style (should be in CSS, but add here for demo)
const style = document.createElement('style');
style.textContent = `.ui-focused { outline: 3px solid #00ffcc !important; box-shadow: 0 0 8px #00ffcc !important; z-index: 10; }`;
document.head.appendChild(style);

// Example: Activate UI nav for skill tree when opened
const origShowSkillTree = game.showSkillTree;
game.showSkillTree = function() {
    origShowSkillTree.call(this);
    setTimeout(() => game.activateUiNav('#skillGrid .skill-item'), 50);
};
const origHideSkillTree = game.hideSkillTree;
game.hideSkillTree = function() {
    origHideSkillTree.call(this);
    game.deactivateUiNav();
};

// Example: Activate UI nav for main menu/start screen
const origUpdateStartScreen = game.updateStartScreen;
game.updateStartScreen = function() {
    origUpdateStartScreen.call(this);
    setTimeout(() => game.activateUiNav('#startScreen button, #startScreen .menu-btn, #characterSelectionContainer .character-option'), 50);
};

// Example: Activate UI nav for relic screen
const origShowRelicStorage = game.showRelicStorage;
game.showRelicStorage = function() {
    origShowRelicStorage.call(this);
    // Add Auto-Combine Relics button if not present
    const relicScreen = document.getElementById('relicScreen');
    if (relicScreen && !document.getElementById('autoCombineRelicsBtn')) {
        const relicBtn = document.createElement('button');
        relicBtn.className = 'button';
        relicBtn.id = 'autoCombineRelicsBtn';
        relicBtn.innerText = '🔄 Auto-Combine Relics';
        relicBtn.style.margin = '12px 0';
        relicBtn.onclick = function() { game.autoCombineAllRelics(); };
        relicScreen.insertBefore(relicBtn, relicScreen.firstChild);
    }
    setTimeout(() => game.activateUiNav('#relicScreen button, #relicScreen .relic-tab, #relicScreen .relic-filter'), 50);
};
const origHideRelicStorage = game.hideRelicStorage;
game.hideRelicStorage = function() {
    origHideRelicStorage.call(this);
    game.deactivateUiNav();
};

// Example: Cursed chest UI
const origShowCursedChestUI = game.showCursedChestUI;
game.showCursedChestUI = function(offerings) {
    origShowCursedChestUI.call(this, offerings);
    setTimeout(() => game.activateUiNav('.cursed-chest-screen .power-card, .cursed-chest-screen .button'), 50);
};
const origCloseCursedChestUI = game.closeCursedChestUI;
game.closeCursedChestUI = function() {
    origCloseCursedChestUI.call(this);
    game.deactivateUiNav();
};
// Controller navigation for power-up cards (generic power-up screen)
const origShowPowerUpUI = game.showPowerUpUI;
game.showPowerUpUI = function() {
    origShowPowerUpUI.call(this);
    setTimeout(() => game.activateUiNav('.powerup-screen .power-card, .powerup-screen .button'), 50);
};
const origClosePowerUpUI = game.closePowerUpUI;
game.closePowerUpUI = function() {
    origClosePowerUpUI.call(this);
    game.deactivateUiNav();
};
// Controller navigation for class select screen
const origShowClassSelect = game.showClassSelect;
game.showClassSelect = function() {
    origShowClassSelect.call(this);
    setTimeout(() => game.activateUiNav('#classSelectScreen .class-option, #classSelectScreen .button'), 50);
};
const origCloseClassSelect = game.closeClassSelect;
game.closeClassSelect = function() {
    origCloseClassSelect.call(this);
    game.deactivateUiNav();
};
game.initSkills = function() {
    this.skills = JSON.parse(localStorage.getItem('skills') || '{}');
};

game.updateSkillTreeUI = function() {
    const container = document.getElementById('skillGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!this.skillTree) return;

    this.skillTree.forEach(skill => {
        const currentLevel = this.skills[skill.id] || 0;
        const isMaxed = currentLevel >= skill.maxLevel;
        const canAfford = this.trueXp >= skill.cost;
        
        const div = document.createElement('div');
        div.className = 'skill-item';
        
        if (isMaxed) {
            div.classList.add('maxed');
        } else if (currentLevel > 0) {
            div.classList.add('unlocked');
        } else if (!canAfford) {
            div.classList.add('locked');
        }
        
        div.innerHTML = `
            <div class="skill-name">${skill.name}</div>
            <div class="skill-description">${skill.description}</div>
            <div class="skill-stats">${skill.stats || ''}</div>
            <div class="skill-footer">
                <span class="skill-level">Lvl ${currentLevel}/${skill.maxLevel}</span>
                <span class="skill-cost">${isMaxed ? '✓ MAX' : `${skill.cost} XP`}</span>
            </div>
        `;
        
        div.style.opacity = !canAfford && !isMaxed && currentLevel === 0 ? '0.6' : '1';
        div.onclick = () => {
            if (!isMaxed && canAfford) {
                game.purchaseSkill(skill);
            }
        };
        container.appendChild(div);
    });
    
    if (document.getElementById('skillPointsText')) {
        document.getElementById('skillPointsText').textContent = this.trueXp;
    }
    if (document.getElementById('startTrueXP')) {
        document.getElementById('startTrueXP').textContent = this.trueXp;
    }
    if (document.getElementById('startSkillsUnlocked')) {
        document.getElementById('startSkillsUnlocked').textContent = Object.keys(this.skills).length;
    }
};

game.purchaseSkill = function(skill) {
    const currentLevel = this.skills[skill.id] || 0;
    if (currentLevel < skill.maxLevel && this.trueXp >= skill.cost) {
        this.trueXp -= skill.cost;
        this.skills[skill.id] = currentLevel + 1;
        localStorage.setItem('skills', JSON.stringify(this.skills));
        localStorage.setItem('trueXp', this.trueXp);
        this.updateSkillTreeUI();
    }
};

game.showSkillTree = function() {
    document.getElementById('skillTreeScreen').style.display = 'flex';
    this.updateSkillTreeUI();
};

game.hideSkillTree = function() {
    document.getElementById('skillTreeScreen').style.display = 'none';
};

game.showSkillTreeFromStart = function() {
    this.showSkillTree();
};

game.restartFromSkillTree = function() {
    this.hideSkillTree();
    this.startGame();
};

game.restart = function() {
    this.running = false;
    this.mode = 'endless';
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('storyMapScreen').style.display = 'none';
    document.getElementById('objectiveHud').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    
    // Hide daily challenge HUD when returning to menu
    if (this.hideDailyChallengeHud) this.hideDailyChallengeHud();
    
    this.resetMusic();
    if (this.updateStartScreen) this.updateStartScreen();
};

game.confirmReset = function() {
    if(confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
        localStorage.clear();
        location.reload();
    }
};

game.updateStartScreen = function() {
    if (document.getElementById('startTrueXP')) {
        document.getElementById('startTrueXP').textContent = this.trueXp;
    }
    if (document.getElementById('startSkillsUnlocked')) {
        document.getElementById('startSkillsUnlocked').textContent = Object.keys(this.skills).length;
    }
};

game.init = function() {
    this.keys = {};
    this.paused = false;
    this.lastFrame = null;
    this.rerollsUsed = 0;
    
    // Load sprites if not already loaded
    if (!this.spritesLoaded && typeof this.loadSprites === 'function') {
        this.loadSprites();
    }
    
    // Reset game state variables to prevent crashes on restart
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.xpOrbs = [];
    this.bosses = [];
    this.zones = [];
    this.chests = [];
    this.damageNumbers = [];
    this.groundRelics = [];
    this.time = 0;
    this.kills = 0;
    this.xp = 0;
    this.xpNeeded = 10;
    this.nextBossTime = 30000;
    this.lastZoneSpawn = 0;
    this.isBossMusic = false;
    
    // Reset new systems
    this.screenShake = { intensity: 0, duration: 0 };
    if (this.resetRunStats) this.resetRunStats();
    
    // Reset events
    this.currentEvent = null;
    this.eventEndTime = 0;
    this.lastEventTime = 0;

    this.initSkills();
    if (this.initRelicSystem) this.initRelicSystem();
    this.createPlayer();
    
    // Initialize Summoner minions if playing Summoner
    if (this.initSummonerMinions) this.initSummonerMinions();
    
    this.setupControls();
    this.running = true;
    this.updateSkillTreeUI();
    this.updateStartScreen();
    document.getElementById('storyProgressDisplay').textContent = this.maxStoryLevel;
    this.gameLoop();
};

game.initCharacterSelection = function() {
    const container = document.getElementById('characterSelectionContainer');
    let html = '<div class="character-selection" style="display:grid; grid-template-columns:repeat(4, 1fr); grid-template-rows:repeat(2, 1fr); gap:18px; justify-items:center; align-items:center; width:100%; max-width:1200px; margin:auto;">';
    this.characters.forEach((char, index) => {
        const isUnlocked = this.isCharacterUnlocked ? this.isCharacterUnlocked(char.name) : true;
        const selectedClass = index === this.selectedCharacterIndex ? 'selected' : '';
        const lockedClass = !isUnlocked ? 'locked' : '';
        
        // Get unlock info
        const unlockInfo = this.characterUnlocks ? this.characterUnlocks[char.name] : null;
        const unlockDesc = unlockInfo && unlockInfo.description ? unlockInfo.description : '';
        
        const statsHtml = isUnlocked ? `
            <div style="font-size: 14px; color: #e0e0e0; margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; text-align: left; background: rgba(15,10,25,0.95); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-shadow: 0 2px 4px rgba(0,0,0,0.8); position: relative; z-index: 2;">
                <div>HP: <span style="color:#ff6666; font-weight:bold;">${char.stats.hp}</span></div>
                <div>SPD: <span style="color:#66ff66; font-weight:bold;">${char.stats.speed}</span></div>
                <div>DMG: <span style="color:#ffaa00; font-weight:bold;">${char.stats.damage}</span></div>
                <div>CD: <span style="color:#66ccff; font-weight:bold;">${char.stats.fireRate}</span></div>
            </div>` : `
            <div style="font-size: 12px; color: #ff6666; margin-top: 12px; background: rgba(15,10,25,0.95); padding: 10px; border-radius: 8px; position: relative; z-index: 2;">
                🔒 ${unlockDesc}
            </div>`;

        const premiumLabel = char.premium && isUnlocked ? `<div style="font-size: 12px; color: #ffd700; font-weight:bold; margin-top: 8px; text-shadow: 0 0 10px rgba(255,215,0,0.6); position: relative; z-index: 2; background: rgba(15,10,25,0.95); padding: 6px; border-radius: 6px;">⚜ PREMIUM ${char.cost} ⚜</div>` : '';

        // Class card split layout
        let bgStyle = '';
        let leftImage = '';
        let rightContent = '';
        let showImage = false;
        if (char.name === 'Necromancer' && isUnlocked) {
            leftImage = `<div style="flex:0 0 120px; width:120px; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #1a0a2a 60%, #2a1a3a 100%); border-radius:12px 0 0 12px; overflow:hidden; box-shadow: 0 0 16px 4px #000 inset;"><img src='Images/Necromancer.png' alt='Necromancer' style='width:auto; height:60%; max-width:80%; max-height:80%; object-fit:contain; filter:drop-shadow(0 0 16px #00ffcc);'/></div>`;
            showImage = true;
        }
        if (char.name === 'Summoner' && isUnlocked) {
            leftImage = `<div style="flex:0 0 120px; width:120px; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #1a0a2a 60%, #3a1a1a 100%); border-radius:12px 0 0 12px; overflow:hidden; box-shadow: 0 0 16px 4px #000 inset;"><img src='Images/summoner.png' alt='Summoner' style='width:auto; height:60%; max-width:80%; max-height:80%; object-fit:contain; filter:drop-shadow(0 0 16px #ffaa00);'/></div>`;
            showImage = true;
        }
        // Right content (name, desc, stats)
        rightContent = `
            <div style="flex:1 1 0; min-width:140px; max-width:320px; padding:16px 10px 10px 10px; display:flex; flex-direction:column; justify-content:flex-start; background:linear-gradient(135deg, #1a0a2a 80%, #2a1a3a 100%); border-radius:${showImage ? '0 12px 12px 0' : '12px'}; height:100%; box-sizing:border-box; box-shadow: 0 0 16px 4px #000 inset; overflow:hidden;">
                <div class="char-name" style="color: ${isUnlocked && (char.name==='Summoner'||char.name==='Necromancer') ? '#00ffd0' : isUnlocked ? '#00ffcc' : '#666'}; font-weight:bold; margin-bottom:8px; font-size: 1.1em; text-shadow: 0 0 16px #00ffd0, 0 2px 4px #000; letter-spacing: 1px; position: relative; z-index: 3; background: none; padding: 0; border-radius: 0; display: block; word-break:break-word;">${isUnlocked ? char.name : '???'}</div>
                <div class="char-desc" style="font-size: 0.7em; color: ${isUnlocked && (char.name==='Summoner'||char.name==='Necromancer') ? '#fff' : isUnlocked ? '#c8b8d8' : '#666'}; text-shadow: 0 2px 8px #000; line-height: 1.3; background: none; padding: 0; border-radius: 0; position: relative; z-index: 3; margin-bottom: 8px; word-break:break-word; white-space:normal;">${isUnlocked ? char.description : 'Character Locked'}</div>
                <div style="position:relative; z-index:3; margin-bottom:6px; font-size:0.7em;">${statsHtml}</div>
                ${premiumLabel}
            </div>
        `;
        
        const lockedOverlay = !isUnlocked ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); border-radius: 12px; z-index: 1;"></div>' : '';
        // Add data-index for event delegation
        html += `
            <div class="character-option ${selectedClass} ${lockedClass}" tabindex="0" data-index="${index}" style="display:flex; flex-direction:row; align-items:stretch; height:160px; min-width:220px; max-width:340px; margin:auto; box-sizing:border-box; ${!isUnlocked ? 'cursor: not-allowed; opacity: 0.7;' : ''}; overflow:hidden; background:none; border-radius:12px; position:relative; transition:box-shadow 0.3s; box-shadow: 0 0 16px 4px #00ffd0 inset, 0 0 16px 0px #000;">
                ${lockedOverlay}
                ${showImage ? leftImage : ''}
                ${rightContent}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;

    // Add event listeners for keyboard/controller selection
    container.querySelectorAll('.character-option').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.keyCode === 13 || e.keyCode === 32) && !el.classList.contains('locked')) {
                const idx = parseInt(el.getAttribute('data-index'));
                if (!isNaN(idx)) game.selectCharacter(idx);
            }
        });
        el.addEventListener('click', () => {
            if (!el.classList.contains('locked')) {
                const idx = parseInt(el.getAttribute('data-index'));
                if (!isNaN(idx)) game.selectCharacter(idx);
            }
        });
    });
};

game.selectCharacter = function(index) {
    // Only select if unlocked
    const char = this.characters[index];
    if (this.isCharacterUnlocked && !this.isCharacterUnlocked(char.name)) return;
    
    this.selectedCharacterIndex = index;
    this.initCharacterSelection(); // Re-render to update selection style
};

game.startGame = function() {
    try {
        console.log('Starting game...');
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('victoryScreen').style.display = 'none';
        document.getElementById('relicScreen').style.display = 'none';
        document.getElementById('hud').style.display = 'block';
        
        // Force init to ensure clean state (Fixes bug where game continues instead of resetting)
        this.running = false;
        this.init();
        
        // Initialize Daily Challenge HUD if in daily mode
        if (this.mode === 'daily' && this.initDailyChallengeHud) {
            this.initDailyChallengeHud();
        } else if (this.hideDailyChallengeHud) {
            this.hideDailyChallengeHud();
        }
        
        // Start music with user interaction
        this.playMusic();
        console.log('Game started successfully');
    } catch (e) {
        console.error('Error starting game:', e);
        alert('Error starting game: ' + e.message);
        document.getElementById('startScreen').style.display = 'flex';
    }
};

game.startStoryMode = function() {
    this.showStoryMap();
};

game.showStoryMap = function() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('storyMapScreen').style.display = 'flex';
    this.renderStoryMap();
};

game.hideStoryMap = function() {
    document.getElementById('storyMapScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
};

game.renderStoryMap = function() {
    const container = document.getElementById('storyMapPath');
    const maxLevel = this.maxStoryLevel || 1;

    // Update progress display
    document.getElementById('storyMapProgress').textContent = maxLevel - 1;

    // Zone configurations
    const zones = [
        { name: 'Forest', key: 'forest', start: 1, end: 10, color: '#00ff88', image: 'Images/DarkForest.png' },
        { name: 'Ice Realm', key: 'ice', start: 11, end: 20, color: '#66ccff', image: 'Images/IceMountains.png' },
        { name: 'Volcano', key: 'volcano', start: 21, end: 30, color: '#ff6633', image: null },
        { name: 'Demon Realm', key: 'demon', start: 31, end: 40, color: '#aa44ff', image: null },
        { name: 'Angel Sanctuary', key: 'angel', start: 41, end: 50, color: '#ffdd44', image: null },
        { name: 'The Void', key: 'void', start: 51, end: 60, color: '#ff00ff', image: null },
        { name: 'Crystal Caves', key: 'crystal', start: 61, end: 70, color: '#00ffff', image: null },
        { name: 'Ancient Ruins', key: 'ancient', start: 71, end: 80, color: '#ffaa00', image: null },
        { name: 'Shadow Realm', key: 'shadow', start: 81, end: 90, color: '#8844aa', image: null },
        { name: 'Divine Throne', key: 'divine', start: 91, end: 100, color: '#ffffff', image: null }
    ];

    let html = '';

    zones.forEach((zone, zoneIndex) => {
        // Zone container with optional background image
        const bgStyle = zone.image ? `background-image: url('${zone.image}');` : '';
        html += `
            <div class="story-zone-container zone-${zone.key}" style="--zone-color: ${zone.color}; ${bgStyle}">
                <div class="story-zone-overlay"></div>
                <div class="story-zone-divider">
                    <span class="story-zone-name">${zone.name}</span>
                </div>
                <div class="story-zone-levels">
        `;

        // Generate levels for this zone
        for (let level = zone.start; level <= zone.end; level++) {
            const isUnlocked = level < maxLevel;
            const isCurrent = level === maxLevel;
            const isLocked = level > maxLevel;
            const isBoss = level % 10 === 0;
            const isCompleted = level < maxLevel;

            // Calculate row position (zigzag pattern)
            const levelInZone = level - zone.start;
            const row = Math.floor(levelInZone / 3);
            const posInRow = levelInZone % 3;
            const isEvenRow = row % 2 === 0;

            let position;
            if (posInRow === 0) position = isEvenRow ? 'left' : 'right';
            else if (posInRow === 1) position = 'center';
            else position = isEvenRow ? 'right' : 'left';

            // Build classes
            let classes = 'story-level-node';
            if (isUnlocked) classes += ' unlocked';
            if (isCurrent) classes += ' current';
            if (isLocked) classes += ' locked';
            if (isBoss) classes += ' boss';
            if (isCompleted) classes += ' completed';

            const onClick = isLocked ? '' : `onclick="game.selectStoryLevel(${level})"`;

            html += `
                <div class="story-level-row ${position}">
                    <div class="${classes}" ${onClick} style="--zone-color: ${zone.color}">
                        <span>${level}</span>
                    </div>
                </div>
            `;
        }
        
        // Close zone container
        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Scroll to current level
    setTimeout(() => {
        const currentNode = container.querySelector('.story-level-node.current');
        if (currentNode) {
            currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
};

game.selectStoryLevel = function(level) {
    this.mode = 'story';
    this.storyLevel = level;
    document.getElementById('storyMapScreen').style.display = 'none';
    this.startGame();
};

game.nextStoryLevel = function() {
    this.storyLevel++;
    if (this.storyLevel > 100) {
        alert("🎉 Congratulations! You have completed ALL 100 story levels! You are a true survivor!");
        this.restart();
        return;
    }
    this.startGame();
};

game.backToStoryMap = function() {
    this.running = false;
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('objectiveHud').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    this.resetMusic();
    this.showStoryMap();
};

game.getStoryConfig = function() {
    const level = this.storyLevel;
    
    // Determine zone based on level (10 zones, 10 levels each)
    let zoneKey = 'forest';
    if (level > 10) zoneKey = 'ice';
    if (level > 20) zoneKey = 'volcano';
    if (level > 30) zoneKey = 'demon';
    if (level > 40) zoneKey = 'angel';
    // Extended zones (51-100) cycle back with harder variants
    if (level > 50) zoneKey = 'demon';   // The Void uses demon theme
    if (level > 60) zoneKey = 'ice';     // Crystal Caves uses ice theme
    if (level > 70) zoneKey = 'volcano'; // Ancient Ruins uses volcano theme
    if (level > 80) zoneKey = 'angel';   // Shadow Realm uses angel theme
    if (level > 90) zoneKey = 'demon';   // Divine Throne uses demon theme

    // Get zone names for display
    const zoneNames = {
        1: 'Forest', 11: 'Ice Realm', 21: 'Volcano', 31: 'Demon Realm', 41: 'Angel Sanctuary',
        51: 'The Void', 61: 'Crystal Caves', 71: 'Ancient Ruins', 81: 'Shadow Realm', 91: 'Divine Throne'
    };
    const zoneBracket = Math.floor((level - 1) / 10) * 10 + 1;
    const displayName = zoneNames[zoneBracket] || 'Unknown';
    
    // Calculate kill requirements based on level
    // Base: 200 enemies, increases by 50 per level, capped at reasonable values
    const baseEnemies = (20 + (level * 5)) * 10;
    const enemiesRequired = Math.min(baseEnemies, 3000);
    
    // Boss levels (every 10th level) require killing a boss
    const isBossLevel = level % 10 === 0;
    const bossesRequired = isBossLevel ? 1 : 0;
    
    return {
        zone: zoneKey,
        name: displayName,
        enemiesRequired: enemiesRequired,
        bossesRequired: bossesRequired,
        isBossLevel: isBossLevel,
        ...this.zoneConfig[zoneKey]
    };
};

game.levelComplete = function() {
    this.running = false;
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    // Hide objective HUD
    document.getElementById('objectiveHud').style.display = 'none';

    // Save progress
    if (this.storyLevel >= this.maxStoryLevel) {
        this.maxStoryLevel = this.storyLevel + 1;
        localStorage.setItem('maxStoryLevel', this.maxStoryLevel);
    }

    // Calculate True XP bonus
    const xpBonus = 1 + ((this.skills.truexp || 0) * 0.15);
    const trueXpGained = Math.floor((this.kills * 0.25 + this.level * 2) * xpBonus);
    this.trueXp += trueXpGained;
    localStorage.setItem('trueXp', this.trueXp);

    // Update victory screen stats
    const config = this.getStoryConfig();
    const minutes = Math.floor(this.time / 60000);
    const seconds = Math.floor((this.time % 60000) / 1000).toString().padStart(2, '0');
    
    document.getElementById('victoryLevel').textContent = this.storyLevel;
    document.getElementById('victoryZone').textContent = config.name;
    document.getElementById('victoryTime').textContent = `${minutes}:${seconds}`;
    document.getElementById('victoryKills').textContent = this.kills;
    document.getElementById('victoryBosses').textContent = this.storyBossesKilled || 0;
    document.getElementById('victoryPlayerLevel').textContent = this.level;
    document.getElementById('victoryXp').textContent = trueXpGained;
    
    document.getElementById('hud').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'flex';
    
    this.resetMusic();
};

// Update Objective HUD for Story Mode
game.updateObjectiveHUD = function() {
    const objectiveHud = document.getElementById('objectiveHud');
    if (!objectiveHud) return;
    
    if (this.mode !== 'story') {
        objectiveHud.style.display = 'none';
        return;
    }
    
    objectiveHud.style.display = 'block';
    
    // Update enemy progress
    const enemiesKilled = Math.min(this.storyEnemiesKilled || 0, this.storyEnemiesRequired || 1);
    const enemiesTotal = this.storyEnemiesRequired || 1;
    const enemiesPercent = (enemiesKilled / enemiesTotal) * 100;
    
    document.getElementById('objectiveEnemiesCount').textContent = enemiesKilled;
    document.getElementById('objectiveEnemiesTotal').textContent = enemiesTotal;
    document.getElementById('objectiveEnemiesBar').style.width = `${Math.min(enemiesPercent, 100)}%`;
    
    // Update boss progress (only show on boss levels)
    const bossItem = document.getElementById('objectiveBosses');
    if (this.storyBossesRequired > 0) {
        bossItem.style.display = 'block';
        const bossesKilled = Math.min(this.storyBossesKilled || 0, this.storyBossesRequired);
        const bossesTotal = this.storyBossesRequired;
        const bossesPercent = (bossesKilled / bossesTotal) * 100;
        
        document.getElementById('objectiveBossesCount').textContent = bossesKilled;
        document.getElementById('objectiveBossesTotal').textContent = bossesTotal;
        document.getElementById('objectiveBossesBar').style.width = `${Math.min(bossesPercent, 100)}%`;
    } else {
        bossItem.style.display = 'none';
    }
};

game.gameOver = function() {
    // Handle Revival Skill
    if (this.player.hasRevive && !this.player.usedRevive) {
        this.player.usedRevive = true;
        this.player.health = this.player.maxHealth * 0.5; // Revive with 50% HP
        this.player.invulnerable = 3000; // 3 seconds of invulnerability
        this.createExplosion(this.player.x, this.player.y, '#ffff00'); // Visual effect for revive
        return; // Don't end the game
    }

    this.running = false;
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    // Calculate True XP
    const xpBonus = 1 + ((this.skills.truexp || 0) * 0.15);
    const trueXpGained = Math.floor((this.kills * 0.1 + this.level * 0.5) * xpBonus);
    this.trueXp += trueXpGained;
    localStorage.setItem('trueXp', this.trueXp);

    // Update Game Over Screen
    const minutes = Math.floor(this.time / 60000);
    const seconds = Math.floor((this.time % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('finalTime').textContent = `${minutes}:${seconds}`;
    document.getElementById('finalKills').textContent = this.kills;
    document.getElementById('finalLevel').textContent = this.level;
    document.getElementById('trueXpGained').textContent = trueXpGained;

    // Show Screen
    document.getElementById('hud').style.display = 'none';
    document.getElementById('bossHealthContainer').style.display = 'none';
    document.getElementById('objectiveHud').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    // Hide daily challenge HUD
    if (this.hideDailyChallengeHud) this.hideDailyChallengeHud();
    
    // Show/hide story map button based on mode
    const storyMapBtn = document.getElementById('storyMapBtn');
    if (storyMapBtn) {
        storyMapBtn.style.display = this.mode === 'story' ? 'inline-block' : 'none';
    }
    
    // Save bestiary and show run stats
    if (this.saveBestiary) this.saveBestiary();
    if (this.showRunStats) this.showRunStats();
    if (this.checkAchievements) this.checkAchievements();
    if (this.updateTotalStats) this.updateTotalStats();
    
    // Save to leaderboard (endless mode only)
    if (this.saveLeaderboardEntry) this.saveLeaderboardEntry();
    
    // Save run to history
    if (this.saveRunToHistory) this.saveRunToHistory();
    
    this.resetMusic();
};

game.retryLevel = function() {
    // Hide game over screen before retrying
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('objectiveHud').style.display = 'none';
    // Retry the current level (works for both story and endless modes)
    this.startGame();
};

game.update = function(deltaTime) {
    if (!this.running || this.paused) return;
    
    this.time += deltaTime;

    // Check Story Mode Win Condition (kill-based)
    if (this.mode === 'story') {
        const enemiesComplete = this.storyEnemiesKilled >= this.storyEnemiesRequired;
        const bossesComplete = this.storyBossesKilled >= this.storyBossesRequired;
        
        if (enemiesComplete && bossesComplete) {
            this.levelComplete();
            return;
        }
        
        // Update objective HUD
        this.updateObjectiveHUD();
    }
    
    // Update Daily Challenge Progress HUD
    if (this.mode === 'daily' && this.updateDailyChallengeHud) {
        this.updateDailyChallengeHud();
    }

    // Check for player death
    if (this.player.health <= 0) {
        this.gameOver();
        return;
    }

    this.updatePlayer(deltaTime);
    this.updateEnemies(deltaTime);
    this.updateBosses(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updateParticles(deltaTime);
    this.updateXpOrbs(deltaTime);
    this.updateZones(deltaTime);
    this.updateChests(deltaTime);
    this.updateNecromancerMinions(deltaTime);
    
    // Update Summoner minions
    if (this.updateSummonerMinions) this.updateSummonerMinions(deltaTime);
    
    // Update events (swarm, etc.)
    if (this.updateEvents) this.updateEvents(deltaTime);
    
    // Update player animation
    if (this.updatePlayerAnimation) this.updatePlayerAnimation(deltaTime);
    
    // Update ground relics
    if (this.updateGroundRelics) this.updateGroundRelics(deltaTime);
    
    // Update new systems
    if (this.updateScreenShake) this.updateScreenShake(deltaTime);
    if (this.updateDamageNumbers) this.updateDamageNumbers(deltaTime);
    
    this.spawnEnemies();
    this.checkBossSpawn();
    this.spawnZones(deltaTime);
    this.autoShoot(deltaTime);
    this.checkCollisions();
    this.updateHUD();
    
    // Check cursed chest spawn
    if (this.checkCursedChestSpawn) this.checkCursedChestSpawn();
    
    // Check achievements periodically
    if (this.checkAchievements && this.time % 5000 < deltaTime) {
        this.checkAchievements();
    }
};

game.gameLoop = function() {
    if (!this.running) {
        // Stop the loop if game is not running
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        return;
    }
    
    try {
        const now = Date.now();
        const deltaTime = now - (this.lastFrame || now);
        this.lastFrame = now;
        
        this.update(deltaTime);
        this.draw();
    } catch (e) {
        console.error('Error in game loop:', e);
        console.error('Stack:', e.stack);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
};

// Initialize start screen
game.initSkills(); // Load skills immediately so UI works
game.trueXp = parseInt(localStorage.getItem('trueXp') || '0'); // Load True XP
game.updateStartScreen();
game.initCharacterSelection();

// Initialize daily challenge banner
if (game.updateDailyBanner) game.updateDailyBanner();

// Set initial music volume
const bgMusic = document.getElementById('bgMusic');

// Initialize audio elements - ensure they can play
bgMusic.muted = false;
document.getElementById('bgMusic2').muted = false;
document.getElementById('bossMusic').muted = false;
document.getElementById('bossMusic2').muted = false;

// Load saved volumes
const savedMasterVolume = localStorage.getItem('masterVolume');
const savedMusicVolume = localStorage.getItem('musicVolume');
const savedSfxVolume = localStorage.getItem('sfxVolume');

// Initialize master volume
if (savedMasterVolume !== null) {
    const vol = parseInt(savedMasterVolume);
    game.masterVolume = vol / 100;
    if (document.getElementById('masterVolumeSlider')) {
        document.getElementById('masterVolumeSlider').value = vol;
    }
    if (document.getElementById('volumeSlider')) {
        document.getElementById('volumeSlider').value = vol;
    }
} else {
    game.masterVolume = 0.5;
}

// Initialize music volume
if (savedMusicVolume !== null) {
    const vol = parseInt(savedMusicVolume);
    if (document.getElementById('musicVolumeSlider')) {
        document.getElementById('musicVolumeSlider').value = vol;
    }
    game.musicVolume = Math.min(vol / 100 * 2.5, 1.0);
} else {
    game.musicVolume = 1.0;
}

// Apply effective volume (master * music)
bgMusic.volume = game.musicVolume * game.masterVolume;

if (savedMasterVolume !== null && parseInt(savedMasterVolume) === 0) {
    document.getElementById('muteButton').textContent = '🔇';
}

if (savedSfxVolume !== null) {
    const vol = parseInt(savedSfxVolume);
    game.sfxVolume = Math.min(vol / 100 * 2.5, 1.0);
    if (document.getElementById('sfxVolumeSlider')) {
        document.getElementById('sfxVolumeSlider').value = vol;
    }
} else {
    game.sfxVolume = 1.0;
}

// Setup audio element error handlers to debug loading issues
const audioElements = [bgMusic, document.getElementById('bgMusic2'), 
                      document.getElementById('bossMusic'), 
                      document.getElementById('bossMusic2')];

audioElements.forEach((audio, idx) => {
    audio.addEventListener('canplay', () => {
        console.log(`Audio ${idx} loaded successfully`);
    });
    audio.addEventListener('error', (e) => {
        console.error(`Audio ${idx} failed to load:`, e, 'Source:', audio.src);
    });
    audio.addEventListener('play', () => {
        console.log(`Audio ${idx} started playing`);
    });
});

// Prevent right-click context menu
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

// Pause button setup
document.getElementById('pauseButton').addEventListener('click', () => {
    game.togglePause();
});

// Prevent zoom on double-tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Keep map size consistent
window.addEventListener('resize', () => {
    canvas.width = 1920;
    canvas.height = 1080;
});

// Trigger resize on orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
});
