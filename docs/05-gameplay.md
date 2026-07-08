# 05 — Gameplay Spec

Controls, physics, anchors, portal, HUD — with the exact numbers from `prototype/script.js`.

## Controls

| Input | Action | Notes |
| --- | --- | --- |
| `W A S D` | Move (forward/strafe, yaw-relative, planar) | `MOVE_SPEED` 4.2 u/s; diagonal normalized |
| `← →` | Scan yaw | `TURN_SPEED` 1.75 rad/s; left arrow = +yaw = scan turns left, afterimage drifts right |
| Mouse X | Scan yaw | `MOUSE_SCAN_SPEED` 0.0042; aligned with arrows (mouse right = scan right); works with or without pointer lock |
| `↑ ↓` | Scan tilt (roll) | `ROLL_SPEED` 1.15 rad/s, clamped ±`MAX_SCAN_ROLL` (π/3) |
| Mouse wheel | Scan tilt | `WHEEL_ROLL_SPEED` 0.0024 |
| `↑`+`↓` together | Reset tilt | also starts the game if not started |
| Middle click | Reset tilt | handled in `pointerdown`/`mousedown`/`auxclick` for cross-browser |
| `Space` | Start, then jump | `JUMP_SPEED` 6.2, `GRAVITY` 17.5 ⇒ apex ≈ **1.10 u** at ~0.35 s, airtime ~0.71 s |
| Left click | Start, then jump | also requests pointer lock |
| `Enter` | Start | |
| `Shift` | Focus mode | turn ×0.38, move ×0.46, live strip ~2.7× wider |
| `3` | Toggle DEV 3D | debug only; works even during reveal |
| `0` / `1` / `2` | Ping mode (decision ②: **hybrid adopted**, default = 2) | 0 = periodic, 1 = on-demand kept as dev comparison; retire before release |
| `F` / right-click | Focused ping | modes 1–2 only; full 3-ray fan, full range, `FOCUSED_PING_COOLDOWN` 0.35 s |

During a reveal (`inputLocked()`): all inputs ignored/cleared except the `3` toggle; held movement keys resume after.

## Player physics

- Planar circle, `PLAYER_RADIUS` 0.48, eye at `EYE_HEIGHT` 1.2 + jump height.
- World bounds ±18.5 (`BOUNDS`); collision vs `solids` AABBs is height-agnostic — you can never jump over walls (lowest wall 2.4 > apex 1.10). Keep that inequality true when adding geometry, or document the exception.
- Wall hit + movement input ⇒ `playWallBump()` (0.22 s cooldown).

## Anchor system

Anchors (`pickups`) are collected **strictly in array order**; only the active one is visible and audible (`isPickupActive`). Collecting: `game.pulse = 1`, reveal 0.28 s (input locked), chime, next anchor activated with hint message.

### Collection predicate

`isPlayerInsidePickup`: planar distance ≤ `PICKUP_TOUCH_RADIUS` **1.18**. If `airborne`: additionally `|pickupY − (player.height + AIR_TOUCH_HEIGHT 1.05)| ≤ AIR_TOUCH_TOLERANCE 0.78` — i.e. the anchor must be jumped *through*, not walked under. (Anchor 5 hovers at 1.9±0.14 bob; reachable window is mid-jump.)

`isPlayerOnPickupApproachSide`: if `approachYaw` set, the player's bearing *from the anchor* (`yawFromBasisDelta` — mirrored convention, see [02-architecture](02-architecture.md) gotcha) must be within ±`approachArc` of `approachYaw`. Wrong side ⇒ hint "This anchor has a face. Slip in from the lit side." (rate-limited 1.8 s).

### The reference room's five anchors (`levels/level07.js` — the Scattered Hall, play via `?level=7`; the default `?level=1` is ST1 "The Waking Room" with 3 still anchors)

| # | Type | Position (right, forward, up) | Motion | Gate | baseFreq | Color |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | still / any side | −5.6, −12.6 | — | — | 330 | cyan |
| 2 | still / gated | 8.9, −4.8 | — | `approachYaw` π, arc π/4.4 | 410 | amber |
| 3 | shuttle / any side | −10.2, 3.1 | sin, `motionRight` 2.6, speed 1.05 | — | 500 | magenta |
| 4 | moving ellipse / gated | 8.4, 10.6 | `motionRight` 1.8 × `motionForward` 0.9, speed 0.86 | `approachYaw` −π/2, arc π/5 | 570 | green |
| 5 | airborne / jump-through | −14.2, 15.1, **2.05** | bob only | — | 650 | red |

