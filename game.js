const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const pointsEl = document.getElementById("points");
const lotteryBtn = document.getElementById("lottery-btn");

let player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 50,
  width: 30,
  height: 30,
  color: "lime",
  speed: 7,
  points: 0,
  score: 0,
  powerups: [],
};

let bullets = [];
let enemies = [];
let keys = {};

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

  // Player move
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width)
    player.x += player.speed;

  // Draw player
  drawRect(player);

  // Bullets
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    drawRect(b);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Enemies
  enemies.forEach((e, ei) => {
    e.y += e.speed;
    drawRect(e);

    // Collision with bullets
    bullets.forEach((b, bi) => {
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        player.score += 100;
        player.points += 10;
        updateUI();
      }
    });
  });
}

function updateUI() {
  scoreEl.textContent = player.score;
  pointsEl.textContent = player.points;
}

function loop() {
  update();
  requestAnimationFrame(loop);
}

// Key handling
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " || e.code === "Space") {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10,
      color: "white",
      speed: 7,
    });
  }
});

window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Lottery system 
lotteryBtn.addEventListener("click", () => {
  if (player.points >= 100) {
    player.points -= 100;
    const reward = pickPowerUp();
    player.powerups.push(reward);
    alert(`Tu as gagné: ${reward}`);
    applyPowerUp(reward);
    updateUI();
  } else {
    alert("Pas assez de points !");
  }
});

function pickPowerUp() {
  const lootTable = [
    { name: "double_shot", weight: 3 },
    { name: "shield", weight: 2 },
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
      break;
    case "speed_up":
      player.speed += 1;
      break;
    case "shield":
      player.shield = true;
      break;
    case "rapid_fire":
      // Could implement faster shooting
      break;
  }
}

// Start the game
setInterval(spawnEnemy, 1500);
loop();
