# 03 — Perception Spec (the mental canvas)

This is the most concept-critical code in the project. Read [01-vision](01-vision.md) first. Everything here describes `drawMentalImage(dt)` and `drawFull3D(...)` in `prototype/script.js`.

## Model

The player's screen is not a viewport. It is a **memory surface**:

- The only *live* pixels are the thin rotated column at screen center (the scan strip).
- Everything else is *recollection*: past strips, shifted as the scan turned, fading toward black.
- Turning the scan is therefore also *painting*; standing still lets the world dissolve. Hence the line: "The ruin is legible only while it moves."

## Device-pixel rendering (2026-07-13)

The mental canvas backing store is sized at `devicePixelRatio` (capped 2×), so **1 canvas px = 1 physical px** — before this, Windows display scaling (e.g. 150%) stretched a CSS-resolution canvas and blurred everything, which is why the hairline experiment first read as "not really 1 px". `renderer.setPixelRatio(1)`; `resize()` computes `dpr`, sizes the canvases and the hidden sensor (`sensorWidth/Height`) in device px. `PANORAMA_PIXELS_PER_RADIAN` remains defined in **CSS px/rad** and is multiplied by `dpr` at use, so the memory horizon (~282° at 1920 CSS px) is unchanged. Normal strip widths scale by `dpr` (8 CSS px); **the hairline strip does not** — it is deliberately 1 *device* px, the thinnest line the screen can show.

**Hairline is the default since 2026-07-13** (user: 「1ピクセルの方が2次元人の体感っぽくていい」); key `4` toggles back to the wide strip for comparison. Key `5` is a further experiment: **zero afterimage** — the canvas is wiped every frame and only the live line exists. Undecided; if adopted anywhere, the natural home is a story beat (e.g. the first seconds after the fall, before he *learns* to remember — afterimage as an acquired skill).

## Exact per-frame behavior

Order matters; this sequence produces the afterimage feel:

1. **Shift**: `shift = normalizeAngle(yaw - lastYaw) * PANORAMA_PIXELS_PER_RADIAN` (390 px/rad). The previous frame's mental canvas is drawn into `copyCanvas` offset by `shift`, then copied back. Turning the scan **right** (yaw decreases) shifts the old image **left** — the world streams past like a panning panorama. Pixels shifted off-screen are gone forever (no wraparound).
2. **Decay**: a translucent black rect, alpha `0.03 + clamp(drift * 0.005, 0, 0.03)` where `drift = hypot(angularVelocity, rollVelocity * 0.75)`. Faster scanning ⇒ faster forgetting (motion smears memory).
3. **Branch — DEV 3D** (`game.devView`): `drawFull3D(width, height)` draws the full scene over everything, opaque. Return.
4. **Branch — Reveal** (`game.revealTimer > 0`): full 3D at alpha `0.18 + (timer/REVEAL_DURATION) * 0.62`, plus a green wash. The strip below still draws — the reveal *overlays* perception, then evaporates back into it. ⚠️ The timer is decremented in `loop()`, **not** here — it used to live in this branch, which DEV 3D's early return never reached, freezing the game forever after an in-dev-view collect (fixed 2026-07-07). Keep timers in the loop, not in draw paths.
5. **Live strip**: render scene into the hidden 96 px renderer; blit the center 3 source columns into an 8 px screen column at center, alpha 0.86, rotated by `player.scanRoll`. (Fixed width since 2026-07-08 — the old focus/"Wide scan" mode that widened this to 8→18 px was removed; a wider live slice undercut the 1D-perception thesis.)
6. **Pulse tint**: if `game.pulse > 0.01`, a cyan rect over the strip (composite `source-atop`, alpha `pulse * 0.12`), decaying as `pulse *= 0.08^dt`.
7. **Orientation tick**: 1×18 px white mark near the bottom of the strip, rotated with the roll — the only always-on cue for which way "down" is along the scan.

## Derived numbers (useful when tuning)

