game.playMusic = function() {
    // Load track preferences
    const savedNormalTrack = localStorage.getItem('selectedNormalTrack') || 'endless';
    const savedBossTrack = localStorage.getItem('selectedBossTrack') || 'crimson';
    this.selectedNormalTrack = savedNormalTrack;
    this.selectedBossTrack = savedBossTrack;
    
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    const bossMusic = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    const selectedMusic = this.selectedNormalTrack === 'endless' ? music1 : music2;
    
    selectedMusic.volume = this.masterVolume;
    selectedMusic.muted = false;
    
    // Stop all music (both normal and boss)
    music1.pause();
    music2.pause();
    bossMusic.pause();
    bossMusic2.pause();
    music1.currentTime = 0;
    music2.currentTime = 0;
    bossMusic.currentTime = 0;
    bossMusic2.currentTime = 0;
    
    console.log('Attempting to play music...', this.selectedNormalTrack);
    console.log('Music volume:', selectedMusic.volume, 'Muted:', selectedMusic.muted);
    
    try {
        const playPromise = selectedMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Music started successfully');
                // Setup track switching
                music1.onended = () => this.switchMusic();
                music2.onended = () => this.switchMusic();
                this.updateNowPlayingDisplay();
            }).catch(error => {
                console.log('Autoplay blocked by browser:', error.name);
                // Set up to play on next click
                const playOnClick = () => {
                    console.log('Playing music on user interaction');
                    selectedMusic.muted = false;
                    selectedMusic.volume = this.masterVolume;
                    const p = selectedMusic.play();
                    if (p !== undefined) {
                        p.then(() => {
                            music1.onended = () => this.switchMusic();
                            music2.onended = () => this.switchMusic();
                            this.updateNowPlayingDisplay();
                            document.removeEventListener('click', playOnClick);
                            document.removeEventListener('keydown', playOnClick);
                            document.removeEventListener('touchstart', playOnClick);
                        }).catch(e => console.log('Play failed:', e));
                    }
                };
                // Listen for any user interaction
                document.addEventListener('click', playOnClick);
                document.addEventListener('keydown', playOnClick);
                document.addEventListener('touchstart', playOnClick);
                
                // Show play button as fallback
                const button = document.getElementById('muteButton');
                button.style.background = 'linear-gradient(135deg, #ff3366, #ff6699)';
                button.textContent = '▶️';
                button.style.cursor = 'pointer';
                button.onclick = (e) => {
                    e.stopPropagation();
                    selectedMusic.muted = false;
                    selectedMusic.play();
                    button.textContent = '🔊';
                    button.style.background = 'none';
                    button.onclick = () => game.toggleMute();
                    music1.onended = () => game.switchMusic();
                    music2.onended = () => game.switchMusic();
                    this.updateNowPlayingDisplay();
                    document.removeEventListener('click', playOnClick);
                    document.removeEventListener('keydown', playOnClick);
                    document.removeEventListener('touchstart', playOnClick);
                };
            });
        } else {
            // For older browsers without Promise support
            selectedMusic.play();
            this.updateNowPlayingDisplay();
        }
    } catch (e) {
        console.log('Error trying to play music:', e);
    }
};

game.switchMusic = function() {
    // Stop all normal music
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    music1.pause();
    music2.pause();
    
    // Play the selected track
    const selectedTrack = this.selectedNormalTrack === 'endless' ? music1 : music2;
    selectedTrack.volume = this.masterVolume;
    selectedTrack.currentTime = 0;
    
    selectedTrack.play().catch(e => console.log('Music switch failed:', e));
    
    // Update current track indicator
    this.currentMusicTrack = this.selectedNormalTrack === 'endless' ? 1 : 2;
    this.updateNowPlayingDisplay();
};

game.togglePause = function() {
    this.paused = !this.paused;
    const btn = document.getElementById('pauseButton');
    const screen = document.getElementById('pauseScreen');
    
    if (this.paused) {
        btn.textContent = '▶';
        screen.style.display = 'flex';
        
        // Update pause screen stats
        document.getElementById('pauseLevel').textContent = this.level;
        document.getElementById('pauseXP').textContent = Math.floor(this.xp);
        document.getElementById('pauseXPNeeded').textContent = this.xpNeeded;
        const pct = this.xpNeeded > 0 ? Math.min(100, (this.xp / this.xpNeeded) * 100) : 0;
        document.getElementById('pauseXPBar').style.width = `${pct}%`;
    } else {
        btn.textContent = '⏸';
        screen.style.display = 'none';
    }
};

