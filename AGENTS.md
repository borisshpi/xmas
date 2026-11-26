# AGENTS.md

Guidance for coding agents working in this repo. For visual and design rules, see [STYLING.md](STYLING.md).

## What this is

A small personal gift web page. The recipient walks a character (seen from behind) down a Berlin sidewalk toward three wrapped presents in front of the Brandenburger Tor. The presents are equally spaced and each one is bigger than the one before. When she is close to one, a small "🔒 Entsperren" bubble appears above it. Clicking it, or pressing Enter, opens that present's riddle. The right answer unlocks it and shows its message. Presents unlock **in order**. A present only exists (visible, solid, and interactive) once the one before it is opened (`giftVisible`). It then emerges from the haze further down the path.

Flow (`App.tsx`): `walking` → `puzzle(gift)` → `reveal(gift)` → back to `walking`. `opened[]` tracks each present. The riddle can be closed with "Später". The reveal has a "Weiter" button, except for the last present, whose message stays up as the ending.

All present data lives in the `GIFTS` array in `constants.ts`: `z`, `lane`, `size`, `question`, `hint`, `emoji`, `title`, `text`. Collision and the bubble range scale with `size`.

The audience is one person, not the public. Optimise for charm and polish, not for scale or features.

## Stack

- React 19 + TypeScript (strict-ish, `noUnusedLocals`/`noUnusedParameters`) + Vite 8
- Plain CSS in `src/index.css`. No CSS framework and no CSS modules.
- Game rendering on `<canvas>` 2D. No game engine.
- Font: Nunito via `@fontsource/nunito` (weights 600 and 800 only)
- Lint: oxlint (`.oxlintrc.json`)
- Deploy: Cloudflare Workers static assets (`wrangler.jsonc` serves `./dist` as an SPA)

## Commands

```sh
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build. Run before calling work done.
npm run lint     # oxlint
npm run hash     # regenerate the answer hashes (local only, see below)
```

There are no tests. Verify with `npm run build` and `npm run lint`, then check it in the browser at desktop and phone widths, using keyboard and touch buttons.

## Layout

```
src/
  App.tsx                 phase state machine, composes everything
  main.tsx                entry; loads fonts + index.css
  index.css               ALL live styles
  game/
    constants.ts          camera/projection, depth positions, speed, and all user-facing copy
    draw.ts               pure canvas drawing (scene, gift, character)
    GameCanvas.tsx        rAF loop, movement, path bounds, gift collision, unlock bubble, touch D-pad
    useKeys.ts            keyboard state in a ref (arrows / WASD, four directions)
    answerHash.ts         GENERATED: do not edit by hand
  components/
    PuzzleModal.tsx       riddle form, shake on wrong answer, hint after 2 tries
    MessageReveal.tsx     final message card
  lib/hash.ts             cyrb53 + normalize
scripts/                  *.nocommit.* files are git-ignored
```

## Conventions

- **The UI language is German.** All user-visible text is German, and so are code comments. Use proper umlauts (ä ö ü ß). Don't write ae/oe/ue.
- **Put copy and tunables in `game/constants.ts`.** Don't hard-code strings or magic numbers in components.
- **Canvas code works in logical coordinates** (`WORLD_W` × `WORLD_H` = 800 × 400). `GameCanvas` sets the DPR scaling once, so never multiply by `devicePixelRatio` in `draw.ts`.
- **The player moves in depth (`z`) and sideways (`lane`).** She faces away from the camera when walking forward and toward the camera when walking back (`facing`). Moving sideways keeps her last facing. Up and down change `z`, left and right change `lane`. `lane` is clamped to `±LANE_LIMIT`, so she always stays on the sidewalk. `z` is clamped to `START_Z…MAX_Z`. Each gift is a solid box (`GIFT_HALF_LANE` × `STOP_DIST`, times its `size`), and each axis is resolved separately, so she slides along it. Being close (`TRIGGER_DIST`, `TRIGGER_LANE`) only shows the unlock bubble. It never opens the riddle by itself. The loop calls `setNear` only when the nearest gift in range changes, never once per frame. A follow camera (`camZ`) trails the player with an exponential lag (`CAMERA_LAG`), so she only drifts a little into the depth before the world scrolls after her. `project(lane, z)` in `draw.ts` takes `z` relative to the camera (`worldZ - camZ`) and maps a ground point to screen `x`, `y`, and scale. Ground joints, trees, and lamps are anchored in world z, so they scroll. Props behind the camera are culled. The skyline is "infinitely far" away and never moves. The unlock bubble follows the gift through `giftAnchor(gift, camZ)`, which the loop writes straight into the DOM, with no React re-render. `lane` runs from -1 to 1 across the sidewalk. Everything standing on the ground is drawn with its feet at the origin through `at(...)` and is depth-sorted, far to near. Add new props to that list. Don't position them by hand.
- **`draw.ts` stays pure.** It takes `(ctx, state, t)` and draws, with no React, no refs, and no mutation outside the canvas. Animation comes from `t` (ms, `performance.now()`), not from stored per-frame state.
- **The game loop must not re-render React.** Per-frame state (`playerX`, keys, flags) lives in refs. Props reach the loop through mirrored refs (`openedRef`, `onUnlockRef`), so the effect never restarts. Keep this pattern.
- Each canvas helper wraps transforms in `save()`/`restore()` and sets its own `fillStyle`/`strokeStyle`/`lineWidth`. Don't rely on state left over from an earlier helper.
- Use function components and default exports for components. Use named exports for helpers and hooks.
- Keep the dependency count tiny. Ask before adding a package.

## The answer secret

The answers must never appear in the repo or the bundle.

1. Write the answers to `scripts/answer.nocommit.txt`, **one per line, in `GIFTS` order**. The file is git-ignored.
2. Run `npm run hash`. This rewrites `src/game/answerHash.ts` (`ANSWER_HASHES`, one per gift). The script prints only the count, never the answers.
3. Commit only `answerHash.ts`.

Only the correct answer opens a gift, with no dev bypass. A gift without a hash can't be opened at all, so the hash count must match `GIFTS.length`.

`normalize` (trim + lowercase) must stay identical in `src/lib/hash.ts` and `scripts/make-hash.nocommit.mjs`. If you change one, change both and regenerate.

Don't read, print, log, or commit the plaintext answers. Don't add it to `constants.ts`, tests, or docs either. Each gift's `hint` is shown to the user, so it must not give the answer away outright.

## Known leftovers from the Vite template

These are unused today. Remove them or ignore them, but don't build on them:

- `src/App.css` (not imported anywhere)
- `src/assets/*` (`hero.png`, `react.svg`, `vite.svg`)
- `public/favicon.svg` and `public/icons.svg` (Vite logo)
- `README.md` (template text)
- `<title>xmas</title>` and `lang="en"` in `index.html`. The content is German.

The first gift's placeholder `title` says "Geburtstag" while the project is named `xmas`. Gifts 2 and 3 have placeholder questions and messages. Confirm the occasion with the user before you change copy.

## Git

- Branch off `main`. Commit only when asked.
- Never commit `*.nocommit.*`, `dist/`, or `.wrangler/`.
