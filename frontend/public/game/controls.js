export const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "l") {
    e.preventDefault();
    document.getElementById("lottery-btn").click();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
