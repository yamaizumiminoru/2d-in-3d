# 09 — Agent Playbook

Operational manual for any coding agent (Claude, Gemini/Antigravity, Codex, …) working on Sliceborne. Pair with [`AGENTS.md`](../AGENTS.md) (rules) — this file is the *how*.

## Environment

- Windows 11, PowerShell-first. Working dir: `C:\Users\piano\.gemini\antigravity\scratch\2d-adventure`.
- No package.json / build / test framework. Node is available for `node --check` only.
- Serve `prototype/` as web root on port 4173 (convention):

```powershell
python -m http.server 4173 --directory prototype
# or: npx http-server prototype -p 4173
```

- Three.js is vendored (`prototype/third_party/three/`) — no internet needed. If the page is black, check the browser console for an import-map path error first.
- Port 4173 may already be held by a long-lived server from an earlier session that serves this same folder live; reuse it, or use another port (e.g. 4174 — see `.claude/launch.json`, which Claude's preview tooling uses).

## Verification ladder (run bottom-up as far as your change warrants)

1. **Syntax** — `node --check prototype\script.js` (catches most damage; ES-module syntax is fine with `--check`).
2. **Serves** — `Invoke-WebRequest -Uri "http://127.0.0.1:4173/index.html" -UseBasicParsing -TimeoutSec 5`.
3. **Console-clean** — open the page; zero errors in devtools console before and after clicking start.
4. **Smoke test** (below) — required for any change to `script.js`.
5. **Concept audit** — reread the Hard Constraints in `AGENTS.md`; confirm your change violates none.

## Manual smoke test (~3 minutes)

1. Load page → start veil shows → click → veil fades, message "The echo line finds depth.", audio hum + periodic ping audible.
2. `W/A/S/D` moves; walking into the violet center block plays the low bump (and repeats only after ~0.2 s).
3. `→` held: scan turns right, **afterimage drifts left** (this direction is sacred). Mouse right does the same.
4. `↑/↓` tilts the line; wheel too; middle-click or `↑`+`↓` resets with message "Scan tilt reset."
5. `Shift`: strip visibly widens, movement/turn slow down.
6. `Space` jumps (ping louder).
7. `3` toggles DEV 3D both ways (mode readout `DEV 3D`).
8. Collect all five anchors in order (positions/types table in [05-gameplay](05-gameplay.md); use DEV 3D to navigate quickly — that's what it's for). Verify per anchor: brief 3D reveal + input freeze + chime + next hint appears. Anchor 2 and 4 must *refuse* wrong-side entry with the "has a face" hint.
9. Portal turns bright green after #5; walking in wins: chime, reveal, "The flat traveler crosses the third axis.", readout `VOLUME HELD`.
10. Resize the window mid-play — no crash (afterimage clearing is expected).

Post-Phase-1 additions: eyes-closed echo test ([04-audio](04-audio.md) §B1 acceptance).

## Debugging tips (hard-won)

- **Use the dev hook `window.sliceborne`** (`{player, game, pickups, beacons, solids}`) for state reading and automation — module scope is unreachable from the console without it. A scripted full playthrough (dispatch `KeyboardEvent`s on `window`, steer toward `pickups[game.activePickupIndex]`, jump-spam near the air anchor) won the game in ~35 s on 2026-07-07; that pattern is the strongest available regression test. Caveats from that run: waypoint around walls (pure head-on pressing doesn't slide), and remember anchors reset on reload.
- **Pixel-reading the mental canvas is flaky** — mid-animation reads gave unreliable results in past sessions. Prefer: screenshots + visual judgment, DEV 3D for spatial questions, the dev hook for logic questions.
- Reproduce perception bugs in DEV 3D first to separate "world is wrong" from "rendering of world is wrong".
- Audio bugs: remember the 0.94 s ping period and per-beacon `isActive()` gating — "no sound" is often "beacon not active", not a graph problem. `audioCtx.state` must be `running` (requires the start gesture). Echo returns are scheduled up to ~1.4 s after a ping (`2·MAX_ECHO_RANGE/SOUND_SPEED`); WebAudio exceptions in scheduling surface in the console every ping, so a clean console over ~5 s means the echo path is healthy.
- The reveal locks input for 0.28 s — automation that sends inputs immediately after a collect will drop them. Wait ≥ 0.4 s.
- Time values: gameplay uses rAF `seconds`; audio cooldowns use `audioCtx.currentTime`. Don't mix them.

## Code conventions

- Plain ES modules, no TypeScript, no dependencies beyond Three.js. Match the existing style: `const` tunables SCREAMING_SNAKE at the top; small verb-named functions; no classes; early returns.
- Spatial math through `WORLD` (`WorldBasis`) — never raw `.x/.z` gameplay logic. Mind the dual yaw convention ([02-architecture](02-architecture.md)).
- Colors from the `COLORS` table; new world objects get `addEdgeGlow`.
- Player-facing strings: terse, lowercase-calm, slightly liturgical; one line. Read the existing messages first.
- Comments: only for constraints code can't express (like the existing style — there are almost none; keep it that way).

## Git

The folder is a git repository but currently has **no commits** (unborn HEAD). If the user asks to start version control: `git add -A` and commit everything including `docs/` as the initial commit. Do not commit or push unasked.

## Working with the user

- Japanese; concise; wants edits made directly rather than proposed. Show, then explain in a sentence.
- They audit *conceptual consistency* — when adding any effect, be ready to answer "what does the 2D man's body do to produce this?" in-fiction, or label it dev-only.
- They accept prototyping shortcuts (DEV 3D) but never concept dilution (radar, stereo, default-3D).
- When two designs are close, build the cheaper one behind a `const` and let them play it; they decide fast from playing.

## Handoff protocol (when your session ends)

1. Leave the game winnable (smoke test passes) — never hand off a broken main path.
2. Update the affected `docs/` files in the same session; the docs are the project's continuity mechanism.
3. If you changed behavior/controls/layout, update the status snapshot in [docs/README.md](README.md).
4. Note anything half-done or decided-but-unbuilt in the relevant doc's open-questions/roadmap section — not in a new scratch file.
