import {
  WORLD_W, WORLD_H, HORIZON_Y, NEAR_Y, NEAR_SCALE, DEPTH_FALLOFF, PATH_HALF_W,
  GIFTS, GIFT_FADE_FROM, GIFT_FADE_TO, giftVisible,
} from "./constants";

// ---------- Projektion: Kamera hinter der Figur, leicht von oben ----------

type Point = { x: number; y: number; s: number };

/** 1 bei Abstand 0 zur Kamera, wird mit der Tiefe kleiner. */
const depth = (z: number) => DEPTH_FALLOFF / (z + DEPTH_FALLOFF);

/**
 * Bodenpunkt auf seitlicher Position `lane` (-1 … 1 = Gehwegränder) und
 * Abstand `z` vor der Kamera (Welt-z minus Kamera-z).
 */
export function project(lane: number, z: number): Point {
  const f = depth(z);
  return {
    x: WORLD_W / 2 + lane * PATH_HALF_W * f,
    y: HORIZON_Y + (NEAR_Y - HORIZON_Y) * f,
    s: NEAR_SCALE * f,
  };
}

/** Zeichnet `fn` mit Fußpunkt im Ursprung, an Position und Größe der Tiefe. */
function at(ctx: CanvasRenderingContext2D, lane: number, z: number, k: number, fn: () => void) {
  const p = project(lane, z);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s * k, p.s * k);
  fn();
  ctx.restore();
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 10 * s, 24 * s, 0, Math.PI * 2);
  ctx.arc(x + 46 * s, y, 18 * s, 0, Math.PI * 2);
  ctx.fill();
}

// Bezugslinie, auf der die Kulissen-Zeichnungen stehen (wird beim Zeichnen auf den Horizont skaliert)
const GROUND_Y = 320;

// ---------- Berlin-Kulisse ----------

const STONE = "#f3e2b8";
const STONE_SHADE = "#dcc48f";

function skylineFar(ctx: CanvasRenderingContext2D) {
  // blasse Häuserreihe in der Ferne (Dunst)
  ctx.fillStyle = "#cfe4f7";
  const blocks = [
    [0, 70], [50, 95], [95, 60], [150, 85], [210, 55], [260, 100], [330, 70],
    [390, 90], [450, 65], [500, 80], [560, 105], [620, 75], [680, 95], [740, 70],
  ];
  ctx.beginPath();
  blocks.forEach(([x, h], i) => {
    const w = (blocks[i + 1]?.[0] ?? WORLD_W + 20) - x + 6;
    ctx.roundRect(x - 3, GROUND_Y - h, w, h + 10, [6, 6, 0, 0]);
  });
  ctx.fill();
}

function fernsehturm(ctx: CanvasRenderingContext2D, x: number) {
  const base = GROUND_Y + 4;

  // Antenne, rot-weiß geringelt
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = i % 2 ? "#ffffff" : "#ff8fa6";
    ctx.beginPath();
    ctx.moveTo(x, 44 + i * 8);
    ctx.lineTo(x, 52 + i * 8);
    ctx.stroke();
  }

  // Schaft
  const shaft = ctx.createLinearGradient(0, 90, 0, base);
  shaft.addColorStop(0, "#eef4fa");
  shaft.addColorStop(1, "#d6e4f1");
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(x - 3, 90);
  ctx.lineTo(x + 3, 90);
  ctx.lineTo(x + 9, base);
  ctx.lineTo(x - 9, base);
  ctx.closePath();
  ctx.fill();

  // Kugel
  const ball = ctx.createLinearGradient(0, 108, 0, 152);
  ball.addColorStop(0, "#ffffff");
  ball.addColorStop(1, "#cddbea");
  ctx.fillStyle = ball;
  ctx.beginPath();
  ctx.arc(x, 130, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a9c3dc";
  ctx.beginPath();
  ctx.roundRect(x - 21.5, 127, 43, 5, 2.5);
  ctx.fill();

  // Ring unter der Antenne
  ctx.fillStyle = "#e3ecf5";
  ctx.beginPath();
  ctx.roundRect(x - 6, 96, 12, 5, 2.5);
  ctx.fill();
}

