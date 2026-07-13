# 04 — Audio Spec

Two parts: (A) exact spec of what exists, (B) the Echolocation v2 plan — the highest-priority unbuilt system. The known gap: **the prototype is currently solvable without sound.** Future levels must make audio genuinely necessary without turning it into a radar.

## Audio layers arrive one at a time (user call, 2026-07-13)

Hum + echo presented together is **polyphony** — following two simultaneous streams is a trained skill most players don't have. So the layers are introduced stage by stage: **ST1 = the anchor hum alone** (`level.silentPings` mutes self-pings/echoes entirely; wall bump stays — it is event feedback, not a stream), **ST2 on = the heartbeat echo joins** ("the world begins to answer"), the **focused ping is taught in ST8** (② hybrid), and the trained ear meets richer signatures (B4) only in combat stages. One voice first; counterpoint later. Dev escape hatch: pressing `0/1/2` clears `silentPings`.

## Principles (from the user, non-negotiable)

- **No unearned stereo.** The line's two ends are the only ears: mono while the scan is vertical; pan exists only via §D's tilt law. Self-generated sounds always centered.
- **Direction is earned by scanning.** The fiction is dolphin-like: self-ping + reflections. Direction emerges from *how the sound changes while the scan moves*, not from where it sits in the stereo field.
- **Game-legible beats physically exact.** Target sound language: near = sharp *kin*, far = dull *bon*.
- Audio may only start after a user gesture (`begin()` → `startAudio()`).

## A. Current implementation

### Graph

```
per beacon:  sine osc (baseFreq) → bandpass (Q≈6, f≈1.6×base) → gain (0..) → pan (③) ─┐
one-shots:   self-ping / echo returns (side rays panned ③) / wall bump / chime ────────┤→ masterGain (0.9) → limiter → out
```

(`limiter` = `DynamicsCompressorNode`, threshold −12 dB, knee 24, ratio 12, attack 3 ms, release 250 ms.)

Beacons = each anchor (`gainScale` 0.72, `baseFreq` 330/410/500/570/650 Hz for anchors 1–5) + the portal (660 Hz, `gainScale` 1, active only when all anchors are collected). Only the *active* anchor's `isActive()` is true, so exactly one anchor sounds at a time.

### Per-frame modulation (`updateAudio`), exact formulas

```
signal    = (0.28 + max(0,cos(rel)) * 0.72) / (1 + distance * 0.1)   // signalForBeacon, clamped 0..1
rel       = normalizeAngle(yawToObject − player.yaw)                  // signed relative yaw
echoPulse = exp(−9 · phase), phase = (now % 0.94) / 0.94              // ECHO_PERIOD = 0.94 s
scanDoppler = clamp(rel · angularVelocity · 0.28, ±0.26)              // SCAN_DOPPLER_AMOUNT
scanEnergy  = clamp(|angularVelocity| · signal, 0, 1)
distancePitch = clamp(1 − distance/24, 0, 1) · 0.22

pan    = clamp(−EAR_SEPARATION 0.6 · |sin(scanRoll)| · sin(rel), ±1)   // decision ③; 0 when vertical
gain   = signal^0.92 · (0.22 + 0.68·echoPulse + 0.66·scanEnergy) · gainScale
freq   = baseFreq · (0.82 + 0.16·max(0,cos rel) + distancePitch + echoPulse·(0.14+0.16·signal) + scanDoppler)
filter f = baseFreq · (1.4 + 1.8·signal + 2.4·echoPulse + 2.8·scanEnergy),  Q = 5 + 10·scanEnergy
```

All applied with `setTargetAtTime` (τ 0.045–0.06 s). Readable consequences, worth preserving in any rewrite:

- **Sweeping the scan toward a beacon raises its pitch; away lowers it** (`scanDoppler`: `rel` and `angularVelocity` share sign when converging). This is the game's substitute for stereo — direction from motion.
- Facing it and being near both raise pitch and brightness; the 0.62 s echo pulse gives everything a shared breathing rhythm synced to the self-ping.
- A still player hears an almost-static hum — scanning is what makes the soundscape speak (matches pillar "the ruin is legible only while it moves").

