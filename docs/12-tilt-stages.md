# 12 — Tilt Stage Designs (easy → hard)

Concrete, buildable stage designs realizing the tilt idea bank ([11-tilt-mechanics](11-tilt-mechanics.md)) inside the campaign frame ([10-campaign](10-campaign.md)). Ordered by difficulty. Requested by the user 2026-07-07.

## The tilt literacy ladder (design spine)

Each design teaches exactly one new tilt verb, in this order:

| Rung | Verb | Skill | Lands in |
| --- | --- | --- | --- |
| 0 | 傾けられる **Be tilted** | passive: the world rolls you (banked ground, A8) | ST0 quake; ST2–3 banked passages |
| 1 | 見る **See** | tilt to make a hidden thing visible | ST4 zone 1 |
| 2 | 辿る **Follow** | tilt to read a pointer and follow it | ST4 zone 2 |
| 3 | 保つ **Hold** | sustain a matched tilt (grain) | ST4 zone 4 |
| 4 | 測る **Measure** | compare sweeps at two tilts to judge height | ST5 |
| 5 | 抗う **Counter** | hold a reading against ground that leans you (input roll is relative) | ST6 (TS-H) |
| 6 | 聴く **Listen** | tilt changes what returns: echoes, and now *sides* (③ stereo) | ST8 ch.2–3 |
| 7 | 戦う **Fight** | read stances, hold cut lines, track the fallen | ST10 |
| 8 | 開く **Open** | lay the line flat: 90° unlock, first full stereo | ST11 (TS-G) |
| 9 | 踊る **Dance** | continuous tilt tracking as expression | ST12 |

With decision ③ adopted ([04-audio](04-audio.md) §D), every rung from 2 upward gains a quiet stereo dividend: leaning lateralizes world sounds in proportion to `|sin(scanRoll)|`. The designs below note where that dividend is *taught* versus merely present.

## Engine reality checks (respect these in every design)

- **Collision is planar and height-agnostic** ([02-architecture](02-architecture.md)) → no pits, no low windows, no crawl-unders. A "slot" anchor must sit at the slot's *mouth* (ring half-out of the gap) so it's touchable from outside the solid's footprint.
- **`MAX_SCAN_ROLL` = 60°** → every "match this lean" target must be ≤ ~50° so the match is comfortably reachable. Horizontal slots are read at 60°, not 90° — set gap heights generous (≥ 0.8 u).
- **The body stays vertical** (default from [11-tilt-mechanics](11-tilt-mechanics.md) open questions) → no tilted slits for the *player*; tilt gates perception only.
- Passable gaps ≥ 1.4 u (player diameter 0.96 + margin). Low-glow "dark" geometry: `glow` ≈ 0.02–0.04, no edge glow.
- Grain tuning baseline: tolerance ±0.12 rad, arm time 1.0 s cumulative within a 2.5 s window, slow decay on mismatch.
- **Banked ground (A8)** requires the `renderRoll = clamp(scanRoll + groundRoll, ±π/2)` plumbing before any rung-0 beat is built. Banks ≤ 35°, spring-smoothed, reset zeroes input only. Grain/slot targets sitting *on* banked ground must budget for the ground's contribution (a 30° slot above a 30° bank needs zero input — that inversion is a valid puzzle, once).

---

## Rung-0 beats — banked ground before the ladder (no stage of their own)

Passive tilt (A8) is seeded as *beats inside existing stages*, never a stage — being tilted isn't a skill, so it can't carry a stage per the one-new-element rule:

1. **ST0 — the quake is the first tilt.** During the earthquake script, the whole painting's `renderRoll` lurches (±10–18°, spring-damped, ~3 s). The player's very first experience of roll is involuntary and frightening. No interaction; pure staging.
2. **ST2 — the banked corridor.** One connecting passage between gate areas crosses a fallen slab bank (18°, ~6 u long, clearly visible as a tilted amber slab). Walking it, the world leans and — because ③ ships with it for free — the active anchor's hum drifts sideways with zero input. No text; the body learns. Exit returns to flat (spring back).
3. **ST3 — optional compensation taste.** A shuttle anchor watched *from* a small 15° bank: players who counter-tilt to keep the phase readable discover input roll is relative. Uncommented; a reward for the observant.

These three beats cost one system (`groundRoll` plumbing) and zero stages, and they make ST4's "now do it yourself" land on prepared ground — literally.

## TS-A 「傾いだ廃墟」 — full design for ST4 (rungs 1–3)