game.toggleMute = function() {
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    const bossMusic1 = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    const button = document.getElementById('muteButton');
    
    // Check any audio element to determine current mute state
    const isMuted = music1.muted;
    
    if (isMuted) {
        music1.muted = false;
        music2.muted = false;
        bossMusic1.muted = false;
        bossMusic2.muted = false;
        button.textContent = '🔊';
    } else {
        music1.muted = true;
        music2.muted = true;
        bossMusic1.muted = true;
        bossMusic2.muted = true;
        button.textContent = '🔇';
    }
};

game.setVolume = function(value) {
    // Alias for setMasterVolume for backward compatibility
    this.setMasterVolume(value);
};

game.setMasterVolume = function(value) {
    // Save master volume preference
    localStorage.setItem('masterVolume', value);
    
    // Sync master volume slider
    if (document.getElementById('masterVolumeSlider')) {
        document.getElementById('masterVolumeSlider').value = value;
    }
    if (document.getElementById('volumeSlider')) {
        document.getElementById('volumeSlider').value = value;
    }
    if (document.getElementById('menuVolumeSlider')) {
        document.getElementById('menuVolumeSlider').value = value;
    }
    
    // Store the master volume (0-1 range)
    this.masterVolume = value / 100;
    
    // Apply master volume to currently playing music
    this.applyMasterVolume();
};

game.applyMasterVolume = function() {
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    const bossMusic = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    
    const effectiveMusicVol = this.musicVolume * this.masterVolume;
    
    // Apply to whichever music is playing
    if (this.isBossMusic) {
        const activeBossMusic = this.selectedBossTrack === 'crimson' ? bossMusic : bossMusic2;
        music1.volume = 0;
        music2.volume = 0;
        bossMusic.volume = bossMusic === activeBossMusic ? effectiveMusicVol : 0;
        bossMusic2.volume = bossMusic2 === activeBossMusic ? effectiveMusicVol : 0;
    } else {
        const activeMusic = this.selectedNormalTrack === 'endless' ? music1 : music2;
        music1.volume = music1 === activeMusic ? effectiveMusicVol : 0;
        music2.volume = music2 === activeMusic ? effectiveMusicVol : 0;
        bossMusic.volume = 0;
        bossMusic2.volume = 0;
    }
};

game.setMusicVolume = function(value) {
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    const bossMusic = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    
    // Save volume preference
    localStorage.setItem('musicVolume', value);
    localStorage.setItem('gameVolume', value); // Keep for backward compatibility
    
    // Sync music volume slider
    if (document.getElementById('musicVolumeSlider')) {
        document.getElementById('musicVolumeSlider').value = value;
    }
    
    // Store the music volume (cap at 1.0 for maximum)
    this.musicVolume = Math.min(value / 100 * 2.5, 1.0);
    
    // Apply volumes with master volume scaling
    this.applyMasterVolume();
    
    // Auto-play music if user interacts with volume slider
    if (!this.isBossMusic && music1.paused && music2.paused) {
        const selectedMusic = this.selectedNormalTrack === 'endless' ? music1 : music2;
        selectedMusic.play().catch(e => console.log('Music play failed on volume change:', e));
    }
    
    // Update mute button if volume is 0
    const button = document.getElementById('muteButton');
    if (value == 0) {
        button.textContent = '🔇';
    } else if (!music1.muted && !bossMusic.muted && !bossMusic2.muted) {
        button.textContent = '🔊';
    }
};

game.setSfxVolume = function(value) {
    // Save SFX volume preference
    localStorage.setItem('sfxVolume', value);
    
    // Sync SFX volume slider
    if (document.getElementById('sfxVolumeSlider')) {
        document.getElementById('sfxVolumeSlider').value = value;
    }
    
    // Store the SFX volume (cap at 1.0 for maximum)
    this.sfxVolume = Math.min(value / 100 * 2.5, 1.0);
};

game.showAudioSettings = function() {
    // Sync slider values with current volumes
    const musicSliderValue = Math.round((this.musicVolume / 2.5) * 100);
    const sfxSliderValue = Math.round((this.sfxVolume / 2.5) * 100);
    const masterSliderValue = Math.round((this.masterVolume || 0.5) * 100);
    
    if (document.getElementById('masterVolumeSlider')) {
        document.getElementById('masterVolumeSlider').value = masterSliderValue;
    }
    if (document.getElementById('musicVolumeSlider')) {
        document.getElementById('musicVolumeSlider').value = musicSliderValue;
    }
    if (document.getElementById('sfxVolumeSlider')) {
        document.getElementById('sfxVolumeSlider').value = sfxSliderValue;
    }
    
    // Sync track selection buttons
    const trackButtons = ['audio-track-endless', 'audio-track-chill', 'audio-track-crimson', 'audio-track-endless-boss'];
    trackButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    
    if (this.selectedNormalTrack === 'endless') {
        const btn = document.getElementById('audio-track-endless');
        if (btn) btn.classList.add('active');
    } else {
        const btn = document.getElementById('audio-track-chill');
        if (btn) btn.classList.add('active');
    }
    
    if (this.selectedBossTrack === 'crimson') {
        const btn = document.getElementById('audio-track-crimson');
        if (btn) btn.classList.add('active');
    } else {
        const btn = document.getElementById('audio-track-endless-boss');
        if (btn) btn.classList.add('active');
    }
    
    this.updateNowPlayingDisplay();
    document.getElementById('audioSettingsScreen').style.display = 'flex';
};

