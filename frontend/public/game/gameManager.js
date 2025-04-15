import { player } from "./player.js";
import { enemies, bullets, enemyBullets, turrets } from "./state.js";
import { spawnEnemy } from "./enemy.js";
import { showBossBanner, message } from "./ui.js";
import { spawnBoss, getBoss } from "./boss.js";

let win = false;
let bossBeaten = 0;
let enemiesToKill = 100;
const minSpawnInterval = 400;

export function resetGame() {
  if (!win) {
    player.score = 0;
    player.points = 0;
    bossBeaten = 0;
    enemiesToKill = 100;
  } else {
    player.points += 100;
    enemiesToKill = 100 + bossBeaten * 10;
  }

  player.health = player.maxHealth;
  bullets.length = 0;
  enemies.length = 0;
  enemyBullets.length = 0;
  turrets.length = 0;
  win = false;
}

export function checkBossSpawn(enemiesKilled) {
  if (!getBoss() && enemiesKilled >= enemiesToKill) {
    showBossBanner();
    enemies.length = 0;
    spawnBoss();
  }
}

export function updateSpawnTimers(spawnParams) {
  spawnParams.timer += 16;
  spawnParams.accelTimer += 16;

  if (spawnParams.timer >= spawnParams.interval) {
    spawnEnemy();
    spawnParams.timer = 0;
  }

  if (
    spawnParams.accelTimer >= 10000 &&
    spawnParams.interval > minSpawnInterval
  ) {
    spawnParams.interval -= 100;
    spawnParams.accelTimer = 0;
  }
}
