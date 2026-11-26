import { useState } from "react";
import GameCanvas from "./game/GameCanvas";
import PuzzleModal from "./components/PuzzleModal";
import MessageReveal from "./components/MessageReveal";
import { GIFTS } from "./game/constants";

type Phase =
  | { kind: "walking" }
  | { kind: "puzzle"; gift: number }
  | { kind: "reveal"; gift: number };

export default function App() {
  const [phase, setPhase] = useState<Phase>({ kind: "walking" });
  const [opened, setOpened] = useState<boolean[]>(() => GIFTS.map(() => false));

  const solve = (gift: number) => {
    setOpened((o) => o.map((v, i) => v || i === gift));
    setPhase({ kind: "reveal", gift });
  };
  const isLast = (gift: number) => gift === GIFTS.length - 1;

  return (
    <div className="stage">
      <GameCanvas
        opened={opened}
        canInteract={phase.kind === "walking"}
        onUnlock={(gift) => setPhase({ kind: "puzzle", gift })}
      />
      {phase.kind === "walking" && (
        <p className="info">Lauf mit den Pfeiltasten oder den Buttons zu den Geschenken.</p>
      )}
      {phase.kind === "puzzle" && (
        <PuzzleModal
          key={phase.gift}
          gift={phase.gift}
          onSolved={() => solve(phase.gift)}
          onCancel={() => setPhase({ kind: "walking" })}
        />
      )}
      {phase.kind === "reveal" && (
        <MessageReveal
          gift={phase.gift}
          onClose={isLast(phase.gift) ? undefined : () => setPhase({ kind: "walking" })}
        />
      )}
    </div>
  );
}
