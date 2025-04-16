// === CANVAS & UI ===
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const pointsEl = document.getElementById("points");
const healthEl = document.getElementById("health");
const lotteryBtn = document.getElementById("lottery-btn");
const shootSound = new Audio("shoot.mp3");

shootSound.volume = 0.3;

function message(text) {
  const messageEl = document.getElementById("message");
  messageEl.classList.remove("hidden");
  messageEl.textContent = text;

  setTimeout(() => {
    messageEl.textContent = "";
    messageEl.classList.add("hidden");
  }, 2000);
}

// variable correctif
let turretSpawnInterval = 15000; // 30 secondes entre chaque apparition de tourelle
let enemiesToKill = 1;
let laserCharge = 1000;
let LaserCooldown = Math.floor(Math.random() * 2000) + 1000; // 1 et 3 secondes entre chaque tir de laser
let bossMaxHP = 200;
let bossHP = 200;
let spawnTimer = 0;
let spawnInterval = 2000; // entre 1 et 3 secondes
let spawnAccelerationTimer = 0;
const minSpawnInterval = 400;
let kamikazeSpawnChance = 6; // 6/10 de chance de spawn un kamikaze
let gunnerSpawnChance = 3; // 3/10 de chance de spawn un gunner
// les tank sont le reste des  chance de spawn (1/10)

let win = false;
let bossBeaten = 10; // Nombre de boss battus

// === PLAYER SETUP ===
let player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 50,
  width: 30,
  height: 30,
  color: "lime",
  damage: 1,
  baseDamage: 1, // Ajout du multiplicateur de dégâts (1 = normal, 2 = x2 damage)
  speed: 4,
  baseSpeed: 4,
  points: 0,
  score: 0,
  scoreMultiplier: 1, // Multiplicateur de score};
  baseScoreMultiplier: 1, // Ajout du multiplicateur de score (1 = normal, 2 = x2 score)
  health: 3,
  maxHealth: 3,
  shootDouble: false,
  rapidFire: false,
  shield: false,
};
// On ajoute l'image du joueur pour remplacer le cube
player.img = new Image();
player.img.src = "bombardino-crocodilo.png"; // Remplace ce chemin par l'URL de ton image

let bullets = [];
let enemies = [];
let enemyBullets = [];
let boss = null;
let bossLaser = null;
let shakeDuration = 0;
let shakeIntensity = 8;
let turrets = [];
let lastTurretSpawnTime = 0;

let keys = {};

let lastShotTime = 0;
const defaultShootCooldown = 300;
const rapidFireCooldown = 50;

let enemiesKilled = 0;

let gameOver = false; // Ajout de la variable de gestion du Game Over

// === SPAWN ENNEMIS ===
function spawnEnemy() {
  const typeChance = Math.random();
  let type, hp, speed, width, height, color;

  if (typeChance < kamikazeSpawnChance / 10) {
    type = "kamikaze";
    hp = 1;
    speed = 4 / 3;
    width = height = 30;
    color = "orange";
  } else if (typeChance < (gunnerSpawnChance + kamikazeSpawnChance) / 10) {
    type = "gunner";
    hp = 2;
    speed = 2 / 3;
    width = height = 30;
    color = "purple";
  } else {
    type = "tank";
    hp = 4;
    speed = 0.5;
    width = height = 40;
    color = "darkblue";
  }

  // Ajout des patterns de mouvement pour les ennemis
  const patterns = ["straight", "diagonal", "circular", "zigzag"];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  const enemy = {
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
    pattern, // le pattern de mouvement attribué
  };

  // Propriétés spécifiques selon le pattern attribué
  if (pattern === "diagonal") {
    enemy.dx = (Math.random() < 0.5 ? -1 : 1) * speed;
  } else if (pattern === "circular") {
    enemy.angle = 0;
    enemy.amplitude = 20;
    enemy.initX = enemy.x;
  } else if (pattern === "zigzag") {
    enemy.dx = (Math.random() < 0.5 ? -1 : 1) * speed;
  }
  // Le pattern 'straight' n'a pas de propriété supplémentaire

  enemies.push(enemy);
}

