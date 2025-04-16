// gameState.js

export let canvas;
export let ctx;

export function initCanvas() {
  canvas = document.getElementById("game");
  ctx = canvas?.getContext("2d");
}

export let bullets = [];
export let enemies = [];
export let enemyBullets = [];
export let boss = null;
export let bossLaser = null;
export let turrets = [];

export let keys = {};

export let lastShotTime = 0;
export const defaultShootCooldown = 300;
export const rapidFireCooldown = 50;

export let spawnTimer = 0;
export let spawnInterval = 2000;
export let spawnAccelerationTimer = 0;
export const minSpawnInterval = 400;

export let shakeDuration = 0;
export const shakeIntensity = 8;
export let lastTurretSpawnTime = 0;
export const turretSpawnInterval = 15000;

export let enemiesKilled = 0;
export let enemiesToKill = 100;
export let bossBeaten = 10;
export let LaserCooldown = 2000;
export let laserCharge = 3000;
export let win = false;

export const player = {
  x: 0,
  y: 0,
  width: 30,
  height: 30,
  color: "lime",
  damage: 1,
  baseDamage: 1,
  speed: 4,
  baseSpeed: 4,
  points: 0,
  score: 0,
  scoreMultiplier: 1,
  baseScoreMultiplier: 1,
  health: 3,
  maxHealth: 3,
  powerups: [],
  shootDouble: false,
  rapidFire: false,
  shield: false,
};

export function setSpawnTimer(value) {
  spawnTimer = value;
}

export function incrementSpawnAcceleration() {
  spawnAccelerationTimer += 1;
}

export function decrementSpawnInterval(amount) {
  spawnInterval = Math.max(spawnInterval - amount, minSpawnInterval);
}

export function setLastTurretSpawnTime(value) {
  lastTurretSpawnTime = value;
}

export function setBoss(value) {
  boss = value;
}

export function setBossLaser(value) {
  bossLaser = value;
}

export function setShakeDuration(value) {
  shakeDuration = value;
}

export function setWin(value) {
  win = value;
}
