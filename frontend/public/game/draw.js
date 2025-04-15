export function drawRect(ctx, obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

export function drawCircle(ctx, obj) {
  ctx.fillStyle = obj.color;
  ctx.beginPath();
  ctx.arc(
    obj.x + obj.width / 2,
    obj.y + obj.height / 2,
    obj.width / 2,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

export function drawTriangle(ctx, obj) {
  const { x, y, width, height, color } = obj;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y + height);
  ctx.lineTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.closePath();
  ctx.fill();
}