(Anchor 5 was at `up: 1.9` until 2026-07-07; at the bob minimum (1.76) a standing player's touch height (1.05) was within tolerance — it was collectible **without jumping**. `up: 2.05` puts the standing gap at 0.86 > 0.78 while the mid-jump window still works — verified by automated playthrough. Keep airborne anchors' `up` ≥ ~2.0 with the current constants.)

Motion model (`updatePickupTransform`): `right = base + sin(t·speed+phase)·motionRight`, `forward = base + cos(t·speed+phase)·motionForward`, plus a small vertical bob (±0.14 airborne / ±0.05 grounded). `phase = index · 0.71`.

Anchor visuals: torus ring + icosahedron core (group at `up`), translucent floor ring, thin tether cylinder; gated anchors add a frame of posts with a green "entry line" on the open side, `gate.rotation.y = approachYaw`.

### Checklist: adding an anchor

1. Add `addPickup({...})` in `addWorld()` **at the right sequence position** (array order = order).
2. Pick an unused `baseFreq` (spread ≥ ~60 Hz from neighbors) and a `COLORS` entry; add the color to `playAnchorChime`'s base map if new.
3. Write the `hint` text (imperative, one line, matches existing voice) and a short `kind` label.
4. If gated: set `approachYaw` (mirrored convention!) and verify in DEV 3D that the green entry line sits on the intended side; walk in from both sides to test.
5. If airborne: `up` ≈ 1.6–2.1 so the jump-through window (see predicate) is reachable; test with repeated jumps.
6. Update the anchors table above and [08-level-design](08-level-design.md) if the layout philosophy changed.
7. HUD shows `ANCHORS n/5` from `pickups.length` automatically — no HUD edits needed.

## Portal (goal)

- Position (0, 17.4, up 1.7); ring + core + floor ring + beam, all dim until `game.collected === pickups.length`, then bright green and animated.
- Win: open portal + planar distance < 2.2 ⇒ `game.won`, chime ×1.35, reveal, message "The flat traveler crosses the third axis.", mode readout `VOLUME HELD`. **There is no post-win state machine — the game keeps running.** A proper end screen is a roadmap item.
- Approaching while closed ⇒ hint "`n` anchor(s) still hold the door flat." (rate-limited 2.4 s).

## HUD (`updateHud`)

All measurement cells are **1D marks** (memo ⑤, adopted & implemented 2026-07-07):

| Field | Source | Form |
| --- | --- | --- |
| SIGNAL | strongest `signalForBeacon` across beacons | cyan fill-bar (width = %) |
| ANCHORS | per-pickup state | segments (`.anchor-segment`); fill in the anchor's color on collect, bright border = active |
| ~~DRIFT~~ | — | **removed 2026-07-08** (user: 必要ない). The drift *math* survives inside `drawMentalImage` (it drives afterimage decay); only the HUD cell is gone — the readout is now 3 cells |
| DIR | heading ribbon (`RIBBON_PX_PER_RADIAN` 26): cardinal letters slide opposite to scan turn, same convention as the afterimage; N = amber. **Uncalibrated until the frame shard is found** (memo ④d) — letters hidden, a faint mark wanders | 1D azimuth tape |
| mode readout | `ANCHOR n` → `GOAL` → `VOLUME HELD`; or `DEV 3D` | words (language stays words) |

**Frame shard (memo ④d, implemented):** `addFrameShard()` places a wooden L-piece at (14.8, −15.2), humming as a beacon (`baseFreq` 236, `timbre: 'wood'` → triangle osc + lowpass, `gainScale` 0.55, silent once found). `updateFrameShard` collects it at planar distance < 1.1 → `game.compassFound = true`, chime, "A shard of the frame — the world regains its north." Optional — never gates anchors or the portal.

HUD is informational only; per the vision doc it must never become the thing the player watches. Adding new HUD cells requires user sign-off.

### Decision memo ④: earned compass (user question, 2026-07-07 — "Zelda-style per-stage compass?")

**Assessment:** yes — the compass is currently the HUD's largest piece of *unearned* direction information (absolute N/E/S/W, always, for free), which quietly fights pillar 1 ("read the world"). Earning it per stage converts a leak into a reward, and matches the game's grammar of earned senses (reveal → stereo → horizon). Three flavors considered:

