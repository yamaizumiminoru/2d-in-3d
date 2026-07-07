# Sliceborne Handoff for Claude Fable 5

Date: 2026-07-06

> **Note (2026-07-06, later the same day):** This short handoff has been expanded into a full
> documentation set. Agents should start from `AGENTS.md` at the repo root, then `docs/README.md`.
> This file is kept for history; where it and `docs/` disagree, `docs/` wins.

This document is for a short handoff to another coding assistant. The project is a playable browser prototype in this folder:

`C:\Users\piano\.gemini\antigravity\scratch\2d-adventure`

The app is currently opened at:

`http://127.0.0.1:4173/index.html`

## Core Concept

Sliceborne is a game about a two-dimensional person thrown into three-dimensional space.

The player does not get ordinary 3D human vision. They perceive the world through a narrow moving scan line, afterimages, and echolocation-like sound. The pleasure of the game should come from learning to read 3D space with an intentionally incomplete 2D-like body and sensorium.

Working story idea:

- A man and woman lived as a couple inside a painting.
- An earthquake shakes the painting.
- The woman falls out and rolls away into the 3D world.
- The man jumps out after her.
- He has to navigate a quake-scattered 3D room with 2D perception.

## Design Principles

- Preserve the core tension: do not turn the game into normal 3D vision unless it is explicitly a temporary mechanic or dev aid.
- The player should read the world, not a radar. A previous helper under the HUD was removed because it made the player stare at the meter.
- Sound should not be stereo left/right hearing. The current fiction is closer to dolphin-like self-pings and reflections.
- Direction can affect signal and audio, but most floor interactions should use planar distance unless a specific mechanic needs height.
- Use high-contrast world colors because most objects are seen as afterimages.
- Keep UI minimal. `DEV 3D` is a debugging aid, not the intended play mode.

## Important Files

- `prototype/index.html`
  - Single HTML entry point.
  - HUD, start veil, canvas, import map for Three.js.

- `prototype/script.js`
  - Main game.
  - World construction, controls, scan rendering, audio, anchors, portal, collision.

- `prototype/modules/math/WorldBasis.js`
  - Coordinate abstraction inspired by GameBlocks.
  - Use this rather than ad hoc x/y/z assumptions when possible.

- `prototype/gameblocks_usage.md`
  - Notes on the borrowed abstraction.

- `prototype/third_party/GameBlocks_LICENSE.txt`
  - License note.

There is no build step. The prototype is plain HTML and JavaScript, with Three.js loaded from CDN.

## Current Controls

- `WASD`: move.
- `Left / Right Arrow`: scan yaw left/right.
- Mouse horizontal movement: scan yaw, now aligned with arrow direction.
- `Up / Down Arrow`: tilt scan axis.
- Mouse wheel: tilt scan axis.
- Mouse wheel click: reset tilt.
- `Up + Down Arrow` together: reset tilt.
- `Space`: jump.
- Left click: jump after start.
- `Shift`: focus mode, slower movement and wider scan.
- `3`: toggle developer full 3D view.

The right-arrow behavior is:

- press right
- player scan direction turns right
- afterimage drifts left

Mouse is now aligned with that convention.

## Current Play Loop

The player stabilizes anchors one at a time. Only the current anchor is visible/active. After all five anchors are stabilized, the bright green portal is the goal.

Current anchor sequence in `addWorld()`:

1. Fixed ground anchor, any side.
   - Position: `right: -5.6`, `forward: -12.6`
   - Hint: touch the floor ring from any side.

2. Fixed ground gated anchor.
   - Position: `right: 8.9`, `forward: -4.8`
   - Requires entering from the open/lit side.

3. Moving ground anchor, any side.
   - Position: `right: -10.2`, `forward: 3.1`
   - Regular left-right shuttle motion.

4. Moving gated anchor.
   - Position: `right: 8.4`, `forward: 10.6`
   - Regular oval motion.
   - Requires entering from the lit side.

