# 02 — Architecture

Ground truth as of 2026-07-06. `prototype/script.js` is ~1200 lines, single file, no classes, no build step.

## Runtime & dependencies

- Plain ES modules served statically. Web root = `prototype/`.
- Three.js **0.160.0**, vendored at `prototype/third_party/three/three.module.js` (unmodified, MIT — see `LICENSE_NOTE.txt` there) via the import map in `index.html`. Runs fully offline.
- No package.json, no bundler, no framework, no test runner. Verification is `node --check` + manual play ([09-agent-playbook](09-agent-playbook.md)).

## File map

| File | Role |
| --- | --- |
| `prototype/index.html` | HUD markup + all CSS, start veil, reticle overlay, `#mental-canvas`, import map |
| `prototype/script.js` | Engine: world building, input, physics, perception rendering, audio, game state |
| `prototype/levels/levelNN.js` | **Level data modules** (plain objects: playerStart, bounds, walls, columns, markers, pickups, frameShard, portal; optional `palette` — floor / floorEmissive / floorGlow / grid1 / grid2 —, `compassGranted` (ST1–2), `memoryLocked` (stage plays with no afterimage; the win unlocks memory), `silentPings` (no self-pings/echoes — hum-only monophony, ST1) and `revealDuration` (per-stage flash length)). **File numbers = campaign stage numbers**: level01 = ST1 "The Waking Room" (default; also the annotated authoring template), level07 = the Scattered Hall reference room. `?level=N`, bad ids fall back to 01 with a console warning; level imports are timestamp-busted against stale module caches. Colors are raw hex so level files stay self-contained |
| `tools/serve.py` | Dev server (no-store cache headers) — use this, not a bare static server; see [09-agent-playbook](09-agent-playbook.md) |
| `prototype/modules/math/WorldBasis.js` | Coordinate-basis abstraction (from GameBlocks, MIT) |
| `prototype/gameblocks_usage.md` | Notes on the borrowed abstraction |
| `prototype/third_party/GameBlocks_LICENSE.txt` | License |

## The two-canvas rendering trick

This is the heart of the game. Three surfaces are involved:

