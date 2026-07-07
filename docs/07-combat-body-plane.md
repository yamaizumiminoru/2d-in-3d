# 07 — Combat & Body Plane (future spec)

Nothing in this document is implemented yet. It translates the user's confirmed design intentions into buildable mechanics, and marks open questions. Design tone: **slow, readable, orientation-based** — chess with facing, not an action game. Perception is limited, so no mechanic may demand reflexes faster than ~0.4 s windows.

## 1. Body orientation (prerequisite, Phase 2)

Today the player is a collision circle with a scan direction. The fiction says the player is a **zero-thickness plane**. Make that mechanically real by splitting:

- **Scan orientation** — what line/plane the player *perceives through* (`player.yaw` + `player.scanRoll`, exists today).
- **Body orientation** — what plane the player *physically occupies* (`player.bodyYaw`, new).

Proposal (validate with user before building):

- `Q`/`E`: rotate body plane. Start with smooth rotation at ~2.2 rad/s; a snap-to-45° variant behind a `const BODY_SNAP` for comparison. (User explicitly undecided between snap and smooth — build both cheap, let them play it.)
- Default coupling: body follows scan yaw lazily (spring). `Q`/`E` breaks the coupling; a reset (both together, mirroring the tilt-reset idiom) re-couples. This keeps early levels identical to today.
- Visual: the player can't see themself, but body orientation should be *feelable* — proposal: the orientation tick at the strip bottom gains a second, dimmer tick showing body-vs-scan offset; plus movement feel (below).
- Movement consequence (optional, tune later): moving along the body plane is full speed; moving broadside is slightly slower (a plane moving face-first through air). Gives body orientation a constant gentle presence.

### Narrow gaps / slit colliders

New collider type: `slit = { right, forward, yaw, halfLength, tolerance }`. Passable only while `|normalizeAngle(player.bodyYaw − slit.yaw)| ≤ tolerance` (start tolerance ≈ 0.2 rad); otherwise solid wall + a distinct "flat clang" bump sound. This is *rotation of a zero-width body*, not crouching — the message copy should reinforce it. Key later-state: a slit you can only pass while your scan looks elsewhere — seeing along one plane, passing through another.

⚠️ Convention warning: reuse ONE yaw convention for body/slit math and document which; see the dual-yaw gotcha in [02-architecture](02-architecture.md).

## 2. Enemies are 2D beings too

Enemies are zero-width plane beings (`THREE.PlaneGeometry`, `DoubleSide`, emissive, edge-glowed). This creates the game's best perceptual trick for free:

> **Apparent width in the scan strip = facing information.** A plane seen face-on fills a wide arc; edge-on it is a hairline. As an enemy turns, its afterimage swells and collapses. The player literally reads intent from geometry.

Audio completes it ([04-audio](04-audio.md) §B4): pitch-change rate = speed, timbre = material, distortion/tremolo = state (alerted, charging, wounded).

### 2.5 Body proportions (user decisions, 2026-07-07)

- **Player & heroine: portrait planes.** Human-proportioned — seen from the side, vertically elongated (~0.9 wide × 1.65 tall, thickness ≈ 0; eye at 1.2 matches `EYE_HEIGHT`). The player is currently camera-only; the body plane becomes real with Phase 2 (slits), combat, and the finale. Terrain collision stays the r 0.48 circle.
- **Enemies: landscape planes.** Quadruped fiction — seen from the side, horizontally elongated (Turner: ~2.0 long × 1.0 tall). The user's gameplay rationale: a tall thin target is nearly unhittable with side attacks; a wide low silhouette gives the cut a real cross-section, and a four-legged animal makes those proportions read as natural.
- **Perceptual dividend:** the scan vocabulary splits by aspect ratio — *portrait marks* (people, columns, tethers) vs *landscape marks* (beasts). Species identification through the line, before any detail is resolved.
- **Flutter vs rigid (user: 要検討) — recommendation:** rigid silhouette with a **state ripple** layered on top. The outline must stay crisp because apparent width = facing is the core combat read; but a cloth-like ripple whose amplitude encodes state (idle breath → alert flutter → charge pulled taut) adds life and pairs 1:1 with the B4 tremolo. Cheap: vertex ripple or 3–5 hinged slats, no cloth sim. Decide finally at first Turner build, by eye.

### 2.6 Mirror walls (user idea, 2026-07-07)

