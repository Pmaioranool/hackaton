import { initCanvas, canvas, ctx, keys, player, bullets, enemyBullets } from "./gameState.js";
import { updatePlayer } from "./player.js";
import { updateEnemies } from "./enemy.js";
import { updateUI, updateHealthUI } from "./ui.js";
import { applyScreenShake } from "./renderer.js";
import { getId, putUserScore } from "./backend.js";

console.log("🎮 main.js chargé");

function waitForCanvasAndStart() {
  const tryStart = () => {
    initCanvas();
    if (canvas) {
      console.log("✅ canvas détecté, lancement du jeu !");
      updateHealthUI();
      loop();
    } else {
      console.log("🕓 canvas pas encore prêt, on retente...");
      setTimeout(tryStart, 100); // on retente toutes les 100ms
    }
  };
  tryStart();
}

// Lance le jeu après un court délai pour laisser Next.js finir de monter le DOM
waitForCanvasAndStart();

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  applyScreenShake();
  updatePlayer(keys);
  updateEnemies();
  ctx.restore();
}

async function resetGame() {
  const id = await getId();
  await putUserScore(id, player.score);

  player.score = 0;
  player.points = 0;
  player.health = player.maxHealth;
  bullets.length = 0;
  enemyBullets.length = 0;

  updateUI();
  updateHealthUI();

  const event = new Event("resetGame");
  window.dispatchEvent(event);
}

function loop() {
  update();
  requestAnimationFrame(loop);
}

export { resetGame };
