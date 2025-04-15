import { canvas } from "./setup.js";
import { enemies } from "./state.js";

export function spawnEnemy() {
  const typeChance = Math.random();
  let type, hp, speed, width, height, color;

  if (typeChance < 0.3) {
    type = "tank";
    hp = 4;
    speed = 0.5;
    width = height = 40;
    color = "darkblue";
  } else if (typeChance < 0.6) {
    type = "kamikaze";
    hp = 1;
    speed = 4 / 3;
    width = height = 30;
    color = "orange";
  } else {
    type = "gunner";
    hp = 2;
    speed = 2 / 3;
    width = height = 30;
    color = "purple";
  }

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
    shootCooldown: Math.random() * 1000 + 1000,
    lastShootTime: Date.now(),
    pattern,
  };

  if (pattern === "diagonal") {
    enemy.dx = (Math.random() < 0.5 ? -1 : 1) * speed;
  } else if (pattern === "circular") {
    enemy.angle = 0;
    enemy.amplitude = 20;
    enemy.initX = enemy.x;
  } else if (pattern === "zigzag") {
    enemy.dx = (Math.random() < 0.5 ? -1 : 1) * speed;
  }

  enemies.push(enemy);
}
