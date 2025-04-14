const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const pointsEl = document.getElementById("points");
const healthEl = document.getElementById("health");
const lotteryBtn = document.getElementById("lottery-btn");

let player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 50,
  width: 30,
  height: 30,
  color: "lime",
  speed: 7,
  baseSpeed: 7,
  points: 0,
  score: 0,
  health: 3,
  powerups: [],
  shootDouble: false,
  rapidFire: false,
  shield: false,
};

let bullets = [];
let enemies = [];
let keys = {};

let lastShotTime = 0;
const defaultShootCooldown = 200;
const rapidFireCooldown = 50;

let spawnTimer = 0;
let spawnInterval = 2000;
let spawnAccelerationTimer = 0;
const minSpawnInterval = 400;

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 30),
    y: -30,
    width: 30,
    height: 30,
    color: "red",
    speed: 2,
  });
}

function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }

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

  bullets.forEach((bullet, bulletIndex) => {
    bullet.y -= bullet.speed;
    drawRect(bullet);
    if (bullet.y < 0) {
      bullets.splice(bulletIndex, 1);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.y += enemy.speed;
    drawRect(enemy);

    bullets.forEach((bullet, bulletCollisionIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        bullets.splice(bulletCollisionIndex, 1);
        enemies.splice(enemyIndex, 1);
        player.score += 100;
        player.points += 10;
        updateUI();
      }
    });

    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      if (!player.shield) {
        player.health -= 1;
        updateHealthUI();
        enemies.splice(enemyIndex, 1);
        if (player.health <= 0) {
          alert("Game Over!");
          player.health = 3;
          player.score = 0;
          player.points = 0;
          updateUI();
          updateHealthUI();
          enemies = [];
          bullets = [];
        }
      } else {
        enemies.splice(enemyIndex, 1);
      }
    }
  });

  // --- Gestion du spawn progressif ---
  spawnTimer += 16;
  spawnAccelerationTimer += 16;

  if (spawnTimer >= spawnInterval) {
    spawnEnemy();
    spawnTimer = 0;
  }

  if (spawnAccelerationTimer >= 10000) {
    if (spawnInterval > minSpawnInterval) {
      spawnInterval -= 100;
    }
    spawnAccelerationTimer = 0;
  }
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
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " || e.code === "Space") {
    let currentTime = Date.now();
    const shootCooldown = player.rapidFire
      ? rapidFireCooldown
      : defaultShootCooldown;
    if (currentTime - lastShotTime >= shootCooldown) {
      lastShotTime = currentTime;
      if (player.shootDouble) {
        bullets.push({
          x: player.x + player.width / 2 - 10,
          y: player.y,
          width: 4,
          height: 10,
          color: "white",
          speed: 7,
        });
        bullets.push({
          x: player.x + player.width / 2 + 6,
          y: player.y,
          width: 4,
          height: 10,
          color: "white",
          speed: 7,
        });
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
      setTimeout(() => {
        player.shootDouble = false;
      }, 10000);
      break;
    case "speed_up":
      player.speed = player.baseSpeed + 3;
      setTimeout(() => {
        player.speed = player.baseSpeed;
      }, 20000);
      break;
    case "shield":
      player.shield = true;
      break;
    case "rapid_fire":
      player.rapidFire = true;
      setTimeout(() => {
        player.rapidFire = false;
      }, 5000);
      break;
  }
}

// Lancer la boucle
updateHealthUI();
loop();