- Once the player has a body plane, mirrors show the player **what they are**: face one broadside and the scan sweeps a tall portrait figure; rotate the body and the reflection collapses to a hairline. *"I really am flat"* — shown, never told.
- **Solves a Phase 2 UX problem diegetically:** body-yaw feedback (§1's proposal was a second HUD tick) — the reflection's width *is* the body-orientation readout, in-world, no HUD. Debut in ST9 (slit stage) as teaching tool + existential beat; consider scripting the first mirror as the first time the player ever *sees* the protagonist.
- Implementation: at `SENSOR_RENDER_WIDTH` 96 px an extra mirror pass is nearly free. Options: vendor `Reflector` from three/examples/jsm, or a hand-rolled mirrored-camera pass. The self-mesh must be visible **only** to the mirror pass (Three.js layers) — never to the first-person camera. Give mirror surfaces a distinct *glass* timbre (B4) so they are findable by ear before they are understood by eye.
- Story echo (optional, decide with user): in ST12, her portrait crosses a distant mirror once — seen only as a reflection, gone when you turn.

## 3. Combat rules

Let `n̂` = defender's plane normal, `d̂` = incoming attack direction (planar). Define **exposure** `= |d̂ · n̂|`: 1 face-on, 0 edge-on.

- **You hit their face, you dodge with your edge.** An attack connects when the *defender's* exposure to it ≥ `HIT_EXPOSURE` (~0.5). A zero-width being attacked edge-on has nothing to hit — the attack passes through.
- Symmetrically for the player: your face is your vulnerability. The same orientation that makes you safe (edge to the threat) is the one that lets *your* strike cut them if they're facing you. Positioning = rotating two planes around each other.
- **Side attack = blade.** Attacking along the target's plane (their exposure high, your motion edge-first) reads as cutting; give it the kill.
- **Parry**: when an enemy charges, rotating your body ≥ ~60° within the last `PARRY_WINDOW` (~0.4–0.5 s, err generous) before impact turns the hit into a pass-through — and, if your plane ends up aligned with their motion, a *cut-through counter*. Not a shield: a matador's turn.
- Damage model: start binary (cut or not). HP/staggers only if playtesting demands.

## 4. First enemy: the Turner (Phase 3 scope)

- Stands still or patrols a short line. When it hears the player's self-ping within range (fictionally sound-reactive — reinforces that *your own perception is detectable*, a beautiful cost), it slowly rotates to face the player (face-on = its attack posture and its vulnerability to your thrust… no: face-on toward you means *your* exposure is what matters — its facing telegraphs the charge).
- Loop: idle → alert (tremolo appears in its tone) → track (turns toward player, apparent width in your scan grows) → charge along its plane (fast pitch-change rate warns you) → recover (edge-on, harmless, cuttable).
- Counterplay: read width + tremolo, sidestep or parry-turn during charge, cut during recover.
- One Turner in a small arena teaches everything §3 defines. Two Turners is the graduation exam. Never more than ~2 active — readability cap.

## 5. The reunion: edge to edge (user decision, 2026-07-07)

Side contact is the *attack* verb — passing through a plane cuts it. So the finale's touch must be different **in kind**, not just in tone:

> **The reunion is coplanar, edge to edge.** The two planes align into the same plane and their vertical edges meet — zero width touching zero width, a measure-zero contact. The kiss metaphor (user's).

The geometry hands the whole game its relationship model for free. Two planes in space have exactly three configurations:

| Configuration | Geometry | Meaning in Sliceborne |
| --- | --- | --- |
| **Transversal** | they intersect in a line | the cut — combat, violence |
| **Parallel** | they never meet | loneliness — passing without touching (ST12 can stage this: walking parallel to her traces) |
| **Coplanar** | they share one plane | union — the reunion |

ST13 mechanical sketch: her plane is ahead, read by afterimage and leitmotif. The player must rotate body yaw to **align, not face** — facing her broadside is attack posture. Then approach *along* the shared plane; the touch event = `|Δplane yaw| < ε` AND low closing speed AND edge gap < ε. Guard against tragedy: she cannot be damaged; a transversal approach makes her step-roll gently back (a refusal that teaches — she taught him tilt through the imprint in ST11; she teaches him this too). After the touch, the two coplanar beings can pass the flat door home *together* — a doorway only a single plane can enter.

## 6. Open questions (ask the user before committing)

| Question | Cheap default until answered |
| --- | --- |
| Body rotation: snap 45° vs smooth? | Build both behind a `const` |
| Does the player attack actively (button) or is contact-while-oriented the attack? | Contact-based first — fewer inputs, more chess-like |
| Can enemies hear the self-ping (stealth pressure on perception itself)? | Yes in Turner spec above — but confirm; it deepens the fiction *and* the difficulty |
| Player death: restart level vs anchor checkpoint? | Restart level while levels are small |
| Does scan tilt (roll) interact with combat (reading a toppled enemy)? | Yes — full idea bank now in [11-tilt-mechanics](11-tilt-mechanics.md) (stance reading, cut-grain, topple/finisher); build order there |
