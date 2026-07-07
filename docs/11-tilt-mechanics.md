# 11 — Tilt Mechanics Idea Bank (傾斜の設計案)

Brainstorm requested by the user 2026-07-07. Nothing here is implemented. Tilt (`player.scanRoll`, ±60°, keyboard ↑↓ / wheel) is currently the least-exploited input — used only as perceptual gating (ST4). This document mines it, especially for combat. Feeds ST4, ST6, and ST9–ST12 in [10-campaign](10-campaign.md) and extends [07-combat-body-plane](07-combat-body-plane.md).

> **These ideas are now realized as concrete stage designs in [12-tilt-stages](12-tilt-stages.md)** (easy → hard: TS-A…TS-F on the "see → follow → hold → measure → listen → fight → dance" ladder). Build from 12; this file remains the idea-level rationale.

## What tilt *is* (get this straight first)

The camera's up-vector rolls with the scan, so the strip samples a genuinely rolled slice of the world. Tilt therefore interpolates between two kinds of question:

- **Vertical line** = a *tall, thin* question: full floor-to-ceiling information at one bearing.
- **Rolled line** (→ horizontal at the 90° limit) = a *wide, flat* question: one height across a swath of bearings, in a single glance, without sweeping.

Everything below is an application of one geometric fact: **two planes meet in a line.** The player is a plane; enemies are planes; the scan is (the view of) a plane. Every interaction between them *is* a line — and tilt is the control that chooses which line. This is the same idea family as slits (body vs wall) and cut-exposure (body vs body), so tilt mechanics reinforce the existing design instead of adding a new vocabulary.

## A. Perception & traversal ideas