game.hideAudioSettings = function() {
    document.getElementById('audioSettingsScreen').style.display = 'none';
};

game.testSfx = function() {
    const sound = document.getElementById('shootSound');
    if (sound) {
        const clone = sound.cloneNode(true);
        clone.volume = this.sfxVolume * this.masterVolume * 0.5;
        clone.play().catch(e => {});
    }
};

game.transitionToBossMusic = function() {
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    const activeBgMusic = this.selectedNormalTrack === 'endless' ? music1 : music2;
    const bossMusic = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    const selectedBossMusic = this.selectedBossTrack === 'crimson' ? bossMusic : bossMusic2;
    
    if (this.isBossMusic) return; // Already playing boss music
    
    if (this.musicFadeInterval) clearInterval(this.musicFadeInterval);
    
    // Preserve muted state
    const wasMuted = music1.muted;
    
    this.isBossMusic = true;
    const effectiveMusicVol = this.musicVolume * this.masterVolume;
    
    // Stop normal music
    music1.pause();
    music2.pause();
    
    // Start boss music at 0 volume, preserving muted state
    selectedBossMusic.volume = 0;
    selectedBossMusic.currentTime = 0;
    selectedBossMusic.muted = wasMuted;
    bossMusic.muted = wasMuted;
    bossMusic2.muted = wasMuted;
    selectedBossMusic.play().catch(e => console.log('Boss music play failed:', e));
    
    // Crossfade over 2 seconds
    const fadeSteps = 40;
    const fadeInterval = 2000 / fadeSteps;
    let step = 0;
    
    this.musicFadeInterval = setInterval(() => {
        step++;
        const progress = step / fadeSteps;
        
        activeBgMusic.volume = effectiveMusicVol * (1 - progress);
        selectedBossMusic.volume = effectiveMusicVol * progress;
        
        if (step >= fadeSteps) {
            clearInterval(this.musicFadeInterval);
            this.musicFadeInterval = null;
            activeBgMusic.pause();
            this.updateNowPlayingDisplay();
        }
    }, fadeInterval);
};

game.transitionToNormalMusic = function() {
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    const activeBgMusic = this.selectedNormalTrack === 'endless' ? music1 : music2;
    const bossMusic = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    const selectedBossMusic = this.selectedBossTrack === 'crimson' ? bossMusic : bossMusic2;
    
    if (!this.isBossMusic) return; // Already playing normal music
    
    if (this.musicFadeInterval) clearInterval(this.musicFadeInterval);
    
    // Preserve muted state
    const wasMuted = bossMusic.muted;
    
    this.isBossMusic = false;
    const masterVol = this.masterVolume || 0.5;
    
    // Resume normal music at 0 volume, preserving muted state
    activeBgMusic.volume = 0;
    activeBgMusic.muted = wasMuted;
    music1.muted = wasMuted;
    music2.muted = wasMuted;
    activeBgMusic.play().catch(e => console.log('Normal music play failed:', e));
    
    // Crossfade over 2 seconds
    const fadeSteps = 40;
    const fadeInterval = 2000 / fadeSteps;
    let step = 0;
    
    this.musicFadeInterval = setInterval(() => {
        step++;
        const progress = step / fadeSteps;
        
        selectedBossMusic.volume = masterVol * (1 - progress);
        activeBgMusic.volume = masterVol * progress;
        
        if (step >= fadeSteps) {
            clearInterval(this.musicFadeInterval);
            this.musicFadeInterval = null;
            selectedBossMusic.pause();
            this.updateNowPlayingDisplay();
        }
    }, fadeInterval);
};

game.resetMusic = function() {
    if (this.musicFadeInterval) {
        clearInterval(this.musicFadeInterval);
        this.musicFadeInterval = null;
    }
    
    this.isBossMusic = false;
    
    const bossMusic = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    const music1 = document.getElementById('bgMusic');
    const music2 = document.getElementById('bgMusic2');
    
    bossMusic.pause();
    bossMusic.currentTime = 0;
    bossMusic2.pause();
    bossMusic2.currentTime = 0;
    
    // Reset to track 1 for menu/restart
    this.currentMusicTrack = 1;
    this.currentBossMusicTrack = 1;
    music1.currentTime = 0;
    music2.pause();
    music2.currentTime = 0;
    
    // Reset volumes using the actual slider value to preserve user's setting
    const sliderValue = document.getElementById('volumeSlider').value;
    this.setVolume(sliderValue);
    
    // Ensure music 1 is playing
    if (music1.paused) {
        music1.play().catch(e => console.log("Music play failed", e));
    }
};