**New element:** tilt (see → follow → hold). Room ~32×32, bounds ±14.5, outer walls ±16 (cyan, h 3.4). Spawn (0, −12) facing forward; portal (0, 13.5). Progression roughly south → north through four zones. 3 anchors.

### Zone 1 (south-west) — See: the slot

- Amber slab stack at (−6, −6): lower slab `w 6, d 2.2, h 0.8`; upper slab same footprint at `up 1.7, h 1.2` → a horizontal gap 0.8–1.7 u high, long axis along *right*.
- **Anchor A1** (cyan, 330 Hz, still/any side) at (−6, −7.35), `up 1.25` — 0.25 u *outside* the slabs' south face, ring half-inside the gap mouth. Touch is trivial; *seeing* it is the lesson: a vertical scan crossing the stack reads slab–sliver–slab (2 px of ring); at ~55–60° roll the line runs along the gap and the ring + gap interior become one long bright stroke.
- Landmark: tall cyan column (−11, −9, r 0.7, h 4.6). Hint text: "Anchor 1: the ruin has a seam. Lay the line along it."

### Zone 2 (west) — Follow: the beam

- A fallen beam: decorative mesh (`BoxGeometry 0.5 × 0.5 × 7`, blue, bright edge glow) leaning ~35°, floor end at (−9, 1), high end toward the west wall at (−13.5, 4). Collision: one small AABB at the floor end only (0.8 × 0.8). It glints under matched tilt (grain visual, ±0.12 of 35°).
- The beam's long axis points into a low-glow C-shaped nook: three violet slabs (`glow 0.04`, no edge glow) around (−12.5, 5.5), opening north-east, walls h 2.4.
- **Anchor A2** (amber, 410 Hz, still/any side) at (−12.5, 5.5), inside the nook. Vertical-scan players see darkness where the nook is; tilt-matched players see the beam as a stroke aiming at it. Echo also helps (the nook walls return close "kin") — keeps the audio thread warm per [10-campaign](10-campaign.md) guardrails.
- **Stereo first-touch (③, taught here):** while the player leans to match the beam (~35°), A2's hum — dead center when vertical — pulls audibly toward the nook's side (`pan ≈ 0.6·sin(35°)·sin(rel)` ≈ 0.2–0.3). The beam lesson and the stereo lesson are the *same lean*: zero extra design, one new hint line. Hint: "Anchor 2: the fallen beam still points at what it fell for. Lean — the sound leans with you."

### Zone 3 (east) — relief + tilt-reset idiom

- Two blue wall segments at (5, 0) and (8.6, 0) (each `w 2.6, d 0.8, h 3.0`) leaving a 1.5 u doorway at right ≈ 6.8 — the only route east. A tall, strictly vertical feature after two tilted lessons: naturally invites the reset (middle-click / ↑+↓). No new code; if playtests show players stuck tilted, add a one-shot hint volume later.

### Zone 4 (north-east) — Hold: the grain exam

- Open plaza. **Anchor A3** (magenta, 500 Hz) at (6, 9), `up 0.9` — the first **grain anchor**: `grainRoll 0.7 rad (~40°)`. Arming: hold `|scanRoll − grainRoll| ≤ 0.12` while the strip crosses the anchor, 1.0 s cumulative; the floor ring fills (opacity 0.56 → 1.0, radius pulse) as progress; decays at half speed when mismatched. Once armed (ring locks bright), collect by touch as usual.
- The answer key is environmental: two magenta marker boxes near it lean at exactly 40° (decor meshes, rotated) — match *them* and the anchor arms.
- Hint: "Anchor 3: this one has a grain. Hold the line along it."

**Portal** (0, 13.5). Difficulty rationale: A1 = one static read; A2 = a read that must be *carried* across the room; A3 = a read that must be *held* under time. **Acceptance:** clearing without tilting is impossible (A1 findable but A3 hard-gates); median first-clear ≤ 8 min; the reset idiom observed at least once per tester.

**New code required:** grain fields on pickups (`grainRoll`, `grainTolerance`, `armProgress`) + arming logic in `updatePickups` + floor-ring feedback; rotated decorative meshes (trivial); level loader (Phase 1) or a temporary `?level=` switch.

---

## TS-B 「二度見の井戸」 — ST5's tilt beats (rung 4)

**New element of ST5 is height**; these three air-anchor set pieces make tilt the *measuring tool*. Room ~30×30.