1. **Alignment resonance ("grain") — the keystone.** Give objects a long axis. A scan line aligned with the axis reads it as a continuous bright stroke; misaligned, as a mere point-crossing. Reading (identifying, unlocking, targeting) = matching tilt within tolerance. Implementation sketch: per-object `grainRoll`; brightness/emissive boost (and audio timbre sharpening) scales with `cos(scanRoll − grainRoll)` while the strip crosses it.
2. **Grain anchor (new anchor type).** An anchor that only *arms* while scanned at its matching tilt for ~1 s (floor ring fills as you hold alignment), then is collected by touch as usual. Teaches grain in ST4 — long before combat spends it (see B2). Cheap: reuses `approachArc`-style tolerance logic in roll-space.
3. **Two-tilt triangulation.** Sweeping at two different tilts gives two projections of the same landmark; the delta encodes height. No code needed — it already works — but a stage beat should *teach* it (e.g., ST5: judge an air anchor's height before jumping by comparing a vertical and a tilted sweep).
4. **Diagonal jump-painting.** Mid-jump, tilting toward the direction of travel paints the landing zone across the arc. Teach in ST5; later air anchors can face diagonal approach windows.
5. **Tilted echo fan (height by ear).** Echo rays are planar today. A tilted scan could split the fan: the line's upper half casts a slightly up-angled ray, the lower half down-angled — overhangs and pits become audible only while tilted. This is the concrete "mechanic that needs height" the planar-audio rule reserved space for. Keep it OFF the heartbeat ping and on the focused ping only (ties into decision ② hybrid).
   - **Tilt-derived stereo (question ③, [04-audio](04-audio.md) §D):** the line's two ends are the two ears; `pan ∝ sin(scanRoll)·sin(relativeYaw)`. Mono at vertical (current rule preserved as the roll=0 case), partial stereo while leaning, full stereo only at the A7 horizontal unlock — awaiting the user's decision after playing.
6. **Trail wobble (ST10).** Her rolling-coin traces are tilted arcs; matching the trace's lean with your tilt makes the decal glint and adds her leitmotif note. Emotionally: to follow her, you must *lean the way she leaned*.
7. **Full-horizontal unlock (late game).** Raising `MAX_SCAN_ROLL` to 90° as a story-earned upgrade completes the duality of "tall thin" vs "wide flat" questions. A pure horizontal line is almost a new sense — one glance = a planar cross-section of the whole room at eye height. Powerful; gate it late, or price it (drains focus?). Ask the user before building. *(Resolved: became stage ST11 / TS-G.)*
8. **Banked ground — passive tilt (user idea, 2026-07-07).** Floor regions carry a `groundRoll` (optionally `groundHeight`): standing there *leans the being*. `renderRoll = clamp(scanRoll + groundRoll, ±π/2)`, plumbed through the camera up-vector, strip rotation, reticle, and the ③ stereo law — no physics, just a region lookup with spring smoothing. What it buys:
   - **Teaching inversion (rung 0):** the world tilts you before you ever learn to tilt yourself. A banked passage in ST2–3 pre-teaches both the visual roll *and* stereo — hums lateralize on a slope with zero input, so ③ is felt environmentally before ST4 names it.
   - **The quake is the first tilt:** in ST0, the earthquake lurches the whole painting's `renderRoll`. Tilt enters the game as catastrophe, returns as skill (ST4), is *resisted* (ST6), and is completed as gift (ST11) — one motif, four meanings. *(Adopted 2026-07-07: rung-0 beats + dedicated stage ST6 「傾いだ大地」, [12-tilt-stages](12-tilt-stages.md) TS-H.)*
   - **Borrowed horizon:** bank ~32° + input 60° ≈ 90°: a *place-bound* taste of the ST11 unlock, before it is yours. Use exactly once as foreshadowing (TS-G act 1).
   - **Compensation as challenge:** counter-tilting to read something vertical while the ground leans you teaches that input roll is *relative* — a mid-campaign beat (and a nasty-good combat variation much later: a banked arena skews every lean-telegraph).
   - **Fiction dividend:** a quake-scattered ruin *should* have tilted slabs; all-flat floors were the less consistent choice.
   - **Comfort guards (hard):** banks ≤ 35°, zones short and clearly bounded, spring smoothing on entry/exit (~0.2 s), tilt-reset zeroes *input only* (you keep leaning with the ground — relaxing on a slope *is* leaning), airborne eases `groundRoll` toward 0. Forced roll can nauseate; playtest with the user early.
   - New code: region list `{rect, roll, height}`, lookup + spring, `renderRoll` plumbing (`directionFrame`, `drawMentalImage` rotation, reticle CSS var, `tiltStereo`), banked decor slabs.

## B. Combat ideas (extends [07-combat-body-plane](07-combat-body-plane.md); slow-and-readable cap still applies)

Tilt's combat role: it is the **reading and aiming of lines** — never twitch aiming; tilt speed (1.15 rad/s) is slow by design, which enforces deliberation and commitment.

1. **Stance reading (build first).** Enemies telegraph by *leaning* their plane. A lean is nearly invisible to a mismatched scan (a leaning plane crosses a vertical line at one point) but unmistakable when tilt-matched (full bright stroke). The Turner's charge telegraph becomes: tremolo appears → *lean begins* → charge along the lean. Skilled players tilt to read the lean direction early and pre-position; unskilled players still get the tremolo. Reward, not requirement — clean skill floor/ceiling split.
2. **Cut-grain (the kill rule, v2).** Upgrade the binary exposure rule: when your plane passes through theirs, the cut happens along the *intersection line* of the two planes. Enemies have a grain axis (A1); a cut aligned with the grain within tolerance destroys, misaligned glances off (stagger only). The fight becomes: read their grain (tilt-matched scanning, A1), then set your cut line to match. Note the honest limitation: until the player's *body* can roll, the player's plane is vertical, so the cut line is controlled by *approach geometry and their lean*, not by player tilt directly — i.e., you wait for or provoke the lean that exposes the grain. That's exactly the matador tempo the combat spec wants. (If body-roll ever exists, this rule is already future-proof.)
3. **Parry as containment.** Geometric restatement of the parry: their attack edge is a moving line; if at impact your plane *contains* that line (orientation within tolerance), it slides along you instead of through you — deflection, and if their motion continues past your edge, the cut-through counter. Same input as the existing parry (body turn), but the success condition is now legible through A1's stance reading rather than pure timing. Generous window (~0.4–0.5 s) stays.
4. **Toppled state (free finisher from geometry).** A countered/slammed enemy falls flat — a horizontal plane on the floor. To a vertical scan it is a hairline at ground level: *nearly invisible unless you tilt hard* (or hear its dull flat tone — B4 audio signatures). Toppled enemies are harmless but rise if forgotten. Finisher: walk through it — your vertical plane cuts its horizontal plane; the intersection line is a cut across its whole body. No new input, pure fiction payoff.
5. **The Gyro (enemy type).** A plane spinning continuously about a non-vertical axis: apparent width pulses; its rotation axis is only readable tilt-matched. Approach is safe in the rhythm's gaps. A perception-first "puzzle enemy" for one mid-campaign arena.
6. **Coin projectiles.** Thrown discs flying edge-on (a point, near-invisible head-on) that wobble periodically — they glint in tilted scans and scream via pitch-change rate. Dodge = body-edge to their plane; they embed in walls as temporary tilted landmarks. Fictional resonance: enemies weaponize the same rolling physics she escaped by. Late-game.
7. **Slit herding.** Lure a charging enemy into a slit that doesn't match *its* body angle: slam, clang, topple (→ B4). Combines ST9 geometry with ST10 combat for the graduation arena; needs no new systems beyond slits + topple.
8. **Stance audio.** Lean sharpens an enemy's tremolo; toppled = dull, floor-flat tone; grain alignment (when scanned) adds a thin ringing overtone. Ears confirm what tilt reads — consistent with [04-audio](04-audio.md) §B4.

## Recommended build order & scope guards

1. **A1 grain + A2 grain anchor** (ST4) — small, teaches the keystone concept, no combat dependency.
2. **B1 stance reading + B3 parry-containment** (with the Turner, Phase 3) — biggest readability win per line of code.
3. **B4 topple + finisher** — memorable, nearly free once planes exist.
4. Then at most one of B5/B6/B7 for enemy variety; all three would bloat the campaign (user: no padding).

Guards: tilt must never become required *during* an attack window (read before, act during); anything requiring tilt precision under time pressure violates the ≤0.4 s reflex cap. A5/A7 need the ② ping decision and user sign-off respectively.

## Open questions for the user

| Question | Cheap default |
| --- | --- |
| Should the player's *body* ever roll (true 3D plane orientation), or stay vertical forever? | Stay vertical — cut-grain works via approach + enemy lean (B2); body-roll is a sequel-sized idea |
| Full-horizontal scan unlock (A7): story upgrade, focus-priced, or never? | Prototype behind a `const`, decide by feel |
| Grain visible as a subtle streak texture, or pure resonance (brightness only)? | Pure resonance first — texture may over-explain |