5. Airborne jump anchor.
   - Position: `right: -14.2`, `forward: 15.1`, `up: 1.9`
   - Requires jumping through it.
   - Moved away from the exit because it was too close.

Goal portal:

- Position: `right: 0`, `forward: 17.4`, `up: 1.7`
- Bright green ring/beam after all anchors are collected.

## Current Visual Model

Main rendering surface:

- `#mental-canvas`

Normal view:

- The real Three.js scene is rendered into a narrow hidden strip.
- That strip is drawn into the center of the mental canvas.
- Old image data is shifted by yaw delta to create panorama-like afterimages.

Temporary 3D reveal:

- When an anchor is collected, the game briefly overlays full 3D.
- Current duration: `REVEAL_DURATION = 0.28`
- During this reveal, input and game time are briefly locked.
- Fiction: the player sacrifices the time dimension for a moment to gain one extra spatial dimension.

Developer view:

- Press `3` to toggle `DEV 3D`.
- Implemented by `drawFull3D(...)`.
- This should remain a debug aid, not the default play experience.

World readability:

- Walls and obstacles were brightened.
- Edge glows were added via `addEdgeGlow(...)`.
- Outer walls are cyan; internal obstacles use amber, blue, green, and violet.

## Current Audio Model

Audio starts after user interaction due browser audio rules.

Important functions:

- `startAudio()`
- `updateAudio()`
- `playSelfPing(...)`
- `playAnchorChime(...)`
- `playWallBump()`

Current principles:

- No stereo panning.
- Signals are centered.
- Pitch/timbre changes with scan motion, relative angle, distance, and echo pulse.
- Anchor collection has a short chime.
- Wall collision has a low, Dragon Quest 1-like bump tone.

Wall collision sound:

- `resolveCollision()` returns whether collision resolution pushed the player.
- `updatePlayer(...)` calls `playWallBump()` when the player tried to move and got pushed back.
- `playWallBump()` has a short cooldown to avoid machine-gun noise.

## Where To Change Things

Anchor layout and sequence:

- `addWorld()`
- Search for `addPickup({`.

Anchor behavior:

- `addPickup(...)`
- `updatePickupTransform(...)`
- `isPlayerInsidePickup(...)`
- `isPlayerOnPickupApproachSide(...)`
- `collectPickup(...)`

Portal:

- `addPortal()`
- `updatePortal(...)`

Controls:

- `handleKeyDown(...)`
- `handlePointerDown(...)`
- `handleMouseMove(...)`
- `handleWheel(...)`
- `jump()`
- `resetTilt()`

Movement and collision:

- `updatePlayer(...)`
- `resolveCollision()`

Perception rendering:

- `drawMentalImage(...)`
- `drawFull3D(...)`
- constants near the top, especially `PANORAMA_PIXELS_PER_RADIAN`, `MOUSE_SCAN_SPEED`, `WHEEL_ROLL_SPEED`, and `REVEAL_DURATION`.

Audio:

- `startAudio()`
- `updateAudio()`
- `playSelfPing(...)`
- `playAnchorChime(...)`
- `playWallBump()`

## Verification

Minimum check after editing:

```powershell
node --check prototype\script.js
```

