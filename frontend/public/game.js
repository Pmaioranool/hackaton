// === CANVAS & UI ===
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const pointsEl = document.getElementById("points");
const healthEl = document.getElementById("health");
const lotteryBtn = document.getElementById("lottery-btn");
const shootSound = new Audio("shoot.mp3");
const backgroundMusic = new Audio("/asset/music/background.mp3");
const bossMusic = new Audio("/asset/music/boss.mp3");
const gameOverMusic = new Audio("/asset/music/gameover.mp3");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
let isShopOpen = false;
shootSound.volume = 0.3;

backgroundMusic.volume = 0.2; // 50% du volume
bossMusic.volume = 0.3;
gameOverMusic.volume = 0.3;

// Configurer la lecture en boucle
backgroundMusic.loop = true;
bossMusic.loop = true;
const enemyImages = {
  kamikaze: new Image(),
  gunner: new Image(),
  tank: new Image(),
  boss: new Image(),
};

// Configuration des sources des images
enemyImages.kamikaze.src = "/asset/sprite/enemy_kamikaze.png";
enemyImages.gunner.src = "/asset/sprite/enemy_gunner.png";
enemyImages.tank.src = "/asset/sprite/enemy_tank.png";
enemyImages.boss.src = "/asset/sprite/boss.png";
enemyImages.kamikaze.onerror = () =>
  console.error("Failed to load kamikaze image");
enemyImages.gunner.onerror = () => console.error("Failed to load gunner image");

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
let baseEnemiesToKill = 2;
let enemiesToKill = baseEnemiesToKill;
let laserCharge = 3000;
let LaserCooldown = Math.floor(Math.random() * 2000) + 1000; // 1 et 3 secondes entre chaque tir de laser
let bossHP = 200;
let bossHPMax = 200;
let spawnTimer = 0;
let spawnInterval = 2000;
let spawnAccelerationTimer = 0;
const minSpawnInterval = 400;
let kamikazeSpawnChance = 6; // 6/10 de chance de spawn un kamikaze
let gunnerSpawnChance = 3; // 3/10 de chance de spawn un gunner
let pointToGamble = 50;
// les tank sont le reste des  chance de spawn (1/10)

let chance_double_shot = 0.5;
let laps_double_shot = 7000;

let chance_rapid_fire = 0.5;
let laps_rapid_fire = 2000;
const rapidFireCooldown = 100;

let chance_damage_bonus = 0.5; // Applique un multiplicateur de dégâts x2 pendant 10 sec.
let laps_damage_bonus = 7500;

let chance_speed_up = 1;
let laps_speed_up = 3000;

let chance_heal = 2.5;
let chance_shield = 3;
let laps_shield = 10000;

let chance_score_x2 = 2; // Applique un multiplicateur de score x2 pendant 10 sec.
let laps_score_x2 = 3000;

let win = false;
let bossBeaten = 0; // Nombre de boss battus

// === PLAYER SETUP ===
let player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 50,
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
  extraCannons: 0, // Nouveau : nombre de canons supplémentaires
  rapidFire: false,
  shield: false,
  bossCoins: 0,
  baseCannon: 1,
};

const defaultShootCooldown = 300;
// On ajoute l'image du joueur pour remplacer le cube
player.img = new Image();
player.img.src = "/asset/sprite/sprite_hero.png"; // Remplace ce chemin par l'URL de ton image

enemyImages.boss = new Image();
enemyImages.boss.src = "/asset/sprite/boss.png";
enemyImages.boss.onerror = () => console.error("Failed to load boss image");
function createShop(bossCoins) {
  isShopOpen = true; // Ouvre la boutique
  isPaused = true; // Met le jeu en pause

  // Conteneur principal de la boutique
  const shopContainer = document.createElement("div");
  shopContainer.className = "shop-container";
  shopContainer.style.position = "absolute";
  shopContainer.style.top = "50%";
  shopContainer.style.left = "50%";
  shopContainer.style.transform = "translate(-50%, -50%)";
  shopContainer.style.padding = "20px";
  shopContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  shopContainer.style.color = "white";
  shopContainer.style.border = "2px solid white";
  shopContainer.style.borderRadius = "10px";
  shopContainer.style.fontFamily = "Arial, sans-serif";
  shopContainer.style.zIndex = "1000";

  // Titre de la boutique
  const shopTitle = document.createElement("h1");
  shopTitle.textContent = "Shop";
  shopContainer.appendChild(shopTitle);

  // Affichage des BossCoins
  const bossCoinsDisplay = document.createElement("p");
  bossCoinsDisplay.innerHTML = `<strong>BossCoins :</strong> ${bossCoins}`;
  shopContainer.appendChild(bossCoinsDisplay);

  // Liste des articles
  const itemsList = document.createElement("ul");
  itemsList.style.listStyle = "none";
  itemsList.style.padding = "0";

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.style.marginBottom = "10px";

    if (item.max !== 0) {
      const itemText = document.createElement("span");
      itemText.textContent = `${item.name} - ${item.cost} BossCoins - encore ${item.max}`;
      listItem.appendChild(itemText);

      // Bouton d'achat
      const buyButton = document.createElement("button");
      buyButton.textContent = "Acheter";
      buyButton.style.marginLeft = "10px";
      buyButton.style.padding = "5px 10px";
      buyButton.style.backgroundColor = "#007bff";
      buyButton.style.color = "white";
      buyButton.style.border = "none";
      buyButton.style.borderRadius = "5px";
      buyButton.style.cursor = "pointer";

      buyButton.addEventListener("click", () => {
        handlePurchase(item, bossCoinsDisplay, shopContainer);
      });

      listItem.appendChild(buyButton);
      itemsList.appendChild(listItem);
    }
  });

  shopContainer.appendChild(itemsList);
  // Ajoute la boutique au document
  document.body.appendChild(shopContainer);
}

