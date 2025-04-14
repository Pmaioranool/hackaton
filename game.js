// === CANVAS & UI ===
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const pointsEl = document.getElementById("points");
const healthEl = document.getElementById("health");
const lotteryBtn = document.getElementById("lottery-btn");
const shootSound = new Audio("shoot.mp3");
shootSound.volume = 0.3;

// === PLAYER SETUP ===
let player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 50,
  width: 30,
  height: 30,
  color: "lime",
  speed: 4,
  baseSpeed: 4,
  points: 0,
  score: 0,
  health: 3,
  maxHealth: 3,
  powerups: [],
  shootDouble: false,
  rapidFire: false,
  shield: false,
};

let bullets = [];
let enemies = [];
let enemyBullets = [];
let boss = null;
let bossLaser = null;
let keys = {};

let lastShotTime = 0;
const defaultShootCooldown = 300;
const rapidFireCooldown = 50;

let spawnTimer = 0;
let spawnInterval = 2000;
let spawnAccelerationTimer = 0;
const minSpawnInterval = 400;
let enemiesKilled = 0;

// === SPAWN ENNEMIS ===
function spawnEnemy() {
  const typeChance = Math.random();
  let type, hp, speed, width, height, color;

  if (typeChance < 0.3) {
    type = "tank";
    hp = 5;
    speed = 1.5 / 3;
    width = height = 40;
    color = "darkblue";
  } else if (typeChance < 0.6) {
    type = "kamikaze";
    hp = 1;
    speed = 4 / 3;
    width = height = 30;
    color = "orange";
  } else {
    type = "gunner";
    hp = 2;
    speed = 2 / 3;
    width = height = 30;
    color = "purple";
  }

  enemies.push({
    x: Math.random() * (canvas.width - width),
    y: -height,
    width,
    height,
    color,
    speed,
    type,
    hp,
    shootCooldown: Math.random() * 1000 + 1000, // 1s à 3s,
    lastShootTime: Date.now(),
  });
}

// === DESSIN ===
function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawCircle(obj) {
  ctx.fillStyle = obj.color;
  ctx.beginPath();
  ctx.arc(
    obj.x + obj.width / 2,
    obj.y + obj.height / 2,
    obj.width / 2,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

// === UPDATE PRINCIPAL ===
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width)
    player.x += player.speed;

  drawRect(player);

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

  bullets.forEach((bullet, i) => {
    bullet.y -= bullet.speed;
    drawRect(bullet);
    if (bullet.y < 0) bullets.splice(i, 1);
  });

  // === ENNEMIS ===
  if (!boss) {
    enemies.forEach((enemy, ei) => {
      enemy.y += enemy.speed;

      enemy.type === "tank" ? drawCircle(enemy) : drawRect(enemy);

      if (enemy.type === "gunner") {
        if (Date.now() - enemy.lastShootTime > enemy.shootCooldown) {
          enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 10,
            speed: 4,
            color: "red",
          });

          enemy.lastShootTime = Date.now();
        }
      }

      bullets.forEach((bullet, bi) => {
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          bullets.splice(bi, 1);
          enemy.hp--;
          if (enemy.hp <= 0) {
            enemies.splice(ei, 1);
            player.score += 100;
            player.points += 10;
            enemiesKilled++;
            updateUI();
          }
        }
      });

      // Collision joueur
      if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
      ) {
        if (player.shield) {
          player.shield = false; // Le bouclier absorbe le coup
        } else {
          player.health--;
          updateHealthUI();
          if (player.health <= 0) {
            alert("Game Over!");
            resetGame();
          }
        }
        enemies.splice(ei, 1);
      }
    });

    // === LANCEMENT DU BOSS ===
    if (enemiesKilled >= 1) {
      enemies = [];
      boss = {
        x: canvas.width / 2 - 100,
        y: 20,
        width: 200,
        height: 60,
        color: "crimson",
        hp: 10,
        direction: 1,
        speed: 2,
        lastTorpedoTime: 0,
        lastLaserTime: 0,
        laserCharging: false,
        laserChargeStart: 0,
      };
    }
  }

  // === BOSS ===
  if (boss) {
    // Mouvement gauche-droite
    boss.x += boss.speed * boss.direction;
    if (boss.x <= 0 || boss.x + boss.width >= canvas.width)
      boss.direction *= -1;

    drawRect(boss);

    // === Laser ===
    if (!boss.laserCharging && Date.now() - boss.lastLaserTime > 10000) {
      boss.laserCharging = true;
      boss.laserChargeStart = Date.now();
    }

    if (boss.laserCharging) {
      const chargeDuration = Date.now() - boss.laserChargeStart;

      // Charge visuelle
      ctx.fillStyle = "rgba(255,0,0,0.3)";
      ctx.fillRect(
        boss.x + boss.width / 2 - 10,
        boss.y + boss.height,
        20,
        canvas.height
      );

      if (chargeDuration > 3000) {
        // TIR DU LASER
        bossLaser = {
          x: boss.x + boss.width / 2 - 10,
          width: 20,
        };
        boss.lastLaserTime = Date.now();
        boss.laserCharging = false;
      }
    }

    // Affichage et collision laser
    if (bossLaser) {
      ctx.fillStyle = "red";
      ctx.fillRect(bossLaser.x, 0, bossLaser.width, canvas.height);

      if (
        player.x < bossLaser.x + bossLaser.width &&
        player.x + player.width > bossLaser.x
      ) {
        alert("Touché par le laser ! Game Over!");
        resetGame();
        bossLaser = null;
        return;
      }

      // Laser reste 0.5s
      if (Date.now() - boss.lastLaserTime > 500) bossLaser = null;
    }

    // Torpilles régulières
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

    // Dégâts du joueur au boss
    bullets.forEach((bullet, bi) => {
      if (
        bullet.x < boss.x + boss.width &&
        bullet.x + bullet.width > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + bullet.height > boss.y
      ) {
        bullets.splice(bi, 1);
        boss.hp--;
        if (boss.hp <= 0) {
          alert("Boss vaincu ! GG !");
          resetGame();
        }
      }
    });
  }

  // === BULLETS ENNEMIES ===
  enemyBullets.forEach((b, bi) => {
    b.y += b.speed;
    drawRect(b);
    if (
      b.x < player.x + player.width &&
      b.x + b.width > player.x &&
      b.y < player.y + player.height &&
      b.y + b.height > player.y
    ) {
      if (player.shield) {
        player.shield = false; // Le bouclier absorbe le coup
      } else {
        player.health--;
        updateHealthUI();
        if (player.health <= 0) {
          alert("Game Over!");
          resetGame();
        }
      }
      enemyBullets.splice(bi, 1);
    } else if (b.y > canvas.height) {
      enemyBullets.splice(bi, 1);
    }
  });

  // === SPAWN ===
  if (!boss) {
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
  }
}