### One-shots

| Sound | Recipe | Trigger |
| --- | --- | --- |
| `playSelfPing(scale)` | triangle 1700→720 Hz over 55 ms, ~90 ms envelope | every 0.94 s; louder on jump (1.25) and start; each ping also triggers `emitEchoes` |
| `emitEchoes(scale)` → `playEchoReturn` | per ray: triangle blip at `240 + closeness·900` Hz through lowpass `500 + closeness·3800` Hz; peak `ECHO_GAIN 0.16 · scale · (0.18 + 0.82·closeness)`; duration 50–140 ms (far = longer/duller) | 3 rays at yaw −0.21/0/+0.21 rad, planar raycast vs `solids` (`castEchoRay`), skip beyond `MAX_ECHO_RANGE` 24; delay = `2·distance / SOUND_SPEED (34 u/s)`; side rays ×0.72 |
| `playWallBump()` | square 115→72 Hz through 310 Hz lowpass, 0.18 s | movement input + collision push; 0.22 s cooldown (audio clock). Deliberately Dragon-Quest-1-like |
| `playAnchorChime(color, scale)` | 3 partials ×1 / ×1.5 / ×2.02, slight upward bend; base by color: green 740, red 620, magenta 560, amber 470, cyan/other 390 Hz | anchor collect (1.0), win (1.35) |

## B. Echolocation v2 — implementation plan

Goal: make walls and rooms *audible*, so a level can be built that cannot be solved with eyes alone ([08-level-design](08-level-design.md), pattern "dark room").

> **Status 2026-07-07: B1 and B2 are implemented** (`emitEchoes`, `castEchoRay`, `rayAabbDistance`, `playEchoReturn` in `script.js`; constants `SOUND_SPEED 34`, `MAX_ECHO_RANGE 24`, `ECHO_RAY_OFFSETS [−0.21, 0, 0.21]`, `ECHO_GAIN 0.16`; `ECHO_PERIOD` raised 0.62 → 0.94 s to give echoes room). The exact recipe used is in the one-shots table above. **Not yet done:** the ping-on-demand vs periodic-ping question (currently periodic — ask the user after they play it), B3 reverb, B4 signatures, the eyes-closed acceptance test with a human, and the dark-room level itself.

### B1. Real echo delays — ✅ implemented as below

On each self-ping, cast rays and schedule *delayed* reflection sounds:

```
SOUND_SPEED = 34        // world units/s — game speed of sound, NOT 343; tune 25–50
on playSelfPing:
  for each ray in fan (start: 1 ray along scan yaw; later: 3 rays at −12°/0/+12°):
    d = raycast distance to nearest solid (reuse `solids` AABBs in planar space — cheap 2D ray-AABB; no THREE.Raycaster needed)
    if d < MAX_ECHO_RANGE (~24):
      schedule reflection at now + 2d/SOUND_SPEED    // osc.start(now + delay) — WebAudio does the scheduling
      volume ∝ 1/(1 + d·k)          — near = loud     (idea "volume")
      lowpass cutoff ∝ falls with d — near = kin, far = bon  (idea "timbre")
```

At `SOUND_SPEED = 34`: wall at 3 u → 0.18 s round trip; at 15 u → 0.88 s. That range is readable as rhythm against the 0.62 s ping period — but note ping period and echo delay will interleave; consider lengthening `ECHO_PERIOD` to ~1.0 s when echoes land, or ping-on-demand (a dedicated key) for a "listen" action. Prototype both; ask the user which fiction they prefer.

**Acceptance test (eyes-closed test)**: in DEV-less play with the screen covered, a tester can face the nearest wall within ±30° and estimate near/mid/far correctly 8/10 times.

