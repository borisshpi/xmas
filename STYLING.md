# STYLING.md

The visual language of the gift page. New UI and new canvas art should look like they belong with what's already here. All live CSS is in `src/index.css`. All canvas art is in `src/game/draw.ts`.

## Mood

Soft, rounded, friendly, toy-like. The page should feel like a cheerful casual-console menu: a bright pastel sky, puffy white frames, chunky buttons you can press, and gentle motion. Avoid hard edges, dark themes, thin hairlines, and anything that reads as "corporate" or "flat material".

There is one light theme. Don't add dark mode. The page is a scene, not an app.

## Palette

The colors are currently hard-coded. Reuse these exact values rather than inventing near-duplicates. If you introduce CSS custom properties, name them after these roles.

### UI (CSS)

| Role | Value | Used for |
|---|---|---|
| Page background | `#f4fbff` → `#d8eefc` (vertical gradient) | `body` |
| Body text | `#4a5568` | default text |
| Soft text / icons | `#5a7fa8` | `.info`, touch button glyphs |
| Muted text | `#8aa1b8` | `.hint` |
| Heading accent | `#3a87d4` | `.card h2` |
| Frame ring / borders | `#cfe6f7` | inset ring, input borders, button borders |
| Frame | `#fff` | thick outer borders on canvas and cards |
| Surface | `#ffffff` → `#f0f8ff` / `#eaf4fb` (vertical gradient) | cards, secondary buttons |
| Primary action | `#5db3ff` → `#2f8fe8`, pressed edge `#2271bd` | `.card button` |
| Focus | `#5db3ff` | input focus border |
| Overlay scrim | `rgba(220,240,255,.7)` + `blur(4px)` | `.overlay` |
| Shadow tint | `rgba(60,120,180,.25–.3)` | all drop shadows: blue-tinted, never grey/black |

### Scene (canvas)

| Element | Colors |
|---|---|
| Sky | `#7cc8ff` → `#e9f8ff` |
| Clouds | `rgba(255,255,255,0.95)` |
| Far skyline (haze) | `#cfe4f7` |
| Stone landmarks (Brandenburger Tor, Reichstag) | `#f3e2b8`, shade `#dcc48f`; Quadriga patina `#7fbfa4`; glass dome `#f4fbff` → `#cfe6f7` |
| Fernsehturm | shaft `#eef4fa` → `#d6e4f1`, ball `#ffffff` → `#cddbea`, window band `#a9c3dc`, antenna `#ff8fa6`/white |
| Altbau facades / roofs | `#ffd9cc`/`#c98f86`, `#fff0c4`/`#b9a08a`, `#d9ecff`/`#9fb3c8`; windows white `0.75` |
| Trees | crowns `#7fcd58`, `#66bb45` (darker than the grass so they read on it), top highlight white `0.18`; trunk `#b08a64` |
| Grass | `#c6ebad` → `#9fdc78` → `#5cba3c` (hazy far away) |
| Gehweg | slabs `#e9e3d8` (far) → `#f8f4ed` (near), joints `#ddd3c2`, mosaic strips `#ebe0c9` with dots `#d8c9ab`, curb `#d8cebc` |
| Street lamps | post `#6b7a8c`, light `#fff6d8` |
| Gift body / lid | `#ff6b8b` → `#e63e66`, lid `#ff3d6b`, ribbon `#fff` |
| Lock | shackle `#c9c9c9`, body `#ffcf33` |
| Glow / sparkles | `rgba(255,245,160,…)`, white `0.9` |
| Character (woman seen from behind, shoulder-length red hair, blue dress, white bow at the back) | hair `#d9532c`, back hair `#b8432a`, dress `#4fb0ff` → `#2f8fe8`, legs `#4a5a8a`, skin `#ffd9b3`, eyes `#3b2a24` with white glint, brows `#a8432a`, nose `#e8b48e`, blush `rgba(255,120,140,0.35)`, mouth `#c9505a` |
| Contact shadows | `rgba(0,0,0,0.15)` |

Each accent has a job: **blue** for UI and actions, **pink-red** for the gift (the goal), **yellow** for locked or magic states. Keep new accents within these families.

## Typography

- Use **Nunito** only, with the fallback `system-ui, sans-serif`.
- Use two weights: **600** for body (the default on `body`) and **800** for headings, buttons, and emphasis. Don't use other weights. They aren't loaded.
- Pass `font: inherit` to form controls.
- Sizes are modest: 17px for inputs and buttons, 14px for hints, the browser default for headings.
- Center text in cards and helper lines.
- An emoji may lead a heading (🔒, 😢). Use at most one per heading.

## Shape and depth

- **Radii are generous:** 24px for inputs and primary buttons, 28px for cards and the canvas, 32px for the touch buttons (a pill shape). Nothing below about 8px except tiny canvas details.
- **Use the puffy frame** for any framed surface:
  `border: 4–6px solid #fff; box-shadow: 0 8–10px 24–30px rgba(60,120,180,.25–.3), inset 0 0 0 2px #cfe6f7;`
- **Use pressable buttons:** a vertical gradient fill, a solid bottom "edge" shadow (`0 4px 0 <darker>`), and on `:active` a `translateY(3px)` with the edge shrunk to `0 1px 0`. Every button follows this.
- Use gradients top-to-bottom only, light to dark, in both CSS and canvas.

