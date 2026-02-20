const MAP_WIDTH = 7680;
const MAP_HEIGHT = 4320;
const PLAYER_RADIUS = 15;
const MAP_MIN_X = PLAYER_RADIUS;
const MAP_MAX_X = MAP_WIDTH - PLAYER_RADIUS;
const MAP_MIN_Y = PLAYER_RADIUS;
const MAP_MAX_Y = MAP_HEIGHT - PLAYER_RADIUS;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 1920;
    canvas.height = 1080;
}
