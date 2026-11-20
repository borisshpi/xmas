import { useEffect, useRef } from "react";

export type Keys = { left: boolean; right: boolean };

export function useKeys() {
  const keys = useRef<Keys>({ left: false, right: false });

  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = v;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = v;
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return keys;
}