1. **The ruler.** Air anchor (up 2.05) beside a cyan column carrying three thin glow rings at heights 1.0 / 2.0 / 3.0 (decor) — the world's yardstick. Players learn to judge float height by sweeping at two tilts and comparing against the rings. Open floor, pure timing jump.
2. **The shelves.** Two solid shelves: (4.0, 1.2) `w 2.4, d 2.4, h 1.4` and (7.2, 4.6) `w 2.4, d 2.4, h 2.6`; air anchor at (5.6, 2.9, up 2.0) floating in the ~2.6 u diagonal channel between their footprints. A vertical scan shows three clustered marks; two sweeps at different tilts separate the layers and reveal which mark floats. (Two-tilt triangulation in practice — no code, pure layout.)
3. **The dark well.** A low-glow C-nook (as TS-A zone 2) with the air anchor above it (up 2.05, bob ±0.14) and two thin emissive rails leaning 30° (decor, grain-lit) whose lines *cross at the anchor's bearing*. Read the rails tilt-matched → know where to stand → jump on the bob's downbeat. Echo pre-check before jumping helps (nook walls sing close).

Difficulty rationale: ruler = assisted measurement; shelves = unassisted separation; well = inferred position + timing in the dark. **Acceptance:** testers demonstrably sweep twice at different tilts (observable in DEV 3D shadowing) before the shelf jump; well anchor ≤ 4 attempts median.

**New code:** none beyond TS-A's decor meshes. (Optional: reuse grain glint on the rails.)

---

## TS-H 「傾いだ大地」 — full design for ST6 (rung 5: Counter)

**New element:** counter-tilt. Banked ground here is *adverse* — it leans you away from what you must read. (Deliberate thematic contrast with TS-G act 1, where the bank is an ally lending you the horizon: ST6 resists, ST11 gives.) Room ~34×30, bounds ±15. The quake's epicenter: floor broken into visible leaning slabs (all `groundRoll` static — the rocking comes from walking across them at your own pace, never from animated ground; comfort guards per [11-tilt-mechanics](11-tilt-mechanics.md) A8). Spawn south on flat ground; portal north on flat ground (arrival and departure are level — the leaning is the journey). 3 anchors.

### H1 (south) — the counter lesson

- A single clean bank: amber slab field, `groundRoll +20°`, ~8×6 u, clearly readable as tilted geometry (edge-glowed rim).
- **Anchor H1** (cyan, 330 Hz): a **grain anchor** at the bank's center whose grain is **world-vertical (0°)**. Standing on the bank leans you +20°; arming needs `renderRoll ≈ 0` → input −20°. The floor-ring fill gives immediate feedback while the player discovers the counter.
- Hint: "The ground lies. Your line doesn't have to."
- This is TS-A's rung-3 skill inverted: there you tilted to match a leaning world; here you tilt to *refuse* one.

### H2 (center-west) — find true ground

- A wide −25° bank field with a low-glow pocket in its far wall holding **Anchor H2** (amber, 410 Hz). The pocket's interior reads like TS-A's nook — but from the bank, max input (+60°) only reaches `renderRoll +35°`, not enough to lay the line along the pocket's seam (needs ≥ 45°).
- The answer stands mid-field: a **flat outcrop** — one fallen slab lying level (`groundRoll 0`, ~2.5×2.5 u, subtly brighter rim). From it, +50° input reads the seam cleanly.
- Lesson: on leaning ground, *where you stand is part of the read*. No hint text — the outcrop's rim glow is the guide; if testers stall, add one line later.

### H3 (north) — the ridge exam

- A ridge of alternating static banks (+15° / −15°, segments ~5 u, spring transitions) crossing the room west–east. Walking it, the world rocks at the player's own pace.
- **Anchor H3** (red, 650 Hz, airborne, `up 2.05`) above the ridge crest mid-way. The jump must be timed to the anchor's bob *while* the player's lean oscillates with the segments — but **airborne eases `groundRoll` toward 0** (A8 rule), so the leap itself is a moment of level calm: read on the rock, jump into stillness, touch, land back into the lean.
- This composes rungs 0+4+5 with ST5's height skill without introducing anything new — the exam is the composition.

**Acceptance:** H1 armed without hint re-reads by ≥ 7/10 testers; H2 solved without added text (outcrop discovered); H3 median ≤ 5 attempts; zero nausea reports in a 5-tester pass; afterward testers can articulate "my tilt is relative to the ground."

