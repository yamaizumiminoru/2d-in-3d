# 08 — Level Design

How to build spaces that are *readable* through scan, afterimage, and echo. The current room (in `addWorld()`) is the reference implementation of these rules.

## The player's actual capabilities (design against these, not against normal 3D sight)

- Live vision: a ~0.14° vertical sliver. Effective vision: the afterimage panorama — up to ~282° of *remembered* world on a 1920 px window, fading in seconds ([03-perception](03-perception.md)).
- Scanning speed: 1.75 rad/s ⇒ a full sweep of a room takes ~3.6 s, during which the oldest memories have already faded twice over. **The player never sees a whole room; they hold a decaying sketch of it.**
- Movement 4.2 u/s inside ±18.5 bounds; jump apex 1.10 u; walls ≥ 2.4 u are un-jumpable (keep it that way).
- Sound: today, beacon hums + self-ping + bump. After Phase 1: echo distances, direction-by-scanning, room-size reverb.

## Readability rules

1. **High-contrast emissive colors only** — objects are mostly seen as afterimages; dark or desaturated geometry effectively doesn't exist. Use the `COLORS` palette; every solid gets `addEdgeGlow` (edges survive fading longest). The floor and sky render slightly above pure black (`COLORS.air`) so *scanned-empty* differs from *unscanned* ([03-perception](03-perception.md) invariant 7) — dark-room pockets (`glow` ≈ 0.02) still work because their *walls* are dark, while the floor trace shows where you've swept.
2. **Color = vocabulary.** Current grammar, keep it consistent: cyan = outer walls/landmarks, amber/blue/green/violet = internal obstacle families, magenta/red = special, bright green = *goal, exclusively*. Never use the portal green for anything else.
3. **Motion must be periodic.** Moving objects are readable only if their motion is regular (sinusoidal shuttle, oval). The player reads phase from repeated scans; chaotic motion is invisible noise. (Anchor 3 and 4 are the reference.)
4. **Landmarks over maps.** Tall unique silhouettes (columns, marker boxes) at asymmetric positions let players re-anchor their mental sketch after a fade-out. Every room needs ≥ 3 distinguishable landmarks at different bearings.
5. **Asymmetry everywhere.** A symmetric room is a lost player — after one fade, mirrored halves are indistinguishable. The reference room breaks symmetry with color families and landmark placement.
6. **One new demand per room.** Each level teaches exactly one new reading skill; everything else stays familiar.

## Progression grammar (the campaign spine, per the user)

> Realized as a concrete 12-stage plan in [10-campaign](10-campaign.md) — build stages from that spec; this section is the underlying grammar.

1. **Flat** — pure planar reading: walls, corridors, still anchors. No tilt needed.
2. **Tilt** — geometry that only resolves when the scan rolls (overhangs, sloped slots, things hidden above/below the vertical line's default sweep).
3. **Height** — jump anchors, airborne reading, timing the jump-through window.
4. **Audio-forced** — see "dark room" below; echoes become mandatory.
5. **Body plane** — slits, alignment puzzles ([07-combat-body-plane](07-combat-body-plane.md)).
6. **Enemies** — arenas mixing all prior skills.
7. **Her trail → finale** — story levels; rolling-coin arcs, the leitmotif, the reunion.

## Pattern library

- **Dark room (audio-forced)**: geometry with emissive turned near-zero (`glow` ~0.02, no edge glow) — visually almost silent even as afterimage, but echo-loud. Introduce as a *pocket* inside a normal level first (a dark alcove holding an anchor), then a full room. This is the Phase 1 acceptance level.
- **Gate chain**: consecutive gated anchors whose open sides force a specific path through obstacles — teaches deliberate approach planning.
- **Phase lock**: a shuttle anchor crossing behind a periodic mover; the player must read *two* phases and thread them.
- **Echo corridor**: after Phase 1 — corridors distinguishable only by reverb size/dryness; junction choice by ear.
- **Memory span test**: two landmarks placed just beyond one panorama width apart, forcing back-and-forth scanning and deliberate memorization. Use sparingly; it's the hardest primitive.
- **The luxurious flat**: a story beat, not a challenge — a genuinely 2D scene (the painting) where the mental canvas is, for once, *complete and stable*. Emotional contrast is the point.

## Layout constraints (hard numbers)

- Bounds ±18.5; keep gameplay ≥ 1.5 u from bounds so the clamp never masquerades as a wall.
- Corridor widths ≥ 2.5 u (player diameter 0.96 + reading room); slit puzzles are the exception by definition.
- Anchor spacing: consecutive anchors 8–20 u apart — far enough to force navigation, near enough that the just-heard hint still applies. Don't place an anchor within ~3 u of the portal (anchor 5 was explicitly moved away from the exit for this reason).
- Anchor `baseFreq`s within a level: ascending with sequence, ≥ 60 Hz apart, inside ~300–700 Hz (readable against the 1700→720 self-ping).
- Every anchor must be reachable without DEV 3D by a player using only documented controls — verify by playing, not by reasoning.

## Authoring workflow

Levels are **plain-data ES modules**: `prototype/levels/levelNN.js` (shipped 2026-07-07 — level01 is the reference). To author a level: copy level01, edit the data (playerStart, bounds, walls, columns, markers, pickups, frameShard, portal — colors as raw hex), open `?level=N`, iterate with DEV 3D (`3`) — but always final-check in normal perception, because *that* is the game. A layout that is elegant in DEV 3D and illegible in the scan is a failed layout. Mechanics beyond current engine support (grain, slits, banked ground, enemies) still need engine work first — see [06-roadmap](06-roadmap.md) and [12-tilt-stages](12-tilt-stages.md) per stage.

Playtest questions for every new level (in normal perception):
1. Within 60 s, can you name three landmarks and point (scan) to them from memory?
2. Did you ever stop moving because you had *no* hypothesis about the space (bad) versus to *test* one (good)?
3. Did sound tell you anything vision didn't? (Must be "yes" from Phase 1 on.)
4. Did you ever want the radar back? If yes, the level is under-landmarked — fix the level, not the HUD.