function reichstag(ctx: CanvasRenderingContext2D, cx: number) {
  const base = GROUND_Y + 4, w = 130, h = 52, top = base - h;

  // Glaskuppel
  const dome = ctx.createLinearGradient(0, top - 34, 0, top);
  dome.addColorStop(0, "#f4fbff");
  dome.addColorStop(1, "#cfe6f7");
  ctx.fillStyle = dome;
  ctx.beginPath();
  ctx.ellipse(cx, top - 2, 26, 30, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const dx of [-12, 0, 12]) {
    ctx.moveTo(cx + dx, top - 2);
    ctx.quadraticCurveTo(cx + dx * 0.6, top - 24, cx, top - 31);
  }
  ctx.stroke();

  // Gebäude mit Ecktürmen
  ctx.fillStyle = STONE_SHADE;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, top, w, h, 4);
  ctx.fill();
  ctx.fillStyle = STONE;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2 - 6, top - 10, 26, h + 10, 4);
  ctx.roundRect(cx + w / 2 - 20, top - 10, 26, h + 10, 4);
  ctx.roundRect(cx - 30, top + 4, 60, h - 4, 4);
  ctx.fill();
  // Giebel über dem Portal
  ctx.beginPath();
  ctx.moveTo(cx - 34, top + 6);
  ctx.lineTo(cx, top - 8);
  ctx.lineTo(cx + 34, top + 6);
  ctx.closePath();
  ctx.fill();
}