**New code required:** nothing beyond A8 `groundRoll` plumbing (built for ST2's rung-0 beat) + TS-A's grain system. This stage is pure layout once those exist.

---

## TS-C 「斜光の間」 — ST8 chambers 2–3, the listening beats (rung 6)

**Depends on decision ② (focused ping) and an `echoSolids` extension** — echo-only geometry entries carrying a height band `{minUp, maxUp}`, plus split elevation rays: when `|scanRoll| > 0.35`, the focused ping adds +18° and −18° elevation rays (upper/lower halves of the tilted line). Planar `solids` behavior is unchanged.

- Dark chamber, three doorways in the far wall, visually identical (all full-height gaps ≥ 1.5 u for planar collision, all near-zero glow). Two are "false": decorative low lintels (echoSolids at up 1.6–2.0) hang just inside — a tilted focused ping returns an early dull *bon* from overhead. The true door has clear high air (no overhead return).
- False doors are not punishing — they lead into short dead-end loops that cost ~20 s and return. The lesson is the listening, not the penalty.
- Second beat: the chamber's side alcoves differ only in reverb size (B3) — one holds the anchor (boomy), one is a dry dent. Ear-only discrimination.
- **If ② resolves to periodic-only:** drop the lintel mechanic (no deliberate ping to tilt) and keep only the reverb discrimination; move the lintel idea to a post-② backlog.

### Chamber 3 「二つの声・易」 — two voices, easy version (③ stereo, partial)

- Two hums with the **same baseFreq** behind two dark doorways ~6 u apart: one is the chamber's anchor, the other a **decoy emitter** (new tiny entity: a beacon with no pickup, `decoy: true`). Vertical scan: indistinguishable — both centered, same pitch.
- Lean to max (60° → pan ≈ ±0.5 with `EAR_SEPARATION 0.6`): the voices split left/right. Wide angular separation keeps the partial stereo sufficient — this is the *easy* form; TS-G act 3 repeats it hard (narrow separation, full stereo required).
- **Mono fallback (accessibility, required):** the true voice additionally "breathes" — it is attached to a slightly moving anchor, so scan-doppler distinguishes it slowly. Stereo is the shortcut, never the wall.

**Acceptance:** with the monitor off (HUD only), testers pick the true door first in ≥ 6/10 runs after one practice run; chamber 3 solved ≥ 8/10 on headphones *while leaning* (observable via `player.scanRoll` in the dev hook).

---

## TS-D 「狭き道・斜」 — ST9's tilt beat (rung 2 reprise, harder)

Small beat, no new systems: the final slit wall's *edges* carry grain (lean 25°) — under matched tilt the slit's rim glints, revealing the passable seam in an otherwise uniform dark wall. Combines with the campaign's thesis slit (pass while scanning elsewhere) — first find the seam by tilt, then cross it blind. The player's body stays vertical; tilt finds, never passes.

**Acceptance:** the slit is effectively invisible untilted (verified by a fresh tester failing to find it in 60 s without tilt) yet found in ≤ 20 s with tilt after ST4 training.

---

## TS-E 「回る者・改」 — ST10 combat chambers with tilt (rung 7)

Three connected arenas (~14×14 each). Combat rules per [07-combat-body-plane](07-combat-body-plane.md) §3; all values `const`s. Death = restart current chamber only.

### C1 道場 (dojo) — stance reading

- One **Turner T1** (~2.0 long × 1.0 tall landscape plane — quadruped silhouette, per [07-combat-body-plane](07-combat-body-plane.md) §2.5): no grain, face-cut kills it. Turn rate 0.6 rad/s; charge telegraph = tremolo + **lean 30°** held 0.9 s; charge 6.5 u/s along its plane; recover 1.6 s edge-on. Central violet column (r 0.8) for disengaging.
- Tilt lesson: the lean is a hairline to a vertical scan but an unmistakable stroke tilt-matched — matching reveals *which way* the charge will go before it moves. Tremolo alone suffices to survive (skill floor); tilt-reading enables pre-positioning for the counter (ceiling).
- No anchor; the exit un-flattens on T1's defeat.

### C2 監視者 (the watcher) — topple and finish

- **Anchor** (amber, gated) behind **T2**'s 6 u patrol line. Parry/slam topples T2: it becomes a floor-flat plane, harmless, `topple 4 s` then rises.
- Tilt lesson: toppled, T2 is a hairline at floor level — track it tilted (or by its dull flat tone, [04-audio](04-audio.md) §B4) and **walk through it** to finish (vertical player plane cuts the horizontal body — the geometry *is* the finisher).
- If ② hybrid: T2 hears the focused ping ≤ 9 u; heartbeat is inaudible — the stealth beat.

### C3 卒業 (graduation) — cut-grain + herding

- **Two grain Turners** (grain axes +35° and −35°, exposed only during their lean/charge). Misaligned cuts glance (stagger, no kill): the kill requires baiting the charge, matador-turning, and cutting along the *exposed* grain — read tilt-matched during the telegraph.
- East wall carries a **slit** (yaw tolerance 0.2 rad): a charging Turner herded into it slams → instant topple (clang). The herding option roughly halves the difficulty for players who read the room.
- **Anchor** (magenta, gated toward the slit wall — the layout *suggests* fighting near the herding tool). Never more than 2 active enemies (readability cap).

**Stereo beats (③, free with the implementation):** in C3, leaning briefly mid-fight lateralizes the *second* Turner's tone — hear which flank it circles from while your eyes hold the first. The price is built in: while leaning, the front enemy's lean-telegraph reads worse (the vertical stroke compresses). Likewise a toppled enemy's dull floor-tone pans when leaning — relocating the fallen one without looking. Teach nothing; let C3 veterans discover it (it will feel like their own idea).

Difficulty rationale: C1 = one read, no stakes; C2 = read + track + finish under a clock; C3 = two interleaved reads + grain precision, with an environmental escape hatch. **Acceptance:** per [10-campaign](10-campaign.md) — C3 median attempts ≤ 4; clearable without DEV 3D; no reflex window < 0.4 s (lean 0.9 s, parry 0.45 s, topple 4 s all comply).

**New code:** enemy entity (plane mesh, patrol/track/charge/recover state machine), topple state, grain-on-enemy reusing TS-A's grain math, slit-slam interaction, stance audio hooks.

---

## TS-G 「地平の目」 — full design for ST11 (rung 8: Open)

**New element:** the 90° roll unlock + the game's first full stereo. Prereqs: ST4–10 skills; ③ implemented (done). Room ~34×34, bounds ±16; mid-dim ruin with more magenta accents than any stage before (her color, nearing). Spawn south, portal north. 3 anchors + the imprint event.

### Act 1 (south) — appetite: the borrowed horizon (A8)

- **Anchor G1** (cyan, 330 Hz): a *thin* horizontal slot (gap only 0.5 u, band 1.0–1.5 u) in a long amber wall — TS-A's rung-1 skill at its uncomfortable limit. At 60° from flat ground the read is partial, slivered, effortful.
- In front of the slot: a **banked slab (32°)**, the one place the slot reads fully — standing on it with full input, `renderRoll ≈ 90°`: the player experiences the horizontal line *before owning it*, bound to one awkward spot. Taste breeds desire: the appetite act ends with "I want this everywhere," which act 2 answers.
- Behind the same wall, G2's hum leaks over: centered when vertical, lateralizing hard from the slab (near-full stereo — also a preview). The wall says: you know the direction; you just can't lie down enough yet — *except here*.

### Act 2 (center) — the imprint (the unlock)

- A circular chamber (ring wall r 6, one entry). On the floor: **her imprint** — a perfect faint-magenta circle decal (r 1.2) with a wobble-spiral tail leading into it (foreshadowing ST11's spiral, literally the same decal system).
- **Trigger:** stand inside the circle and hold `|scanRoll| ≥ 0.95 · MAX_SCAN_ROLL` for 2.0 s. Then: brief input lock (~0.6 s, reveal-like but *without* full 3D — this is her gift, not the third dimension's), the line rolls the remaining 30° on its own, `MAX_SCAN_ROLL` becomes π/2 for the rest of the run, and the leitmotif plays with **full stereo width for the first time in the game** — one phrase sweeping L → R → center.
- Message: "She lay here. The world tips the rest of the way."
- Fiction: she teaches him through a trace, before they ever meet. The mechanics carry the romance; no cutscene needed.

### Act 3 (north) — the exam of the horizontal eye

1. **The ring of pillars (one-glance reading):** 12 cyan columns (r 0.5, h 3.0) on a circle r 7; one is a broken stub (h 0.35). At 90° the line lies along the horizon: *one glance* renders the entire ring as a single stroke with one gap — the exit bearing toward G2. Vertical sweepers can still solve it the old way (~40 s of sweeping); the stage never hard-gates the new sense, it *sells* it.
2. **二つの声・難 (two voices, hard):** two doorways only 4 u apart, same-freq hums behind each — **G2** (magenta anchor) behind one, a decoy emitter behind the other. Partial stereo (±0.5) is no longer enough at this separation; full ±1 pan at 90° splits them cleanly. Wrong door = a short dead-end where the decoy is revealed as a hollow, silent ring shell (~15 s walk-back, no other penalty). **Mono fallback:** the true voice carries a faint leitmotif note (mono-audible).
3. **Anchor G3 「水平の帯」 (the horizontal band):** at `up 1.2` — *exactly eye height*, living inside the horizontal line — orbiting a center pylon (`motionRight 3.2, motionForward 3.2`, slow). At 90° its hum pans across the whole field as it circles: L → C → R → C…. Catch it where a floor arrow decal marks the bearing, timing the grab to the pan crossing center. `airborne: false` (planar touch — height is presentation and audio, not a jump gate). Stereo-as-*tracking*, the sense's graduation. **Mono fallback:** scan-doppler still reads the orbit, slower.

- **Portal** (0, 15). Clearing message candidate: "The line learns to lie down. She is close."

**Balance:** no artificial cost on 90° — the geometric trade (total vertical blindness while flat: floor decals, jump reads, and lean-telegraphs all vanish from the strip except at center) is the cost, and ST12–13 should include at least one moment where flattening is the *wrong* choice so the dial stays a dial.

**New code required:** `MAX_SCAN_ROLL` `const` → mutable with an unlock path; imprint trigger volume (planar circle + roll-hold timer); decoy emitters (beacon minus pickup); floor decals (flat ring/arc meshes, no collision); leitmotif stinger with scripted pan sweep; unlock persistence (with the Phase 4 save system).

**Acceptance:** pillar ring solved in one glance by unlocked players (< 10 s, vs > 40 s sweeping — measurable via dev hook timing); two-voices ≥ 8/10 on headphones; a mono-speaker tester still clears all three exams; at least one playtester names the unlock moment as a highlight unprompted.

---

## TS-F 「彼女の軌跡」 — ST12's dance (rung 9, deliberate difficulty dip)

Three trace set pieces, no fail state — relief before the finale, per the campaign's pacing note:

1. **The arc**: a single rolled-coin curve, lean 15°. Walking its length with roughly matched tilt makes it glint and adds one leitmotif note.
2. **The S-curve**: alternating lean ±30° with an inflection point — re-tilt mid-walk (the first "phrase" of the dance).
3. **The spiral**: continuous lean 0° → 50° toward the center where she wobbled and fell; hold a slowly increasing tilt while walking the spiral. Completing it plays the leitmotif's fullest form yet heard — and, post-TS-G, in full stereo: each earned note placed left or right along the spiral's turn, so the dance is *heard* circling with you.

Traces remain faintly visible untilted — the dance is *rewarded*, never gated. The mechanic is TS-A's grain glint applied to floor decals plus a note-trigger; nearly free by then. Include one beat where lying fully flat *loses* the trail (floor decals vanish from a horizontal line) — the TS-G balance note made playable: the new sense is a dial, not an upgrade.

**Acceptance:** testers describe the spiral moment in emotional terms unprompted; zero testers stuck.

---

## Build order and cross-stage summary

| Order | Design | Campaign slot | New systems | Blocked by |
| --- | --- | --- | --- | --- |
| 1 | TS-A | ST4 | grain anchors, decor meshes | level loader (Phase 1) |
| 2 | TS-B | ST5 | none new | TS-A |
| 3 | TS-H | ST6 | none new (groundRoll built for ST2's rung-0 beat, grain from TS-A) | A8 plumbing |
| 4 | TS-D | ST9 beat | none new (grain reuse) | Phase 2 slits |
| 5 | TS-E | ST10 | enemies, topple, slit-slam | Phase 3 |
| 6 | TS-C | ST8 ch.2–3 | echoSolids + elevation rays; decoy emitters | decision ② + audio B3 |
| 7 | TS-G | ST11 | roll unlock, imprint trigger, decals, leitmotif stinger | ③ stereo (✅ done); buildable parallel to TS-E |
| 8 | TS-F | ST12 | decal glint + note triggers (reuses TS-G decals) | story pass with user |

TS-C builds later than its stage number because it depends on ②; ST8 chamber 1 (plain dark navigation) is independent and can be built with B3 alone. TS-G needs no combat and no ② — it can start as soon as the level loader and decals exist.