### B2. Scan-differential timing (direction without stereo) — ✅ implemented (3-ray fan)

With the 3-ray fan, a wall off to one side returns its echo earlier on the ray nearer to it. While the player pans, the echo's arrival time slides — earlier as the scan approaches the wall's bearing. This is the audio analog of invariant "direction from motion" and completes the no-stereo direction story. Implementation: per-ray independent delay/volume; no panning, only timing/level differences *across successive pings while scanning*.

### B3. Room-size reverb

One shared `ConvolverNode` (or cheaper: feedback-delay network) on a send bus; wet level and tail length driven by the *mean* of the ray distances (large mean = big room = long tail; short = dry corridor). Update per ping, smooth with `setTargetAtTime`.

### B4. Object signatures (feeds combat later — see [07-combat-body-plane](07-combat-body-plane.md))

| Cue | Meaning | Sketch |
| --- | --- | --- |
| Pitch-change *rate* | target speed | fast Δpitch = fast mover; slow Δpitch = heavy/slow |
| Timbre/filter color | material | metal = ringing bandpass, wood = damped low-mid, glass = bright + short |
| Distortion/tremolo/roughness | state | enemy alertness, instability, HP |

### Migration note

Keep the current continuous beacon tones for anchors/portal (they are *magical* objects; a continuous hum fits). Echo v2 concerns *geometry* — walls, obstacles, rooms — which today are silent except for bumps. The two layers should coexist: beacons = destinations, echoes = terrain.

### C. Decision memo: ping mode (open question ②)

The user will decide this after playing. **All three modes are implemented (2026-07-07)** behind `game.pingMode`, switchable live with keys `0`/`1`/`2`; focused ping on `F` or right-click (`FOCUSED_PING_COOLDOWN` 0.35 s). Hybrid heartbeat = `HEARTBEAT_PING_SCALE` 0.22, center ray only, `HEARTBEAT_ECHO_RANGE` 6 u. The shared echo-pulse "breathing" now follows the *actual* last ping (`lastPingAt`) instead of a global clock, so it works in all modes. Jump still fires a full ping+echo fan in every mode (jumping shouts). Let the user play each and record the decision here.

**Option 1 — Periodic ping (current: every `ECHO_PERIOD` 0.94 s)**

