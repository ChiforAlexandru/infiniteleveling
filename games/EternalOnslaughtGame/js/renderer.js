game.drawZombie = function(enemy) {
    // Body
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.4, enemy.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (red glowing)
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.25, enemy.y - enemy.radius * 0.5, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.25, enemy.y - enemy.radius * 0.5, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = enemy.radius * 0.3;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.radius * 0.8, enemy.y);
    ctx.lineTo(enemy.x - enemy.radius * 1.2, enemy.y - enemy.radius * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius * 0.8, enemy.y);
    ctx.lineTo(enemy.x + enemy.radius * 1.2, enemy.y - enemy.radius * 0.3);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
};

game.drawSkeleton = function(enemy) {
    // Draw goblin using GoblinWalk.png sprite, fallback to circle if not loaded
    if (!game.goblinSprite) {
        game.goblinSprite = new Image();
        game.goblinSprite.src = 'Images/sprites/GoblinWalk.png';
    }
    const spriteSize = 32;
    const drawSize = enemy.radius * 2;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (game.goblinSprite.complete && game.goblinSprite.naturalWidth > 0) {
        ctx.drawImage(
            game.goblinSprite,
            0, 0, spriteSize, spriteSize, // source
            -drawSize/2, -drawSize/2, drawSize, drawSize // destination
        );
    } else {
        // Fallback: draw a green circle
        ctx.fillStyle = enemy.color || '#339933';
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - enemy.radius * 0.4, enemy.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - enemy.radius * 0.4, enemy.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Glowing eyes inside sockets
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - enemy.radius * 0.4, enemy.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - enemy.radius * 0.4, enemy.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Bones (arms)
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = enemy.radius * 0.2;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.radius * 0.5, enemy.y);
    ctx.lineTo(enemy.x - enemy.radius * 1.0, enemy.y + enemy.radius * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius * 0.5, enemy.y);
    ctx.lineTo(enemy.x + enemy.radius * 1.0, enemy.y + enemy.radius * 0.5);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
};

