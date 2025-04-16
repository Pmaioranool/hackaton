// player.js
import {
  canvas,
  ctx,
  bullets,
  player,
  defaultShootCooldown,
  rapidFireCooldown,
  lastShotTime,
} from "./gameState.js";

export function updatePlayer(keys) {
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;

  drawPlayer();
  handleShooting();
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

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
}

function handleShooting() {
  const now = Date.now();
  const shootCooldown = player.rapidFire ? rapidFireCooldown : defaultShootCooldown;

  if (now - lastShotTime >= shootCooldown) {
    player.lastShotTime = now;
    const baseX = player.x + player.width / 2;
    const bulletTemplate = (offsetX) => ({
      x: baseX + offsetX,
      y: player.y,
      width: 4,
      height: 10,
      color: "white",
      speed: 7,
    });

    if (player.shootDouble) {
      bullets.push(bulletTemplate(-10), bulletTemplate(6));
    } else {
      bullets.push(bulletTemplate(-2));
    }
  }
}
