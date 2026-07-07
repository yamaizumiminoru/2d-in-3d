# 01 — Vision & Fiction

## Elevator pitch

A man and a woman live inside a painting. An earthquake shakes it; the woman falls out and rolls away into the 3D world. The man jumps out after her. He is a two-dimensional being — zero thickness, a plane — and he must search a quake-scattered 3D room with a 2D body and a 2D sensorium.

The game does not give him 3D vision. He perceives the world through:

- **One moving scan line** — a near-1D vertical slice of live 3D view (about 0.14° of arc).
- **Afterimages** — a fading panorama assembled from where the scan line has been.
- **Echo-like sound** — self-emitted pings and modulated tones, with no left/right hearing.

The pleasure is *learning to read space*. Not fighting the interface — mastering it, the way a dolphin masters clicks or a blind person masters a cane.

## The inversion (why this is new)

Games have explored dimension-play before. Knowing the prior art keeps future work from accidentally converging into an existing genre:

| Prior work | What it does | How Sliceborne differs |
| --- | --- | --- |
| *Flatland* (novel, 1884) | 2D being visited by a 3D sphere; describes the concept | Sliceborne is the playable version of the *Flatlander in Spaceland* chapter — the part no game has made playable |
| *FEZ* | 3D world viewed as 2D projections; player rotates the projection | The world is presented in clean 2D at all times; perception is never scarce |
| *Miegakure* (unreleased) | 3D being slicing through 4D space | Same trick one dimension up, and the slice is rendered as full comfortable 3D |
| *Perspective*, *Monument Valley* | Projection/perspective puzzles | Perception itself is not the limited resource |
| *Perception*, *Lurking*, *Devil's Tuning Fork*, *Blind* | Echolocation rendered as visual point clouds / outlines | Sound becomes sight — a radar. Sliceborne deliberately refuses the radar; sound stays sound |

Sliceborne's specific combination — *a 2D-native being with a 1D live slice, temporal afterimage memory, and non-binaural echo hearing, navigating real 3D space* — has, to the best of our knowledge, no direct precedent. Treat that combination as the crown jewels. Every feature should deepen it; no feature should dilute it.

## Design pillars

1. **Read, don't see.** The player reconstructs space in their head. The screen shows evidence, not answers. *Violation example:* any persistent top-down map, radar, or scope. (One was built and removed; players stared at the meter instead of the world.)
2. **Incompleteness is the content.** Frustration at first contact is expected; the difficulty curve is perceptual literacy, not reflexes. *Violation example:* widening the live strip until it is effectively a normal camera.
3. **Sound is self-made, and direction is earned.** The being pings and listens to its own reflections, like a dolphin. Its only "ears" are the two ends of its 1D line: with a vertical scan they are stacked (mono); tilting the scan gives the ends real left/right separation, so stereo pan exists *only* in proportion to the tilt (`|sin(scanRoll)|·sin(relYaw)` — decision ③, adopted 2026-07-07). Direction is earned by scanning (pitch shifts) or by leaning (stereo emerges). *Violation example:* any panning while the scan is vertical, or panning a self-sound.
4. **The third dimension is expensive.** Full 3D exists in the fiction only as a sacrifice: the anchor reveal trades *the time dimension* (input and game time freeze) for one extra spatial dimension, for 0.28 seconds. Keep 3D costly, brief, or developer-only.
5. **Fiction-consistent effects.** Every perceptual effect should be explainable inside the fiction or explicitly flagged as a dev artifact. The user actively audits this.
6. **Playable over conceptual.** The prototype must always start, play, and win. A beautiful unplayable idea is a regression.

## The fiction, in detail

