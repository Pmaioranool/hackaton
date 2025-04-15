import { canvas } from "./setup.js";
import { turrets, bullets, enemyBullets } from "./state.js";
import { player } from "./player.js";
import { message, updateUI } from "./ui.js";

let boss = null;
let bossLaser = null;
let lastTurretSpawnTime = 0;
const turretSpawnInterval = 15000;
const LaserCooldown = 2000;
const laserCharge = 3000;
let shakeDuration = 0;
const shakeIntensity = 8;

export function getBoss() {
  return boss;
}

export function spawnBoss() {
  boss = {
    x: canvas.width / 2 - 100,
    y: 20,
    width: 200,
    height: 60,
    color: "crimson",
    hp: 200,
    direction: 1,
    speed: 2,
    lastTorpedoTime: 0,
    lastLaserTime: 0,
    laserCharging: false,
    laserChargeStart: 0,
  };
  lastTurretSpawnTime = Date.now();
}

export function spawnTurrets() {
  const turretLeft = {
    x: boss.x + 10,
    y: boss.y + boss.height,
    width: 20,
    height: 20,
    color: "darkred",
    hp: 1,
    lastShootTime: 0,
    shootCooldown: 1000,
  };

  const turretRight = {
    x: boss.x + boss.width - 30,
    y: boss.y + boss.height,
    width: 20,
    height: 20,
    color: "darkred",
    hp: 1,
    lastShootTime: 0,
    shootCooldown: 1000,
  };

  turrets.push(turretLeft, turretRight);
}

export function updateBoss() {
  if (!boss) return;

  // Mouvement du boss
  boss.x += boss.speed * boss.direction;
  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) boss.direction *= -1;

  // Gestion du laser
  if (!boss.laserCharging && Date.now() - boss.lastLaserTime > LaserCooldown) {
    boss.laserCharging = true;
    boss.laserChargeStart = Date.now();
    shakeDuration = 15;
  }

  if (boss.laserCharging) {
    const chargeDuration = Date.now() - boss.laserChargeStart;
    if (chargeDuration > laserCharge) {
      bossLaser = { x: boss.x + boss.width / 2 - 10, width: 20 };
      boss.lastLaserTime = Date.now();
      boss.laserCharging = false;
    }
  }

  // Torpilles
  if (Date.now() - boss.lastTorpedoTime > 800) {
    enemyBullets.push({
      x: boss.x + boss.width / 2 - 3,
      y: boss.y + boss.height,
      width: 6,
      height: 14,
      speed: 4,
      color: "orange",
    });
    boss.lastTorpedoTime = Date.now();
  }

  // Collision avec les balles
  bullets.forEach((bullet, bi) => {
    if (
      bullet.x < boss.x + boss.width &&
      bullet.x + bullet.width > boss.x &&
      bullet.y < boss.y + boss.height &&
      bullet.y + bullet.height > boss.y
    ) {
      bullets.splice(bi, 1);
      boss.hp -= player.damage;
      if (boss.hp <= 0) {
        message("Boss vaincu ! GG !");
        player.score += 1000 * player.scoreMultiplier;
        boss = null;
        turrets.length = 0;
      }
    }
  });
}

export function drawBoss(ctx) {
  if (!boss) return;

  ctx.fillStyle = boss.color;
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

  if (bossLaser) {
    ctx.fillStyle = "red";
    ctx.fillRect(bossLaser.x, 0, bossLaser.width, canvas.height);

    if (Date.now() - boss.lastLaserTime > 500) {
      bossLaser = null;
    }
  }
}

export function applyScreenShake(ctx) {
  if (shakeDuration > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(dx, dy);
    shakeDuration--;
  }
}
