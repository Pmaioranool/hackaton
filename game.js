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
  baseSpeed: 7,  // Vitesse de base du joueur
  points: 0,
  score: 0,
  powerups: [],
  // Propriétés de power-ups
  shootDouble: false,
  rapidFire: false,
  shield: false,
};

let bullets = [];
let enemies = [];
let keys = {};

// Variables pour le tir
let lastShotTime = 0;
const defaultShootCooldown = 200; // en millisecondes
const rapidFireCooldown = 50;      // en millisecondes

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
  // Effacer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Déplacement du joueur
  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }

  // Dessiner le joueur
  drawRect(player);

  // Si le shield est actif, on dessine un halo autour du joueur
  if (player.shield) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Mise à jour et affichage des balles
  bullets.forEach((bullet, bulletIndex) => {
    bullet.y -= bullet.speed;
    drawRect(bullet);
    if (bullet.y < 0) {
      bullets.splice(bulletIndex, 1);
    }
  });

  // Mise à jour et affichage des ennemis
  enemies.forEach((enemy, enemyIndex) => {
    enemy.y += enemy.speed;
    drawRect(enemy);

    // Vérification de la collision entre chaque ennemi et chacune des balles
    bullets.forEach((bullet, bulletCollisionIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Collision : suppression de la balle et de l'ennemi
        bullets.splice(bulletCollisionIndex, 1);
        enemies.splice(enemyIndex, 1);
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

// Gestion des événements clavier, avec vérification du cooldown pour le tir
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " || e.code === "Space") {
    let currentTime = Date.now();
    const shootCooldown = player.rapidFire ? rapidFireCooldown : defaultShootCooldown;
    if (currentTime - lastShotTime >= shootCooldown) {
      lastShotTime = currentTime;
      // Si le power-up double_shot est actif, on tire deux balles
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
        // Tir normal
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

// Système de loterie pour obtenir des power-ups
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
      // Réinitialisation après 10 secondes
      setTimeout(() => {
        player.shootDouble = false;
      }, 10000);
      break;
    case "speed_up":
      // Augmente la vitesse de façon plus marquée (ex. +3)
      player.speed = player.baseSpeed + 3;
      setTimeout(() => {
        player.speed = player.baseSpeed;
      }, 20000);
      break;
    case "shield":
      // Le shield reste actif jusqu'à ce qu'une autre logique intervienne pour le désactiver
      player.shield = true;
      break;
    case "rapid_fire":
      player.rapidFire = true;
      // Réinitialisation après 5 secondes
      setTimeout(() => {
        player.rapidFire = false;
      }, 5000);
      break;
  }
}

// Démarrage du jeu
setInterval(spawnEnemy, 400);
loop();
