import { loop } from "./loop.js";
import { updateHealthUI } from "./ui.js";
import { lotteryRoll } from "./powerups.js";

document.getElementById("lottery-btn").addEventListener("click", () => {
  lotteryRoll();
});

updateHealthUI();
loop();
