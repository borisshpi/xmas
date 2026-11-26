import { useEffect, useRef } from "react";

export type Dir = "up" | "down" | "left" | "right";
export type Keys = Record<Dir, boolean>;

const KEYMAP: Record<string, Dir> = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right",
};

export function useKeys() {
  const keys = useRef<Keys>({ up: false, down: false, left: false, right: false });

  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      // im Rätsel-Eingabefeld nicht mitlaufen
      if (e.target instanceof HTMLInputElement) return;
      const dir = KEYMAP[e.key];
      if (!dir) return;
      keys.current[dir] = v;
      e.preventDefault(); // Pfeiltasten sollen die Seite nicht scrollen
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    // Fenster verliert Fokus: nichts soll „hängen bleiben“
    const reset = () => {
      keys.current = { up: false, down: false, left: false, right: false };
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
    };
  }, []);

  return keys;
}
