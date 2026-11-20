import { useState } from "react";
import GameCanvas from "./game/GameCanvas";
import PuzzleModal from "./components/PuzzleModal";
import MessageReveal from "./components/MessageReveal";

type Phase = "walking" | "puzzle" | "unlocked";

export default function App() {
  const [phase, setPhase] = useState<Phase>("walking");

  return (
    <div className="stage">
      <GameCanvas
        giftOpen={phase === "unlocked"}
        onReachGift={() => setPhase("puzzle")}
      />
      {phase === "walking" && (
        <p className="info">Bewege dich mit ← → oder den Buttons zum Geschenk.</p>
      )}
      {phase === "puzzle" && (
        <PuzzleModal onSolved={() => setPhase("unlocked")} />
      )}
      {phase === "unlocked" && <MessageReveal />}
    </div>
  );
}
