// enemy.js

import {
  canvas,
  ctx,
  enemies,
  enemyBullets,
  turrets,
  boss,
  bossLaser,
  spawnTimer,
  spawnInterval,
  spawnAccelerationTimer,
  minSpawnInterval,
  lastTurretSpawnTime,
  turretSpawnInterval,
  player,
  LaserCooldown,
  laserCharge,
  enemiesKilled,
  enemiesToKill,
  bossBeaten,
  win,
  setSpawnTimer,
  incrementSpawnAcceleration,
  decrementSpawnInterval,
  setLastTurretSpawnTime,
  setBoss,
  setBossLaser,
  setShakeDuration,
  setWin,
} from "./gameState.js";

import { drawRect, drawCircle, drawTriangle } from "./renderer.js";

export function updateEnemies() {
  const now = Date.now();

  // Spawn des ennemis
  if (now - spawnTimer >= spawnInterval) {
    spawnEnemy();
    setSpawnTimer(now);
    incrementSpawnAcceleration();
    if (spawnAccelerationTimer % 5 === 0 && spawnInterval > minSpawnInterval) {
      decrementSpawnInterval(100);
    }
  }

  // Mise à jour des ennemis
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    drawRect(enemy);

    if (
      enemy.y + enemy.height >= player.y &&
      enemy.x < player.x + player.width &&
      enemy.x + enemy.width > player.x
    ) {
      player.health -= 1;
      enemies.splice(index, 1);
    }

    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
    }
  });

  turrets.forEach((turret, index) => {
    turret.y += turret.speed;
    drawTriangle(turret);

    if (Math.random() < 0.01) {
      enemyBullets.push({
        x: turret.x + turret.width / 2 - 2,
        y: turret.y + turret.height,
        width: 4,
        height: 10,
        color: "red",
        speed: 4,
      });
    }

    if (turret.y > canvas.height) {
      turrets.splice(index, 1);
    }
  });

  if (Math.random() < 0.02 && enemies.length > 0) {
    const shooter = enemies[Math.floor(Math.random() * enemies.length)];
    enemyBullets.push({
      x: shooter.x + shooter.width / 2 - 2,
      y: shooter.y + shooter.height,
      width: 4,
      height: 10,
      color: "red",
      speed: 4,
    });
  }

  enemyBullets.forEach((bullet, index) => {
    bullet.y += bullet.speed;
    drawRect(bullet);

    if (
      bullet.y + bullet.height >= player.y &&
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x
    ) {
      if (!player.shield) {
        player.health -= 1;
      }
      enemyBullets.splice(index, 1);
    }

    if (bullet.y > canvas.height) {
      enemyBullets.splice(index, 1);
    }
  });

  if (!boss && enemiesKilled >= enemiesToKill) {
    spawnBoss();
  }

  if (boss) {
    boss.y += boss.speed;
    drawCircle(boss);

    if (Date.now() - boss.lastLaserTime >= LaserCooldown) {
      setBossLaser({
        x: boss.x + boss.width / 2 - 5,
        y: boss.y + boss.height,
        width: 10,
        height: canvas.height - boss.y,
        color: "magenta",
      });
      boss.lastLaserTime = Date.now();
      setShakeDuration(20);
    }

    if (
      boss.y + boss.height >= player.y &&
      boss.x < player.x + player.width &&
      boss.x + boss.width > player.x
    ) {
      player.health = 0;
    }

    if (boss.y > canvas.height) {
      setBoss(null);
    }
  }

  if (bossLaser) {
    drawRect(bossLaser);

    if (
      bossLaser.y <= player.y + player.height &&
      bossLaser.x < player.x + player.width &&
      bossLaser.x + bossLaser.width > player.x
    ) {
      if (!player.shield) {
        player.health = 0;
      }
    }

    if (Date.now() - boss.lastLaserTime >= laserCharge) {
      setBossLaser(null);
    }
  }

  if (now - lastTurretSpawnTime >= turretSpawnInterval) {
    spawnTurret();
    setLastTurretSpawnTime(now);
  }

  if (bossBeaten <= 0 && !win) {
    setWin(true);
  }
}

function spawnEnemy() {
  const x = Math.random() * (canvas.width - 30);
  enemies.push({
    x,
    y: -30,
    width: 30,
    height: 30,
    color: "orange",
    speed: 1 + Math.random() * 2,
  });
}

function spawnTurret() {
  const x = Math.random() * (canvas.width - 30);
  turrets.push({
    x,
    y: -30,
    width: 30,
    height: 30,
    color: "purple",
    speed: 1 + Math.random() * 2,
  });
}

function spawnBoss() {
  setBoss({
    x: canvas.width / 2 - 40,
    y: -80,
    width: 80,
    height: 80,
    color: "magenta",
    speed: 1,
    lastLaserTime: Date.now(),
  });
}