function resetGame() {
  player.health = player.maxHealth;
  player.score = 0;
  player.points = 0;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  powerups = [];
  player.shootDouble = false;
  player.rapidFire = false;
  player.shield = false;
  player.speed = player.baseSpeed;
  boss = null;
  bossLaser = null;
  enemiesKilled = 0;
  updateUI();
  updateHealthUI();
}

function updateUI() {
  scoreEl.textContent = player.score;
  pointsEl.textContent = player.points;
}

function updateHealthUI() {
  healthEl.textContent = `Vie: ${player.health}`;
}

function loop() {
  update();

  // Tir automatique
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

  requestAnimationFrame(loop);
}

// === CONTROLS ===
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " || e.code === "Space") {
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
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

lotteryBtn.addEventListener("click", () => {
  if (player.points >= 100) {
    player.points -= 100;
    const reward = pickPowerUp();
    player.powerups.push(reward);
    alert(`Tu as gagné : ${reward}`);
    applyPowerUp(reward);
    updateUI();
  } else {
    alert("Pas assez de points !");
  }
});

function pickPowerUp() {
  const lootTable = [
    { name: "double_shot", weight: 2 },
    { name: "shield", weight: 3 },
    { name: "speed_up", weight: 4 },
    { name: "rapid_fire", weight: 1 },
    { name: "heal", weight: 0.5 },
  ];
  const total = lootTable.reduce((sum, item) => sum + item.weight, 0);
  const roll = Math.random() * total;
  let cumulative = 0;
  for (const item of lootTable) {
    cumulative += item.weight;
    if (roll < cumulative) return item.name;
  }
}

function applyPowerUp(power) {
  switch (power) {
    case "double_shot":
      player.shootDouble = true;
      setTimeout(() => (player.shootDouble = false), 10000);
      break;
    case "speed_up":
      player.speed = player.baseSpeed + 3;
      setTimeout(() => (player.speed = player.baseSpeed), 20000);
      break;
    case "shield":
      player.shield = true;
      break;
    case "rapid_fire":
      player.rapidFire = true;
      setTimeout(() => (player.rapidFire = false), 5000);
      break;
    case "heal":
      if (player.health < player.maxHealth) {
        player.health++;
        updateHealthUI();
      } else {
        alert("Vie déjà au maximum !");
      }
      break;
  }
}

// === Démarre le jeu ===
updateHealthUI();
loop();
