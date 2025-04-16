// renderer.js
import { ctx, shakeDuration, shakeIntensity } from "./gameState.js";

/**
 * Dessine un rectangle plein
 * @param {Object} obj - L'objet à dessiner (doit avoir x, y, width, height, color)
 */
export function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

/**
 * Dessine un cercle centré sur l'objet
 * @param {Object} obj - L'objet à dessiner (doit avoir x, y, width, height, color)
 */
export function drawCircle(obj) {
  ctx.fillStyle = obj.color;
  ctx.beginPath();
  ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, 2 * Math.PI);
  ctx.fill();
}

/**
 * Dessine un triangle (utilisé pour les ennemis gunners)
 * @param {Object} obj - L'objet à dessiner (doit avoir x, y, width, height, color)
 */
export function drawTriangle(obj) {
  const { x, y, width, height, color } = obj;
  ctx.fillStyle = color;
  ctx.beginPath();

  // Triangle pointant vers le bas
  ctx.moveTo(x + width / 2, y + height); // bas centre
  ctx.lineTo(x, y); // haut gauche
  ctx.lineTo(x + width, y); // haut droit
  ctx.closePath();
  ctx.fill();
}

/**
 * Applique un effet de "secousse" à l'écran (lors du laser par exemple)
 */
export function applyScreenShake() {
  if (shakeDuration > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(dx, dy);
  }
}
