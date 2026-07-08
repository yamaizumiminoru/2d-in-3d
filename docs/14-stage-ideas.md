# 14 — Per-Stage Idea Pass (各ステージの細かいアイデア)

Requested by the user 2026-07-08. For every stage: **(a)** palette/atmosphere (feeds the level-data `palette` field — floor / floorEmissive / floorGlow / grid1 / grid2), **(b)** concrete set-piece ideas beyond the existing specs, **(c)** audio identity, **(d)** the stage's one memorable moment, **(e)** emblem/vignette hooks. Consistent with [10-campaign](10-campaign.md), [12-tilt-stages](12-tilt-stages.md), [13-storytelling](13-storytelling.md). Items needing a user decision are marked ☐. No-padding rule and the ≤0.4 s reflex cap apply throughout.

**The palette arc in one line:** warm home (ST0) → cold cyan void (ST1) → one accent color per skill stage → the reference palette (ST7) → colorless dark (ST8) → glass (ST9) → danger red (ST10) → her magenta rising (ST11–12) → warm home again (ST13). Atmosphere retells the story even if you never read a vignette.

---

## ST0 絵の中 / In the Painting

- **(a)** The only warm stage: cream ground, ochre/rose flats, lamplight glow. Not the level system — a flat canvas scene.
- **(b)** ① Household objects as naive flat icons (table, two chairs, a window whose "outside" is itself a painted, never-changing sky — a picture inside a picture, planting the ending's logic). ② She rolls alongside as you walk — playful synchronized orbit; love as motion, no words. ③ **The frame is touchable at both ends of the world, and it hums with the wooden timbre** — the exact sound of the compass shards. The player learns "the sound of home" before ever needing it. ④ The quake: `renderRoll` lurch, objects sliding, the frame cracking; she rolls past and out through the torn right edge.
- **(c)** Warm major drone; her leitmotif complete and warm; the wood-hum of the frame; **no ping** — at home he has whole sight and needs no echo. (Retroactively, the pings of ST1+ mean exile.)
- **(d)** Touching the frame and hearing the hum you will spend the whole game seeking.
- **(e)** ST0's ending *is* the fall vignette; emblem: two marks in a rectangle, torn.

## ST1 目覚めの間 / The Waking Room

> **Built 2026-07-08 as `prototype/levels/level01.js`** — the campaign's first playable stage and the annotated authoring template other agents copy. Ideas ① and ③ below are pending content passes (breadcrumb decor, hum-before-heartbeat scripting).

- **(a)** Near-monochrome cold cyan; canonical bright floor at its palest; sparse grid. Emotionally the darkest palette — waking in nothing.
- **(b)** ① Anchor 1's hum starts *before* the first heartbeat ping — you walk toward sound before you understand sight. ② A stretch of pure darkness that reads as a wall but answers "empty" by echo — the first lesson that black ≠ solid. ③ One landmark contains a **broken frame corner** embedded in a wall (decorative wood — story breadcrumb, non-collectible). ④ The portal dimly visible from spawn: goal grammar taught by sight, not text.
- **(c)** The emptiest soundscape in the game: heartbeat + one hum + bump. Every later stage is richer — ST1 is the baseline the ear will measure everything against.
- **(d)** The first reveal: 0.28 s of the whole room, then back to the line. The thesis in one blink.
- **(e)** Emblem: his stroke alone; a sweep of light passes over it.

## ST2 面と門 / Faces and Gates

- **(a)** Amber-dominant (gate color); floor a touch warmer.
- **(b)** ① First gate's green entry line faces *away* from the approach corridor — you meet the closed face first and must circle. ② The same gate silhouette appears twice with opposite facings — "same shape, different face" discrimination. ③ The rung-0 **banked corridor** (18° slab): the world leans you and the hum drifts sideways with zero input. ④ A gate-shaped alcove that is *not* a gate (no entry line) — face-reading includes knowing when there is no face.
- **(c)** ☐ Gate occlusion timbre: hum slightly muffled when heard from the closed side (small code; makes facing *audible*). Recommend yes — it foreshadows enemy-facing audio.
- **(d)** The first wrong-side bounce → "This anchor has a face."
- **(e)** Emblem: her circle far and tiny, still rolling away.

## ST3 拍を読む / Reading the Pulse

- **(a)** Magenta accents on neutral ground; grid slightly denser (rhythm made visible).
- **(b)** ① A shuttle anchor crossing behind a doorway — visible only in the opening's window; phase = when you can *see*. ② Two shuttles at a 2:3 period ratio near each other — a polyrhythm room readable by ear before eye. ③ The dark alcove anchor (first audio-forced taste). ④ **Her first trail arc** on the floor near the exit, uncommented; the post-stage vignette then shows her line crossing this room's silhouette — the decal you maybe ignored becomes recognition.
- **(c)** The stage hums in meter: shuttle doppler makes two-tone pulses; the player's own heartbeat ping sits inside the polyrhythm.
- **(d)** Standing still and letting the anchor come to you — waiting as a learned skill.
- **(e)** Vignette after: recognition (her line through this room).

## ST4 傾いだ廃墟 / The Tilted Ruin (TS-A)

- **(a)** Broken blues + violet, dimmer floor (dusk), sparse grid — the first palette that feels *wrong on purpose*.
- **(b)** Beyond TS-A's slot/beam/grain: ① the reset-teaching doorway framed by the stage's only two strictly vertical light seams — relief through composition. ② A "grain garden": three small marker boxes leaning 20°/40°/60° near the grain anchor — a tilt scale you calibrate against. ③ A trail arc *under* the fallen beam — did she pass before it fell, or after? Ambiguity is allowed.
- **(c)** Wood creaks when tilted geometry is scanned at matched angle (grain resonance made audible — first use of material timbre on terrain).
- **(d)** The first grain-lock: the floor ring filling while you hold the angle.
- **(e)** Emblem: his stroke leans, holds, straightens.

## ST5 跳ぶ線 / The Leaping Line (TS-B)

- **(a)** Green accents; floor at its brightest (landing reads must be crisp).
- **(b)** Beyond TS-B's ruler/shelves/well: ① the height-ruler column doubles as the stage's tallest landmark, visible everywhere. ② A trail arc that **ends at a ledge** — she dropped here (the post-stage vignette shows the fall-and-bounce). ③ ☐ An air anchor bobbing in antiphase to a natural jump rhythm — read-then-time challenge (may be too cruel for ST5; if cut, reuse in ST7's retune).
- **(c)** ☐ Heartbeat pauses while airborne — breath held in the leap (tiny code, big feel; verify it doesn't starve echo info). Landing gets a soft thud.
- **(d)** Already in the engine, now made deliberate: **catching an air anchor mid-jump freezes you at the apex** — the reveal fires while you hang in the air, seeing everything, then the fall resumes. Place one anchor so this happens over the room's best view.
- **(e)** Emblem: his stroke leaps a gap in the ground-line.

## ST6 傾いだ大地 / The Leaning Fields (TS-H)

- **(a)** Ochre/rust earth — the epicenter's torn ground; warm gray floor; grid broken (grid2 near-invisible).
- **(b)** Beyond TS-H: ① the find-true-ground outcrop is a **fallen door** lying flat (knob detail) — doors recur all game as portals; here lies a dead one. ② Her wobble arcs cross the ridge *diagonally* — she crossed the leaning world without any tilt input; the player realizes she is better at this than he is. ③ ☐ Rare audio-only "aftershocks": a low rumble + ±3° momentary renderRoll sway (comfort-sensitive — playtest first, cut without mercy if anyone feels sick).
- **(c)** Deep ground tones; each bank has a faint pitch offset so leaning is *heard* as detune (the ③ stereo law already lateralizes hums on banks — this adds pitch as confirmation).
- **(d)** H3's leap: from rocking ground into the perfectly level stillness of the air.
- **(e)** Emblem: the ground-line tilts under his stroke; he stays true vertical.

## ST7 崩れた広間 / The Scattered Hall (midterm — the existing room)

- **(a)** **The canonical palette, untouched.** Every other stage is a variation around this reference; keep it pure so the campaign has a tonal center.
- **(b)** Retune only (per campaign): dim two obstacles toward dark-alcove treatment; keep the frame shard at the SE corner. If ST5's antiphase-bob anchor was cut, it can live here as the midterm's hardest read.
- **(c)** The full ensemble as-is — the midterm is also the audio midterm.
- **(d)** Five segments lit, the door un-flattening — the prototype's original magic, preserved.
- **(e)** Vignette after: the Turner silhouette turning toward her trail (threat enters).

## ST8 光らない部屋 / The Unlit Room (TS-C)

- **(a)** **The palette-system payoff: `palette` sets even the floor dark** (`floor` ≈ 0x0b0f10, `floorGlow` ≈ 0.05, grid near-black). The brightness of every other stage becomes meaningful by its absence here. The one stage that is truly for the ears.
- **(b)** Beyond TS-C's lintels/two-voices: ① chamber 1 is a single hum in total dark — pure echo navigation. ② **One "light shaft"** mid-stage: a small bright floor patch, the only visible thing in the level — oasis, landmark, and emotional beat in one. ③ The frame-shard hunt as this stage's purest beat (campaign rule). ④ Reverb (B3) makes the two alcoves ear-distinguishable.
- **(c)** The richest soundscape: reverb tails, lintel *bons*, the wooden shard hum, the leitmotif note behind the true voice. Mix carefully — this stage is the audio thesis.
- **(d)** Reaching the light shaft after minutes of ears-only — seeing as *reward*.
- **(e)** Emblem: black; concentric rings pulse around his stroke.

## ST9 狭き道 / The Narrow Way (TS-D + mirrors)

- **(a)** Violet + pale glass-blue (mirror edges introduce the glass color).
- **(b)** ① The scripted **first mirror**: a calm dead-end where the player first sees the protagonist — a tall portrait stroke that narrows as they turn (sandbox, zero pressure; most players will play with it for a minute — let them). ② The slit gauntlet a/b/c per TS-D (grain-glinting seam → offset pair → pass-while-looking-elsewhere). ③ A mirror corridor where the reflection walks with you — establishing "reflection = truth" before ST12 uses it for her.
- **(c)** Glass timbre for mirrors (findable by ear); the "flat clang" of a failed slit; body-rotation gets a soft page-turn whisper.
- **(d)** "I really am flat" — the first mirror.
- **(e)** Emblem: his stroke slips through a break in a wall-line; a mirror doubles him for one beat.

## ST10 回る者 / The Turner (TS-E)

- **(a)** Danger red enters the palette; floor pale (enemy silhouettes must read instantly).
- **(b)** Beyond TS-E's three chambers: ① the dojo contains a **dead Turner husk** — a flat plane on the floor, safe to study: topple-state anatomy shown as a corpse before you meet a living one. ② The herding slit wall carries claw marks (they slam often — environmental storytelling). ③ ☐ **Paper death**: a cut Turner splits into two half-planes that flutter down like paper (two tumbling plane meshes — cheap, and the most 2D death imaginable).
- **(c)** Tremolo = alert; pitch-change rate = charge; death = a tearing-paper *kin*. The stealth chamber makes the focused ping's cost audible: silence, then your own question betrays you.
- **(d)** The first true parry: the charge passes through your edge — a beat of silence where you should have died — then your counter.
- **(e)** Emblem: a wide low stroke charges his; his turns edge-on; the wide one passes through nothing.

## ST11 地平の目 / The Horizon Eye (TS-G)

- **(a)** Magenta rising (her color nearing). ☐ Post-unlock, the floor could brighten a step — the world literally opens with the new sense (palette swap mid-stage; small code).
- **(b)** Beyond TS-G's acts: ① the imprint chamber's walls carry small flat pictures (frame fragments arranged like a gallery — the room where she rested is a little museum of home). ② The borrowed-horizon slab in act 1 positioned so the *first* thing full-tilt reveals is her imprint chamber's doorway — the taste points at the gift.
- **(c)** Pre-unlock: mono discipline at its strictest. The unlock: the leitmotif's first full-stereo sweep L→R→C. After: every hum carries width when you lie the line down — mixing must make the difference *felt*.
- **(d)** The unlock itself — she teaches him through a trace, and the world gains a horizon.
- **(e)** Emblem: his stroke lies down and becomes the horizon (the card's audio is the game's first full-stereo emblem).

## ST12 彼女の軌跡 / Her Trail (TS-F)

- **(a)** The warmest palette since ST0 — magenta + soft rose; the world softens as he closes in.
- **(b)** Beyond TS-F's arc/S-curve/spiral: ① the mirror crossing (her portrait passes a distant mirror once — gone when you turn). ② ☐ The optional lone Turner here is **not hostile** — it circles her trail, confused, having lost her; it can be avoided entirely and killing it gives nothing (mercy as characterization). ③ The spiral's center is another imprint circle — stand in it and the leitmotif plays its fullest form; no unlock this time, only feeling. ④ The lying-flat-loses-the-trail beat (the 90° dial-not-upgrade lesson).
- **(c)** Her leitmotif is the stage's spine: notes join per trace, placed left/right along the spiral's turn (post-unlock stereo makes the dance audible circling you).
- **(d)** The spiral: walking her wobble with your own lean while the music assembles itself.
- **(e)** Emblem: her trail-arcs converge; the two marks near — parallel. Vignette after ST11 (she pauses mid-roll) has already landed; **no vignette after ST12** — straight into the finale.

## ST13 再会 / Reunion

- **(a)** ST0's warm palette **returns** in the final chamber — home's colors bleeding into the 3D world as you near her.
- **(b)** ① One final anchor, one final door. ② She is present as a portrait plane; face her broadside → ひらり, the 90° flip refusal; align coplanar → approach along the shared plane → edges touch. ③ The two coplanar planes pass the flat door together. ④ Final image, zero words: the ST0 room again, **one new frame on the wall — a perspective drawing of the Scattered Hall** ☐ (the room players know best, now hanging flat at home; confirm the picture's subject with the user).
- **(c)** **On the edge-touch: total silence for one second** — the game's first true silence (no heartbeat, no hum) — then the leitmotif returns as a **duet**, his line added beneath hers. The kiss is scored by absence.
- **(d)** The silence.
- **(e)** Emblem: parallel → aligned → one line → the frame redraws around them. Campaign's last card.

---

## Per-stage `palette` quick sheet (starting values, tune by eye)

| ST | floor | floorEmissive | glow | grid feel |
| --- | --- | --- | --- | --- |
| 1 | 0xaebfc2 | 0x9fb3b6 | 0.5 | sparse, cold |
| 2 | 0xb3aa9a | 0xa89e8d | 0.5 | neutral |
| 3 | 0xb0a8b4 | 0xa39aa8 | 0.5 | denser |
| 4 | 0x8e9bb0 | 0x7f8da3 | 0.4 | sparse |
| 5 | 0xa9bfae | 0x9ab3a0 | 0.55 | crisp |
| 6 | 0xb5a48e | 0xa8957e | 0.45 | broken |
| 7 | 0x9db4b8 (canonical) | 0x8fa7ab | 0.5 | reference |
| 8 | 0x0b0f10 | 0x0b0f10 | 0.05 | near-none |
| 9 | 0xa5a3bd | 0x9694b0 | 0.5 | fine |
| 10 | 0xbcaeae | 0xb09f9f | 0.55 | wide |
| 11 | 0xb3a3b8 | 0xa694ab | 0.5→0.6 ☐ | opens |
| 12 | 0xc2aab5 | 0xb69aa8 | 0.55 | soft |
| 13 | warm (ST0 family) | — | — | none |

## Open checkboxes (user decisions collected from above)

☐ ST2 gate occlusion timbre ・ ☐ ST5 antiphase-bob anchor (or move to ST7) ・ ☐ ST5 heartbeat pause while airborne ・ ☐ ST6 audio-only aftershocks (comfort test first) ・ ☐ ST10 paper death ・ ☐ ST11 mid-stage floor brighten on unlock ・ ☐ ST12 non-hostile lost Turner ・ ☐ ST13 the new picture's subject = the Scattered Hall?
