export const player = {
  x: 400 - 15,
  y: 600 - 50,
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
  powerups: [],
  shootDouble: false,
  rapidFire: false,
  shield: false,
};

const getId = async () => {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:5000/api/token/${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    const data = await response.json();
    login(data.token);
    router.push("/login");
    return data.id;
  }
};

export async function resetPlayerStats(win, bossBeaten) {
  const id = getId();
  if (!win) {
    player.score = 0;
    player.points = 0;
  } else {
    player.points += 100;
  }

  player.health = player.maxHealth;
  player.damage = 1;
  player.scoreMultiplier = 1;
  player.shootDouble = false;
  player.rapidFire = false;
  player.shield = false;
  player.speed = player.baseSpeed;

  await fetch(`http://localhost:5000/api/users/${id}`, {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score: player.score }),
  });
}
