export const WORLD_W = 800;      // logische Breite des Spielfelds
export const WORLD_H = 400;      // logische Höhe
// Kamera hinter der Figur: Der Gehweg führt in die Tiefe (z), weiter weg = kleiner.
export const HORIZON_Y = 170;    // Fluchtpunkt-Höhe
export const NEAR_Y = 360;       // Bildschirm-y der Füße bei z = 0
export const NEAR_SCALE = 1.5;   // Größe der Figur bei z = 0
export const DEPTH_FALLOFF = 80; // je kleiner, desto stärker schrumpft alles mit der Tiefe
export const PATH_HALF_W = 250;  // halbe Gehwegbreite in Pixeln bei z = 0

export const START_Z = 0;
export const START_LANE = -0.35; // seitliche Startposition (-1 linker … 1 rechter Gehwegrand)
export const MAX_Z = 240 + 14;   // Ende des begehbaren Wegs (knapp hinter dem letzten Geschenk)
export const GIFT_FADE_FROM = 95; // ab diesem Abstand zur Kamera verblasst ein Geschenk …
export const GIFT_FADE_TO = 130;  // … und ist ab hier unsichtbar
export const CAMERA_LAG = 0.35; // Sekunden, bis die Kamera der Figur größtenteils nachgezogen ist
export const LANE_LIMIT = 0.85;  // so weit darf die Figur zur Seite, ohne vom Gehweg zu fallen
export const SPEED = 28;         // Tiefeneinheiten pro Sekunde
export const LANE_SPEED = 0.9;   // Gehwegbreiten-Anteile pro Sekunde (seitlich)
export const GIFT_HALF_LANE = 0.4; // Kollision: halbe Breite eines Geschenks der Größe 1 (Lane-Einheiten)
export const STOP_DIST = 6;      // Kollision: halbe Tiefe eines Geschenks der Größe 1
export const TRIGGER_DIST = 10;  // Blase erscheint, wenn die Figur so nah (Tiefe) … (wächst mit der Geschenkgröße)
export const TRIGGER_LANE = 0.75; // … und so nah (seitlich) am Geschenk ist

export const UNLOCK_PROMPT = "Entsperren";
export const CONTINUE_LABEL = "Weiter";
export const LATER_LABEL = "Später";

export type Gift = {
  z: number;        // Tiefe auf dem Weg
  lane: number;     // seitliche Position (0 = Mitte)
  size: number;     // Größe relativ zum Standardgeschenk
  question: string;
  hint: string;     // erscheint nach 2 Fehlversuchen, darf die Antwort nicht verraten
  emoji: string;
  title: string;
  text: string;
};

// Gleicher Abstand, jedes Geschenk größer als das davor. Nur der Reihe nach zu öffnen.
// Alle in einer Linie. Ein Geschenk erscheint erst, wenn das vorherige geöffnet ist,
// und taucht dann aus dem Dunst auf – so stapeln sie sich nie zu einem Turm.
// Antworten: eine Zeile pro Geschenk in scripts/answer.nocommit.txt, dann `npm run hash`.
export const GIFTS: Gift[] = [
  {
    z: 80, lane: 0, size: 0.7,
    question: "Was ist das leckerste Essen der Welt?",
    hint: "Igel!",
    emoji: "😢",
    title: "Hier sollte eigentlich stehen...",
    text: "dass wir zusammen in die Therme gehen werden haha",
  },
  {
    z: 160, lane: 0, size: 1,
    question: "Mühlheim ist ein/e ...",
    hint: "Kleiner als eine Stadt",
    emoji: "😢",
    title: "Versuch Nummer zwei",
    text: "Hoffentlich haben wir dieses mal nicht das gleiche Geschenk!",
  },
  {
    z: 240, lane: 0, size: 1.35,
    question: "Hier steht später die dritte Frage.",
    hint: "Tipp zur dritten Frage",
    emoji: "😢",
    title: "Geschenk Nummer 3",
    text: "Hier steht später die dritte Nachricht.",
  },
];

/** Ein Geschenk ist sichtbar (und im Weg), sobald das vorherige geöffnet ist. */
export const giftVisible = (i: number, opened: readonly boolean[]) => i === 0 || opened[i - 1];
