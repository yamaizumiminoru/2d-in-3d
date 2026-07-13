# 13 — Storytelling (words last)

> **Status: ADOPTED by the user 2026-07-08** (「ストーリーテリングはそんな感じでいきましょう」). The emblem grammar, 影絵 vignettes, reveal-glimpse, and words policy below are decisions, not proposals.

User constraints (2026-07-07): no long verbal exposition; the first-person protagonist never speaks; between stages, simple stills or realtime-rendered shorts are welcome. This document is the storytelling system.

## Principles

1. **Geometry carries emotion.** The game already speaks in planes: transversal = violence, parallel = loneliness, coplanar = love ([07-combat-body-plane](07-combat-body-plane.md) §5). Narrative devices must speak the same language — if a beat can be told with lines and angles, it must not be told with words.
2. **Zero dialogue, zero monologue, zero VO.** The only words in the game are the existing one-line system liturgy ("The echo line finds depth.") — the *world's* voice, never his — plus stage number/name on transition cards.
3. **His memories are pictures.** Between-stage vignettes are **flat** — shadow-theater (影絵) silhouettes in the emissive palette on near-black. Never full-3D cutscenes: 3D stays costly ([AGENTS.md](../AGENTS.md) one rule), and a 2D being's memory is natively a picture. Realtime canvas-2D, not video files.
4. **One new fact per vignette, no text inside, 2–6 s, any input skips, only on first clear** (never inside a retry loop).
5. **Perception is the narrator.** The strongest beats are delivered through the player's own senses: the reveal, the mirror, the stereo field, the leitmotif — story you *perceive*, not story you are told.

## The two-line emblem (title-card grammar)

Every stage transition card = stage number + name + a ~2 s animated **emblem**: two marks on black — **him: a vertical stroke** (portrait plane edge-on), **her: a circle** (a coin that rolls; edge-on, a line). The emblem states retell the whole story with no words; by ST13 the player reads the grammar fluently:

| After stage | Emblem |
| --- | --- |
| 0 | two marks side by side inside a rectangle (the frame); the rectangle shakes and tears; her circle rolls out |
| 1 | his stroke alone on black; a thin sweep of light passes over it (he learns to see) |
| 2 | far off, tiny: her circle still rolling away |
| 3 | his stroke beside a fading dotted arc — her trail, found |
| 4 | his stroke *leans*, holds, straightens (tilt learned) |
| 5 | his stroke leaps a gap in the ground-line |
| 6 | the ground-line tilts under him; his stroke stays true vertical (counter) |
| 7 | his stroke steady amid five colored points (the hall, mastered) |
| 8 | black; concentric rings pulse around his stroke (he learns to ask) |
| 9 | his stroke slips through a break in a wall-line; a mirror doubles him for one beat |
| 10 | a wide low stroke charges his; his turns edge-on; the wide one passes through nothing |
| 11 | his stroke lies down and becomes the horizon; the field opens L→R (the card's leitmotif is the game's first full-stereo emblem) |
| 12 | her trail-arcs spiral inward; the two marks near each other — parallel |
| 13 | parallel → aligned → **one line** (coplanar); then the rectangle of the frame redraws around them |

Production: one small canvas-2D helper (`flat theater`): each emblem is a draw function of `t ∈ [0,1]`; ~40 lines each; palette from `COLORS`.

## Between-stage vignettes (影絵 — only where a fact lands)

Same flat-theater system, richer scenes. Not every stage gets one — scarcity keeps them precious:

| Slot | Fact conveyed (silently) |
| --- | --- |
| ST0 ending (in-stage) | the fall itself: frame tears, she rolls out, he leaps after — the game's inciting motion, playable/scripted rather than cut |
| after ST3 | recognition: her roll-line crosses the silhouette of *the room the player just cleared* — she was here |
| after ST5 | peril: her arc drops off a ledge-line and bounces on — she can fall |
| after ST7 | threat: a wide low silhouette (Turner shape) turns toward her dotted trail — the beasts hunt by trails too |
| after ST10 | hope: her trail passes *through a slit* the wide silhouettes cannot follow — why they lost her, and why he (who learned slits in ST9) can |
| after ST11 | grace: mid-roll, her circle pauses — and tilts, for one beat, toward the viewer. She felt something. The leitmotif plays at full stereo width — the only vignette with music |
| before ST13 | **nothing** — no vignette between the last stage and the reunion; hunger unbroken |

## In-stage devices (no cutscene needed)

- **The memory unlock (ADOPTED 2026-07-13, implemented in ST1):** afterimage is a learned skill. ST1 plays raw — only the living line; sound finds the first anchor; each reveal flash is the only map; the win grants memory ("…and the world begins to remain"). The player experiences the *birth of memory* — the game's biggest power-up is perception itself, and it arrives without a single word of tutorial.

- **Trail decals + leitmotif notes** — specced for ST12; sprinkle *sparingly* from ST3 (one arc per few stages, uncommented).
- **The reveal-glimpse (new, recommended):** from ST9 on, during exactly one anchor reveal per stage, **she is visible in the far distance** — a tiny portrait plane, gone when perception collapses back. Closer every stage. The player learns to *spend their glimpse looking for her* — story delivered through the game's most expensive resource, 0.28 s of sight. Implementation: a scripted plane present only while `revealTimer > 0` on the stage's designated anchor.
- **Mirrors:** ST12's one-beat crossing reflection ([07-combat-body-plane](07-combat-body-plane.md) §2.6).
- **Frame shards (optional meta-picture):** each stage's found shard adds one stroke to a slowly self-completing flat picture (shown on the title/level-select screen); by the end it is the painting's frame, rebuilt. Decide with the user when a menu exists.
- **The ending:** zero words. The regained painting simply *contains one new picture* — something with perspective in it ([10-campaign](10-campaign.md) ST13). The last sentence of the game is an image.

## The title as the arc (implemented 2026-07-08)

The start card's word **COPLANAR** is split into per-letter spans. At rest the letters are coplanar (flat, readable). On start (`begin()` → `setTitleCoplanar(false)`) each letter rotates to a distinct 3D angle — *coplanarity breaks* as the flat beings are thrown into volume, playing out as the veil fades. On the win, after ~3.2 s, the card fades back (`showEndTitle()`) with the letters realigned to coplanar and the subtitle changed to the ending line — the reunion, told by the title itself. This is the emblem grammar (below) in its smallest, already-shipped form; the eventual ST13 emblem should rhyme with it. Tunables: the scatter angles in `buildTitle()`, the CSS `.title-letter` transition, the veil `opacity` transition.

## Production notes

- One overlay canvas (reuse the veil's positioning/styling); draw functions receive `t` and the `COLORS` palette; skip on `keydown`/`pointerdown`; emblem ≈ 2 s, vignette ≤ 6 s.
- Vignettes are **data + tiny draw code per scene**, versioned in `prototype/story/` when built (Phase 4).
- Test rule: show any vignette to someone who hasn't played — they should be able to say what happened in one sentence. If they can't, redraw; never add words.