function brandenburgerTor(ctx: CanvasRenderingContext2D, cx: number) {
  const base = GROUND_Y + 4, w = 150, colH = 58;
  const top = base - 6 - colH;

  ctx.fillStyle = STONE;
  // Sockel
  ctx.beginPath();
  ctx.roundRect(cx - w / 2 - 4, base - 8, w + 8, 10, 3);
  ctx.fill();

  // Säulen
  const colW = 11;
  for (let i = 0; i < 6; i++) {
    const colX = cx - w / 2 + 4 + (i * (w - 8 - colW)) / 5;
    const col = ctx.createLinearGradient(colX, 0, colX + colW, 0);
    col.addColorStop(0, STONE);
    col.addColorStop(1, STONE_SHADE);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(colX, top, colW, colH, 3);
    ctx.fill();
  }

  ctx.fillStyle = STONE;
  // Gebälk
  ctx.beginPath();
  ctx.roundRect(cx - w / 2 - 6, top - 14, w + 12, 16, 4);
  ctx.fill();
  // Attika
  ctx.beginPath();
  ctx.roundRect(cx - 44, top - 28, 88, 16, 4);
  ctx.fill();
  ctx.fillStyle = STONE_SHADE;
  ctx.fillRect(cx - w / 2 - 6, top - 2, w + 12, 3);

  // Quadriga (grüne Patina)
  ctx.fillStyle = "#7fbfa4";
  ctx.beginPath();
  ctx.ellipse(cx, top - 32, 20, 6, 0, 0, Math.PI * 2);
  for (const dx of [-14, -5, 5, 14]) {
    ctx.moveTo(cx + dx + 4, top - 38);
    ctx.ellipse(cx + dx, top - 38, 4, 6, 0.3, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, top - 48, 4, 0, Math.PI * 2);
  ctx.roundRect(cx - 3, top - 46, 6, 10, 2);
  ctx.fill();
}

function altbau(
  ctx: CanvasRenderingContext2D,
  x: number, w: number, h: number,
  facade: string, roof: string
) {
  const base = GROUND_Y + 4, top = base - h;

  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.roundRect(x - 3, top - 14, w + 6, 18, [10, 10, 2, 2]);
  ctx.fill();

  ctx.fillStyle = facade;
  ctx.beginPath();
  ctx.roundRect(x, top, w, h, [3, 3, 0, 0]);
  ctx.fill();

  // Fenster
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  const cols = Math.floor((w - 8) / 16);
  const gap = (w - cols * 8) / (cols + 1);
  for (let row = 0; row < Math.floor((h - 16) / 22); row++) {
    for (let c = 0; c < cols; c++) {
      ctx.roundRect(x + gap + c * (8 + gap), top + 10 + row * 22, 8, 12, [4, 4, 1, 1]);
    }
  }
  ctx.fill();
}

function berlin(ctx: CanvasRenderingContext2D) {
  const houses: [number, number, number, string, string][] = [
    [-300, 62, 120, "#d9ecff", "#9fb3c8"],
    [-236, 58, 104, "#fff0c4", "#b9a08a"],
    [-176, 66, 126, "#ffd9cc", "#c98f86"],
    [-108, 60, 110, "#d9ecff", "#9fb3c8"],
    [850, 62, 118, "#ffd9cc", "#c98f86"],
    [912, 58, 132, "#fff0c4", "#b9a08a"],
    [970, 66, 112, "#d9ecff", "#9fb3c8"],
    [1036, 60, 126, "#ffd9cc", "#c98f86"],
    [1096, 62, 108, "#fff0c4", "#b9a08a"],
  ];
  houses.forEach(([x, w, h, f, r]) => altbau(ctx, x, w, h, f, r));
  fernsehturm(ctx, 779);
  reichstag(ctx, 3);
  brandenburgerTor(ctx, WORLD_W / 2); // genau im Fluchtpunkt
}

const SKYLINE_SCALE = 0.58;

function skyline(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(0, HORIZON_Y + 1);
  ctx.scale(1, SKYLINE_SCALE);
  ctx.translate(0, -(GROUND_Y + 4));
  skylineFar(ctx);
  ctx.restore();

  ctx.save();
  ctx.translate(WORLD_W / 2, HORIZON_Y + 1);
  ctx.scale(SKYLINE_SCALE, SKYLINE_SCALE);
  ctx.translate(-WORLD_W / 2, -(GROUND_Y + 4));
  berlin(ctx);
  ctx.restore();
}

// ---------- Boden ----------

const Z_NEAR = -20;  // reicht unter den Bildrand
const Z_FAR = 4000;  // praktisch am Horizont

function grass(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, HORIZON_Y, 0, WORLD_H);
  g.addColorStop(0, "#c6ebad");
  g.addColorStop(0.25, "#9fdc78");
  g.addColorStop(1, "#5cba3c");
  ctx.fillStyle = g;
  ctx.fillRect(0, HORIZON_Y, WORLD_W, WORLD_H - HORIZON_Y);
}

function band(ctx: CanvasRenderingContext2D, u0: number, u1: number, fill: string | CanvasGradient) {
  const a = project(u0, Z_NEAR), b = project(u1, Z_NEAR);
  const c = project(u1, Z_FAR), d = project(u0, Z_FAR);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.fill();
}