- Camera: vertical FOV 48°, aspect `96/height` ⇒ horizontal FOV ≈ **4.5°** at 1080 p. The blitted 3-px core covers ≈ **0.14°** — the live view is effectively a 1D line, as the fiction demands.
- Panorama scale: 390 px/rad ⇒ a 1920-px-wide window holds ≈ 4.92 rad ≈ **282° of remembered world**. On narrow windows the memory horizon shrinks proportionally (a real difficulty knob).
- The panorama scale is **deliberately not matched** to the strip's true angular scale (which would be ~3200 px/rad). This mismatch compresses the world into the screen and is part of the tuned feel — don't "correct" it for physical accuracy without the user asking.
- (Removed 2026-07-08: a "focus / Wide scan" mode widened the live slice ~2.7× and slowed movement. The user cut it — "sweep and see everything" trivialized the perception challenge and pulled the game toward normal vision. If a "perception costs something" affordance is wanted later, prefer one that *narrows* or *dims*, not one that widens.)

## Invariants (violating any of these breaks the game's identity)

1. Live pixels exist **only** in the center strip (plus reveal/DEV overlays). Never update off-center pixels from the live render.
2. Afterimage motion must stay **opposite** to scan turn: press right → scan turns right → afterimage drifts left. (This was explicitly aligned for both arrows and mouse; the mouse handler negates `movementX` for this reason.)
3. Decay must be monotonic — no effect may *refresh* old pixels without new scanning.
4. The reveal is short (`REVEAL_DURATION` 0.28 s), input-locked, and fictionalized. Lengthening it materially is a design change requiring the user.
5. `scanRoll` rotates the strip, the reticle overlay (CSS var `--scan-roll`), and the camera `up` together — they must never desynchronize. All three read from the same `player.scanRoll`. Consequence (confirmed correct by the user, 2026-07-07): **vertical structures genuinely lean in the rendered slice while tilted** — identical to tilting your head; the retinal image rotates for humans too. Do not "stabilize" the world against roll. The orientation tick and the rolled reticle are the being's vestibular cues; banked ground (A8) deliberately plays with the gap between world-tilt and self-tilt.
6. No minimap, radar, scope, or persistent object markers on the mental canvas or HUD.
7. ~~"Seen empty" must differ from "not seen"~~ — **goal retired 2026-07-08** (user: two implementations tried — a subtle air-trace and the bold bright-floor band — and neither *felt* like anything in play; dropped for now). The **bright floor stays** for its own merits: aesthetics the user approved, and the bright-floor/dark-sky **horizon** as a stable orientation + tilt reference. Do not re-attempt seen-vs-unseen marking without a genuinely new approach and the user's ask; the failed attempts are archived in git history (a257649, 7bf980f).
8. **Input texture differs by device (user observation, 2026-07-08):** keyboard scanning turns at constant `TURN_SPEED`, so afterimage bands are perfectly uniform; mouse scanning produces variable-speed smear. Both are legitimate reads of the same law. Optional future tunable to A/B with the user: slight ease-in/out on keyboard turns for a more organic band — **do not implement unprompted**.

## Tuning table

| Constant | Value | Effect of increasing |
| --- | --- | --- |
| `SENSOR_RENDER_WIDTH` | 96 | More horizontal context available to the strip blit (and slightly wider hFOV); keep small |
| `PANORAMA_PIXELS_PER_RADIAN` | 390 | World feels larger on screen; less of it fits in memory |
| `REVEAL_DURATION` | 0.28 | Longer 3D flash (design-sensitive; see invariant 4) |
| `MOUSE_SCAN_SPEED` | 0.0042 | Faster mouse scanning |
| `TURN_SPEED` | 1.75 rad/s | Faster keyboard scan yaw |
| `TILT_STEPS` / `TILT_NOTCH_DEG` | ±30/45/60° | Tilt notch grid (decision ⑦; keyboard tap-steps, pad holds) |
| `TILT_SPRING` | 13 (1/s) | How fast `scanRoll` eases to its notch (~0.15 s) |
| `MAX_SCAN_ROLL` | π/3 | Tilt clamp / top notch |
| strip widths (in `drawMentalImage`) | 3 px source → 8 px draw (fixed) | Wider = more live info but dilutes the 1D thesis (the focus-widen mode was cut) |
| decay alphas (step 2) | 0.03 + 0.03 | Faster forgetting |

## Rules for changing this file's domain

- Any new visual channel must answer: *what does the 2D man's body do to produce this?* If there is no answer, it's a debug overlay — gate it behind `game.devView` or a new explicit dev flag.
- Prefer modulating existing channels (strip width, decay rate, panorama scale, pulse) over adding new ones.
- Test on at least two window widths; the memory horizon depends on width (see derived numbers).
- After edits, run the smoke test in [09-agent-playbook](09-agent-playbook.md) and specifically verify invariant 2 by pressing `→` and watching drift direction.
