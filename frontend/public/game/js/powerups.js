// powerups.js
import { player } from "./gameState.js";
import { updateUI, updateHealthUI, showMessage } from "./ui.js";

export function lotteryRoll() {
  if (player.points >= 100) {
    player.points -= 100;
    const reward = pickPowerUp();
    player.powerups.push(reward);
    showMessage(`Tu as gagné : ${reward}`);
    applyPowerUp(reward);
    updateUI();
  } else {
    showMessage("Pas assez de points !");
  }
}

export function pickPowerUp() {
  const lootTable = [
    { name: "double_shot", weight: 2 },
    { name: "shield", weight: 3 },
    { name: "speed_up", weight: 4 },
    { name: "rapid_fire", weight: 1 },
    { name: "heal", weight: 0.5 },
    { name: "damage_bonus", weight: 1 },
    { name: "score_x2", weight: 1 },
  ];
  const total = lootTable.reduce((sum, item) => sum + item.weight, 0);
  const roll = Math.random() * total;
  let cumulative = 0;
  for (const item of lootTable) {
    cumulative += item.weight;
    if (roll < cumulative) return item.name;
  }
}

export function applyPowerUp(power) {
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
        showMessage("Vie déjà au maximum !");
        player.points += 90;
      }
      break;
    case "damage_bonus":
      player.damage = player.damage * 2;
      setTimeout(() => (player.damage = player.baseDamage), 10000);
      break;
    case "score_x2":
      player.scoreMultiplier = player.scoreMultiplier * 2;
      setTimeout(() => (player.scoreMultiplier = player.baseScoreMultiplier), 10000);
      break;
  }
}
