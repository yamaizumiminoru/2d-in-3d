# 10 — Campaign Plan (面クリア構成)

Confirmed with the user 2026-07-07: the game is **stage-clear (面クリア式)**. Each stage introduces exactly one new gameplay element, and the campaign must not be padded — when in doubt, cut. This document is the buildable stage list. Design language: [08-level-design](08-level-design.md). Tech dependencies: [06-roadmap](06-roadmap.md).

## Structure rules

- **The spine never changes:** stabilize the stage's anchors → the door un-flattens → walk through = clear. Players always know what "done" means; stages vary *how anchors must be read*, not the goal grammar.
- **One new element per stage.** Everything else is review. If a stage teaches nothing new and isn't an exam or story beat, it shouldn't exist.
- **Anchor counts vary (3–5).** Not every stage is 5; shorter is fine. Fatigue is the enemy.
- **(Adopted ④(d), [05-gameplay](05-gameplay.md)):** each stage hides one optional **frame shard** — an audio-found compass (wooden hum). Before it: relative navigation; after: absolute bearings. Optional, never a gate; ST1–2 pre-granted; ST8's shard hunt is that stage's purest by-ear beat. Implemented in the prototype room as reference.
- **Stage transition:** portal → reveal flash → fade to black → title card (stage number + name + the **two-line emblem**, [13-storytelling](13-storytelling.md)) → optional 影絵 vignette (first clear only) → next stage. Dev access: `?level=N` URL param (Phase 1 loader).
- Target first-release playtime: **60–90 minutes**. Current estimate below sums to ~95 — at the ceiling; the cut list below is live, not decorative.

## Stage list

| # | Name | New element | Anchors | Est. play | Tech needed |
| --- | --- | --- | --- | --- | --- |
| 0 | 絵の中 / In the Painting | (prologue) movement in a *complete* 2D world | — | 3 min | unique flat-render mode |
| 1 | 目覚めの間 / The Waking Room | scan + afterimage reading; still anchors | 3 | 5 min | level loader |
| 2 | 面と門 / Faces and Gates | approach-side gates ("things have facing") | 3 | 5 min | — |
| 3 | 拍を読む / Reading the Pulse | moving anchors; phase reading | 4 | 7 min | — |
| 4 | 傾いだ廃墟 / The Tilted Ruin | scan tilt (roll) required | 3–4 | 7 min | — |
| 5 | 跳ぶ線 / The Leaping Line | height: jump, air anchors, airborne reading | 4 | 7 min | — |
| 6 | 傾いだ大地 / The Leaning Fields | counter-tilt: banked ground fights your reading (A8) | 3 | 7 min | groundRoll plumbing |
| 7 | 崩れた広間 / The Scattered Hall | **none — midterm exam** (= current prototype room, retuned) | 5 | 10 min | already built |
| 8 | 光らない部屋 / The Unlit Room | audio-forced navigation (echo as primary sense) | 3 | 8 min | audio B3 + ping-mode decision |
| 9 | 狭き道 / The Narrow Way | body plane + slits | 3 | 8 min | Phase 2 |
| 10 | 回る者 / The Turner | enemies & orientation combat | 3 | 10 min | Phase 3 |
| 11 | 地平の目 / The Horizon Eye | 90° roll unlock + first full stereo | 3 | 8 min | ③ stereo (done) + roll unlock |
| 12 | 彼女の軌跡 / Her Trail | trail-reading (story mechanic) | 3 | 8 min | decals + leitmotif |
| 13 | 再会 / Reunion | (finale) scripted, short | 1 | 4 min | story scripting |

**Cut/merge candidates if scope tightens** (in order): merge 12+13 into one story finale; fold ST6 into ST4 (its H1 counter-lesson) + ST12 (its ridge as a trail beat); fold ST11's unlock into ST12's opening act; merge 2 into 3 (gates + motion in one "facing and phase" stage); replace 0 with a 4-panel still-image intro. Floor: 10 stages. Do **not** cut 7 (free, and the pacing needs an exam), 8 (the audio thesis stage), or the 90° unlock *moment* itself (even if its stage merges away — the first-full-stereo beat is a campaign highlight, [04-audio](04-audio.md) §D).

## Per-stage specs

> Tilt-heavy stages now have detailed, geometry-level designs in [12-tilt-stages](12-tilt-stages.md): ST4 = TS-A (full layout), ST5 = TS-B, **ST6 = TS-H (full layout)**, ST8 ch.2–3 = TS-C, ST9 beat = TS-D, ST10 = TS-E, **ST11 = TS-G (full layout)**, ST12 = TS-F. Where this file and 12 differ in detail, 12 is the newer, more specific spec.

### ST0 — 絵の中 / In the Painting (prologue)