game.showMusicSelector = function() {
    // Update button states
    document.getElementById('track-endless').classList.remove('active');
    document.getElementById('track-chill').classList.remove('active');
    document.getElementById('track-crimson').classList.remove('active');
    document.getElementById('track-endless-boss').classList.remove('active');
    
    if (this.selectedNormalTrack === 'endless') {
        document.getElementById('track-endless').classList.add('active');
    } else {
        document.getElementById('track-chill').classList.add('active');
    }
    
    if (this.selectedBossTrack === 'crimson') {
        document.getElementById('track-crimson').classList.add('active');
    } else {
        document.getElementById('track-endless-boss').classList.add('active');
    }
    
    this.updateNowPlayingDisplay();
    document.getElementById('musicSelectorScreen').style.display = 'flex';
};

game.hideMusicSelector = function() {
    document.getElementById('musicSelectorScreen').style.display = 'none';
};

game.selectNormalTrack = function(track) {
    this.selectedNormalTrack = track;
    
    // Update UI buttons (support both old and new IDs)
    const oldIds = ['track-endless', 'track-chill'];
    const newIds = ['audio-track-endless', 'audio-track-chill'];
    [...oldIds, ...newIds].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    
    if (track === 'endless') {
        ['track-endless', 'audio-track-endless'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('active');
        });
        this.currentMusicTrack = 1;
        this.switchToTrack(document.getElementById('bgMusic'));
    } else if (track === 'chill') {
        ['track-chill', 'audio-track-chill'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('active');
        });
        this.currentMusicTrack = 2;
        this.switchToTrack(document.getElementById('bgMusic2'));
    }
    
    this.updateNowPlayingDisplay();
    
    // Save preference
    localStorage.setItem('selectedNormalTrack', track);
};

game.selectBossTrack = function(track) {
    this.selectedBossTrack = track;
    
    // Update UI buttons (support both old and new IDs)
    const oldIds = ['track-crimson', 'track-endless-boss'];
    const newIds = ['audio-track-crimson', 'audio-track-endless-boss'];
    [...oldIds, ...newIds].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    
    if (track === 'crimson') {
        ['track-crimson', 'audio-track-crimson'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('active');
        });
        this.currentBossMusicTrack = 1;
    } else if (track === 'endless-boss') {
        ['track-endless-boss', 'audio-track-endless-boss'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('active');
        });
        this.currentBossMusicTrack = 2;
    }
    
    // If boss music is playing, switch to the new track
    if (this.isBossMusic) {
        const newBossMusic = this.currentBossMusicTrack === 1 ? 
            document.getElementById('bossMusic') : 
            document.getElementById('bossMusic2');
        this.switchToTrack(newBossMusic);
    }
    
    this.updateNowPlayingDisplay();
    
    // Save preference
    localStorage.setItem('selectedBossTrack', track);
};

game.switchToTrack = function(audioElement) {
    // Stop all current music
    const bgMusic = document.getElementById('bgMusic');
    const bgMusic2 = document.getElementById('bgMusic2');
    const bossMusic = document.getElementById('bossMusic');
    const bossMusic2 = document.getElementById('bossMusic2');
    
    bgMusic.pause();
    bgMusic.currentTime = 0;
    bgMusic2.pause();
    bgMusic2.currentTime = 0;
    bossMusic.pause();
    bossMusic.currentTime = 0;
    bossMusic2.pause();
    bossMusic2.currentTime = 0;
    
    // Play the new track
    const masterVol = this.masterVolume || 0.5;
    audioElement.volume = masterVol;
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log('Track switch failed:', e));
};

game.updateNowPlayingDisplay = function() {
    let trackName = '';
    if (this.isBossMusic) {
        trackName = this.selectedBossTrack === 'crimson' ? 
            'Crimson Last Stand' : 'Endless Boss Waves';
    } else {
        trackName = this.selectedNormalTrack === 'endless' ? 
            'Endless Waves' : 'Chill Cozy';
    }
    // Update both old and new element IDs
    const oldEl = document.getElementById('nowPlayingTrack');
    const newEl = document.getElementById('audioNowPlayingTrack');
    if (oldEl) oldEl.textContent = trackName;
    if (newEl) newEl.textContent = trackName;
};