// Fonction pour gérer l'achat d'un article
function handlePurchase(item, bossCoinsDisplay, shopContainer) {
  if (player.bossCoins >= item.cost) {
    if (item.max > 0 || item.max === "illimité") {
      player.bossCoins -= item.cost; // Déduit le coût des BossCoins
      bossCoinsDisplay.innerHTML = `<strong>BossCoins :</strong> ${player.bossCoins}`;
      switch (item.id) {
        case 1:
          player.damage += 1; // Double les dégâts
          player.baseDamage += 1; // Double les dégâts
          item.max -= 1; // Réduit le nombre d'achats possibles
          break;
        case 2:
          player.maxHealth += 1; // Augmente la vie max
          player.health += 1; // Récupère 1 vie
          updateHealthUI(player.health);
          item.max -= 1; // Réduit le nombre d'achats possibles
          break;
        case 3:
          player.extraCannons += 1; // Ajoute une deuxième tourelle
          item.max -= 1; // Réduit le nombre d'achats possibles
          break;
        case 4:
          player.shield = true; // Ajoute un bouclier
          break;
        case 5: // Skip
          break;
      }
      shopContainer.remove(); // Supprime la boutique après l'achat
      isPaused = false; // Reprend le jeu
      isShopOpen = false; // Ferme la boutique
    }
  } else {
    message("Vous n'avez pas assez de BossCoins !");
  }
}

// Liste des articles disponibles
const items = [
  { id: 1, name: "Damage Bonus", cost: 3, max: 2 },
  { id: 2, name: "Max Health Bonus", cost: 3, max: 3 },
  { id: 3, name: "More Cannons", cost: 5, max: 4 },
  { id: 4, name: "Shield Upgrade", cost: 1, max: "illimité" },
  { id: 5, name: "skip", cost: 0, max: "illimité" },
];

