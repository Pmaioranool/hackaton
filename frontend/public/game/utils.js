export function applyScreenShake(ctx, shakeDuration, shakeIntensity) {
  if (shakeDuration > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(dx, dy);
    return shakeDuration - 1;
  }
  return 0;
}