Also check that the local page responds:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:4173/index.html" -UseBasicParsing -TimeoutSec 5
```

Browser automation in this thread was sometimes flaky. Visual checks by screenshot/manual play were more reliable than trying to inspect the canvas pixels directly.

## Known Preferences From The User

- The prototype should stay playable, not just conceptual.
- The current folder's project is the target; do not replace it with a separate project.
- Avoid helper UI that becomes the main thing the player watches.
- The user likes conceptual rigor: if a visual/audio effect implies a physical model, make sure it fits the fiction or call it a debug/programming artifact.
- The user wants a realistic-feeling 2D-being-in-3D constraint, but they also accepts developer-mode tools while prototyping.
- Make changes directly when asked; keep explanations concise.

## Future Work / Ideas Not Yet Implemented

### High Priority: Movement And Scan Coupling

| Priority | Idea | Implementation Notes |
| --- | --- | --- |
| High | Sync movement speed and panning speed | With WASD, movement speed is currently fixed, so panning can also remain fixed. If left-stick analog movement is added later, panning should probably become variable and tunable too. |
| High | Doppler-shift-based sound direction | A 2D being should not have ordinary left/right directional hearing. Direction should be inferred from pitch changes while panning/scanning. |

Current issue: audio exists, but the player can mostly solve the prototype without relying on it. Future levels should make sound genuinely useful without turning it into a simple radar.

### Future Audio Ideas

1. Volume

- Near objects should sound louder.
- Far objects should sound quieter.
- This is the most natural and immediately legible distance cue.

2. Echo delay

- This is probably the strongest direction for the echolocation fiction.
- The player emits a short ping.
- Near walls return quickly.
- Far walls return after a longer delay.
- This can make distance readable through time.

3. Timbre changes

- Nearby reflections could preserve more high frequency.
- Far or soft reflections could become lower, duller, or more blurred.
- It does not need to be physically exact; it needs to be game-legible.
- Example game language: near = sharp `kin`, far = dull `bon`.

4. Reverb time

- A large room could produce a longer tail.
- A narrow passage could produce a short, dry reflection.
- This can make room size readable without a visual map.

5. Difference while turning/scanning

- When the player pans, the timing or pitch response can change depending on where the wall/object lies.
- If the return changes earlier during a leftward scan than a rightward scan, the player can infer a side without ordinary stereo hearing.

6. Pitch-change rate for target speed

| Priority | Idea | Implementation Notes |
| --- | --- | --- |
| Medium | Pitch-change rate shows object speed | Fast pitch change = fast-moving object. Slow pitch change = heavy/slow enemy or object. |
| Medium | Timbre shows material | Metal, wood, glass, fabric, etc. could have different reflection colors. This becomes auditory object recognition for the 2D being. |
| Medium | Sound shows state | Enemy HP, danger level, emotion, alertness, or instability could be conveyed by distortion, pitch, tremolo, or roughness. |

### Enemy And Combat Ideas

The user wants enemies and combat eventually, but not as a fast reflex-heavy action game. Because perception is limited, combat should be slower, readable, and based on orientation.

| Priority | Idea | Implementation Notes |
| --- | --- | --- |
| High | Enemies are also 2D beings | Enemies are zero-width plane beings too. Their facing direction and body plane become combat information. |
| High | Side attacks deal damage | Because 2D beings have zero width, attacking from the side can work like cutting with a blade or passing through the plane. |
| Medium | Enemy orientation changes | Enemies can turn toward the player, making side-taking dynamic rather than static. |
| Medium | Orientation button | Player can switch body orientation. Whether this is snap rotation or smooth rotation is undecided. |

Possible parry idea:

- If an enemy charges, the player may be able to change orientation at the last moment.
- This could create a parry-like mechanic: instead of blocking with a shield, the player turns their zero-width body plane to survive or cut through.

### Body Orientation And Narrow Gaps

- Narrow gaps can require the player to pass sideways.
- This is not just crouching or squeezing; it is about rotating a zero-width body plane.
- This should eventually be separate from scan tilt:
  - scan orientation = what plane/line the player perceives through
  - body orientation = what plane the player physically occupies
- Interesting later-state possibility: the player can see along one plane but pass through another.

### Progression

- Start with flat spaces.
- Then introduce scan tilt.
- Then introduce height, jump anchors, airborne reading.
- Then introduce enemies and body-plane mechanics.
- Later levels should force use of audio, not just visual afterimages.

### Story

- Couple in a painting.
- Earthquake.
- Woman falls out and rolls away.
- Man enters 3D space to find her.

## Caution

Do not make the default experience ordinary full 3D. That breaks the central concept. Full 3D should be brief, costly, fictionalized, or explicitly developer-only.

Do not reintroduce the removed signal scope unless the user explicitly asks for it. The intended feeling is: read the world through scan, afterimage, motion, and echo.