function spawnTurrets() {
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

function drawTriangle(obj) {
  const { x, y, width, height, color } = obj;
  ctx.fillStyle = color;
  ctx.beginPath();

  // Dessine un triangle pointant vers le bas
  ctx.moveTo(x + width / 2, y + height); // Bas au centre
  ctx.lineTo(x, y); // Haut gauche
  ctx.lineTo(x + width, y); // Haut droit

  ctx.closePath();
  ctx.fill();
}

function applyScreenShake() {
  if (shakeDuration > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(dx, dy);
    shakeDuration--;
  }
}
function showBossBanner() {
  const banner = document.getElementById("boss-banner");
  banner.classList.remove("hidden");

  setTimeout(() => {
    banner.classList.add("hidden");
  }, 3000); // 3 secondes d'affichage
}

// === UPDATE PRINCIPAL ===
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  applyScreenShake();

  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width)
    player.x += player.speed;

  // Au lieu de dessiner un cube pour le joueur, on affiche son image
  if (player.img && player.img.complete) {
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
  } else {
    drawRect(player);
  }

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
      // Mise à jour du mouvement en fonction du pattern attribué
      switch (enemy.pattern) {
        case "straight":
          enemy.y += enemy.speed;
          break;
        case "diagonal":
          enemy.x += enemy.dx;
          enemy.y += enemy.speed;
          if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.dx *= -1;
          }
          break;
        case "circular":
          enemy.y += enemy.speed;
          enemy.angle += 0.1;
          enemy.x = enemy.initX + enemy.amplitude * Math.cos(enemy.angle);
          break;
        case "zigzag":
          enemy.x += enemy.dx;
          if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.y += enemy.height; // Descend d'un cran à chaque rebond
            enemy.dx *= -1;
          }
          break;
        default:
          enemy.y += enemy.speed;
      }

      switch (enemy.type) {
        case "tank":
          drawCircle(enemy); // Dessine un cercle pour le tank
          break;
        case "kamikaze":
          drawRect(enemy); // Dessine un rectangle pour le kamikaze
          break;
        case "gunner":
          drawTriangle(enemy);
          break;
      }

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
          enemy.shootCooldown = Math.random() * 1000 + 1000; // Réinitialise le cooldown de tir
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
          enemy.hp -= player.damage; // Utilisation du multiplicateur de dégâts
          if (enemy.hp <= 0) {
            enemies.splice(ei, 1);
            player.score += 100 * player.scoreMultiplier; // Application du multiplicateur de score
            player.points += 10;
            enemiesKilled++;
            updateUI(player.score, player.points);
          }
        }
      });

      // Collision avec le joueur
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
          updateHealthUI(player.health);
        }
        enemies.splice(ei, 1);
      }
    });

    // === LANCEMENT DU BOSS ===
    if (enemiesKilled >= enemiesToKill) {
      showBossBanner();
      enemies = [];
      boss = {
        x: canvas.width / 2 - 100,
        y: 20,
        width: 200,
        height: 60,
        color: "crimson",
        hp: bossHP,
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
    if (Date.now() - lastTurretSpawnTime > turretSpawnInterval) {
      spawnTurrets();
      lastTurretSpawnTime = Date.now();
    }
    // === TOURELLES ===
    turrets.forEach((turret, ti) => {
      // Tir vers le joueur
      const now = Date.now();
      if (now - turret.lastShootTime > turret.shootCooldown) {
        // Calcul direction vers le joueur
        const dx = player.x + player.width / 2 - (turret.x + turret.width / 2);
        const dy =
          player.y + player.height / 2 - (turret.y + turret.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 3;

        enemyBullets.push({
          x: turret.x + turret.width / 2 - 2,
          y: turret.y + turret.height / 2 - 2,
          width: 4,
          height: 4,
          color: "yellow",
          speedX: (dx / dist) * speed,
          speedY: (dy / dist) * speed,
        });

        turret.lastShootTime = now;
      }

      drawRect(turret);

      // Collision avec les tirs du joueur
      bullets.forEach((bullet, bi) => {
        if (
          bullet.x < turret.x + turret.width &&
          bullet.x + bullet.width > turret.x &&
          bullet.y < turret.y + turret.height &&
          bullet.y + bullet.height > turret.y
        ) {
          bullets.splice(bi, 1);
          turret.hp -= player.damage; // Utilisation du multiplicateur de dégâts pour les tourelles
          if (turret.hp <= 0) {
            turrets.splice(ti, 1);
            player.points += 15; // Multiplicateur de score appliqué
            updateUI();
          }
        }
      });
    });

    // Mouvement gauche-droite
    boss.x += boss.speed * boss.direction;
    if (boss.x <= 0 || boss.x + boss.width >= canvas.width)
      boss.direction *= -1;

    drawRect(boss);

    // === Laser ===
    if (
      !boss.laserCharging &&
      Date.now() - boss.lastLaserTime > LaserCooldown
    ) {
      boss.laserCharging = true;
      boss.laserChargeStart = Date.now();
      shakeDuration = 15; // secoue l’écran lors du chargement du laser
    }

    if (boss.laserCharging) {
      const chargeDuration = Date.now() - boss.laserChargeStart;

      // Indicateur visuel de charge
      ctx.fillStyle = "rgba(255,0,0,0.3)";
      ctx.fillRect(
        boss.x + boss.width / 2 - 10,
        boss.y + boss.height,
        20,
        canvas.height
      );

      if (chargeDuration > laserCharge) {
        // TIR DU LASER
        bossLaser = {
          x: boss.x + boss.width / 2 - 10,
          width: 20,
        };
        boss.lastLaserTime = Date.now();
        boss.laserCharging = false;
      }
    }

    // Affichage et collision du laser
    if (bossLaser) {
      ctx.fillStyle = "red";
      ctx.fillRect(bossLaser.x, 0, bossLaser.width, canvas.height);

      if (
        player.x < bossLaser.x + bossLaser.width &&
        player.x + player.width > bossLaser.x
      ) {
        // message("Touché par le laser ! Game Over!");
        // Active gameOver au lieu d'appeler resetGame()
        player.health = player.health - 2;
        updateHealthUI();
        bossLaser = null;
        return;
      }

      // Le laser reste affiché 0.5s
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

    // Dégâts du joueur sur le boss
    bullets.forEach((bullet, bi) => {
      if (
        bullet.x < boss.x + boss.width &&
        bullet.x + bullet.width > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + bullet.height > boss.y
      ) {
        bullets.splice(bi, 1);
        boss.hp -= player.damage; // Multiplicateur de dégâts appliqué au boss
        if (boss.hp <= 0) {
          message("Boss vaincu ! GG !");
          player.score += 1000 * player.scoreMultiplier; // Multiplicateur de score appliqué
          win = true;
          bossBeaten += 1; // Incrémente le nombre de boss battus
          resetGame();
        }
      }
    });
  }

  // === BULLETS ENNEMIES ===
  enemyBullets.forEach((b, bi) => {
    b.x += b.speedX || 0;
    b.y += b.speedY || b.speed;

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
  ctx.restore();
}

const getId = async () => {
  const storedToken = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:5000/api/token/decrypt", {
      method: "GET",
      headers: {
        authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      return data.id; // Retourne l'id de l'utilisateur
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'id :", error);
  }
};

const putUserScore = async (id, score) => {
  try {
    await fetch(`http://localhost:5000/api/users/newScore/`, {
      method: "put",
      headers: { "Content-Type": "application/json", id: id },
      body: JSON.stringify({ score: score }),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'id :", error);
  }
};

async function resetGame() {
  if (!win) {
    const id = await getId();
    putUserScore(id, player.score); // Envoie le score au backend
    player.score = 0;
    player.points = 0;
    spawnInterval = 2000;
    bossBeaten = 0; // Réinitialise le nombre de boss battus
    enemiesToKill = 100; // Réinitialise le nombre d'ennemis à tuer pour faire apparaître le boss
  } else {
    player.points += 100; // Bonus de points pour avoir battu le boss
    if (spawnInterval > minSpawnInterval)
      spawnInterval = 2000 - bossBeaten * 100; // Réduction de l'intervalle de spawn des ennemis
    enemiesToKill = 100 + bossBeaten + 10;
  }

  player.health = player.maxHealth;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  player.powerups = [];
  player.shootDouble = false;
  player.rapidFire = false;
  player.shield = false;
  player.speed = player.baseSpeed;
  // Réinitialisation des multiplicateurs
  player.damage = 1;
  player.scoreMultiplier = 1;
  boss = null;
  bossLaser = null;
  enemiesKilled = 0;
  win = false;
  updateUI(player.score, player.points);
  updateHealthUI(player.health);
  const event = new Event("resetGame");
  window.dispatchEvent(event);
}

function updateUI() {
  scoreEl.textContent = player.score;
  pointsEl.textContent = player.points;
}

function updateHealthUI() {
  if (player.health <= 0) {
    // message("Game Over!");
    // Active gameOver au lieu d'appeler resetGame()
    gameOver = true;
  }
  healthEl.textContent = `Vie: ${player.health}`;
}

function loop() {
  // Si Game Over, arrête toute mise à jour du jeu et affiche l'écran de fin
  if (gameOver) {
    ctx.save();
    ctx.fillStyle = "rgba(50,50,50,0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 80);
    ctx.font = "20px Arial";
    ctx.fillText(
      "Appuie sur Entrée pour rejouer",
      canvas.width / 2,
      canvas.height / 2 + 20
    );
    ctx.restore();

    // Vérifie si Entrée est pressée pour redémarrer
    if (keys["Enter"]) {
      resetGame();
      gameOver = false;
    }
    requestAnimationFrame(loop);
    return;
  }

  update();

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

  requestAnimationFrame(loop);
}

// === CONTROLS ===
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  // shoot with space
  // if (e.key === " " || e.code === "Space") {
  //   // const now = Date.now();
  //   // const shootCooldown = player.rapidFire
  //   //   ? rapidFireCooldown
  //   //   : defaultShootCooldown;
  //   // if (now - lastShotTime >= shootCooldown) {
  //   //   lastShotTime = now;
  //   //   shootSound.currentTime = 0;
  //   //   shootSound.play();
  //   //   if (player.shootDouble) {
  //   //     bullets.push(
  //   //       {
  //   //         x: player.x + player.width / 2 - 10,
  //   //         y: player.y,
  //   //         width: 4,
  //   //         height: 10,
  //   //         color: "white",
  //   //         speed: 7,
  //   //       },
  //   //       {
  //   //         x: player.x + player.width / 2 + 6,
  //   //         y: player.y,
  //   //         width: 4,
  //   //         height: 10,
  //   //         color: "white",
  //   //         speed: 7,
  //   //       }
  //   //     );
  //   //   } else {
  //   //     bullets.push({
  //   //       x: player.x + player.width / 2 - 2,
  //   //       y: player.y,
  //   //       width: 4,
  //   //       height: 10,
  //   //       color: "white",
  //   //       speed: 7,
  //   //     });
  //   //   }
  //   // }
  // }
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// === LOTTERY ===
const lotteryRoll = () => {
  if (player.points >= 100) {
    player.points -= 100;
    const reward = pickPowerUp();
    player.powerups.push(reward);
    message(`Tu as gagné : ${reward}`);
    applyPowerUp(reward);
    updateUI(player.score, player.points);
  } else {
    message("Pas assez de points !");
  }
};

lotteryBtn.addEventListener("click", () => {
  lotteryRoll();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "e") {
    e.preventDefault(); // Empêche le comportement par défaut de la touche "L"
    lotteryRoll();
  }
});

function pickPowerUp() {
  const lootTable = [
    { name: "double_shot", weight: 2 },
    { name: "shield", weight: 3 },
    { name: "speed_up", weight: 4 },
    { name: "rapid_fire", weight: 1 },
    { name: "heal", weight: 0.5 },
    { name: "damage_bonus", weight: 1 }, // Nouveau power-up: x2 damage
    { name: "score_x2", weight: 1 }, // Nouveau power-up: x2 score
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
        // Utilise player.health (la propriété de la vie actuelle) pour l'incrément
        player.health++;
        updateHealthUI();
      } else {
        message("Vie déjà au maximum !");
        player.points += 90; // Bonus de 10 points si la vie est déjà au max
      }
      break;
    case "damage_bonus": // Applique un multiplicateur de dégâts x2 pendant 10 sec.
      player.damage = player.damage * 2;
      setTimeout(() => (player.damage = 1), 10000);
      break;
    case "score_x2": // Applique un multiplicateur de score x2 pendant 10 sec.
      player.scoreMultiplier = player.scoreMultiplier * 2;
      setTimeout(() => (player.scoreMultiplier = 1), 10000);
      break;
  }
}

// === Démarre le jeu ===
const hgScore = new Event("resetGame");
window.dispatchEvent(hgScore); // initialise le highScore
updateHealthUI();
loop();
