import { useEffect, useRef } from "react";
import { useKeys } from "./useKeys";
import { draw } from "./draw";
import {
  WORLD_W, WORLD_H, START_X, GIFT_X, SPEED, TRIGGER_DIST,
} from "./constants";

type Props = {
  giftOpen: boolean;
  onReachGift: () => void;
};

export default function GameCanvas({ giftOpen, onReachGift }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useKeys();
  const playerX = useRef(START_X);
  const triggered = useRef(false);
  const giftOpenRef = useRef(giftOpen);
  const onReachRef = useRef(onReachGift);

  giftOpenRef.current = giftOpen;
  onReachRef.current = onReachGift;

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

      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      const maxX = GIFT_X - 30; // Figur bleibt vor dem Geschenk
      playerX.current = Math.max(
        START_X - 20,
        Math.min(maxX, playerX.current + dir * SPEED * dt)
      );

      if (!triggered.current && GIFT_X - playerX.current <= TRIGGER_DIST) {
        triggered.current = true;
        onReachRef.current();
      }

      draw(ctx, playerX.current, giftOpenRef.current, now);
      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [keys]);

  const hold = (dir: "left" | "right", v: boolean) => () => {
    keys.current[dir] = v;
  };

  return (
    <div className="game">
      <canvas ref={canvasRef} className="canvas" />
      <div className="touch">
        {(["left", "right"] as const).map((d) => (
          <button
            key={d}
            onPointerDown={hold(d, true)}
            onPointerUp={hold(d, false)}
            onPointerLeave={hold(d, false)}
            onPointerCancel={hold(d, false)}
          >
            {d === "left" ? "◀" : "▶"}
          </button>
        ))}
      </div>
    </div>
  );
}
