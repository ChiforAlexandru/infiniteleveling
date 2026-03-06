// levels.js
// Handles room/level logic

export let currentRoom = 1;
export const maxRooms = 13; // 10 more levels to the right
export const villageRoom = 4; // Village is the 4th map
export let inVillage = false;

export function checkRoomChange(player, canvas) {
    let changed = false;
    if (!inVillage) {
        if (player.x + player.width > canvas.width) {
            if (currentRoom < villageRoom - 1) {
                currentRoom++;
                player.x = 0;
                changed = true;
            } else if (currentRoom === villageRoom - 1) {
                // Enter village after level 3
                inVillage = true;
                player.x = 0;
                changed = true;
            } else if (currentRoom >= villageRoom && currentRoom < maxRooms) {
                currentRoom++;
                player.x = 0;
                changed = true;
            }
        } else if (player.x < 0) {
            if (currentRoom > 1 && currentRoom !== villageRoom) {
                currentRoom--;
                player.x = canvas.width - player.width;
                changed = true;
            } else if (currentRoom === villageRoom) {
                // Go back to level 3 from village
                inVillage = false;
                currentRoom = villageRoom - 1;
                player.x = canvas.width - player.width;
                changed = true;
            } else {
                player.x = 0;
            }
        }
        // Path down at level 7 (placeholder logic)
        if (currentRoom === 7 && player.y > canvas.height - player.height) {
            window.enteredDownPath = true;
        }
    } else {
        // In village, allow going back to level 3
        if (player.x < 0) {
            inVillage = false;
            currentRoom = villageRoom - 1;
            player.x = canvas.width - player.width;
            changed = true;
        } else if (player.x + player.width > canvas.width) {
            // Allow going to level 4+ from village
            inVillage = false;
            currentRoom = villageRoom;
            player.x = 0;
            changed = true;
        }
    }
    return changed;
}

export function drawRoom(ctx, bgImage, canvas) {
    if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    if (!inVillage) {
        ctx.fillText(`Room ${currentRoom}`, 40, 80);
    } else {
        ctx.fillText('Village (Hub)', 40, 80);
    }
}
