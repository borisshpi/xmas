import { CONTINUE_LABEL, GIFTS } from "../game/constants";

type Props = {
  gift: number;
  /** fehlt beim letzten Geschenk: dann bleibt die Nachricht stehen */
  onClose?: () => void;
};

export default function MessageReveal({ gift, onClose }: Props) {
  const g = GIFTS[gift];
  return (
    <div className="overlay reveal">
      <div className="card">
        <h2>{g.emoji} {g.title}</h2>
        <p>{g.text}</p>
        {onClose && (
          <button type="button" autoFocus onClick={onClose}>
            {CONTINUE_LABEL}
          </button>
        )}
      </div>
    </div>
  );
}
