// === game/loop.js ===
import { player, resetPlayerStats } from "./player.js";
import { bullets, enemies, enemyBullets } from "./state.js";
import { ctx, canvas, shootSound } from "./setup.js";
import { spawnEnemy } from "./enemy.js";
import { drawRect, drawCircle, drawTriangle } from "./draw.js";
import { updateHealthUI, updateUI, message } from "./ui.js";
import { keys } from "./controls.js";
import { getBoss, updateBoss, drawBoss, applyScreenShake } from "./boss.js";
import { checkBossSpawn, updateSpawnTimers } from "./gameManager.js";

const defaultShootCooldown = 300;
const rapidFireCooldown = 50;
let lastShotTime = 0;
let spawnTimer = 0;
let spawnInterval = 2000;
const minSpawnInterval = 400;
let spawnAccelerationTimer = 0;
let gameOver = false;
let restartTimer = 0;
let enemiesKilled = 0;

async function resetGame() {
  bullets.length = 0;
  enemies.length = 0;
  enemyBullets.length = 0;
  await resetPlayerStats(gameOver, 0);
  spawnInterval = 2000;
  spawnTimer = 0;
  spawnAccelerationTimer = 0;
  lastShotTime = 0;
  gameOver = false;
  restartTimer = 0;
  updateUI(player.score, player.points);
  updateHealthUI(player.health);
}

export function loop(timestamp) {
  ctx.save();
  applyScreenShake(ctx);
  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    restartTimer += 16;
    if (restartTimer > 2000) resetGame();
    return;
  }

  // Déplacement du joueur
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width)
    player.x += player.speed;

  drawRect(ctx, player);

  if (player.shield) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      player.x + player.width / 2,
      player.y + player.height / 2,
      player.width,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }

  // Tir automatique du joueur
  const now = Date.now();
  const shootCooldown = player.rapidFire
    ? rapidFireCooldown
    : defaultShootCooldown;
  if (now - lastShotTime >= shootCooldown) {
    lastShotTime = now;
    shootSound.currentTime = 0;
    shootSound.play();
    if (player.shootDouble) {
      bullets.push(
        {
          x: player.x + player.width / 2 - 10,
          y: player.y,
          width: 4,
          height: 10,
          color: "white",
          speed: 7,
        },
        {
          x: player.x + player.width / 2 + 6,
          y: player.y,
          width: 4,
          height: 10,
          color: "white",
          speed: 7,
        }
      );
    } else {
      bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        color: "white",
        speed: 7,
      });
    }
  }

  // Mise à jour des tirs du joueur
  bullets.forEach((bullet, bi) => {
    bullet.y -= bullet.speed;
    drawRect(ctx, bullet);
    if (bullet.y < 0) bullets.splice(bi, 1);
  });

  // Mise à jour des ennemis
  enemies.forEach((enemy, ei) => {
    switch (enemy.pattern) {
      case "straight":
        enemy.y += enemy.speed;
        break;
      case "diagonal":
        enemy.x += enemy.dx;
        enemy.y += enemy.speed;
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width)
          enemy.dx *= -1;
        break;
      case "circular":
        enemy.y += enemy.speed;
        enemy.angle += 0.1;
        enemy.x = enemy.initX + enemy.amplitude * Math.cos(enemy.angle);
        break;
      case "zigzag":
        enemy.x += enemy.dx;
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
          enemy.y += enemy.height;
          enemy.dx *= -1;
        }
        break;
    }

    switch (enemy.type) {
      case "tank":
        drawCircle(ctx, enemy);
        break;
      case "kamikaze":
        drawRect(ctx, enemy);
        break;
      case "gunner":
        drawTriangle(ctx, enemy);
        break;
    }

    bullets.forEach((bullet, bi) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        bullets.splice(bi, 1);
        enemy.hp -= player.damage;
        if (enemy.hp <= 0) {
          enemies.splice(ei, 1);
          player.score += 100 * player.scoreMultiplier;
          player.points += 10;
          updateUI(player.score, player.points);
        }
      }
    });

    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      if (player.shield) {
        player.shield = false;
      } else {
        player.health--;
        updateHealthUI(player.health);
        if (player.health <= 0) {
          message("Game Over!");
          gameOver = true;
        }
      }
      enemies.splice(ei, 1);
    }

    if (
      enemy.type === "gunner" &&
      now - enemy.lastShootTime > enemy.shootCooldown
    ) {
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 2,
        y: enemy.y + enemy.height,
        width: 4,
        height: 10,
        speed: 4,
        color: "red",
      });
      enemy.lastShootTime = now;
    }
  });

  enemyBullets.forEach((b, bi) => {
    b.y += b.speed;
    drawRect(ctx, b);
    if (
      b.x < player.x + player.width &&
      b.x + b.width > player.x &&
      b.y < player.y + player.height &&
      b.y + b.height > player.y
    ) {
      if (player.shield) {
        player.shield = false;
      } else {
        player.health--;
        updateHealthUI(player.health);
        if (player.health <= 0) {
          message("Game Over!");
          gameOver = true;
        }
      }
      enemyBullets.splice(bi, 1);
    } else if (b.y > canvas.height) {
      enemyBullets.splice(bi, 1);
    }
  });

  spawnTimer += 16;
  spawnAccelerationTimer += 16;
  if (spawnTimer >= spawnInterval) {
    spawnEnemy();
    spawnTimer = 0;
  }
  if (spawnAccelerationTimer >= 10000) {
    if (spawnInterval > minSpawnInterval) spawnInterval -= 100;
    spawnAccelerationTimer = 0;
  }

  updateUI(player.score, player.points);
  updateHealthUI(player.health);

  // Gestion du boss
  updateBoss();
  drawBoss(ctx);

  // Vérification du spawn du boss
  checkBossSpawn(enemiesKilled);

  // Mise à jour du spawn
  updateSpawnTimers({
    timer: spawnTimer,
    interval: spawnInterval,
    accelTimer: spawnAccelerationTimer,
  });

  ctx.restore();
  requestAnimationFrame(loop);
}