1. **`renderer.domElement`** (`#hidden-renderer`) — a WebGL canvas only **96 px wide** (`SENSOR_RENDER_WIDTH`) and window-height tall, positioned off-screen at `left: -200px`. The real Three.js scene renders here every frame, through a `PerspectiveCamera` with 48° vertical FOV and aspect `96/height` — i.e. a horizontal FOV of only ~4.5°.
2. **`#mental-canvas`** — the full-screen 2D canvas the player actually sees. Named deliberately: it is the player's *mental image*, not a viewport.
3. **`copyCanvas`** — an offscreen 2D canvas used to shift the previous mental image by the yaw delta each frame (a canvas can't `drawImage` from itself with a shift reliably).

Per frame, `drawMentalImage(dt)`:
1. Shifts the old mental image horizontally by `yawDelta * PANORAMA_PIXELS_PER_RADIAN` (via `copyCanvas`).
2. Fades everything toward black (base 0.03 alpha + up to 0.03 extra proportional to scan drift speed).
3. Renders the 3D scene into the hidden 96 px strip, then blits the **center 3 px** of it into an **8 px** column at screen center, rotated by `player.scanRoll`. (Fixed width; the focus/Wide-scan widen mode was removed 2026-07-08.)
4. Draws the cyan pulse tint and the small white orientation tick.

Full details, invariants and tuning: [03-perception](03-perception.md).

## Coordinate system: WorldBasis

All gameplay math goes through `DEFAULT_WORLD_BASIS` (imported as `WORLD`): right = `+x`, up = `+y`, forward = `-z`. Positions are stored as Three.js `Vector3` in world space but *manipulated* via basis components:

- `WORLD.fromBasisComponents(right, up, forward, target?)` → `Vector3`
- `WORLD.toBasisComponents(v)` → `{right, up, forward}`
- `WORLD.yawPitchRollFrame(yaw, pitch, roll)` → `{right, up, forward, back}` unit vectors
- `WORLD.distanceSqPlanar(a, b)` — squared distance ignoring height (used for almost all gameplay checks)
- `WORLD.forwardToYaw(v)` = `atan2(-right, forward)`

### ⚠️ Gotcha: two yaw conventions coexist

- **Player/scan yaw** follows `yawPitchRollFrame`: forward = `(-sin yaw, 0, cos yaw)` in basis components, and `WORLD.forwardToYaw` = `atan2(-right, forward)`. Positive yaw turns the scan **left**. (`ArrowLeft` adds positive yaw; `ArrowRight` subtracts; mouse-right subtracts — see `handleMouseMove`, which negates `movementX`.)
- **Anchor approach yaw** uses the local helper `yawFromBasisDelta(right, forward)` = `atan2(+right, forward)` — the *mirror* of the player convention. `pickup.approachYaw` is expressed in this mirrored convention **and** is applied directly as `gate.rotation.y` (Three.js Y-rotation) for the gate visual.

These are internally consistent as tuned (anchor 2: `approachYaw: Math.PI`, anchor 4: `-Math.PI/2` = enter from the negative-right side). **Do not "unify" the conventions casually** — if you touch this, re-verify both gate visuals and their entry arcs in DEV 3D. When adding gated anchors, tune `approachYaw` empirically and check the green entry line renders on the open side.

## Core state

```js
player = { position: Vector3, yaw, lastYaw, scanRoll, scanRollTarget, angularVelocity,
           rollVelocity, height, verticalVelocity, grounded }
game   = { started, won, collected, compassFound, time, pulse, mouseScanDelta, wheelRollDelta,
           revealTimer, devView, activePickupIndex, lastAnchorHint, lastPortalHint,
           lastWallBumpAt, messageTimer, lastTime }
```

- `player.height` is jump height above the floor; the camera sits at `EYE_HEIGHT (1.2) + height`. Horizontal position and height are tracked separately; `player.position` itself stays on the floor plane (`resolveCollision` writes `up = 0`).
- `game.pulse` (0..1) drives the cyan strip tint and decays exponentially; set to 1 on collect/jump, bumped by movement and hints.
- `game.revealTimer > 0` ⇒ `inputLocked()` ⇒ player update, pickups, portal, and world animation are all frozen; only audio/HUD/message/render continue.

Collections (module-level arrays):

- `solids` — planar AABBs `{minRight, maxRight, minForward, maxForward}` for collision. Filled by `addSolidBox` and `addColumn` (columns use their bounding square).
- `pickups` — anchors, **array order = required collection order**; `game.activePickupIndex` points at the only visible/active one.
- `beacons` — audio emitters `{object, color, baseFreq, isActive(), gainScale, audio?}`; one per anchor plus the portal.
- `animated` — decorative spinning/bobbing marker boxes (no collision). **Dormant since 2026-07-08**: no level supplies `markers` (floating wireframe cubes were removed as clutter); `addMarkerBox`/`updateWorldAnimation` remain for possible later "tethered debris" use.

## Frame loop (`loop(time)`)

```
dt = min(0.05, elapsed)                    // clamped
updatePlayer(dt)                           // input → yaw/roll/jump/move → resolveCollision → syncCameraToPlayer
if (!inputLocked()):
    game.time += dt                        // game clock — pauses during reveals so moving anchors resume smoothly
    updateWorldAnimation(dt, game.time)    // decorative markers (dt-scaled)
    updatePickups(game.time, dt)           // motion, spin, touch/gate checks → collectPickup
    updatePortal(game.time, dt)            // glow state, proximity hints, win check
updateAudio()                        // beacon tone modulation + self-ping scheduling
updateMessage(dt)                    // message timer → fall back to active hint
updateHud()                          // SIGNAL bar / ANCHOR segments / DIR ribbon / mode
drawMentalImage(dt)                  // perception rendering (or DEV 3D / reveal overlay)
```

Startup: `init()` (async) → `loadLevel()` (dynamic `import('./levels/levelNN.js')` from `?level=N`, fallback to 01) → `addWorld(level)` (lights, floor, then data-driven: bounds override, walls, columns, markers, pickups, frame shard, portal, player start, `activateCurrentPickup()`) → `buildAnchorSegments()`, `resize()`, event listeners, `requestAnimationFrame(loop)`. `BOUNDS` is a `let` overridden per level; the floor/grid size (42) is still fixed — parametrize when a level needs a different footprint.

`begin()` runs on first Space/Enter/click: hides the start veil, creates the `AudioContext` (browser gesture requirement), shows the opening message.

## Input model

All handlers are on `window`. `keys` is a `Set` of `event.code`. Buffered mouse deltas (`game.mouseScanDelta`, `game.wheelRollDelta`) are consumed once per frame in `updatePlayer` and zeroed. During `inputLocked()` new keydowns are ignored (but keys already held stay held) and buffered deltas are cleared. Pointer lock is requested on click; **mouse scan works even without pointer lock** (raw `movementX`), which is a known quirk, not a feature to preserve.

**Gamepad** (added 2026-07-08): polled — not event-driven — once per frame by `readGamepad()` at the top of `updatePlayer`, which advances the edge-detection state in the module-level `pad` object. Left stick + right-stick-X fold additively into the same move/yaw axes as keyboard. **Tilt is detented + spring** (decision ⑦, [05-gameplay](05-gameplay.md)): `player.scanRollTarget` holds a notch (`0/±30/±45/±60`) and `player.scanRoll` eases toward it (`TILT_SPRING`). Gamepad shoulders set the target while held and spring it to 0 on release (`pad.tiltWasHeld` edge); keyboard `↑/↓` and the wheel call `stepTilt(±1)` (persistent). Ping is R3/left-face, jump A; the pad has no reset button (shoulder release already springs to vertical). D-pad (buttons 12–15) folds into movement alongside the left stick. (The focus/"Wide scan" mode was removed 2026-07-08 — see [03-perception](03-perception.md).) Constants: `PAD_DEADZONE`, `PAD_SCAN_SPEED`, `TILT_STEPS`, `TILT_NOTCH_DEG`, `TILT_SPRING`. ⚠️ `readGamepad`'s no-pad `idle` object must carry every key the result does (a missing key once fed `NaN` into `scanRoll` and broke the whole scan).

Controls table and exact semantics: [05-gameplay](05-gameplay.md).

## Collision (`resolveCollision`)

Circle (radius `PLAYER_RADIUS` 0.48) vs planar AABBs, in basis components, fully height-agnostic — jumping never clears a wall (jump apex ≈ 1.10 < wall heights ≥ 2.4, so fiction holds). Player position is clamped to `BOUNDS` (±18.5) before and after; the visual outer walls at ±20.5 are never actually reached because the bounds clamp fires first. Returns `true` if the player was pushed, which (combined with movement input) triggers `playWallBump()`.

Degenerate case: if the player center is *inside* an AABB (distanceSq < 0.0001), it exits through the nearest face plus radius.

## Audio graph

Created lazily in `startAudio()`. Master: `GainNode` at **0.9** → `DynamicsCompressorNode` (limiter: threshold −12 dB, ratio 12) → destination. Per beacon: `sine OscillatorNode → bandpass BiquadFilter (Q 6) → GainNode (starts 0) → StereoPannerNode → master`, running continuously and modulated every frame in `updateAudio()` (pan follows the ③ tilt law: `−EAR_SEPARATION·|sin(scanRoll)|·sin(rel)`, so it is exactly 0 while the scan is vertical; echo side rays pan the same way; ping/bump/chime stay centered). One-shots: `playSelfPing` (triangle 1700→720 Hz chirp, scheduled every `ECHO_PERIOD` 0.94 s), **echo returns** (`emitEchoes` → `castEchoRay`/`rayAabbDistance` → `playEchoReturn`: 3-ray fan raycast against `solids`, delayed blips at `2·distance/SOUND_SPEED`), `playWallBump` (square 115→72 Hz through lowpass, 0.22 s cooldown via `game.lastWallBumpAt` on the *audio* clock), `playAnchorChime` (3 partials, base frequency by color). Exact formulas: [04-audio](04-audio.md).

## Known quirks & footguns (verified in code)

1. **`resize()` clears the mental canvas** — afterimages are lost on window resize. Acceptable; arguably fiction-consistent.
2. **Mouse scan without pointer lock** (see Input model).
3. **`camera.aspect` is constructed from `window.innerHeight`** before `resize()` runs; harmless because `resize()` runs in `init()`.
4. **Two yaw conventions** (see above) — the biggest refactoring trap in the codebase.
5. **No mobile/touch input**; HUD is responsive but the game needs a keyboard (mouse optional).
6. **Echo raycasts are planar** — they use the 2D `solids` AABBs, so scan *tilt* does not change echoes. Consistent with the "planar distance unless a mechanic needs height" rule; revisit only with a concrete height-audio mechanic.

Items 1, 4 are *don't-fix-casually*. (Fixed on 2026-07-07, previously listed here: frame-rate-dependent animation, absolute-time pickup snap after reveals, CDN dependency, hot 1.18 master gain.)

## Dev hook

`init()` exposes `window.coplanar = { player, game, pickups, beacons, solids }` — read-only state access for debugging and browser automation (module scope is otherwise unreachable from the console). Not part of the game; keep it out of gameplay logic.

## Where to change things (function index)

| Concern | Functions / places |
| --- | --- |
| Anchor layout & sequence | `addWorld()` — search `addPickup({` |
| Anchor behavior | `addPickup`, `updatePickupTransform`, `isPlayerInsidePickup`, `isPlayerOnPickupApproachSide`, `collectPickup`, `activateCurrentPickup`, `setPickupVisible`, `isPickupActive` |
| Portal | `addPortal`, `updatePortal` |
| World geometry | `addSolidBox`, `addColumn`, `addMarkerBox`, `addFloor`, `addLights`, `addEdgeGlow`, `material` |
| Controls | `handleKeyDown/Up`, `handlePointerDown`, `handleMouseMove`, `handleWheel`, `handleMouseDown`, `handleAuxClick`, `resetTiltFromMiddleButton`, `jump`, `resetTilt`, `begin`, `requestPointerLock` |
| Movement & collision | `updatePlayer`, `resolveCollision`, `syncCameraToPlayer`, `movementFrame`, `directionFrame` |
| Perception rendering | `drawMentalImage`, `drawFull3D`, `resize`; constants `SENSOR_RENDER_WIDTH`, `PANORAMA_PIXELS_PER_RADIAN`, `REVEAL_DURATION`, `MOUSE_SCAN_SPEED`, `WHEEL_ROLL_SPEED` |
| Audio | `startAudio`, `updateAudio`, `playSelfPing`, `playWallBump`, `playAnchorChime`, `signalForBeacon`; constants `ECHO_PERIOD`, `SCAN_DOPPLER_AMOUNT` |
| HUD / messages | `updateHud` (1D marks: bars/segments/heading ribbon — memo ⑤), `buildAnchorSegments`, `showMessage`, `updateMessage`; DOM ids in `index.html` |
| Frame shard (earned compass, memo ④d) | `addFrameShard`, `updateFrameShard`, `game.compassFound`, ribbon constants `RIBBON_PX_PER_RADIAN` / `RIBBON_HALF_WIDTH` |

## Scaling guidance

The single file is fine up to roughly Phase 1. When body-plane or combat work starts (Phases 2–3), split along the natural seams — `world.js` (construction + solids), `perception.js` (mental canvas), `audio.js`, `player.js` — as plain ES modules with explicit imports, keeping the no-build constraint. Keep `WorldBasis` as the only spatial-convention authority.