- **Story:** daily life inside the painting; her leitmotif plays complete and warm. The quake; she rolls past and out; the frame tears; darkness. Cut to ST1.
- **The quake is the first tilt:** the whole painting's view lurches (`renderRoll` ±10–18°, spring-damped) during the earthquake — the player's first roll is involuntary (rung 0, [12-tilt-stages](12-tilt-stages.md) "Rung-0 beats"). Tilt enters as catastrophe, returns as skill (ST4), completes as gift (ST10).
- **Design:** the one time the mental canvas is *complete and stable* — a fully lit, non-decaying panorama (the painting's interior as a flat world). Walk (A/D along the painting plane), one interaction: reach her at the far end, touch = the quake triggers. No anchors, no portal, no failure.
- **Why it earns its slot:** the whole game is about losing full perception; the player must *have* it once. Everything after reads as loss. (Pattern "the luxurious flat", [08-level-design](08-level-design.md).)
- **Build note:** cheapest implementation is a pre-composed wide image drawn to the mental canvas with camera-x scrolling — no Three.js scene needed. Keep under a day of work; if it grows, take the cut candidate.
- **Acceptance:** a first-time player, with no text, understands: they lived here, she fell out, he followed.

### ST1 — 目覚めの間 / The Waking Room

- **New (redesigned 2026-07-13): raw perception — the whole stage plays with NO afterimage** (`memoryLocked`). Memory is a learned skill, and this stage is where it is earned.
- **The arc:** ① anchor 1 is found **by sound** (it hums straight ahead; scan-doppler homes you); ② collecting an anchor fires the reveal flash (**0.5 s here** via `revealDuration`) and the **next anchor is placed inside that flash's view** — you walk from a glimpse held in your head; ③ the win unlocks memory: "…and the world begins to remain" — afterimages exist from ST2 on, understood as the automated form of what you just did manually.
- **Guardrail (user):** memory must NOT unlock early — audio literacy is learned *before* visual memory, or players never learn to use sound. Anchor 1 must be findable by ear alone; nothing may block the straight glimpse-walk lines (a head-on obstacle in a no-memory stage is cruel).
- **Layout:** anchors (0,−3.5) → (−4.5,4.5) → (−7.5,9), each within ~±38° of the previous approach heading (the full-window reveal hFOV); interior geometry sits OFF those lines as bump/echo furniture; portal (0,9.5) sings when open. Built as `levels/level01.js`.
- **Audio:** load-bearing for the first time — hum + heartbeat echo are the only guides before the first flash.
- **Acceptance:** a new player finds anchor 1 by ear in ≤ 90 s; clears in ≤ 7 min; the memory unlock at the win reads as a *gift*, not a settings change.

### ST2 — 面と門 / Faces and Gates

- **New:** `approachYaw` gates. Message language plants the combat seed early: *things in this world have a face*.
- **Layout:** 1 free anchor (warmup), 2 gated anchors whose open sides face *away* from the natural approach; corridors make the wrong side the obvious path, so the player must read the green entry line and plan.
- **Banked corridor (rung 0):** one connecting passage crosses a fallen 18° slab — the world leans the player and the active hum drifts sideways with zero input (passive tilt + free ③ stereo preview; spec in [12-tilt-stages](12-tilt-stages.md) "Rung-0 beats").
- **Acceptance:** player bounces off a wrong side at least once (the hint fires), then succeeds; understands facing without text beyond the existing hint.

### ST3 — 拍を読む / Reading the Pulse

- **New:** periodic motion (shuttle, oval), phase reading; combined gate+motion at the end.
- **Layout:** 1 still (review), 2 shuttles at different periods, 1 oval-gated (ST2+ST3 combined = the stage exam).
- **Soft audio tutorial:** the last anchor sits in a *dark alcove* (near-zero glow walls, normal anchor glow) — visually solvable but noticeably easier by ear. First taste of "terrain is dark, goals hum."
- **Acceptance:** player waits and times at least one anchor rather than chasing it (observable: approach while anchor is moving toward them).

### ST4 — 傾いだ廃墟 / The Tilted Ruin

- **New:** scan tilt as a *required* reading tool. Slanted slots, low overhangs, a leaning wall: geometry whose interior is only legible when the scan line aligns with it.
- **Layout:** 3–4 anchors inside tilted apertures (e.g., a waist-height horizontal slot: vertical scan shows a sliver; tilting ~60° reveals the ring inside). Include one tilt-reset moment mid-stage so the reset idiom gets used.
- **Acceptance:** clearing without ever tilting is impossible in practice; tilt HUD tick is understood (player un-tilts without prompting).

### ST5 — 跳ぶ線 / The Leaping Line

- **New:** height. Jump timing, air anchors, reading during airtime (afterimages painted mid-jump).
- **Layout:** 2 ground anchors (review, quick), 2 air anchors: first over open floor (pure timing), second above a dark low-glow pocket where an echo check before jumping helps (keeps building the audio habit).
- **Numbers:** keep air anchor `up` ≈ 2.0–2.1 (see the ST-anchor tuning note in [05-gameplay](05-gameplay.md) — standing-collect leak at lower values).
- **Acceptance:** player fails a jump-through at least once and self-corrects; both air anchors collected without hint text changes.

### ST6 — 傾いだ大地 / The Leaning Fields

- **New:** counter-tilt — banked ground (A8) that *fights* your reading: the world leans you away from what you must read, and you learn that input tilt is relative. Full geometry design: [12-tilt-stages](12-tilt-stages.md) TS-H. Thematic contrast planted here pays off in ST11: there the bank is an *ally* (borrowed horizon); here it is adversity.
- **Structure:** a grain anchor that must be held world-vertical from a 20° bank ("The ground lies. Your line doesn't have to.") → a find-true-ground read (the only flat outcrop on a leaning field) → the ridge exam (alternating static banks + a jump whose airborne moment breathes back to level).
- **Comfort:** all banks are static; the "rocking" comes from the player walking across them at their own pace — never animated ground. Guards per [11-tilt-mechanics](11-tilt-mechanics.md) A8.
- **Acceptance:** testers can articulate "my tilt is relative to the ground" afterward; no nausea reports in a 5-tester pass; ridge anchor median ≤ 5 attempts.

### ST7 — 崩れた広間 / The Scattered Hall (midterm)

- **New:** nothing. This is the existing prototype room, kept nearly as-is — the integration exam for ST1–6 (still, gated, shuttle, oval-gated, air; its floor stays flat — banked review lives in ST6's ridge).
- **Retune only:** consider dimming two internal obstacles toward "dark alcove" treatment to keep the audio thread warm. No layout changes without playtesting.
- **Acceptance:** a player who cleared ST1–6 clears this with no new teaching; a player who skipped here (dev) visibly struggles. It should feel like a *homecoming with confidence*, not new pain.

### ST8 — 光らない部屋 / The Unlit Room

- **New:** audio as primary sense. Terrain glow near zero (`glow` ≈ 0.02, no edge glow); anchors and portal keep their hum and faint glow — **the terrain is dark, the goals hum** (never strand the player with zero signal).
- **Layout:** compact (~20×20); 3 anchors; walls form two echo-distinct chambers (dry corridor vs reverberant room — needs B3) plus one moving anchor heard, not seen (pitch-change rate).
- **Ping-mode dependency (decision ②, see [04-audio](04-audio.md) memo):** if on-demand ping exists, this stage is its tutorial (first room solvable with ambient echo, second requires deliberate pings). If periodic-only, densify ambient echo legibility instead. Design both variants on paper before building.
- **Acceptance:** the eyes-closed test passes here by construction — a tester clears the stage with the monitor off except for HUD messages. This is the Phase 1 acceptance level.

### ST9 — 狭き道 / The Narrow Way

- **New:** body orientation (Q/E) + slit colliders ([07-combat-body-plane](07-combat-body-plane.md) §1).
- **Mirror walls debut here** ([07-combat-body-plane](07-combat-body-plane.md) §2.6): the reflection's width is the diegetic body-yaw readout — and the first time the player *sees* the protagonist. Glass timbre by ear.
- **Layout:** 3 anchors behind slit gauntlets: (a) single slit, aligned = pass; (b) offset pair forcing re-rotation between; (c) the thesis slit — passable only while the scan looks elsewhere (see along one plane, pass through another).
- **Acceptance:** players demonstrably decouple body from scan by (c); distinct "flat clang" bump on failed slit entry reads clearly.

### ST10 — 回る者 / The Turner

- **New:** combat per [07-combat-body-plane](07-combat-body-plane.md): apparent-width facing reads, edge-dodge, face-cut, the matador parry.
- **Layout:** three chambers: (1) one Turner, no anchors — a safe sparring room (it can't leave); (2) anchor guarded by one Turner; (3) two Turners + gated anchor (graduation). Never >2 active.
- **Ping-mode dependency:** if pings are audible to enemies, chamber 2 teaches silence-as-resource. If periodic-only, Turners react to *proximity* instead — decide with ②.
- **Acceptance:** clearable using width+audio reads without DEV 3D; median attempt count for chamber 3 in playtest ≤ 4.

### ST11 — 地平の目 / The Horizon Eye

- **New:** the 90° roll unlock ("laying the line flat") and, with it, the game's **first full stereo** — the payoff the whole mono discipline has been buying ([04-audio](04-audio.md) §D, adopted). Full geometry-level design: [12-tilt-stages](12-tilt-stages.md) TS-G.
- **Story:** he finds one of her resting imprints — a perfect circle where she lay flat before rolling on. Standing where she lay and leaning as far as his line allows, the world tips the rest of the way: she teaches him, through a trace, before they ever meet.
- **Structure:** appetite (a slot at the uncomfortable edge of 60° reading) → the imprint unlock (scripted, leitmotif in full stereo width for the first time) → three-part exam of the new sense (one-glance ring of pillars, same-frequency two-voices door choice, an eye-height orbiting anchor tracked by pan drift).
- **Accessibility guard:** every stereo gate has a mono-audible fallback tell (the true voice carries a leitmotif note; the orbit is also readable by scan-doppler). Mono-speaker players are slower, never walled.
- **Acceptance:** unlocked testers solve the pillar ring in one glance (<10 s vs >40 s sweeping); two-voices ≥ 8/10 correct on headphones; testers name the unlock moment as a highlight unprompted.

### ST12 — 彼女の軌跡 / Her Trail

- **New (story mechanic):** trail-reading. A 2D being on edge rolls like a coin: faint curved floor decals (arcs, a spiral where she wobbled, a slot she slipped through) + her leitmotif, which gains one more note near each trace anchor.
- **Layout:** the largest space in the game, but low hostility (one optional Turner at most). 3 trace anchors = places she touched, each a mixed-skill mini-challenge (one tilted, one dark, one behind a slit — a quiet review of everything).
- **Tone:** this stage is allowed to be *easy*. Its job is emotion and momentum toward the finale.
- **Acceptance:** playtester can retell her path through the room afterward ("she rolled off that ledge, spiraled here, slipped through there").

### ST13 — 再会 / Reunion (finale)

- Short and scripted: one final door held flat by a single anchor; on clear, the reveal *doesn't end* — the one time full 3D lingers, fictionalized (she is the fifth anchor / the reason space holds).
- **The final verb is alignment (user decision 2026-07-07):** the reunion touch is coplanar, edge to edge — zero width meeting zero width, the kiss metaphor. Never a side touch (that is the attack verb). Her refusal of a side approach: a light **90° flip (ひらり)** — the parry vocabulary returned as gentleness. Full spec: [07-combat-body-plane](07-combat-body-plane.md) §5.
- **The ending (user decision 2026-07-07): they return to the painting — and the painting has gained something.** A picture that was not there at the start: a depiction of something *three-dimensional* — depth rendered in perspective, volume as a flat image. 3D itself cannot enter the painting; a *picture of it* can. The journey comes home as representation — exactly as this game is 3D beings' flat picture of being 2D. Bookends ST0: same room of the painting, one new frame on its wall. Exact copy/visual: refine with the user at build time; the structure is decided.
- Characters remain **nameless** (user decision 2026-07-07): "the man" / "the woman" — fits the spare, liturgical voice.
- **Acceptance:** total stage length ≤ 5 min; no new mechanics; credits reachable without dev tools.

## Build order (≠ story order)

1. ✅ **Level loader** (2026-07-07) + **ST1 built** (2026-07-08, `levels/level01.js` — also the annotated authoring template; ST7's room moved to `levels/level07.js`, file numbers = stage numbers).
2. ST2, ST3 (recombinations of existing mechanics — cheap wins; ST2's banked corridor needs the A8 groundRoll plumbing).
3. ST4, ST5 (existing tech + TS-A's grain system, new layouts).
4. ST6 (TS-H — groundRoll + grain, both already built by now).
5. ST7 retune pass.
6. ST8 after audio B3 + ping decision ② with user.
7. ST9 (Phase 2 tech), then ST10 (Phase 3 tech).
8. ST0 anytime after the loader (self-contained render mode; do it when a break from systems work is welcome).
9. ST11 after ③ stereo (done) + the roll-unlock plumbing; it needs no combat, so it can be built in parallel with ST10.
10. ST12–13 last, with the user, once the story tone is settled.

## Difficulty & pacing guardrails

- Stage-over-stage new-element count: exactly 1 (ST0/7/13 = 0). If a design needs two new things, split or cut one.
- Every stage after ST3 should keep the audio thread warm (at least one dark pocket or echo-relevant beat) so ST7 is a step, not a cliff.
- No stage may require reflexes under ~0.4 s (combat cap from [07-combat-body-plane](07-combat-body-plane.md)) or memory beyond one panorama width without a landmark ([08-level-design](08-level-design.md)).
- Playtest question for the whole campaign: "which stage would you cut?" If any stage gets named twice by testers, cut or merge it — the user explicitly prefers short over stretched.
