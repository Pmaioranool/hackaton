export const canvas = document.getElementById("game");
export const ctx = canvas?.getContext("2d");

if (!canvas || !ctx) {
  console.error(
    "Canvas element not found or context could not be initialized."
  );
}
export const shootSound = new Audio("shoot.mp3");
shootSound.volume = 0.3;
