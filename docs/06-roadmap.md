# 06 — Roadmap

Phased plan from current prototype to a finished game. Phases are ordered by dependency and by the user's stated priorities. Each phase is shippable on its own; **do not start a phase before its predecessor's acceptance criteria pass** (exception: Phase 0 items can be interleaved anywhere).

Confirmed user priorities: (1) audio that the player genuinely needs, (2) movement/scan coupling if analog input arrives, (3) enemies/combat that are slow and orientation-based, not reflex-based, (4) body-plane mechanics, (5) story framing. Full 3D must stay costly/dev-only throughout.

## Phase 0 — Hardening (small, interleave anytime)

| Task | Status | Detail | Files |
| --- | --- | --- | --- |
| Vendor Three.js | ✅ 2026-07-07 | `prototype/third_party/three/three.module.js`, import map updated; runs offline | `index.html` |
| Frame-rate independence | ✅ 2026-07-07 | `updateWorldAnimation` and pickup/portal rotations now `dt`-scaled | `script.js` |
| Paused game clock | ✅ 2026-07-07 | `game.time` accumulates only when not `inputLocked()`; drives pickups/portal/markers | `script.js` `loop()` |
| Master compressor | ✅ 2026-07-07 | limiter after `masterGain` (now 0.9) | `script.js` audio |
| End screen | ⬜ open | On win, after ~3 s fade to a minimal "found her? not yet…" card with restart (fictional copy TBD with user) | both |

**Acceptance**: game plays identically at 60/120/144 Hz; works with network unplugged; no audible clipping when chime+ping overlap; moving anchors resume smoothly after a reveal. (Automated full playthrough passed 2026-07-07; high-refresh and by-ear checks still pending a human.)

*Do-not-fix list (intentional):* dual yaw conventions (document-only unless carefully migrated), panorama scale ≠ physical strip scale, `resize()` clearing afterimages.

## Phase 1 — Echolocation v2 + the first audio-forced level

The game's biggest known gap: sound exists but isn't needed. **§B1–B2 (echo delays + 3-ray scan-differential) landed 2026-07-07** — see [04-audio](04-audio.md) status note; the user has not yet played/tuned it by ear, so treat the echo constants as first-draft. Remaining: user listening pass (incl. periodic vs on-demand ping decision), §B3 room reverb, then one new level that *requires* audio (see [08-level-design](08-level-design.md) "dark room" pattern). This phase probably needs the level-loading refactor:

- ✅ **Loader shipped 2026-07-07:** `prototype/levels/level01.js` (plain-data module: playerStart, bounds, walls, columns, markers, pickups, frameShard, portal) consumed by `addWorld(level)`; `?level=N` URL param with fallback to 01; verified by playthrough. New levels = new data files, zero engine changes for ST1–7-class content.

**Acceptance**: eyes-closed test from 04-audio passes; a playtester (the user) completes the dark-room level using sound; the original room still plays unchanged as level 1; stereo panning only via the ③ tilt law ([04-audio](04-audio.md) §D — mono at vertical scan).

## Phase 2 — Body plane & narrow gaps

Split *scan orientation* from *body orientation* per [07-combat-body-plane](07-combat-body-plane.md). Deliverables: body yaw state + control (proposal: `Q`/`E` snap ±45°), body-plane visual language in the strip, slit colliders that pass only when body alignment fits, one gauntlet level teaching it.

**Acceptance**: player can pass a slit only when aligned; can *see along* one plane while *occupying* another (the doc's "interesting later-state"); tilt (scanRoll) and body yaw remain visibly distinct mechanics.

## Phase 3 — Enemies & combat

Slow, readable, orientation-based combat per [07-combat-body-plane](07-combat-body-plane.md): 2D plane enemies whose apparent width in the scan reveals facing; edge/face attack rules; the turn-your-plane parry; audio signatures from [04-audio](04-audio.md) §B4. Start with one enemy type (the "Turner") in one arena level.

**Acceptance**: a player who has finished Phases 1–2 content can defeat the Turner using scan + audio reading, without DEV 3D; combat readable at ≤ 2 simultaneous enemies; no reflex windows shorter than ~0.4 s.

## Phase 4 — Story shell & progression

- **The concrete stage list is now specced: [10-campaign](10-campaign.md)** (stage-clear format confirmed by the user 2026-07-07; 14 stages ST0–ST13 with per-stage specs, build order, and cut candidates — ST11 "The Horizon Eye" added with the ③ stereo adoption, ST6 "The Leaning Fields" with the A8 banked-ground adoption). ST1–ST6 need only current tech + the Phase 1 level loader, so campaign construction can start before Phases 2–3 are done.
- Intro: the painting (ST0 — a genuinely 2D scene — the mental canvas showing a *complete* image for once, which will feel shockingly luxurious), the quake, the fall. Mostly staging + text, minimal new tech.
- The woman's leitmotif: a recurring chime interval that grows more complete as the player closes in — pure audio storytelling, fits the fiction.
- Menu/title, save (localStorage: highest level + settings), settings (volume, mouse sensitivity, focus toggle-vs-hold).

**Acceptance**: full run start-to-credits without dev tools; a first-time player understands the story without external explanation.

## Phase 5 — Polish & release

Performance pass (the hidden renderer is tiny — likely fine; profile the 2D canvas ops), accessibility pass (photosensitivity check on strip flashes; remappable keys), gamepad support (**this is where "sync movement speed and panning speed" lands** — analog stick movement should scale pan speed per the user's note), itch.io/web packaging (needs Phase 0 vendoring), title/credits copy.

## Standing rules for every phase

- Never violate the Hard Constraints in [`AGENTS.md`](../AGENTS.md).
- New tunables = named `const`s. New systems = new ES modules once `script.js` passes ~1500 lines (split guidance in [02-architecture](02-architecture.md)).
- Update the relevant `docs/` file in the same change; the docs are part of the product.
- When a design fork is genuinely ambiguous (e.g. ping-on-demand vs periodic ping), build the cheap version behind a constant and ask the user — they decide quickly and prefer seeing it playable.