| Flavor | How | Pros / Cons |
| --- | --- | --- |
| (a) Zelda-literal token | hidden compass pickup per stage, off the main path | exploration reward; but adds a collectible system, and finding it needs the orientation it grants |
| (b) First-anchor auto | compass calibrates when the stage's first anchor is stabilized | zero content cost, fits "anchors stabilize him"; but passive, not really *earned* |
| (c) Landmark attunement | DIR cell starts uncalibrated (dial adrift, letters hidden); hold the scan on the stage's designated tallest landmark ~2 s → calibration chime, compass live for the stage | trains landmark-first navigation ([08-level-design](08-level-design.md) rule 4); fiction-clean; no new collectible |
| **(d) Audio-found compass — user proposal 2026-07-07, now recommended** | the compass is a findable object that *hums*; you locate it by ear (relative direction skills: scan doppler, ③ tilt stereo), touch it, and the DIR cell calibrates for the stage | merges (a)+(c) and *dissolves* (a)'s chicken-egg objection — finding it requires exactly the relative-direction literacy the game teaches, which is the point; gives every stage a two-phase inner arc |

**Why (d) wins — the two-phase structure (user's framing):** before the compass, exploration runs on *relative* direction (egocentric: "the hum is left of the tall column"); after it, on *absolute* bearings (allocentric: "the portal is north"). Finding the compass **changes gameplay** mid-stage — which is what the mental canvas already does visually (afterimage = egocentric memory), now completed on the navigation axis.

**Fiction proposal — the frame shard (額縁の欠片):** in a painting, absolute direction *exists* — the frame defines it. A painting-being's north is "the way home hung." The quake shattered the frame across the world; each stage holds one **shard of the frame**, humming with a *wooden* timbre ([04-audio](04-audio.md) §B4's material language, first use). Touching it restores his frame-sense for that room. The compass is not a tool; it is a piece of home. (Optional meta-arc: collected shards visibly rebuild the frame on the title/end screen.)

Per-stage rules if (d) is adopted: the shard is **optional, never a gate** (anchors remain the spine; mono-hardware players must not be walled) — it rewards with faster planning, not access; ST1–2 grant the compass from the start (onboarding); ST8 (unlit) makes the shard hunt the stage's purest beat — a by-ear find in the dark; the shard's hum is quiet, low-register, distinct from anchor beacons, and **stops once found** (net audio load drops after pickup); the uncalibrated DIR cell visibly *drifts*, so its absence is felt.

Also flagged while we're here (separate, later question — do not bundle): **SIGNAL %** is the next-most radar-ish cell; once Echolocation v2 matures, consider folding it into audio entirely or retiring it in later stages.

Decision recorded: ☑ **(d) audio-found frame shard** — 2026-07-07, user confirmed ("全部採用"). Implemented same day in the prototype (current room; see HUD section above). Campaign rule live in [10-campaign](10-campaign.md).

### Decision memo ⑤: the HUD speaks in 1D (user proposal, 2026-07-07)

**Proposal:** replace numerals with one-dimensional marks — a 1D being's notation is tallies and lengths, not positional digits. `ANCHORS 2/5` → `■■□□□`. **Assessment: adopt-worthy across the board; it gives the HUD an ownable identity and deepens the fiction.** Principle: **measurements in 1D marks, language in words, numerals nowhere** (dev view exempt).

| Cell | Today | 1D form |
| --- | --- | --- |
| ANCHORS | `2/5` | `■■□□□` — segments fill on collect, each *in its anchor's color* (the HUD gradually gains the stage's palette) |
| SIGNAL | `43%` | a thin horizontal fill-bar. Side benefit: a soft bar is harder to min-max than a percentage — reduces the cell's radar-ness ahead of its possible retirement |
| DRIFT | `12` | *(cell removed entirely 2026-07-08 — user judged it unnecessary)* |
| DIR | 2D rotating dial | **1D heading ribbon** (aircraft-style azimuth tape): N/E/S/W glyphs sliding along a horizontal strip. Strictly better than the dial: the mental canvas is already a 1D ribbon of angles, so the compass becomes a miniature of the panorama itself — same axis, same direction convention (scrolls opposite to scan turn, like the afterimage). With ④(d), the ribbon can be drawn as a thin strip of *frame wood* |
| mode readout / messages | text | keep — language stays words |

Implementation: pure DOM/CSS (spans for segments, div widths for bars; ribbon = CSS `background-position` or a 24-px canvas). Precision loss is acceptable — this game runs on readings, not readouts.

Decision recorded: ☑ **adopt all** — 2026-07-07, user confirmed ("全部採用"). Implemented same day: segments/bars/ribbon live in `index.html` + `updateHud`; numerals removed from all measurement cells.

## Messages

`showMessage(text, duration)`; on expiry `updateMessage` falls back to the active anchor's hint (or GOAL instruction). All strings live inline in `script.js` — keep the terse, slightly liturgical voice ("The echo line finds depth.").