function gehweg(ctx: CanvasRenderingContext2D, camZ: number) {
  // Berliner Gehweg: Bordstein, Mosaikpflaster am Rand, Granitplatten in der Mitte
  band(ctx, -1.07, 1.07, "#d8cebc");

  const slab = ctx.createLinearGradient(0, HORIZON_Y, 0, WORLD_H);
  slab.addColorStop(0, "#e9e3d8");
  slab.addColorStop(1, "#f8f4ed");
  band(ctx, -1, 1, slab);
  band(ctx, -1, -0.84, "#ebe0c9");
  band(ctx, 0.84, 1, "#ebe0c9");

  // Fugen: quer in festen Tiefenabständen, längs zum Fluchtpunkt
  ctx.strokeStyle = "#ddd3c2";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // Querfugen hängen an der Welt, nicht an der Kamera: so scrollt der Boden
  for (let z = Math.ceil((camZ + Z_NEAR) / 8) * 8; z < camZ + 260; z += 8) {
    const l = project(-0.84, z - camZ), r = project(0.84, z - camZ);
    ctx.moveTo(l.x, l.y); ctx.lineTo(r.x, r.y);
  }
  for (const u of [-0.84, -0.42, 0, 0.42, 0.84]) {
    const n = project(u, Z_NEAR), f = project(u, Z_FAR);
    ctx.moveTo(n.x, n.y); ctx.lineTo(f.x, f.y);
  }
  ctx.stroke();

  // Mosaiksteine
  ctx.fillStyle = "#d8c9ab";
  ctx.beginPath();
  const first = Math.ceil((camZ + Z_NEAR) / 1.6);
  for (let i = first; i * 1.6 < camZ + 120; i++) {
    for (const u of [-0.96, -0.89, 0.89, 0.96]) {
      const p = project(u + (i % 2 ? 0.02 : -0.02), i * 1.6 - camZ);
      const r = 1.6 * p.s;
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
  }
  ctx.fill();

  // Dunst am Horizont
  const haze = ctx.createLinearGradient(0, HORIZON_Y - 6, 0, HORIZON_Y + 24);
  haze.addColorStop(0, "rgba(233,248,255,0)");
  haze.addColorStop(0.3, "rgba(233,248,255,0.7)");
  haze.addColorStop(1, "rgba(233,248,255,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, HORIZON_Y - 6, WORLD_W, 30);
}

// ---------- Requisiten (alle mit Fußpunkt im Ursprung) ----------

function tree(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b08a64";
  ctx.beginPath();
  ctx.roundRect(-3, -20, 6, 21, 3);
  ctx.fill();

  ctx.fillStyle = color;
  for (const [dx, dy, r] of [[0, 34, 19], [-13, 24, 14], [13, 24, 14]]) {
    ctx.beginPath();
    ctx.arc(dx, -dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(-4, -44, 9, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function laterne(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6b7a8c";
  ctx.beginPath();
  ctx.roundRect(-2, -62, 4, 62, 2);
  ctx.roundRect(-5, -6, 10, 7, 3);
  ctx.fill();

  ctx.fillStyle = "#fff6d8";
  ctx.beginPath();
  ctx.roundRect(-6, -78, 12, 15, [2, 2, 5, 5]);
  ctx.fill();
  ctx.fillStyle = "#6b7a8c";
  ctx.beginPath();
  ctx.moveTo(-9, -77);
  ctx.lineTo(0, -86);
  ctx.lineTo(9, -77);
  ctx.closePath();
  ctx.fill();
}

const GIFT_W = 56;
const LID_DEPTH = 14; // sichtbare Tiefe der Deckel-Oberseite

function lid(ctx: CanvasRenderingContext2D, cx: number, ly: number) {
  const w = GIFT_W + 8, d = LID_DEPTH;
  // Oberseite (von oben sichtbar)
  ctx.fillStyle = "#ff8aa5";
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, ly - d, w, d + 4, 7);
  ctx.fill();
  // Vorderkante
  ctx.fillStyle = "#ff3d6b";
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, ly, w, 12, [3, 3, 6, 6]);
  ctx.fill();
  // Schleifenband über Kreuz
  ctx.fillStyle = "#fff";
  ctx.fillRect(cx - 5, ly - d, 10, d + 12);
  ctx.fillRect(cx - w / 2 + 2, ly - d / 2 - 2.5, w - 4, 5);
  // Schleife
  ctx.beginPath();
  ctx.ellipse(cx - 10, ly - d / 2 - 4, 11, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 10, ly - d / 2 - 4, 11, 7, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f1e6ee";
  ctx.beginPath();
  ctx.arc(cx, ly - d / 2 - 2, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawGift(ctx: CanvasRenderingContext2D, open: boolean, t: number) {
  const w = GIFT_W, h = 42;
  const x = -w / 2, y = -h;
  const bounce = open ? 0 : Math.sin(t / 400) * 2;

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(0, -2, 38, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  if (open) {
    const g = ctx.createRadialGradient(0, y - 8, 5, 0, y - 8, 120);
    g.addColorStop(0, "rgba(255,245,160,0.9)");
    g.addColorStop(1, "rgba(255,245,160,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-120, y - 128, 240, 240);
  }

  ctx.save();
  ctx.translate(0, bounce);

  const body = ctx.createLinearGradient(0, y, 0, 0);
  body.addColorStop(0, "#ff6b8b");
  body.addColorStop(1, "#e63e66");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [4, 4, 8, 8]);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-5, y, 10, h);

  if (!open) {
    lid(ctx, 0, y - 4);

    const ly = y + h / 2 + 2;
    ctx.strokeStyle = "#c9c9c9";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, ly - 4, 7, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "#ffcf33";
    ctx.beginPath();
    ctx.roundRect(-10, ly - 4, 20, 16, 4);
    ctx.fill();
  } else {
    // offene Oberseite: Rand und leuchtender Innenraum
    ctx.fillStyle = "#ff8aa5";
    ctx.beginPath();
    ctx.roundRect(x, y - LID_DEPTH, w, LID_DEPTH + 4, 6);
    ctx.fill();
    const inside = ctx.createLinearGradient(0, y - LID_DEPTH + 3, 0, y + 2);
    inside.addColorStop(0, "#c23a5a");
    inside.addColorStop(1, "#ffe9a8");
    ctx.fillStyle = inside;
    ctx.beginPath();
    ctx.roundRect(x + 4, y - LID_DEPTH + 3, w - 8, LID_DEPTH - 2, 4);
    ctx.fill();
  }
  ctx.restore();

  if (open) {
    // Deckel liegt neben der Kiste auf dem Boden (nichts ragt nach oben ins nächste Geschenk)
    ctx.save();
    ctx.translate(w / 2 + 34, -10);
    ctx.rotate(0.12);
    lid(ctx, 0, 0);
    ctx.restore();

    for (let i = 0; i < 8; i++) {
      const a = t / 600 + i * 0.8;
      const r = 34 + (i % 3) * 8;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, y - 10 + Math.sin(a) * r * 0.45, 2 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------- Figur ----------

const HAIR = "#d9532c";
const HAIR_BACK = "#b8432a";
const SKIN = "#ffd9b3";

export type Facing = "back" | "front";

/**
 * `walking`: null = steht, sonst seitliche Richtung (-1, 0, 1) für eine leichte Neigung.
 * `facing`: "back" = Rücken zur Kamera (läuft weg), "front" = Gesicht zur Kamera (läuft zurück).
 */
function drawPlayer(ctx: CanvasRenderingContext2D, t: number, walking: number | null, facing: Facing) {
  const phase = t / 140;
  if (walking) ctx.rotate(walking * 0.07); // lehnt sich in die Laufrichtung
  const step = walking !== null ? Math.sin(phase) : 0;
  const bob = Math.abs(step) * 2.5;
  const sway = walking !== null ? Math.sin(phase + 1) * 1.5 : 0; // Haare schwingen nach
  const y = -bob;
  const hy = y - 49;
  const front = facing === "front";

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const hair = ctx.createLinearGradient(0, hy - 17, 0, hy + 22);
  hair.addColorStop(0, HAIR);
  hair.addColorStop(1, HAIR_BACK);

  if (front) {
    // von vorn liegen die langen Haare hinter den Schultern
    ctx.fillStyle = HAIR_BACK;
    ctx.beginPath();
    ctx.roundRect(-17 + sway * 0.4, hy - 4, 34, 25, [6, 6, 11, 11]);
    ctx.fill();
  }

  // Beine: abwechselnd hebt sich ein Fuß
  const liftL = Math.max(0, step) * 5;
  const liftR = Math.max(0, -step) * 5;
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#4a5a8a";
  ctx.beginPath();
  ctx.moveTo(-4, y - 12); ctx.lineTo(-4, y - 2 - liftL);
  ctx.moveTo(4, y - 12); ctx.lineTo(4, y - 2 - liftR);
  ctx.stroke();

  ctx.fillStyle = "#e0566e";
  for (const [x, lift] of [[-4, liftL], [4, liftR]]) {
    ctx.beginPath();
    // von vorn sieht man die Schuhspitzen, von hinten die Fersen
    ctx.ellipse(x, y - 1 - lift + (front ? 1 : 0), front ? 4.5 : 4, front ? 3 : 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kleid
  const dress = ctx.createLinearGradient(0, y - 34, 0, y - 7);
  dress.addColorStop(0, "#4fb0ff");
  dress.addColorStop(1, "#2f8fe8");
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.roundRect(-9, y - 34, 18, 15, 7);
  ctx.moveTo(-8, y - 22);
  ctx.lineTo(8, y - 22);
  ctx.lineTo(13, y - 9);
  ctx.quadraticCurveTo(0, y - 5.5, -13, y - 9);
  ctx.closePath();
  ctx.fill();

  if (front) {
    // Kragen
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-3.5, y - 33, 4.5, 2.6, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3.5, y - 33, 4.5, 2.6, -0.35, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Schleife hinten an der Taille
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-4, y - 22, 4, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, y - 22, 4, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e7f2fc";
    ctx.beginPath();
    ctx.arc(0, y - 22, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arme schwingen (frontal/von hinten: leicht hoch und runter)
  ctx.strokeStyle = SKIN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-9, y - 30); ctx.lineTo(-13, y - 19 + step * 2.5);
  ctx.moveTo(9, y - 30); ctx.lineTo(13, y - 19 - step * 2.5);
  ctx.stroke();

  if (front) {
    // Gesicht
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.ellipse(0, hy, 15, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Haare: Oberkopf, seitliche Strähnen bis auf die Schultern, Pony
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.ellipse(0, hy - 3, 17, 14, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-17 + sway * 0.3, hy - 6, 7, 25, [4, 2, 5, 5]);
    ctx.roundRect(10 + sway * 0.3, hy - 6, 7, 25, [2, 4, 5, 5]);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-5, hy - 8, 10, 5, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, hy - 8, 9, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.ellipse(-5, hy - 12, 6, 2.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // freundliches, schlichtes Avatar-Gesicht: ovale Augen mit Glanzpunkt,
    // feine Brauen, Stupsnase, breites Lächeln
    ctx.fillStyle = "#3b2a24";
    for (const ex of [-4.5, 4.5]) {
      ctx.beginPath();
      ctx.ellipse(ex, hy + 2, 2.1, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffffff";
    for (const ex of [-4.5, 4.5]) {
      ctx.beginPath();
      ctx.arc(ex + 0.7, hy + 0.8, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "#a8432a";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(-4.5, hy - 1, 3, Math.PI * 1.2, Math.PI * 1.8);
    ctx.moveTo(4.5 + 3 * Math.cos(Math.PI * 1.2), hy - 1 + 3 * Math.sin(Math.PI * 1.2));
    ctx.arc(4.5, hy - 1, 3, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    ctx.strokeStyle = "#e8b48e";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, hy + 5.5, 1.3, 0.3, Math.PI - 0.3);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,130,150,0.28)";
    ctx.beginPath();
    ctx.ellipse(-8.5, hy + 7, 2.8, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8.5, hy + 7, 2.8, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#c9505a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, hy + 7, 4, 0.35, Math.PI - 0.35);
    ctx.stroke();
    return;
  }

  // Hinterkopf: nur Haare, schulterlang
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, hy, 16, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-16 + sway * 0.4, hy - 2, 32, 22, [4, 4, 11, 11]);
  ctx.fill();
  // Spitzen fallen leicht nach außen auf die Schultern
  ctx.beginPath();
  ctx.ellipse(-14 + sway, hy + 18, 5, 3.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(14 + sway, hy + 18, 5, 3.5, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Scheitel und Glanzlicht
  ctx.strokeStyle = "rgba(160,50,30,0.5)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, hy - 16);
  ctx.quadraticCurveTo(1.5, hy - 7, 0, hy + 1);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.ellipse(-5, hy - 9, 6, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- Szene ----------

type Prop = { lane: number; z: number; k: number; alpha: number; paint: () => void };

// feste Welt-Requisiten entlang des Wegs (z in Weltkoordinaten)
const TREE_COLORS = ["#7fcd58", "#66bb45"];
const TREES: { lane: number; z: number; color: string }[] = [];
for (let i = 0, z = -16; z < 420; i++, z += 21) {
  TREES.push({ lane: -1.55 - (i % 2) * 0.35, z, color: TREE_COLORS[i % 2] });
  TREES.push({ lane: 1.55 + ((i + 1) % 2) * 0.35, z: z + 10, color: TREE_COLORS[(i + 1) % 2] });
}
const LAMPS: number[] = [];
for (let z = -6; z < 420; z += 44) LAMPS.push(z);

/** Alles, was näher als das an der Kamera ist, liegt schon außerhalb des Bildes. */
const CULL_Z = -28;
/** Wie weit nach vorn noch Requisiten gezeichnet werden. */
const DRAW_DIST = 300;

export type Scene = {
  player: { lane: number; z: number; facing: Facing };
  camZ: number;
  opened: readonly boolean[]; // pro Geschenk in GIFTS
  t: number;
  walking: number | null;
};

/** Bildschirmposition (Weltpixel) für die Blase über Geschenk `i`. */
export function giftAnchor(i: number, camZ: number) {
  const g = GIFTS[i];
  const p = project(g.lane, g.z - camZ);
  return { x: p.x, y: p.y - 70 * p.s * g.size };
}

export function draw(ctx: CanvasRenderingContext2D, scene: Scene) {
  const { player, camZ, opened, t, walking } = scene;
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);

  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
  sky.addColorStop(0, "#7cc8ff");
  sky.addColorStop(1, "#e9f8ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_W, HORIZON_Y);

  const span = WORLD_W + 200;
  [[0, 34, 0.7, 6], [260, 62, 0.55, 4], [520, 24, 0.8, 8]].forEach(([x0, cy, s, v]) => {
    cloud(ctx, ((x0 + t * v / 100) % span) - 100, cy, s);
  });

  // Skyline ist „unendlich weit“ weg und bewegt sich nicht mit
  skyline(ctx);
  grass(ctx);
  gehweg(ctx, camZ);

  // alles, was auf dem Boden steht, nach Tiefe sortiert (hinten zuerst)
  const props: Prop[] = [];
  const add = (lane: number, z: number, k: number, paint: () => void, alpha = 1) => {
    const rel = z - camZ;
    if (rel > CULL_Z && rel < DRAW_DIST && alpha > 0) props.push({ lane, z: rel, k, alpha, paint });
  };
  TREES.forEach((tr) => add(tr.lane, tr.z, 1.7, () => tree(ctx, tr.color)));
  LAMPS.forEach((z) => {
    add(-1.14, z, 1.15, () => laterne(ctx));
    add(1.14, z, 1.15, () => laterne(ctx));
  });
  // ferne Geschenke tauchen erst beim Näherkommen aus dem Dunst auf
  const giftAlpha = (rel: number) =>
    Math.min(1, Math.max(0, (GIFT_FADE_TO - rel) / (GIFT_FADE_TO - GIFT_FADE_FROM)));
  GIFTS.forEach((g, i) => {
    if (!giftVisible(i, opened)) return;
    add(g.lane, g.z, g.size, () => drawGift(ctx, opened[i], t), giftAlpha(g.z - camZ));
  });
  add(player.lane, player.z, 1, () => drawPlayer(ctx, t, walking, player.facing));

  props
    .sort((a, b) => b.z - a.z)
    .forEach((p) => {
      ctx.globalAlpha = p.alpha;
      at(ctx, p.lane, p.z, p.k, p.paint);
    });
  ctx.globalAlpha = 1;
}
