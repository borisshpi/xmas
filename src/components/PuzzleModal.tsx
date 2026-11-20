import { useState } from "react";
import { cyrb53, normalize } from "../lib/hash";
import { ANSWER_HASH } from "../game/answerHash";
import { PUZZLE_QUESTION, PUZZLE_HINT } from "../game/constants";


export default function PuzzleModal({ onSolved }: { onSolved: () => void }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [tries, setTries] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cyrb53(normalize(value)) === ANSWER_HASH) {
      onSolved();
    } else {
      setWrong(true);
      setTries((t) => t + 1);
      setTimeout(() => setWrong(false), 500);
    }
  };

  return (
    <div className="overlay">
      <form className={`card ${wrong ? "shake" : ""}`} onSubmit={submit}>
        <h2>🔒 Das Geschenk ist gesperrt</h2>
        <p>{PUZZLE_QUESTION}</p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Deine Antwort"
        />
        <button type="submit">Öffnen</button>
        {tries >= 2 && <p className="hint">Tipp: {PUZZLE_HINT}</p>}
      </form>
    </div>
  );
}
