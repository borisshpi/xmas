import { useState } from "react";
import { cyrb53, normalize } from "../lib/hash";
import { ANSWER_HASHES } from "../game/answerHash";
import { GIFTS, LATER_LABEL } from "../game/constants";

type Props = {
  gift: number;
  onSolved: () => void;
  onCancel: () => void;
};

export default function PuzzleModal({ gift, onSolved, onCancel }: Props) {
  const g = GIFTS[gift];
  const hash = ANSWER_HASHES[gift];
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [tries, setTries] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // nur die richtige Antwort öffnet; ohne hinterlegten Hash bleibt das Geschenk zu
    if (hash !== undefined && cyrb53(normalize(value)) === hash) {
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
        <p>{g.question}</p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Deine Antwort"
        />
        <button type="submit">Öffnen</button>
        {tries >= 2 && <p className="hint">Tipp: {g.hint}</p>}
        <button type="button" className="secondary" onClick={onCancel}>
          {LATER_LABEL}
        </button>
      </form>
    </div>
  );
}
