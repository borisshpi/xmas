import { useEffect, useRef, useState } from "react";
import { useKeys, type Dir } from "./useKeys";
import { draw, giftAnchor, type Facing } from "./draw";
import {
  WORLD_W, WORLD_H, START_Z, START_LANE, MAX_Z, CAMERA_LAG, LANE_LIMIT, SPEED, LANE_SPEED,
  GIFTS, GIFT_HALF_LANE, STOP_DIST, TRIGGER_DIST, TRIGGER_LANE, UNLOCK_PROMPT, giftVisible,
} from "./constants";

type Props = {
  opened: readonly boolean[];
  /** false, solange ein Rätsel oder eine Nachricht offen ist */
  canInteract: boolean;
  onUnlock: (gift: number) => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Steht die Figur an dieser Stelle in einem (sichtbaren) Geschenk? */
const hitsGift = (lane: number, z: number, opened: readonly boolean[]) =>
  GIFTS.some(
    (g, i) =>
      giftVisible(i, opened) &&
      Math.abs(lane - g.lane) < GIFT_HALF_LANE * g.size &&
      Math.abs(z - g.z) < STOP_DIST * g.size
  );

/** Index des nächstgelegenen sichtbaren Geschenks in Reichweite, sonst -1. */
function nearGift(lane: number, z: number, opened: readonly boolean[]) {
  let best = -1, bestDist = Infinity;
  GIFTS.forEach((g, i) => {
    if (!giftVisible(i, opened)) return;
    const dz = Math.abs(g.z - z), dl = Math.abs(g.lane - lane);
    if (dz <= TRIGGER_DIST * g.size && dl <= TRIGGER_LANE * g.size && dz < bestDist) {
      best = i;
      bestDist = dz;
    }
  });
  return best;
}

// Blasenposition in Prozent des Spielfelds (folgt der Kamera)
const bubblePos = (gift: number, camZ: number) => {
  const a = giftAnchor(gift, camZ);
  return { left: `${(a.x / WORLD_W) * 100}%`, top: `${(a.y / WORLD_H) * 100}%` };
};

const PAD: { dir: Dir; label: string; glyph: string }[][] = [
  [
    { dir: "left", label: "Links", glyph: "◀" },
    { dir: "right", label: "Rechts", glyph: "▶" },
  ],
  [
    { dir: "down", label: "Zurück", glyph: "▼" },
    { dir: "up", label: "Vorwärts", glyph: "▲" },
  ],
];

export default function GameCanvas({ opened, canInteract, onUnlock }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useKeys();
  const player = useRef({ lane: START_LANE, z: START_Z, facing: "back" as Facing });
  const camZ = useRef(START_Z);
  const bubbleRef = useRef<HTMLButtonElement>(null);

  // React-State nur beim Wechsel des nahen Geschenks, nicht pro Frame
  const [near, setNear] = useState(-1);
  const nearRef = useRef(-1);

  // Blase zum Entsperren über dem nahen, noch geschlossenen Geschenk
  const bubble = canInteract && near >= 0 && !opened[near];

  const openedRef = useRef(opened);
  const unlockableRef = useRef(-1);
  const onUnlockRef = useRef(onUnlock);
  openedRef.current = opened;
  unlockableRef.current = bubble ? near : -1;
  onUnlockRef.current = onUnlock;

  // Enter öffnet das Rätsel, wenn die Blase zum Entsperren sichtbar ist
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.target instanceof HTMLInputElement) return;
      if (unlockableRef.current < 0) return;
      e.preventDefault();
      onUnlockRef.current(unlockableRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // scharf auf Retina-Displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WORLD_W * dpr;
    canvas.height = WORLD_H * dpr;
    ctx.scale(dpr, dpr);

    let last = performance.now();
    let id = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const k = keys.current;
      const dz = (k.up ? 1 : 0) - (k.down ? 1 : 0);
      const dl = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      const p = player.current;

      // Achsen einzeln bewegen, damit man an Geschenken entlanggleiten kann
      let z = clamp(p.z + dz * SPEED * dt, START_Z, MAX_Z);
      const o = openedRef.current;
      if (hitsGift(p.lane, z, o)) z = p.z;
      let lane = clamp(p.lane + dl * LANE_SPEED * dt, -LANE_LIMIT, LANE_LIMIT);
      if (hitsGift(lane, z, o)) lane = p.lane;

      const walking = z !== p.z || lane !== p.lane;
      // vorwärts: Rücken zur Kamera, rückwärts: Gesicht zur Kamera, seitlich: bleibt
      const facing: Facing = dz > 0 ? "back" : dz < 0 ? "front" : p.facing;
      player.current = { lane, z, facing };

      // Kamera zieht mit kleiner Verzögerung nach (frame-unabhängige Glättung)
      camZ.current += (z - camZ.current) * (1 - Math.exp(-dt / CAMERA_LAG));

      const n = nearGift(lane, z, o);
      if (n !== nearRef.current) {
        nearRef.current = n;
        setNear(n);
      }
      if (bubbleRef.current && nearRef.current >= 0) {
        Object.assign(bubbleRef.current.style, bubblePos(nearRef.current, camZ.current));
      }

      draw(ctx, {
        player: player.current,
        camZ: camZ.current,
        opened: openedRef.current,
        t: now,
        walking: walking ? dl : null,
      });
      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [keys]);

  const hold = (dir: Dir, v: boolean) => () => {
    keys.current[dir] = v;
  };

  return (
    <div className="game">
      <div className="viewport">
        <canvas ref={canvasRef} className="canvas" />
        {bubble && (
          <button
            key={near}
            ref={bubbleRef}
            className="unlock-bubble"
            style={bubblePos(near, camZ.current)}
            onClick={() => onUnlock(near)}
          >
            🔒 {UNLOCK_PROMPT}
          </button>
        )}
      </div>
      <div className="touch">
        {PAD.map((group, i) => (
          <div className="pad" key={i}>
            {group.map(({ dir, label, glyph }) => (
              <button
                key={dir}
                aria-label={label}
                onPointerDown={hold(dir, true)}
                onPointerUp={hold(dir, false)}
                onPointerLeave={hold(dir, false)}
                onPointerCancel={hold(dir, false)}
                onContextMenu={(e) => e.preventDefault()}
              >
                {glyph}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
