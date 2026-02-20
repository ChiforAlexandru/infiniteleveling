// This code should be inserted into renderer.js after the enemies drawing section
// but before the bosses drawing section (around line 941)

// Draw necromancer minions
if (this.player.isNecromancer) {
    this.player.minions.forEach(minion => {
        const opacity = minion.opacity || 1;
        
        // Shadow
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * opacity})`;
        ctx.beginPath();
        ctx.ellipse(minion.x, minion.y + minion.radius + 3, minion.radius * 0.7, minion.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Minion body with glow
        ctx.fillStyle = minion.color;
        ctx.globalAlpha = opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = minion.color;
        ctx.beginPath();
        ctx.arc(minion.x, minion.y, minion.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Inner glow
        ctx.fillStyle = minion.secondaryColor;
        ctx.beginPath();
        ctx.arc(minion.x, minion.y, minion.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
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
