// events.js
import { keys, player } from "./gameState.js";
import { lotteryRoll } from "./powerups.js";

const lotteryBtn = document.getElementById("lottery-btn");

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Touche L pour lancer la loterie
  if (e.key === "l" || e.key === "L") {
    e.preventDefault();
    lotteryRoll();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

lotteryBtn?.addEventListener("click", () => {
  lotteryRoll();
});
