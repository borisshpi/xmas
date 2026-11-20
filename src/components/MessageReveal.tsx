import { MESSAGE_TITLE, MESSAGE_TEXT } from "../game/constants";

export default function MessageReveal() {
  return (
    <div className="overlay reveal">
      <div className="card">
        <h2>🎉 {MESSAGE_TITLE}</h2>
        <p>{MESSAGE_TEXT}</p>
      </div>
    </div>
  );
}
