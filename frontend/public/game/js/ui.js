// ui.js
import { player } from "./gameState.js";

const scoreEl = document.getElementById("score");
const pointsEl = document.getElementById("points");
const healthEl = document.getElementById("health");
const messageEl = document.getElementById("message");
const bossBanner = document.getElementById("boss-banner");

export function updateUI() {
  scoreEl.textContent = player.score;
  pointsEl.textContent = player.points;
}

export function updateHealthUI() {
  healthEl.textContent = `Vie: ${player.health}`;
}

export function showMessage(text) {
  messageEl.classList.remove("hidden");
  messageEl.textContent = text;

  setTimeout(() => {
    messageEl.textContent = "";
    messageEl.classList.add("hidden");
  }, 2000);
}

export function showBossBanner() {
  bossBanner.classList.remove("hidden");
  setTimeout(() => {
    bossBanner.classList.add("hidden");
  }, 3000);
}
