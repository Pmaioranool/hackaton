export function message(text) {
  const messageEl = document.getElementById("message");
  messageEl.classList.remove("hidden");
  messageEl.textContent = text;

  setTimeout(() => {
    messageEl.textContent = "";
    messageEl.classList.add("hidden");
  }, 2000);
}

export function updateUI(score, points) {
  document.getElementById("score").textContent = score;
  document.getElementById("points").textContent = points;
}

export function updateHealthUI(health) {
  document.getElementById("health").textContent = `Vie: ${health}`;
}

export function showBossBanner() {
  const banner = document.getElementById("boss-banner");
  banner.classList.remove("hidden");
  setTimeout(() => banner.classList.add("hidden"), 3000);
}