// Crée et affiche la boutique
// Fonction pour gérer l'achat d'un article

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
    width = height = 25;
    color = "orange";
  } else if (typeChance < (gunnerSpawnChance + kamikazeSpawnChance) / 10) {
    type = "gunner";
    hp = 2;
    speed = 2 / 3;
    width = height = 25;
    color = "purple";
  } else {
    type = "tank";
    hp = 4;
    speed = 0.5;
    width = height = 35;
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
    img: enemyImages[type],
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
          if (enemy.img && enemy.img.complete) {
            ctx.drawImage(
              enemy.img,
              enemy.x,
              enemy.y,
              enemy.width,
              enemy.height
            );
          } else {
            drawCircle(enemy);
          }
          break;
        case "kamikaze":
          if (enemy.img && enemy.img.complete) {
            ctx.drawImage(
              enemy.img,
              enemy.x,
              enemy.y,
              enemy.width,
              enemy.height
            );
          } else {
            drawRect(enemy);
          }
          break;
        case "gunner":
          if (enemy.img && enemy.img.complete) {
            ctx.drawImage(
              enemy.img,
              enemy.x,
              enemy.y,
              enemy.width,
              enemy.height
            );
          } else {
            drawTriangle(enemy);
          }
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
      backgroundMusic.pause();
      bossMusic.currentTime = 0;
      bossMusic.play().catch((e) => console.error("Erreur boss music:", e));
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
        img: enemyImages.boss,
      };
    }
  }

  // === BOSS ===
  if (boss !== null) {
    drawRect(boss);
    drawBossHealthBar(boss);
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

    if (boss.img && boss.img.complete) {
      ctx.drawImage(boss.img, boss.x, boss.y, boss.width, boss.height);
    } else {
      drawRect(boss);
    }

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
      // Vérifie d'abord que le boss existe toujours
      if (!boss) return;

      // Ensuite vérifie la collision
      if (
        bullet.x < boss.x + boss.width &&
        bullet.x + bullet.width > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + bullet.height > boss.y
      ) {
        bullets.splice(bi, 1);
        boss.hp -= player.damage;

        // Effet visuel quand le boss prend des dégâts
        shakeDuration = 5;
        const originalColor = boss.color;
        boss.color = "darkred";

        setTimeout(() => {
          if (boss) {
            // Vérifie à nouveau que le boss existe
            boss.color = originalColor;
          }
        }, 100);

        if (boss.hp <= 0) {
          message("Boss vaincu ! GG !");
          player.score += 1000 * player.scoreMultiplier;
          bossBeaten += 1;
          player.bossCoins += 1; // Ajoute 1 BossCoin au joueur
          win = true;
          resetGame();
          return; // Sortir immédiatement après avoir reset le jeu
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
    spawnTimer += 8;
    spawnAccelerationTimer += 8;
    if (spawnTimer >= spawnInterval) {
      spawnEnemy();
      spawnTimer = 0;
    }
    if (spawnAccelerationTimer >= 20000) {
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
    if (data.error) {
      window.location.href = "/login"; // Redirige vers la page de connexion si le token est invalide
    }
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
      headers: { "Content-Type": "application/json", id: `${id}` },
      body: JSON.stringify({ score: score }),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'id :", error);
  }
};

async function resetGame() {
  try {
    await backgroundMusic.pause();
    await bossMusic.pause();
    await gameOverMusic.pause();

    if (!gameOver) {
      backgroundMusic.currentTime = 0;
      await backgroundMusic.play();
    }
  } catch (e) {
    console.error("Erreur gestion audio:", e);
  }
  // Jouer la musique de fond si le jeu n'est pas en Game Over

  if (!win) {
    const id = await getId();
    putUserScore(id, player.score); // Envoie le score au backend
    player.score = 0;
    player.points = 0;
    spawnInterval = 2000;
    player.maxHealth = 3; // Réinitialise la vie max
    player.health = player.maxHealth; // Réinitialise la vie actuelle
    bossBeaten = 0; // Réinitialise le nombre de boss battus
    enemiesToKill = baseEnemiesToKill; // Réinitialise le nombre d'ennemis à tuer pour faire apparaître le boss
  } else {
    createShop(player.bossCoins);
    player.points += 100; // Bonus de points pour avoir battu le boss
    if (spawnInterval > minSpawnInterval)
      spawnInterval = 2000 - bossBeaten * 200; // Réduction de l'intervalle de spawn des ennemis
    enemiesToKill = baseEnemiesToKill + bossBeaten + 10;
    bossHp = bossHPMax + bossBeaten * 100; // Augmente la vie du boss à chaque victoire
  }

  player.health = player.maxHealth;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  player.powerups = [];
  player.rapidFire = false;
  player.shield = false;
  player.speed = player.baseSpeed;
  // Réinitialisation des multiplicateurs
  player.damage = 1;
  player.scoreMultiplier = 1;
  boss = null;
  bossLaser = null;
  enemiesKilled = 0;
  updateUI(player.score, player.points);
  updateHealthUI(player.health);

  win = false;
  const event = new Event("resetGame");
  window.dispatchEvent(event);
}

function drawBossHealthBar(boss) {
  const barWidth = 200;
  const barHeight = 20;
  const x = canvas.width / 2 - barWidth / 2;
  const y = 10;

  // Fond de la barre
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, barWidth, barHeight);

  // Vie actuelle
  const healthWidth = (boss.hp / bossHP) * barWidth;
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, healthWidth, barHeight);

  // Contour
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);

  // Texte
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
}
function updateUI() {
  scoreEl.textContent = `${player.score} X ${player.scoreMultiplier}`;
  pointsEl.textContent = `${player.points}`;
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
  // Si le jeu est en pause, ne pas continuer la boucle
  if (isPaused) {
    requestAnimationFrame(loop);
    return;
  }

  // Si Game Over, arrête toute mise à jour du jeu et affiche l'écran de fin
  if (gameOver) {
    backgroundMusic.pause();
    bossMusic.pause();
    gameOverMusic.currentTime = 0;
    gameOverMusic
      .play()
      .catch((e) => console.error("Erreur game over music:", e));
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

    // Tir principal
    if (player.extraCannons < 1) {
      bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        color: "white",
        speed: 7,
      });
    } else {
      // Ajout des canons supplémentaires
      for (let i = 1; i <= player.extraCannons; i++) {
        bullets.push(
          {
            x: player.x + player.width / 2 + 10 - i * 20, // Décalage à gauche
            y: player.y,
            width: 4,
            height: 10,
            color: "white",
            speed: 7,
          },
          {
            x: player.x + player.width / 2 - 10 + i * 20, // Décalage à droite
            y: player.y,
            width: 4,
            height: 10,
            color: "white",
            speed: 7,
          }
        );
      }
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
  if (isShopOpen) return;
  if (player.points >= pointToGamble) {
    player.points -= pointToGamble;
    const reward = pickPowerUp();
    // player.powerups.push(reward);
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
  if (e.code === "KeyE") {
    e.preventDefault(); // Empêche le comportement par défaut de la touche "L"
    lotteryRoll();
  }
});

