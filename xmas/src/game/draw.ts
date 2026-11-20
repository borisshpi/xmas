import { WORLD_W, WORLD_H, GROUND_Y, GIFT_X } from "./constants";

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 10 * s, 24 * s, 0, Math.PI * 2);
  ctx.arc(x + 46 * s, y, 18 * s, 0, Math.PI * 2);
  ctx.fill();
}

function hill(ctx: CanvasRenderingContext2D, cx: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, GROUND_Y + 10, w, h, 0, Math.PI, 0);
  ctx.fill();
}

function drawGift(ctx: CanvasRenderingContext2D, open: boolean, t: number) {
  const x = GIFT_X, w = 56, h = 46, y = GROUND_Y - h + 6;
  const bounce = open ? 0 : Math.sin(t / 400) * 2;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, GROUND_Y + 8, 34, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (open) {
    const g = ctx.createRadialGradient(x + w / 2, y, 5, x + w / 2, y, 120);
    g.addColorStop(0, "rgba(255,245,160,0.9)");
    g.addColorStop(1, "rgba(255,245,160,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 90, y - 120, 240, 240);
  }

  const body = ctx.createLinearGradient(0, y, 0, y + h);
  body.addColorStop(0, "#ff6b8b");
  body.addColorStop(1, "#e63e66");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x, y + bounce, w, h, 8);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.fillRect(x + w / 2 - 5, y + bounce, 10, h);

  const lidY = open ? y - 34 : y - 12;
  ctx.save();
  if (open) {
    ctx.translate(x + w / 2, lidY);
    ctx.rotate(-0.35);
    ctx.translate(-(x + w / 2), -lidY);
  }
  ctx.fillStyle = "#ff3d6b";
  ctx.beginPath();
  ctx.roundRect(x - 4, lidY + bounce, w + 8, 16, 7);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + w / 2 - 5, lidY + bounce, 10, 16);
  ctx.beginPath();
  ctx.ellipse(x + w / 2 - 10, lidY - 4 + bounce, 11, 8, -0.5, 0, Math.PI * 2);
  ctx.ellipse(x + w / 2 + 10, lidY - 4 + bounce, 11, 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (!open) {
    const lx = x + w / 2, ly = y + h / 2 + bounce;
    ctx.strokeStyle = "#c9c9c9";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(lx, ly - 4, 7, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "#ffcf33";
    ctx.beginPath();
    ctx.roundRect(lx - 10, ly - 4, 20, 16, 4);
    ctx.fill();
  } else {
    for (let i = 0; i < 8; i++) {
      const a = t / 600 + i * 0.8;
      const r = 40 + (i % 3) * 14;
      const sx = x + w / 2 + Math.cos(a) * r;
      const sy = y - 20 + Math.sin(a) * r * 0.7;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawMii(ctx: CanvasRenderingContext2D, px: number, t: number) {
  const bob = Math.abs(Math.sin(t / 140)) * 3;
  const swing = Math.sin(t / 140) * 6;
  const y = GROUND_Y - bob;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(px, GROUND_Y + 6, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = "round";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#4a5a8a";
  ctx.beginPath();
  ctx.moveTo(px - 4, y - 14); ctx.lineTo(px - 4 + swing, y);
  ctx.moveTo(px + 4, y - 14); ctx.lineTo(px + 4 - swing, y);
  ctx.stroke();

  ctx.fillStyle = "#3aa0ff";
  ctx.beginPath();
  ctx.roundRect(px - 10, y - 36, 20, 26, 8);
  ctx.fill();

  ctx.strokeStyle = "#ffd9b3";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(px - 10, y - 30); ctx.lineTo(px - 14 - swing, y - 18);
  ctx.moveTo(px + 10, y - 30); ctx.lineTo(px + 14 + swing, y - 18);
  ctx.stroke();

  const hy = y - 52;
  ctx.fillStyle = "#ffd9b3";
  ctx.beginPath();
  ctx.ellipse(px, hy, 15, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6b4226";
  ctx.beginPath();
  ctx.ellipse(px, hy - 6, 16, 11, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(px + 4, hy + 1, 2, 0, Math.PI * 2);
  ctx.arc(px + 10, hy + 1, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#a0522d";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(px + 7, hy + 6, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

export function draw(
  ctx: CanvasRenderingContext2D,
  playerX: number,
  giftOpen: boolean,
  t: number
) {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);

  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, "#7cc8ff");
  sky.addColorStop(1, "#e9f8ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  const span = WORLD_W + 200;
  [[0, 60, 1, 6], [260, 110, 0.8, 4], [520, 50, 1.2, 8]].forEach(([x0, cy, s, v]) => {
    cloud(ctx, ((x0 + t * v / 100) % span) - 100, cy, s);
  });

  hill(ctx, 150, 260, 120, "#9fe07a");
  hill(ctx, 560, 320, 90, "#8ad463");

  const ground = ctx.createLinearGradient(0, GROUND_Y, 0, WORLD_H);
  ground.addColorStop(0, "#74cf4e");
  ground.addColorStop(1, "#4fae34");
  ctx.fillStyle = ground;
  ctx.fillRect(0, GROUND_Y, WORLD_W, WORLD_H - GROUND_Y);

  ctx.fillStyle = "#f4e3b8";
  ctx.beginPath();
  ctx.roundRect(-10, GROUND_Y + 8, WORLD_W + 20, 30, 15);
  ctx.fill();

  drawGift(ctx, giftOpen, t);
  drawMii(ctx, playerX, t);
}
