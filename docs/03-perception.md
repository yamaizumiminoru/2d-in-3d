# 03 — Perception Spec (the mental canvas)

This is the most concept-critical code in the project. Read [01-vision](01-vision.md) first. Everything here describes `drawMentalImage(dt)` and `drawFull3D(...)` in `prototype/script.js`.

## Model

The player's screen is not a viewport. It is a **memory surface**:

- The only *live* pixels are the thin rotated column at screen center (the scan strip).
- Everything else is *recollection*: past strips, shifted as the scan turned, fading toward black.
- Turning the scan is therefore also *painting*; standing still lets the world dissolve. Hence the line: "The ruin is legible only while it moves."

## Exact per-frame behavior

Order matters; this sequence produces the afterimage feel:

1. **Shift**: `shift = normalizeAngle(yaw - lastYaw) * PANORAMA_PIXELS_PER_RADIAN` (390 px/rad). The previous frame's mental canvas is drawn into `copyCanvas` offset by `shift`, then copied back. Turning the scan **right** (yaw decreases) shifts the old image **left** — the world streams past like a panning panorama. Pixels shifted off-screen are gone forever (no wraparound).
2. **Decay**: a translucent black rect, alpha `0.03 + clamp(drift * 0.005, 0, 0.03)` where `drift = hypot(angularVelocity, rollVelocity * 0.75)`. Faster scanning ⇒ faster forgetting (motion smears memory).
3. **Branch — DEV 3D** (`game.devView`): `drawFull3D(width, height)` draws the full scene over everything, opaque. Return.
4. **Branch — Reveal** (`game.revealTimer > 0`): full 3D at alpha `0.18 + (timer/REVEAL_DURATION) * 0.62`, plus a green wash. The strip below still draws — the reveal *overlays* perception, then evaporates back into it. ⚠️ The timer is decremented in `loop()`, **not** here — it used to live in this branch, which DEV 3D's early return never reached, freezing the game forever after an in-dev-view collect (fixed 2026-07-07). Keep timers in the loop, not in draw paths.
5. **Live strip**: render scene into the hidden 96 px renderer; blit source columns `[center − w/2, center + w/2]` where `w = 3` (normal) or `8` (focus/Shift) into a screen column `8 px` (normal) or `18 px` (focus) wide, at alpha 0.86, rotated by `player.scanRoll` about screen center.
6. **Pulse tint**: if `game.pulse > 0.01`, a cyan rect over the strip (composite `source-atop`, alpha `pulse * 0.12`), decaying as `pulse *= 0.08^dt`.
7. **Orientation tick**: 1×18 px white mark near the bottom of the strip, rotated with the roll — the only always-on cue for which way "down" is along the scan.

## Derived numbers (useful when tuning)

- Camera: vertical FOV 48°, aspect `96/height` ⇒ horizontal FOV ≈ **4.5°** at 1080 p. The blitted 3-px core covers ≈ **0.14°** — the live view is effectively a 1D line, as the fiction demands.
- Panorama scale: 390 px/rad ⇒ a 1920-px-wide window holds ≈ 4.92 rad ≈ **282° of remembered world**. On narrow windows the memory horizon shrinks proportionally (a real difficulty knob).
- The panorama scale is **deliberately not matched** to the strip's true angular scale (which would be ~3200 px/rad). This mismatch compresses the world into the screen and is part of the tuned feel — don't "correct" it for physical accuracy without the user asking.
- Focus mode (Shift) widens the live slice ~2.7× and slows turn speed to 0.38× / movement to 0.46× — trading mobility for bandwidth, consistent with pillar 4's "perception costs something".

## Invariants (violating any of these breaks the game's identity)

1. Live pixels exist **only** in the center strip (plus reveal/DEV overlays). Never update off-center pixels from the live render.
2. Afterimage motion must stay **opposite** to scan turn: press right → scan turns right → afterimage drifts left. (This was explicitly aligned for both arrows and mouse; the mouse handler negates `movementX` for this reason.)
3. Decay must be monotonic — no effect may *refresh* old pixels without new scanning.
4. The reveal is short (`REVEAL_DURATION` 0.28 s), input-locked, and fictionalized. Lengthening it materially is a design change requiring the user.
5. `scanRoll` rotates the strip, the reticle overlay (CSS var `--scan-roll`), and the camera `up` together — they must never desynchronize. All three read from the same `player.scanRoll`. Consequence (confirmed correct by the user, 2026-07-07): **vertical structures genuinely lean in the rendered slice while tilted** — identical to tilting your head; the retinal image rotates for humans too. Do not "stabilize" the world against roll. The orientation tick and the rolled reticle are the being's vestibular cues; banked ground (A8) deliberately plays with the gap between world-tilt and self-tilt.
6. No minimap, radar, scope, or persistent object markers on the mental canvas or HUD.
7. **"Seen empty" must differ from "not seen"** (user calls, 2026-07-07/08): the **bright floor** carries the distinction (`COLORS.floor` 0x9db4b8, emissive 0x8fa7ab @ 0.5) — swept floor leaves an unmissable band over unscanned black, and the bright-floor/dark-sky **horizon** doubles as a stable orientation and tilt reference. A subtler mechanism (sky/fog slightly above the decay target, `COLORS.air`) was tried and **removed 2026-07-08** — the user could not perceive it; keep signals bold enough to feel. The band still decays with the normal afterimage fade — a permanent distinction would be a minimap by another name. Per-stage `palette` may darken the floor deliberately (ST8's unlit room), which makes the brightness elsewhere meaningful by absence.
8. **Input texture differs by device (user observation, 2026-07-08):** keyboard scanning turns at constant `TURN_SPEED`, so afterimage bands are perfectly uniform; mouse scanning produces variable-speed smear. Both are legitimate reads of the same law. Optional future tunable to A/B with the user: slight ease-in/out on keyboard turns for a more organic band — **do not implement unprompted**.

## Tuning table

| Constant | Value | Effect of increasing |
| --- | --- | --- |
| `SENSOR_RENDER_WIDTH` | 96 | More horizontal context available to the strip blit (and slightly wider hFOV); keep small |
| `PANORAMA_PIXELS_PER_RADIAN` | 390 | World feels larger on screen; less of it fits in memory |
| `REVEAL_DURATION` | 0.28 | Longer 3D flash (design-sensitive; see invariant 4) |
| `MOUSE_SCAN_SPEED` | 0.0042 | Faster mouse scanning |
| `WHEEL_ROLL_SPEED` | 0.0024 | Faster wheel tilt |
| `TURN_SPEED` / `ROLL_SPEED` | 1.75 / 1.15 rad/s | Faster keyboard scan/tilt |
| `MAX_SCAN_ROLL` | π/3 | Wider tilt range |
| strip widths (in `drawMentalImage`) | 3→8 px, 8→18 px | More live information (design-sensitive; pillar 2) |
| decay alphas (step 2) | 0.03 + 0.03 | Faster forgetting |

## Rules for changing this file's domain

- Any new visual channel must answer: *what does the 2D man's body do to produce this?* If there is no answer, it's a debug overlay — gate it behind `game.devView` or a new explicit dev flag.
- Prefer modulating existing channels (strip width, decay rate, panorama scale, pulse) over adding new ones.
- Test on at least two window widths; the memory horizon depends on width (see derived numbers).
- After edits, run the smoke test in [09-agent-playbook](09-agent-playbook.md) and specifically verify invariant 2 by pressing `→` and watching drift direction.
