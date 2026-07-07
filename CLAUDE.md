# CLAUDE.md

Read `AGENTS.md` first — it is the canonical agent guide for this repository. Full docs: `docs/README.md`.

Non-negotiables (duplicated here so they are never missed):

- The default experience must NEVER become ordinary full-3D vision. Full 3D exists only as the brief anchor "reveal", the `DEV 3D` debug toggle (`3` key), or an explicitly costly, fictionalized future mechanic.
- No radar/scope HUD (one was removed on purpose). Stereo panning only via the tilt-derived law (`|sin(scanRoll)|·sin(relYaw)`, `docs/04-audio.md` §D) — mono when the scan is vertical; self-sounds always centered; no other panning.
- Improve this project in place; never replace it with a new one.
- Keep the prototype playable end-to-end (5 anchors → green portal) after every change.
- Use `prototype/modules/math/WorldBasis.js` for spatial math.
- Verify with `node --check prototype\script.js` plus the manual smoke test in `docs/09-agent-playbook.md`.
- The user speaks Japanese; respond in Japanese, keep explanations concise, make requested changes directly.