function pickPowerUp() {
  const lootTable = [
    { name: "double_shot", weight: chance_double_shot },
    { name: "shield", weight: chance_shield },
    { name: "speed_up", weight: chance_speed_up },
    { name: "rapid_fire", weight: chance_rapid_fire },
    { name: "heal", weight: chance_heal },
    { name: "damage_bonus", weight: chance_damage_bonus }, // Nouveau power-up: x2 damage
    { name: "score_x2", weight: chance_score_x2 }, // Nouveau power-up: x2 score
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
      player.extraCannons += 1; // Ajoute un canon supplémentaire
      setTimeout(() => {
        player.extraCannons = Math.max(0, player.extraCannons - 1); // Réduit le nombre de canons après un délai
      }, laps_double_shot);
      break;
    case "speed_up":
      player.speed = player.baseSpeed + 3;
      setTimeout(() => (player.speed = player.baseSpeed), laps_speed_up);
      break;
    case "shield":
      if (!player.shield) {
        message("deja un shield");
        player.points += 50;
        break;
      }
      player.shield = true;
      break;
    case "rapid_fire":
      player.rapidFire = true;
      setTimeout(() => (player.rapidFire = false), laps_rapid_fire);
      break;
    case "heal":
      if (player.health < player.maxHealth) {
        // Utilise player.health (la propriété de la vie actuelle) pour l'incrément
        player.health++;
        updateHealthUI();
      } else {
        message("Vie déjà au maximum !");
        player.points += 50; // Bonus de 10 points si la vie est déjà au max
      }
      break;
    case "damage_bonus": // Applique un multiplicateur de dégâts x2 pendant 10 sec.
      player.damage = player.damage * 2;
      setTimeout(() => (player.damage = player.damage / 2), laps_damage_bonus);
      break;
    case "score_x2": // Applique un multiplicateur de score x2 pendant 10 sec.
      if (player.scoreMultiplier === 32) {
        message("Déjà x32 !");
        player.points += 50; // Bonus de 10 points si le multiplicateur est déjà au max
        return;
      }
      player.scoreMultiplier = player.scoreMultiplier * 2;
      setTimeout(
        () => (player.scoreMultiplier = player.scoreMultiplier / 2),
        laps_score_x2
      );
      setTimeout(updateUI(player.score, player.points), laps_score_x2);
      updateUI(player.score, player.points);
      break;
  }
}

// === Démarre le jeu ===
const hgScore = new Event("resetGame");
window.dispatchEvent(hgScore); // initialise le highScore
getId();
updateHealthUI();
startButton.addEventListener("click", async () => {
  try {
    await backgroundMusic.play(); // Doit être déclenché par une action utilisateur
    startButton.remove();
    pauseButton.classList.remove("hidden");
  } catch (e) {
    console.error("Erreur lecture musique:", e);
    // Fallback si la musique ne peut pas jouer
  }
});
startButton.addEventListener("click", () => {
  startButton.remove(); // Supprime le bouton après avoir cliqué
  pauseButton.classList.remove("hidden"); // Affiche le bouton de pause
  loop(); // Démarre la boucle du jeu
});

let isPaused = false;

// Gestion de la pause avec la touche "Escape"
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape" && !isShopOpen) {
    isPaused = !isPaused; // Inverse l'état de pause
    pauseButton.textContent = isPaused ? "Reprendre" : "Pause"; // Change le texte du bouton
    if (boss) {
      bossMusic[isPaused ? "pause" : "play"](); // Met en pause ou reprend la musique de boss
    } else {
      backgroundMusic[isPaused ? "pause" : "play"](); // Met en pause ou reprend la musique de fond
    }
  }
});

// Gestionnaire d'événement pour le bouton Pause
pauseButton.addEventListener("click", () => {
  if (isShopOpen) return; // Ne pas changer l'état si la boutique est ouverte
  isPaused = !isPaused; // Inverse l'état de pause
  pauseButton.textContent = isPaused ? "Reprendre" : "Pause"; // Change le texte du bouton
  if (boss) {
    bossMusic[isPaused ? "pause" : "play"](); // Met en pause ou reprend la musique de boss
  } else {
    backgroundMusic[isPaused ? "pause" : "play"](); // Met en pause ou reprend la musique de fond
  }
});