- *For:* zero input burden; the world always breathes; the ping becomes the game's metronome (beacon `echoPulse` already syncs to it); beginners receive information without knowing to ask; fiction of an involuntary bodily rhythm (heartbeat/dolphin clicks).
- *Against:* sound the player didn't ask for becomes wallpaper — they tune it out (this is exactly today's "solvable without audio" problem); no timing control (can't ping at a jump's apex or at the moment of a door's alignment); constant sound masks other signatures (enemy tremolo) and fatigues the ear; **stealth becomes undesignable** — if the player can never be silent, ping-hearing enemies are unfair by construction.
- *Predicted outcome:* an ambient, atmospheric game. Echo reading stays passive; ST7 must be tuned around ambient legibility; ST9 enemies must react to proximity, not sound. Lower skill ceiling, gentler onboarding.

**Option 2 — On-demand ping (a "listen" key)**

- *For:* listening becomes an *act* — question → answer trains echo reading far faster and makes the player attend to the reply they asked for; timing control creates skill expression and puzzle hooks (ping mid-jump, ping while sweeping); silence becomes a resource, so ping-hearing enemies (Turner spec) are fair and stealth is a real mechanic; leaves acoustic room for other signals.
- *Against:* one more input to teach, and weak players may simply never press it and wander lost (needs a hard tutorial gate in ST7); between pings the world falls silent, which can read as "audio is broken" unless something ambient remains; players will mash the key into a worse periodic mode unless there's a cooldown/cost, and any cost adds friction; removing the periodic pulse breaks the current beacon-breathing rhythm (`updateAudio` needs rework).
- *Predicted outcome:* a deliberate, almost turn-based rhythm — closer to a blind-navigation immersive sim. Higher skill ceiling and much stronger ST7/ST9, at the cost of onboarding friction.

**Option 3 — Hybrid (recommended starting point)**

- Quiet involuntary heartbeat ping (low gain, maybe center ray only) keeps the world alive and the metronome intact + a deliberate **focused ping** on a key (full fan, louder, maybe wider: 5 rays) for asked questions. Only the focused ping is audible to enemies.
- *For:* preserves ambience and onboarding, adds agency and stealth; maps cleanly onto the campaign ramp (ST1–7 survive on heartbeat; ST8 teaches the focused ping; ST10 prices it).
- *Against:* two systems to tune; risk that the heartbeat already gives enough and the focused ping feels redundant — tune the heartbeat to be *presence, not information* (short range, e.g. clamp its `MAX_ECHO_RANGE` to ~6).
- *Fiction check:* passes — a body hums involuntarily; attention sharpens the beam. (The old Shift "focus" mode this once referenced as precedent was removed 2026-07-08; use a dedicated key.)

Decision recorded: ☑ **hybrid** — 2026-07-07, user confirmed after playing all three. `game.pingMode` defaults to 2; keys `0`/`1` remain as dev comparison tools (retire before release). Consequences now locked: ST8 teaches the focused ping (TS-C lintels confirmed), ST10 enemies hear the focused ping only (stealth beat confirmed).

Observation from the user's mode-1 test, recorded for the archive: the "continuous tone" heard in on-demand mode is **not a bug** — it is the active anchor's (and unfound frame shard's) beacon hum, by design (beacons = destinations hum; echoes = terrain answers). Mode 1 merely exposes it nakedly. If mode 1 is ever revisited: an optional purist variant would make beacons, too, answer only to pings.

### D. Decision memo: tilt-derived stereo (question ③, raised by the user 2026-07-07)

**The question:** stereo was banned because perception is 1-dimensional — but should stereo panning exist *while the scan is tilted*?

**The geometric answer: yes, and it is not an exception to the rule — it is the rule, finished.** The ban was never "no stereo"; it was "no unearned direction information." A 1D line has two ends. Treat the ends as the two ears:

- **Vertical line:** the ends point up/down. Their separation has zero horizontal component → interaural difference = 0 → **mono. The current rule falls out as the roll = 0 special case.** (The up/down difference exists but stereo hardware cannot render it — honestly lost, which is fiction-consistent.)
- **Tilted line:** the ends genuinely occupy different left/right positions. Ear separation's horizontal component ∝ `sin(scanRoll)`; a source's horizontal offset from the scan ∝ `sin(relativeYaw)`. Therefore:

```
pan = EAR_SEPARATION · sin(scanRoll) · sin(relativeYaw)     // StereoPannerNode per beacon/echo
```

`EAR_SEPARATION` (~0.5–0.7) caps the effect so max tilt (60°, sin ≈ 0.87) does not hand out full free stereo. Self-generated sounds (self-ping, wall bump on own body, chime) stay center — they are the player's own body, not the world.

**What this buys:**

1. **Tilt becomes a true sense-mode dial:** tilting trades vertical *visual* coverage for horizontal *auditory* separation. The trade is paid for, so the "direction must be earned" pillar is deepened, not violated.
2. **TS-C (listening stage) gains a channel:** tilted echo returns pan by ray bearing — left wall answers left *only while you lean*.
3. **The 90° unlock (11-tilt-mechanics A7) gets its payoff:** the entire game is mono until, late, the player earns the horizontal line and **hears in stereo for the first time.** The whole mono discipline retroactively becomes setup for one of the best moments available to this game.
4. Optional grace note: the reveal flash could be briefly full-stereo (he *has* volume for that instant) — reinforces the time-for-space fiction.

**Caveats:**

- It must be **taught** (a beat in ST4 or ST7: a hummed beacon left of the scan, audible as "left" only while tilted), or the subtlety is wasted.
- Fiction must be pinned: hearing rides the **scan line (attention)**, not the body plane — consistent with `updateAudio` already using scan-relative yaw.
- Vertical "stereo" (roll = 0) could optionally map to a *timbral* split (top end brighter, bottom darker, mono-compatible), morphing continuously into spatial split as roll grows — deep-cut idea, prototype only if cheap.
- **Adopting this changes the hard-constraint text** in `AGENTS.md`/`CLAUDE.md` from "no stereo panning" to "no unearned stereo: pan only via the tilt-derived formula." Do not edit those files until the user confirms after playing.

Decision recorded: ☑ **adopt** — 2026-07-07, user confirmed. Notes: `EAR_SEPARATION = 0.6`; the mapping uses `|sin(scanRoll)|` (the line's ends are indistinguishable, so flipping tilt direction must not mirror the stereo image — magnitude only, direction from `sin(relativeYaw)`); implemented same day (beacons via per-beacon `StereoPannerNode` in `updateAudio`, echo side-rays pan by ray side in `emitEchoes`/`playEchoReturn`; ping/bump/chime remain centered). `AGENTS.md`/`CLAUDE.md`/01-vision wording updated. The 90° unlock (full stereo) is stage ST11, [12-tilt-stages](12-tilt-stages.md) TS-G.

**Physics grounding (fiction audit, 2026-07-13 — user asked "is this fiction?"):**
- **The core is real acoustics.** Two separated receivers hear only the component of source direction *along their separation axis* (arrival-time difference ∝ `axis·direction` — the working principle of microphone arrays). A vertical baseline therefore cannot distinguish left from right (the psychoacoustic "cone of confusion"); tilting the baseline earns a horizontal component in exact proportion — our `sin(roll)·sin(rel)` is the correct first-order model. Biological precedent: barn owls have vertically *asymmetric* ears (a tilted baseline) for elevation hearing, and humans instinctively tilt their heads to break localization ambiguity.
- **What is fiction:** that a zero-thickness being interacts with 3D sound at all, and that its "ears" are the ends of the *attention* line (pinned deliberately).
- **Where the implementation cheats:** a real two-point receiver on a shadowless (zero-width) body would produce almost pure *time* differences (ITD), not level differences — but we pan by level (`StereoPannerNode`) for game legibility, and we drop the which-end-first sign (`|sin|`).
- ~~Purist alternative (not adopted)~~ → **ADOPTED as an addition, 2026-07-13** (user: 「わかりやすくなるなら時間差も加えましょう」): the interaural time difference is now **layered on top of the level pan** — both cues follow the same tilt law, which is standard binaural practice (redundant cues localize far more robustly). Per beacon: `panner → ChannelSplitter → DelayL/DelayR → ChannelMerger → master`, delays `(EAR_ITD_MAX ∓ itd)/2` with `itd = EAR_ITD_MAX·|sin(roll)|·sin(rel)`, `EAR_ITD_MAX = 0.7 ms`; echo side-ray blips get the same static split derived from their pan. Verified live: vertical = 0.35/0.35 ms (centered); 45° tilt with the source left = L 0.14 / R 0.56 ms + pan −0.37 — both cues agreeing. ITD dominates below ~1.5 kHz, exactly our beacon band (236–660 Hz). *Caveat:* on mono-downmixing speakers the interaural delay comb-filters slightly (worst near 714 Hz); only occurs while tilted, judged acceptable — revisit if a mono-hardware tester reports hollow tones.

### WebAudio hygiene

- Create nodes per ping and let them end (`osc.stop`) — GC handles it; do not grow persistent node counts per frame.
- Everything through `masterGain`; when adding echo layers, add a `DynamicsCompressorNode` before destination and drop `masterGain` to ~0.9 (Phase 0 item) to stop stacking clips.
- All scheduling on `audioCtx.currentTime`, never `performance.now()`.
- Keep every new magic number a named `const` near the top with the existing ones.