## Layout

- `.stage` is the single column: `min(100vw, 900px)` wide with a 14px padding, centered by `body`'s grid.
- The canvas keeps `aspect-ratio: 2 / 1`, matching the 800 × 400 logical world.
- The unlock prompt is `.unlock-bubble`: a small primary-style pill with a white tail, placed over the gift in canvas-relative percent inside `.viewport`. It pops in (`bubble-in`) and then floats gently (`bubble-float`).
- Modals use `.overlay` (fixed, centered grid, blurred scrim) with a `.card` (`min(92vw, 420px)`, grid with a 14px gap).
- Touch controls sit below the canvas as two `.pad` groups, each 42% wide and pushed to the edges: ◀ ▶ under the left thumb, ▼ ▲ under the right. Multi-touch allows diagonal movement. Keep `touch-action: none` and `user-select: none` on them.
- Must work at phone width without horizontal scroll. Test at about 360px.

## Motion

- **`pop`** (0.6s, `cubic-bezier(.2,1.4,.4,1)`): a bouncy scale-in for celebratory reveals.
- **`shake`** (0.4s): horizontal ±8px for a wrong answer. Clear the class after about 500ms so it can retrigger.
- Canvas idle motion uses slow sines of `t`. Gift bob is `sin(t/400)·2`, walk cycle `t/140` (hair sways on the same cycle, slightly phase-shifted), sparkles `t/600`, and clouds drift at a few px/s. Keep amplitudes small, a few pixels.
- No motion should feel abrupt. Prefer overshoot easing for entrances.

## Canvas art rules

- Build everything from simple primitives: `arc`, `ellipse`, `roundRect`, and round-capped strokes (`lineCap = "round"`). No sprites or images.
- Ground every object with a soft contact shadow: a flat ellipse in `rgba(0,0,0,0.15)` at its base.
- **Camera: behind the character, slightly from above.** The sidewalk runs straight into the depth toward a vanishing point at (`WORLD_W/2`, `HORIZON_Y` = 170). The Brandenburger Tor sits exactly at that point. The camera follows the character with a short lag, so she drifts slightly into the depth and back while the world scrolls past. In this view:
  - Walking forward, she has her **back** to the camera. The back of her head is all hair: shoulder-length, with a parting and a highlight. A white bow sits at the back of her dress, and her heels lift alternately.
  - Walking back, she **faces the camera**. She has a friendly, simple avatar face: dark oval eyes with a white glint, close together, thin arched brows, a tiny nose, a soft blush, and a wide smile. Never use dot eyes spaced far apart or lashes, because that reads as creepy at this size. She also has a fringe, side strands down to her shoulders with the long hair behind them, a white collar, and visible shoe tips.
  - Top surfaces are visible as lighter bands: the gift lid, the open box interior, and the tree crowns.
  - Contact shadows are flat ellipses directly below objects.
  - Size and position come only from `project(lane, z)`. Don't hand-place anything that stands on the ground.
  - Ground textures follow the perspective. Cross joints sit at fixed depth steps, and lengthwise joints run to the vanishing point.
  - A soft haze band hides the horizon seam.
- Draw back to front: sky → clouds → skyline (scaled to 0.58 at the horizon) → grass → Gehweg → depth-sorted props (trees, street lamps, gift, character).
- **Three gifts** stand in one line in the middle of the sidewalk (lane 0) at equal spacing (z 80 / 160 / 240), with sizes 0.7 / 1 / 1.35, so each one is bigger than the last. A gift appears only after the previous one is opened, so they never stack into a tower in perspective. Far gifts also fade with distance (`GIFT_FADE_FROM` 95 → `GIFT_FADE_TO` 130) and emerge from the haze. An opened gift's lid lies on the ground beside the box. Nothing may rise above an opened gift, or it would overlap the next gift appearing behind it.
- The secondary card button (`.card button.secondary`, e.g. "Später") uses the same white-surface pressable style as the touch buttons.
- The scene is Berlin. Landmarks are simplified, pastel, and recognisable by silhouette alone. The gift stands in the middle of the sidewalk (`GIFT_LANE` = 0), right below the Brandenburger Tor in the vanishing point. She starts slightly to one side (`START_LANE`), so the gift is visible from the start.
- Avoid outlines on shapes. Separate shapes with color and value instead. Strokes are only for limbs, the lock shackle, the smile, lashes, the antenna, and the dome ribs.
- Start a new path (`beginPath`) for each separate `arc`/`ellipse` blob, or add a `moveTo` first. Otherwise the arcs connect and leave stray wedges.
- Size things to the existing scale. The character is about 70px tall and the gift about 56 × 46 on the 800 × 400 world.
- When a new state needs emphasis, use a radial glow like the opened gift rather than a stronger color.

## Do / Don't

- **Do** reuse the existing classes (`.card`, `.overlay`, `.hint`, the button styles) before writing new ones.
- **Do** keep everything in `index.css`. Don't revive `App.css`. It's template leftover.
- **Don't** use pure black for anything except tiny details like the eyes, and don't use grey shadows.
- **Don't** add icon fonts or UI libraries. Glyphs (◀ ▶) and emoji are fine.