- **The painting**: a flat, stable, complete 2D world. Home. (Future intro level / framing device.)
- **The earthquake**: the inciting incident. It scattered the room the painting hangs in — hence the ruined, blocky, high-contrast landscape of the prototype.
- **The woman**: the goal of the whole game. She rolled away — a 2D being on edge rolls like a coin. Late-game trail-of-evidence potential: arcs, spirals, slots she could have slipped through.
- **The man (player)**: zero-thickness plane, human-proportioned — a *portrait* plane, tall and narrow (as is she). His *scan* is the line where his body-plane intersects what he attends to; his *body* is the plane he physically occupies. These are the same thing early, and diverge later (see [07-combat-body-plane](07-combat-body-plane.md)). The ruin's beasts, by contrast, are *landscape* planes — wide and low, quadrupeds — so the scan reads species from aspect ratio alone.
- **The reunion**: side contact is the combat verb (passing through a plane cuts it), so the ending touch is different in kind — the two planes align **coplanar** and touch **edge to edge**: zero width meeting zero width, the kiss. Two planes can only ever be transversal (the cut), parallel (the miss), or coplanar (the union) — the game's three relationships, from linear algebra ([07-combat-body-plane](07-combat-body-plane.md) §5).
- **Anchors**: points where flat space still "holds" inside the 3D room. Stabilizing all five un-flattens the door (portal). The current win message: *"The flat traveler crosses the third axis."*
- **The reveal**: at the instant an anchor stabilizes, the man borrows the time axis to glimpse volume — everything freezes, he sees, then time resumes and sight collapses back to the line.

## Story decisions (user, 2026-07-07)

- **The ending:** they return to the painting — and the painting has gained a picture that was not there before: something three-dimensional, rendered flat (perspective — depth as image). 3D cannot enter their world; a *picture* of it can. The game closes on the same symmetry it opened with: we, 3D beings, played a flat picture of being 2D; they, 2D beings, hang a flat picture of having been 3D.
- **Names:** the man and the woman stay **nameless** (for now, and probably forever — it fits the voice).
- **Her refusal (ST13):** approached from the side, she flips her plane 90° — ひらり — the parry made gentle. See [07-combat-body-plane](07-combat-body-plane.md) §5.

## Title (decision memo ⑥ — OPEN)

"Sliceborne" was an arbitrary Codex coinage; the user is not attached and leans descriptive ("2D's adventure in 3D"-like). Recommendation: **poetic main title + descriptive subtitle** (the subtitle does the store-page work). Candidates, in rough order of recommendation:

| Candidate | Why | Risk |
| --- | --- | --- |
| **Out of Frame** — *a 2D adventure in 3D* | the whole story in three words: born in a frame, leaves it, returns to it; pairs with the frame-shard compass and the ending's new picture | somewhat common phrase |
| **Coplanar** — *a 2D adventure in 3D* | the ending as the title (love = sharing a plane); uniquely ours | opaque before playing |
| **The Flat Traveler** | already in the win message; warm, storybook | mild |
| **One-Line Eye** | the HUD's boot text; names the perception hook | cryptic |
| Keep **Sliceborne** | ownable, established in code/docs | no story resonance; Codex-arbitrary |

Decision recorded: ☐ — date/notes: ____ (renaming touches `index.html` title/H1, HUD brand, README, repo description; grep `SLICEBORNE|Sliceborne`).

## Tone and aesthetic

- Darkness punctuated by high-contrast emissive color (afterimages must survive fading; see the `COLORS` palette).
- Monospace, instrument-panel UI. The HUD reads like a cockpit, minimal and non-authoritative — and it speaks in **1D marks**: tallies, fill-bars, ribbons; measurements never as numerals (a 1D being's notation — see [05-gameplay](05-gameplay.md) memo ⑤).
- Text is spare and slightly liturgical: "The echo line finds depth." "The ruin is legible only while it moves."
- Sound design language is onomatopoeic and game-legible rather than physically exact: near = sharp *kin*, far = dull *bon*.

## Glossary (use these words consistently in code, docs, and messages)

| Term | Meaning |
| --- | --- |
| **Scan line / strip** | The live vertical sliver of rendered 3D at screen center |
| **Afterimage / panorama** | The decaying accumulation of past strips, shifted opposite to scan turn |
| **Scan yaw** | `player.yaw` — where the scan points on the horizontal plane |
| **Scan roll / tilt** | `player.scanRoll` — rotation of the scan line off vertical (±60°) |
| **Body plane** | (Future) the plane the player physically occupies; distinct from scan |
| **Anchor** | A collectible stabilization point (`pickups` in code); five per level, sequential |
| **Gate / gated anchor** | An anchor that must be entered from its lit side (`approachYaw`) |
| **Beacon** | Anything that emits a continuous audio tone (active anchor, open portal) |
| **Self-ping** | The player's own emitted click (`playSelfPing`), the root of the echo fiction |
| **Reveal** | The 0.28 s full-3D flash after collecting an anchor; input locked |
| **DEV 3D** | Developer full-3D view (`3` key); debug aid only |
| **Portal / door** | The bright green ring — level exit, opens after all anchors |
