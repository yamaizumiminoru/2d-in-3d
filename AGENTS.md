# Coplanar — Agent Guide

Coplanar is a browser game about a two-dimensional person thrown into three-dimensional space. The player never gets ordinary 3D vision: they read the world through a single moving scan line, decaying afterimages, and echolocation-like self-generated sound. The joy of the game is learning to *read* 3D space with an intentionally incomplete 2D sensorium.

This file is the entry point for any coding agent working in this repository. The complete documentation set lives in [`docs/`](docs/README.md). Read this file fully before changing anything.

## Quick start

There is **no build step**. The game is plain HTML + ES modules; Three.js 0.160 is vendored at `prototype/third_party/three/` and loaded via an import map (no internet needed).

```powershell
# Dev server (sends Cache-Control: no-store — plain static servers let the browser
# play stale JS modules after edits; that burned us once)
python tools/serve.py 8000
```

Then open `http://127.0.0.1:8000/?level=1`. Click or press Space/Enter to start (audio needs a user gesture).

Minimum verification after every edit:

```powershell
node --check prototype\script.js
Invoke-WebRequest -Uri "http://127.0.0.1:4173/index.html" -UseBasicParsing -TimeoutSec 5
```

Then do the manual smoke test in [docs/09-agent-playbook.md](docs/09-agent-playbook.md) — syntax checking alone is not enough for a game.

## The one rule

**Never turn the default experience into ordinary 3D vision.** Everything else in this project is negotiable; this is not. Full 3D may appear only as:

1. The brief post-anchor "reveal" flash (fictionalized as trading the time dimension for a spatial one, input locked during it).
2. The developer view (`3` key, `DEV 3D`) — a debug aid, never the intended play mode.
3. A future mechanic that is explicitly temporary and *costly* within the fiction.

## Hard constraints

- **No radar/scope HUD.** A signal scope under the HUD was already built and removed because players stared at the meter instead of reading the world. Do not reintroduce it unless the user explicitly asks.
- **No unearned stereo.** The being's 1D line has two ends — its only "ears". Stereo pan must follow the tilt-derived law `pan ∝ |sin(scanRoll)| · sin(relativeYaw)` (adopted by the user 2026-07-07, [docs/04-audio.md](docs/04-audio.md) §D): mono while the scan is vertical, partial stereo while tilted, full stereo only at the late-game 90° unlock. Self-generated sounds (ping, bump, chime) always stay centered. Any panning outside this law is banned.
- **This folder's project is the target.** Improve it in place; never replace it with a separate project or rewrite-from-scratch.
- **Keep it playable.** Every change must leave the game startable and winnable. Conceptual purity never justifies breaking the play loop.
- **Conceptual rigor.** If a visual/audio effect implies a physical model, it must fit the fiction — or be explicitly labeled a debug/programming artifact. The user checks this.
- **Use `WorldBasis`** (`prototype/modules/math/WorldBasis.js`) for spatial math instead of ad hoc x/y/z assumptions.
- **The HUD speaks in 1D marks, never numerals** (segments, fill-bars, the heading ribbon — decision ⑤, `docs/05-gameplay.md`). The compass is *earned* per stage by finding the audio-emitting frame shard (decision ④d); do not make DIR always-on.

## Documentation map

| You are about to… | Read first |
| --- | --- |
| Understand what this game is and why | [docs/01-vision.md](docs/01-vision.md) |
| Touch any code at all | [docs/02-architecture.md](docs/02-architecture.md) |
| Change rendering / scan / afterimages | [docs/03-perception.md](docs/03-perception.md) |
| Change or extend audio | [docs/04-audio.md](docs/04-audio.md) |
| Change anchors, portal, controls, collision | [docs/05-gameplay.md](docs/05-gameplay.md) |
| Decide what to build next | [docs/06-roadmap.md](docs/06-roadmap.md) |
| Build enemies / combat / body orientation | [docs/07-combat-body-plane.md](docs/07-combat-body-plane.md) |
| Design a level | [docs/08-level-design.md](docs/08-level-design.md) |
| Set up, test, debug, hand off | [docs/09-agent-playbook.md](docs/09-agent-playbook.md) |

`CLAUDE_FABLE5_HANDOFF.md` at the repo root is the original short handoff (2026-07-06) kept for history; the `docs/` set supersedes it in detail.

## Working with the user

- The user communicates in Japanese; reply in Japanese. Keep explanations concise.
- Make changes directly when asked — don't present plans when an edit was requested.
- The user values the concept deeply but accepts developer-mode tools while prototyping.
- When a design choice is ambiguous, prefer the option that makes the world more *readable* through scan + afterimage + echo, not the one that adds information channels.

## Definition of done

A change is done when:

1. `node --check prototype\script.js` passes.
2. The game starts, all five anchors can be collected in order, and the portal win triggers.
3. The change respects every item under "Hard constraints".
4. New tunables are `const`s at the top of `script.js` (or the relevant module), named like the existing ones.
5. Documentation in `docs/` is updated if behavior, controls, or layout changed.