game.drawSlime = function(enemy) {
    // Bouncy animation
    const bounce = Math.sin(Date.now() / 200 + enemy.x) * enemy.radius * 0.15;
    
    // Main body (squished circle)
    const gradient = ctx.createRadialGradient(
        enemy.x, enemy.y - bounce, enemy.radius * 0.3,
        enemy.x, enemy.y - bounce, enemy.radius
    );
    gradient.addColorStop(0, enemy.secondaryColor);
    gradient.addColorStop(1, enemy.color);
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 12;
    ctx.shadowColor = enemy.color;
    
    // Squished ellipse
    ctx.save();
    ctx.translate(enemy.x, enemy.y + bounce);
    ctx.scale(1, 0.8 - bounce / enemy.radius * 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Highlight (shiny spot)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - enemy.radius * 0.5 - bounce, enemy.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (cute dark spots)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - bounce, enemy.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - bounce, enemy.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.25, enemy.y - enemy.radius * 0.1 - bounce, enemy.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.35, enemy.y - enemy.radius * 0.1 - bounce, enemy.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawGhost = function(enemy) {
    // Floating animation
    const float = Math.sin(Date.now() / 300 + enemy.x) * enemy.radius * 0.2;
    
    // Semi-transparent body
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = enemy.color;
    
    // Main ghost shape (rounded)
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - float, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Wispy tail
    ctx.fillStyle = enemy.secondaryColor;
    for (let i = 0; i < 3; i++) {
        const wispY = enemy.y + enemy.radius * 0.5 + i * 3 - float;
        ctx.beginPath();
        ctx.arc(enemy.x + (i % 2 === 0 ? -5 : 5), wispY, enemy.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Eyes (dark)
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - enemy.radius * 0.2 - float, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - enemy.radius * 0.2 - float, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
};

game.drawDemon = function(enemy) {
    // Body
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.4, enemy.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Horns
    ctx.fillStyle = '#000000';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.radius * 0.5, enemy.y - enemy.radius * 0.8);
    ctx.lineTo(enemy.x - enemy.radius * 0.7, enemy.y - enemy.radius * 1.2);
    ctx.lineTo(enemy.x - enemy.radius * 0.4, enemy.y - enemy.radius * 0.9);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius * 0.5, enemy.y - enemy.radius * 0.8);
    ctx.lineTo(enemy.x + enemy.radius * 0.7, enemy.y - enemy.radius * 1.2);
    ctx.lineTo(enemy.x + enemy.radius * 0.4, enemy.y - enemy.radius * 0.9);
    ctx.fill();
    
    // Glowing eyes
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.25, enemy.y - enemy.radius * 0.5, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.25, enemy.y - enemy.radius * 0.5, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawImp = function(enemy) {
    // Small demon-like creature
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = enemy.color;
    
    // Body (smaller, compact)
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.5, enemy.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Small horns
    ctx.fillStyle = '#ff3300';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.4, enemy.y - enemy.radius * 0.8, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.4, enemy.y - enemy.radius * 0.8, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Evil grin
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.3, enemy.radius * 0.3, 0, Math.PI);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
};

game.drawWraith = function(enemy) {
    // Dark spirit
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 20 * pulse;
    ctx.shadowColor = enemy.color;
    
    // Main body
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Dark aura
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Glowing purple eyes
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#cc00ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#cc00ff';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - enemy.radius * 0.2, enemy.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - enemy.radius * 0.2, enemy.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
};

game.drawGolem = function(enemy) {
    // Large rocky creature
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = enemy.color;
    
    // Body (large and blocky)
    ctx.fillRect(enemy.x - enemy.radius * 0.8, enemy.y - enemy.radius * 0.6, enemy.radius * 1.6, enemy.radius * 1.6);
    
    // Head (smaller block on top)
    ctx.fillStyle = enemy.secondaryColor;
    ctx.fillRect(enemy.x - enemy.radius * 0.5, enemy.y - enemy.radius * 1.2, enemy.radius, enemy.radius * 0.8);
    
    // Rock texture (random dots)
    ctx.fillStyle = '#555555';
    ctx.shadowBlur = 0;
    for (let i = 0; i < 8; i++) {
        const rx = enemy.x + (Math.random() - 0.5) * enemy.radius * 1.4;
        const ry = enemy.y + (Math.random() - 0.5) * enemy.radius * 1.2;
        ctx.beginPath();
        ctx.arc(rx, ry, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Glowing core eyes
    ctx.fillStyle = '#ff6600';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff6600';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.25, enemy.y - enemy.radius * 0.8, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.25, enemy.y - enemy.radius * 0.8, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawBat = function(enemy) {
    // Flying bat
    const flap = Math.sin(Date.now() / 100 + enemy.x) * 0.3;
    
    // Body
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.fillStyle = enemy.secondaryColor;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(enemy.x - enemy.radius * 0.8, enemy.y, enemy.radius * 0.8, enemy.radius * (0.5 + flap), Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(enemy.x + enemy.radius * 0.8, enemy.y, enemy.radius * 0.8, enemy.radius * (0.5 + flap), -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Red eyes
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.2, enemy.y - enemy.radius * 0.1, enemy.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.2, enemy.y - enemy.radius * 0.1, enemy.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawSpider = function(enemy) {
    // Spider body
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = enemy.color;
    
    // Abdomen
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y + enemy.radius * 0.2, enemy.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.3, enemy.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Legs (8 of them)
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI - Math.PI / 2;
        const legLength = enemy.radius * 1.5;
        
        // Left side
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.radius * 0.3, enemy.y);
        ctx.lineTo(enemy.x - enemy.radius * 0.3 + Math.cos(angle) * legLength * 0.7, enemy.y + Math.sin(angle) * legLength * 0.5);
        ctx.lineTo(enemy.x - enemy.radius * 0.3 + Math.cos(angle) * legLength, enemy.y + Math.sin(angle) * legLength);
        ctx.stroke();
        
        // Right side
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.radius * 0.3, enemy.y);
        ctx.lineTo(enemy.x + enemy.radius * 0.3 - Math.cos(angle) * legLength * 0.7, enemy.y + Math.sin(angle) * legLength * 0.5);
        ctx.lineTo(enemy.x + enemy.radius * 0.3 - Math.cos(angle) * legLength, enemy.y + Math.sin(angle) * legLength);
        ctx.stroke();
    }
    
    // Multiple eyes
    ctx.fillStyle = '#ff0000';
    for (let i = 0; i < 4; i++) {
        const ex = enemy.x + (i % 2 === 0 ? -1 : 1) * enemy.radius * 0.15 * (i < 2 ? 1 : 0.5);
        const ey = enemy.y - enemy.radius * 0.35 + (i < 2 ? 0 : enemy.radius * 0.15);
        ctx.beginPath();
        ctx.arc(ex, ey, enemy.radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.shadowBlur = 0;
};

game.drawOrc = function(enemy) {
    // Muscular green creature
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = enemy.color;
    
    // Body
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.4, enemy.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Tusks
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.radius * 0.2, enemy.y - enemy.radius * 0.2);
    ctx.lineTo(enemy.x - enemy.radius * 0.35, enemy.y + enemy.radius * 0.1);
    ctx.lineTo(enemy.x - enemy.radius * 0.1, enemy.y - enemy.radius * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius * 0.2, enemy.y - enemy.radius * 0.2);
    ctx.lineTo(enemy.x + enemy.radius * 0.35, enemy.y + enemy.radius * 0.1);
    ctx.lineTo(enemy.x + enemy.radius * 0.1, enemy.y - enemy.radius * 0.1);
    ctx.fill();
    
    // Angry eyes
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.25, enemy.y - enemy.radius * 0.5, enemy.radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.25, enemy.y - enemy.radius * 0.5, enemy.radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawVampire = function(enemy) {
    // Elegant vampire
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = enemy.color;
    
    // Cape (behind)
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius * 1.3, Math.PI * 0.2, Math.PI * 0.8);
    ctx.lineTo(enemy.x, enemy.y + enemy.radius * 1.5);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Pale head
    ctx.fillStyle = '#dddddd';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.4, enemy.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Red glowing eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.2, enemy.y - enemy.radius * 0.5, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.2, enemy.y - enemy.radius * 0.5, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Fangs
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.radius * 0.15, enemy.y - enemy.radius * 0.2);
    ctx.lineTo(enemy.x - enemy.radius * 0.1, enemy.y - enemy.radius * 0.05);
    ctx.lineTo(enemy.x - enemy.radius * 0.05, enemy.y - enemy.radius * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius * 0.15, enemy.y - enemy.radius * 0.2);
    ctx.lineTo(enemy.x + enemy.radius * 0.1, enemy.y - enemy.radius * 0.05);
    ctx.lineTo(enemy.x + enemy.radius * 0.05, enemy.y - enemy.radius * 0.2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawGoblin = function(enemy) {
    // Draw goblin using GoblinWalk.png sprite
    if (!game.goblinSprite) {
        game.goblinSprite = new Image();
        game.goblinSprite.src = 'Images/sprites/GoblinWalk.png';
    }
    // Default to 32x32 sprite size, scale to enemy.radius
    const spriteSize = 32;
    const drawSize = enemy.radius * 2;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.drawImage(
        game.goblinSprite,
        0, 0, spriteSize, spriteSize, // source
        -drawSize/2, -drawSize/2, drawSize, drawSize // destination
    );
    ctx.restore();
};

game.drawWerewolf = function(enemy) {
    // Furry brown creature
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = enemy.color;
    
    // Body
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Head/Snout
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y - enemy.radius * 0.5, enemy.radius * 0.8, enemy.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ears
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.radius * 0.4, enemy.y - enemy.radius * 1.0);
    ctx.lineTo(enemy.x - enemy.radius * 0.8, enemy.y - enemy.radius * 1.4);
    ctx.lineTo(enemy.x - enemy.radius * 0.5, enemy.y - enemy.radius * 0.9);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius * 0.4, enemy.y - enemy.radius * 1.0);
    ctx.lineTo(enemy.x + enemy.radius * 0.8, enemy.y - enemy.radius * 1.4);
    ctx.lineTo(enemy.x + enemy.radius * 0.5, enemy.y - enemy.radius * 0.9);
    ctx.fill();
    
    // Red eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - enemy.radius * 0.6, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - enemy.radius * 0.6, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawTroll = function(enemy) {
    // Large green creature
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = enemy.color;
    
    // Lumpy Body
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.5, enemy.y - enemy.radius * 0.5, enemy.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.5, enemy.y - enemy.radius * 0.4, enemy.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.6, enemy.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Single eye
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.7, enemy.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.7, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.drawNecromancer = function(enemy) {
    // Dark robe
    ctx.fillStyle = enemy.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    // Hood
    ctx.fillStyle = enemy.secondaryColor;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.2, enemy.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Face shadow
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - enemy.radius * 0.2, enemy.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Glowing eyes
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.2, enemy.y - enemy.radius * 0.3, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.2, enemy.y - enemy.radius * 0.3, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Staff
    ctx.strokeStyle = '#4a2a00'; // Brown
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.radius * 0.7, enemy.y - enemy.radius * 0.7);
    ctx.lineTo(enemy.x + enemy.radius * 1.5, enemy.y + enemy.radius * 1.5);
    ctx.stroke();

    // Staff orb
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.7, enemy.y - enemy.radius * 0.7, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
};

game.drawSpecialEnemy = function(enemy) {
    // Draw based on special enemy type
    ctx.shadowBlur = 10;
    ctx.shadowColor = enemy.color;
    
    // Main body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner glow
    ctx.fillStyle = enemy.secondaryColor || enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Type-specific details
    if (enemy.type === 'charger') {
        // Horns
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.radius * 0.5, enemy.y - enemy.radius * 0.3);
        ctx.lineTo(enemy.x - enemy.radius * 0.8, enemy.y - enemy.radius);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.radius * 0.5, enemy.y - enemy.radius * 0.3);
        ctx.lineTo(enemy.x + enemy.radius * 0.8, enemy.y - enemy.radius);
        ctx.stroke();
    } else if (enemy.type === 'blinker') {
        // Teleport rings
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.globalAlpha = 0.3 + i * 0.2;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius * (0.8 + i * 0.3), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    } else if (enemy.type === 'splitter') {
        // Divided appearance
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.radius, enemy.y);
        ctx.lineTo(enemy.x + enemy.radius, enemy.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - enemy.radius);
        ctx.lineTo(enemy.x, enemy.y + enemy.radius);
        ctx.stroke();
    } else if (enemy.type === 'bomber') {
        // Fuse
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - enemy.radius * 0.5);
        ctx.lineTo(enemy.x, enemy.y - enemy.radius * 1.2);
        ctx.stroke();
        // Spark
        ctx.fillStyle = '#ff0000';
        const sparkSize = 3 + Math.sin(Date.now() / 100) * 2;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y - enemy.radius * 1.2, sparkSize, 0, Math.PI * 2);
        ctx.fill();
    } else if (enemy.type === 'shield_bearer') {
        // Shield
        ctx.fillStyle = '#4488ff';
        ctx.beginPath();
        ctx.ellipse(enemy.x + enemy.radius * 0.8, enemy.y, enemy.radius * 0.4, enemy.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#88aaff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.25, enemy.y - enemy.radius * 0.1, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.25, enemy.y - enemy.radius * 0.1, enemy.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
};

game.draw = function() {
    // Don't draw canvas when level-up screen is displayed
    if (this.paused && document.getElementById('levelUpScreen').style.display === 'flex') {
        return;
    }
    
    // Safety check - ensure player exists before drawing
    if (!this.player) {
        console.warn('Player not initialized, skipping draw');
        return;
    }
    
    // Clear any previous transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Background based on Zone
    let bgColor = '#0f1419';
    let gridColor = 'rgba(0, 255, 255, 0.05)';
    if (this.mode === 'story' && this.currentZone && this.zoneConfig[this.currentZone]) {
        bgColor = this.zoneConfig[this.currentZone].bg;
        gridColor = this.zoneConfig[this.currentZone].grid;
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Camera follow player - center them on screen
    ctx.save();
    try {
    
    // Use fixed viewport (canvas size) - 1920x1080
    const viewportWidth = canvas.width;
    const viewportHeight = canvas.height;
    
    // Try to center the player
    let cameraX = -this.player.x + viewportWidth / 2;
    let cameraY = -this.player.y + viewportHeight / 2;
    
    // Apply screen shake
    if (this.screenShake && this.screenShake.intensity > 0) {
        const shake = this.getScreenShakeOffset ? this.getScreenShakeOffset() : { x: 0, y: 0 };
        cameraX += shake.x;
        cameraY += shake.y;
    }
    
    // Clamp so we never show beyond map boundaries
    const minCameraX = -(MAP_WIDTH - viewportWidth);
    const maxCameraX = 0;
    const minCameraY = -(MAP_HEIGHT - viewportHeight);
    const maxCameraY = 0;
    
    const clampedX = Math.max(minCameraX, Math.min(maxCameraX, cameraX));
    const clampedY = Math.max(minCameraY, Math.min(maxCameraY, cameraY));
    
    ctx.translate(clampedX, clampedY);
    
    // Draw grid - only draw visible portion and sparser pattern
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < MAP_WIDTH; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, MAP_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < MAP_HEIGHT; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(MAP_WIDTH, y);
        ctx.stroke();
    }
    
    // Draw chests
    this.chests.forEach(chest => {
        ctx.save();
        ctx.translate(chest.x, chest.y);
        
        if (chest.isCursed) {
            // Cursed chest - red/purple glow
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.fillStyle = '#880033';
            ctx.shadowBlur = 25 * pulse;
            ctx.shadowColor = '#ff3366';
            ctx.fillRect(-20, -12, 40, 24);
            // Skull symbol
            ctx.fillStyle = '#ff6666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('☠', 0, 6);
            // Lid
            ctx.fillStyle = '#aa0044';
            ctx.fillRect(-20, -12, 40, 6);
            // Timer indicator (fade as it despawns)
            if (chest.lifespan && chest.spawnTime) {
                const remaining = 1 - ((this.time - chest.spawnTime) / chest.lifespan);
                ctx.fillStyle = `rgba(255, 100, 100, ${remaining * 0.5})`;
                ctx.fillRect(-20, 14, 40 * remaining, 3);
            }
        } else {
            // Normal chest - gold glow
            ctx.fillStyle = '#ffaa00';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffaa00';
            ctx.fillRect(-15, -10, 30, 20);
            // Draw lid/detail
            ctx.fillStyle = '#ffdd44';
            ctx.fillRect(-15, -10, 30, 5);
        }
        ctx.restore();
    });
    
    // Draw map border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    
    // Draw map border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Calculate visible area for culling (used by zones, enemies, particles, etc.)
    const viewLeft = this.player.x - canvas.width / 2 - 100;
    const viewRight = this.player.x + canvas.width / 2 + 100;
    const viewTop = this.player.y - canvas.height / 2 - 100;
    const viewBottom = this.player.y + canvas.height / 2 + 100;
    
    // Draw zones (with frustum culling)
    this.zones.forEach(zone => {
        // Skip if zone is completely offscreen
        if (zone.x + zone.radius < viewLeft || zone.x - zone.radius > viewRight || 
            zone.y + zone.radius < viewTop || zone.y - zone.radius > viewBottom) return;
        const alpha = Math.max(0, Math.min(1, zone.life / (zone.maxLife || 3000)));
        
        if (zone.type === 'fire') {
            const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
            gradient.addColorStop(0, `rgba(255, 100, 0, ${alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(255, 50, 0, ${alpha * 0.2})`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Flickering effect
            if (Math.random() > 0.5) {
                ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(zone.x, zone.y, zone.radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (zone.type === 'ice') {
            const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
            gradient.addColorStop(0, `rgba(100, 200, 255, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(50, 150, 255, ${alpha * 0.2})`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Frost crystals
            ctx.strokeStyle = `rgba(200, 230, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6;
                ctx.beginPath();
                ctx.moveTo(zone.x, zone.y);
                ctx.lineTo(zone.x + Math.cos(angle) * zone.radius * 0.8, zone.y + Math.sin(angle) * zone.radius * 0.8);
                ctx.stroke();
            }
        } else if (zone.type === 'electric') {
            const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
            gradient.addColorStop(0, `rgba(255, 255, 100, ${alpha * 0.7})`);
            gradient.addColorStop(1, `rgba(255, 255, 0, ${alpha * 0.2})`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Lightning bolts
            if (Math.random() > 0.7) {
                ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                const angle = Math.random() * Math.PI * 2;
                ctx.moveTo(zone.x, zone.y);
                ctx.lineTo(zone.x + Math.cos(angle) * zone.radius, zone.y + Math.sin(angle) * zone.radius);
                ctx.stroke();
            }
        } else if (zone.type === 'water') {
            const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
            gradient.addColorStop(0, `rgba(50, 150, 200, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(30, 100, 150, ${alpha * 0.1})`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Ripple effect
            ctx.strokeStyle = `rgba(100, 180, 220, ${alpha * 0.3})`;
            ctx.lineWidth = 2;
            const rippleProgress = (zone.age || 0) / (zone.maxLife || 3000);
            const rippleRadius = zone.radius * Math.min(1, rippleProgress * 2);
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
    
    // Draw enemies (with culling)
    this.enemies.forEach(enemy => {
        // Skip if offscreen (frustum culling)
        if (enemy.x < viewLeft || enemy.x > viewRight || 
            enemy.y < viewTop || enemy.y > viewBottom) return;
        
        // Draw elite aura first (behind enemy)
        if (enemy.isElite && this.drawEliteAura) {
            this.drawEliteAura(enemy);
        }
        
        const shadowSize = 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + enemy.radius + 5, enemy.radius * 0.8, enemy.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw based on type
        if (enemy.type === 'zombie') {
            this.drawZombie(enemy);
        } else if (enemy.type === 'skeleton') {
            this.drawSkeleton(enemy);
        } else if (enemy.type === 'slime') {
            this.drawSlime(enemy);
        } else if (enemy.type === 'ghost') {
            this.drawGhost(enemy);
        } else if (enemy.type === 'demon') {
            this.drawDemon(enemy);
        } else if (enemy.type === 'imp') {
            this.drawImp(enemy);
        } else if (enemy.type === 'wraith') {
            this.drawWraith(enemy);
        } else if (enemy.type === 'golem') {
            this.drawGolem(enemy);
        } else if (enemy.type === 'bat') {
            this.drawBat(enemy);
        } else if (enemy.type === 'spider') {
            this.drawSpider(enemy);
        } else if (enemy.type === 'orc') {
            this.drawOrc(enemy);
        } else if (enemy.type === 'vampire') {
            this.drawVampire(enemy);
        } else if (enemy.type === 'goblin') {
            this.drawGoblin(enemy);
        } else if (enemy.type === 'werewolf') {
            this.drawWerewolf(enemy);
        } else if (enemy.type === 'troll') {
            this.drawTroll(enemy);
        } else if (enemy.type === 'necromancer') {
            this.drawNecromancer(enemy);
        } else if (enemy.type === 'charger' || enemy.type === 'blinker' || enemy.type === 'splitter' || enemy.type === 'bomber' || enemy.type === 'shield_bearer') {
            this.drawSpecialEnemy(enemy);
        }
        
        // Special behavior effects
        if (enemy.isCharging) {
            ctx.strokeStyle = '#ff4400';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff4400';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        if (enemy.isShielding) {
            ctx.strokeStyle = '#4488ff';
            ctx.fillStyle = 'rgba(68, 136, 255, 0.3)';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#4488ff';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Frozen overlay
        if (enemy.isFrozen) {
            ctx.fillStyle = 'rgba(150, 220, 255, 0.6)';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#88ddff';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius + 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Ice crystal effect
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 * i) / 4 + Math.PI / 4;
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y);
                ctx.lineTo(enemy.x + Math.cos(angle) * enemy.radius, enemy.y + Math.sin(angle) * enemy.radius);
                ctx.stroke();
            }
        }
        
        // Health bar
        const barWidth = enemy.radius * 2;
        const barHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.radius - 10, barWidth, barHeight);
        ctx.fillStyle = '#ff3366';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.radius - 10, barWidth * (enemy.health / enemy.maxHealth), barHeight);
        
        // Draw mutation indicators
        if (this.drawMutationIndicators) this.drawMutationIndicators(enemy);
    });
    
    // Draw XP orbs (with culling)
    this.xpOrbs.forEach(orb => {
        // Skip if offscreen
        if (orb.x < viewLeft || orb.x > viewRight || 
            orb.y < viewTop || orb.y > viewBottom) return;
        
        ctx.fillStyle = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffaa00';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Draw ground relics
    if (this.drawGroundRelics) this.drawGroundRelics();
    
    // Draw necromancer minions
    if (this.player.isNecromancer) {
        this.player.minions.forEach(minion => {
            const opacity = minion.opacity || 1;
            ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * opacity})`;
            ctx.beginPath();
            ctx.ellipse(minion.x, minion.y + minion.radius + 3, minion.radius * 0.7, minion.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = minion.color;
            ctx.globalAlpha = opacity;
            ctx.shadowBlur = 15;
            ctx.shadowColor = minion.color;
            ctx.beginPath();
            ctx.arc(minion.x, minion.y, minion.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = minion.secondaryColor;
            ctx.beginPath();
            ctx.arc(minion.x, minion.y, minion.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(minion.x - 3, minion.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(minion.x + 3, minion.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }
    
    // Draw summoner permanent minions
    if (this.player.isSummoner && this.player.permanentMinions) {
        this.player.permanentMinions.forEach(minion => {
            if (!minion || minion.health <= 0) return;
            
            const opacity = minion.opacity || 1;
            
            // Shadow
            ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * opacity})`;
            ctx.beginPath();
            ctx.ellipse(minion.x, minion.y + minion.radius + 3, minion.radius * 0.8, minion.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Main body with glow
            ctx.globalAlpha = opacity;
            ctx.shadowBlur = 20;
            ctx.shadowColor = minion.color;
            
            // Body
            ctx.fillStyle = minion.color;
            ctx.beginPath();
            ctx.arc(minion.x, minion.y, minion.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner circle
            ctx.fillStyle = minion.secondaryColor;
            ctx.beginPath();
            ctx.arc(minion.x, minion.y, minion.radius * 0.65, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(minion.x - 4, minion.y - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(minion.x + 4, minion.y - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(minion.x - 4, minion.y - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(minion.x + 4, minion.y - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Health bar for permanent minions
            const barWidth = minion.radius * 2;
            const barHeight = 3;
            const healthPercent = minion.health / minion.maxHealth;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(minion.x - barWidth/2, minion.y - minion.radius - 8, barWidth, barHeight);
            ctx.fillStyle = healthPercent > 0.3 ? '#44ff44' : '#ff4444';
            ctx.fillRect(minion.x - barWidth/2, minion.y - minion.radius - 8, barWidth * healthPercent, barHeight);
            
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        });
    }
    
    // Draw bosses (larger and more dramatic)
    if (typeof game.drawBosses === 'function') {
        game.drawBosses.call(this);
    }
    this.bosses.forEach(boss => {
        // Giant shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(boss.x, boss.y + boss.radius + 10, boss.radius * 1.2, boss.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pulsing aura
        const pulseSize = Math.sin(Date.now() / 200) * 10 + boss.radius + 10;
        ctx.strokeStyle = boss.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.3;
        ctx.shadowBlur = 30;
        ctx.shadowColor = boss.color;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        // Boss body
        ctx.fillStyle = boss.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = boss.color;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner glow
        const gradient = ctx.createRadialGradient(boss.x, boss.y, 0, boss.x, boss.y, boss.radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, boss.color);
        gradient.addColorStop(1, boss.color);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Draw projectiles (with frustum culling)
    this.projectiles.forEach(proj => {
        if (proj.x < viewLeft || proj.x > viewRight || 
            proj.y < viewTop || proj.y > viewBottom) return;
        const projColor = proj.isCrit ? '#ffff00' : '#00ffff';
        const projSize = proj.isCrit ? proj.radius * 1.5 : proj.radius;
        
        ctx.fillStyle = projColor;
        ctx.shadowBlur = proj.isCrit ? 12 : 8;
        ctx.shadowColor = projColor;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, projSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Draw orbitals
    this.player.orbitals.forEach(orbital => {
        const orbX = this.player.x + Math.cos(orbital.angle) * orbital.distance;
        const orbY = this.player.y + Math.sin(orbital.angle) * orbital.distance;
        
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.arc(orbX, orbY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw orbit path
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, orbital.distance, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // Draw particles (with frustum culling)
    this.particles.forEach(particle => {
        if (particle.x < viewLeft || particle.x > viewRight || 
            particle.y < viewTop || particle.y > viewBottom) return;
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    // Draw player
    if (this.drawPlayerSprite) {
        this.drawPlayerSprite(ctx);
    } else {
        // Fallback to original drawing
        const shadowSize = 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(this.player.x, this.player.y + this.player.radius + 5, this.player.radius * 0.9, this.player.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.player.invulnerable > 0 && Math.floor(this.player.invulnerable / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        // Draw player direction indicator
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.player.x, this.player.y);
        const indicatorLength = this.player.radius + 10;
        ctx.lineTo(this.player.x + this.player.vx * 3, this.player.y + this.player.vy * 3);
        ctx.stroke();
    }
    
    // Draw damage numbers (in world space)
    if (this.drawDamageNumbers) {
        this.drawDamageNumbers();
    }
    
    } finally {
        ctx.restore(); // End camera transform
    }
    
    // Draw UI elements in screen space
    if (this.drawKillStreak) {
        this.drawKillStreak();
    }
    
    if (this.drawMiniMap) {
        this.drawMiniMap();
    }
    
    if (this.drawSynergyIndicators) {
        this.drawSynergyIndicators();
    }
    
    // Draw active event indicator
    if (this.currentEvent) {
        this.drawEventIndicator();
    }
};
