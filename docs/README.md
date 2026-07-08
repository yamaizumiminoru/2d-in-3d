# Coplanar Documentation

> **日本語での案内**
> このフォルダは、Coplanar（2次元人が3次元空間に投げ込まれるゲーム）を、どのコーディングエージェントでも最後まで完成させられるようにするためのドキュメント一式です。2026-07-06 時点の実装（`prototype/script.js` ほか）を精読した上で書かれており、関数名・定数・数値はすべて実コードと一致しています。エージェントに作業を頼むときは「まず `AGENTS.md` と `docs/` を読んでから着手して」と指示すれば、コンセプトを壊さずに開発を継続できます。ドキュメント本文は、どのエージェントでも確実に読めるよう英語で書いてあります。

All documents are grounded in the actual code as of 2026-07-06. Function names, constants, and numbers are copied from the source, not paraphrased. If code and docs ever disagree, trust the code, then fix the doc.

## Reading order

**Every agent, before the first edit:** [`AGENTS.md`](../AGENTS.md) → [01-vision](01-vision.md) → [02-architecture](02-architecture.md) → [09-agent-playbook](09-agent-playbook.md).

Then, per task:

| # | Document | What it covers |
| --- | --- | --- |
| 01 | [Vision & fiction](01-vision.md) | Core concept, design pillars, prior art, story, glossary |
| 02 | [Architecture](02-architecture.md) | Runtime, file map, state, coordinate system, frame loop, known quirks |
| 03 | [Perception spec](03-perception.md) | The scan-line renderer: exact behavior, invariants, tuning, derived math |
| 04 | [Audio spec](04-audio.md) | Current audio graph with formulas + the Echolocation v2 implementation plan |
| 05 | [Gameplay spec](05-gameplay.md) | Controls, anchors, gates, portal, collision, physics numbers, how-to checklists |
| 06 | [Roadmap](06-roadmap.md) | Phased plan to a finished game, with acceptance criteria per phase |
| 07 | [Combat & body plane](07-combat-body-plane.md) | Future spec: 2D enemies, side attacks, parry, body-vs-scan orientation, narrow gaps |
| 08 | [Level design](08-level-design.md) | The design language for building readable levels, progression grammar, authoring |
| 09 | [Agent playbook](09-agent-playbook.md) | Setup, verification, manual test script, debugging, conventions, handoff protocol |
| 10 | [Campaign plan](10-campaign.md) | The stage-clear (面クリア) campaign: 14 stage specs, build order, pacing guardrails |
| 11 | [Tilt mechanics](11-tilt-mechanics.md) | Idea bank: grain/alignment resonance, tilt in combat (stance reading, cut-grain, topple), build order |
| 12 | [Tilt stage designs](12-tilt-stages.md) | Buildable stage designs for the tilt ladder (see→follow→hold→measure→listen→fight→dance), easy → hard, with geometry |
| 13 | [Storytelling](13-storytelling.md) | Wordless narrative system (ADOPTED): two-line emblem grammar, 影絵 vignettes, reveal-glimpses, words policy |
| 14 | [Stage ideas](14-stage-ideas.md) | Per-stage detail pass ST0–ST13: palettes, set pieces, audio identity, each stage's memorable moment, open checkboxes |

## Status snapshot (2026-07-07)

- Playable prototype: one room, five sequential anchors, win portal. Complete and winnable (verified by an automated full playthrough on 2026-07-07).
- Perception: scan strip + yaw-shifted afterimage panorama + brief post-anchor 3D reveal. Working.
- Audio: per-beacon tones + self-ping + wall bump + chime, **plus Echolocation v2 §B1–B2** (real delayed echo returns; near = sharp *kin*, far = dull *bon*), master limiter, **and tilt-derived stereo (decision ③, adopted & implemented 2026-07-07)**: pan = `−0.6·|sin(scanRoll)|·sin(rel)` on beacons and echo side rays — mono at vertical scan, full stereo reserved for the ST11 unlock. The game is still solvable without sound — the audio-forced level remains the top roadmap item.
- Phase 0 hardening done: Three.js vendored locally, frame-rate-independent animation, paused game clock (`game.time`), master compressor. Remaining from Phase 0: end screen.
- **Title decided (memo ⑥): «Coplanar — a 2D adventure in 3D»** — renamed from the Codex working title everywhere except the historical handoff file; dev hook is now `window.coplanar`.
- **Level loader shipped (Phase 1 refactor done):** levels are plain-data modules in `prototype/levels/`, selected by `?level=N` (fallback to 01). **File numbers = campaign stage numbers.**
- **ST1 「目覚めの間」 built (2026-07-08) as `level01.js`** — the default stage and the annotated authoring template for other agents (touch → sweep → occlusion teaching arc, 3 anchors, compass pre-granted, ST1 palette). The Scattered Hall reference room is `level07.js` (`?level=7`). Seen-vs-unseen marking: goal retired same day (imperceptible in play); bright floor stays for aesthetics + horizon.
- Decision ② **resolved: hybrid** (2026-07-07, default `pingMode = 2`): quiet heartbeat (center ray, 6 u) + focused ping on `F`/right-click; keys `0`/`1` remain as dev comparison. Story decided same day: ending = return to the painting which has gained a picture of something 3D; characters nameless; her refusal = 90° flip. Title = open memo ⑥ in [01-vision](01-vision.md). Also fixed: collecting an anchor in DEV 3D froze the game (reveal timer now lives in the loop).
- HUD decisions ④⑤ adopted & implemented 2026-07-07: all measurement cells are **1D marks** (anchor segments in anchor colors, SIGNAL/DRIFT fill-bars, DIR as a 1D heading ribbon), and the compass is **earned** by finding the wooden-humming **frame shard** (relative → absolute navigation two-phase per stage).
- Body & fiction decisions 2026-07-07: player/heroine = tall **portrait** planes, enemies = wide **landscape** (quadruped) planes; the finale touch is **coplanar edge-to-edge** (the kiss — never a side touch, which is the attack verb). See [07-combat-body-plane](07-combat-body-plane.md) §2.5/§5.
- Dev hook: `window.coplanar` exposes `{player, game, pickups, beacons, solids}` read-only for debugging/automation.
- Not yet built: reverb (B3), audio-forced level, body orientation, narrow gaps, enemies/combat, multi-level progression, story framing, menu/save, end screen.
