// Level 01 — 目覚めの間 / The Waking Room (campaign ST1).
//
// ============================== AUTHORING TEMPLATE ==============================
// This file is the model stage: copy it to make a new level. Rules that matter:
//
// - File numbers = campaign stage numbers (docs/10-campaign.md). ?level=N loads
//   levelNN.js; bad ids fall back to this file.
// - Coordinates are WorldBasis components (right / up / forward), colors raw hex.
//   Distances: player radius 0.48, speed 4.2 u/s, jump apex ~1.10 u. Corridors
//   >= 2.5 u wide; anchors 8-20 u apart; nothing gameplay-critical within 1.5 u
//   of `bounds` (the clamp fires before the visual wall does).
// - `pickups` array order IS the collection order. Vary counts 3-5 per stage.
//   baseFreqs ascend with sequence, >= 60 Hz apart, within ~300-700 Hz.
// - One new demand per stage (docs/10-campaign.md); readability rules and the
//   playtest questions live in docs/08-level-design.md; per-stage palette and
//   set-piece ideas in docs/14-stage-ideas.md.
// - `palette` recolors floor/grid only; walls/columns carry their own colors.
//   Landmarks = tall `columns` at distinct bearings (>=3). The old floating
//   wireframe `markers` field is still parsed but unused (removed 2026-07-08 as
//   visual clutter); leave it out unless a stage genuinely needs sky debris.
// - `compassGranted: true` pre-lights the DIR ribbon (campaign rule: ST1-2 only).
//   Later stages omit it and hide a `frameShard` instead (see level07.js).
// - Verify per docs/09-agent-playbook.md: node --check, then an in-browser
//   playthrough (window.coplanar dev hook). Keep the game winnable.
// ================================================================================
//
// ST1 teaching arc (docs/14 "waking in nothing"): three still anchors -
// (1) touch: nearly straight ahead, reachable in a minute;
// (2) sweep: far across the room, found only by scanning;
// (3) occlusion: hidden behind a wall - trust the hum, walk around.
// The portal is dimly visible from spawn so the goal grammar needs no text.
export default {
  name: 'The Waking Room',
  playerStart: { right: 0, forward: -9.5, yaw: 0 },
  bounds: { minRight: -11, maxRight: 11, minForward: -11, maxForward: 11 },
  compassGranted: true,
  // Story decision 2026-07-13: afterimage (memory) is a LEARNED skill, and the
  // ENTIRE first stage plays without it - only the living line. The arc:
  //   anchor 1 is found by SOUND (it hums straight ahead);
  //   collecting an anchor gives the reveal flash, and the NEXT anchor is placed
  //   inside that flash's view (~±38° of the approach heading) - you navigate
  //   from a glimpse held in your head;
  //   winning the stage unlocks memory ("the world begins to remain") - ST2+
  //   then has afterimages, understood as the automated form of what you did.
  // Audio literacy is learned BEFORE visual memory, on purpose (user call:
  // if memory unlocks early, players never learn to use sound).
  memoryLocked: true,
  revealDuration: 0.5, // slightly longer flash here - it is this stage's only map
  // Audio layers arrive one at a time (user call 2026-07-13: hum + echo at once
  // is polyphony, and untrained ears cannot separate two streams). ST1 = the
  // anchor hum ALONE; self-pings/echoes switch on from ST2 - the world begins
  // to answer only after you have learned to follow one voice.
  silentPings: true,

  // ST1 palette (docs/14): near-monochrome cold cyan, palest floor, sparse grid.
  palette: {
    floor: 0xaebfc2,
    floorEmissive: 0x9fb3b6,
    floorGlow: 0.5,
    grid1: 0x72f5ff,
    grid2: 0x1c454c,
  },

  walls: [
    // outer shell (visual; the bounds clamp is the real edge)
    { right: 0, forward: -12.2, width: 26, depth: 0.8, height: 3.2, color: 0x35d7ff, glow: 0.5 },
    { right: 0, forward: 12.2, width: 26, depth: 0.8, height: 3.2, color: 0x35d7ff, glow: 0.5 },
    { right: -12.2, forward: 0, width: 0.8, depth: 26, height: 3.2, color: 0x35d7ff, glow: 0.5 },
    { right: 12.2, forward: 0, width: 0.8, depth: 26, height: 3.2, color: 0x35d7ff, glow: 0.5 },

    // interior: a wall east of the route (echo/bump furniture) and a block near
    // anchor 1 — both OFF the A1->A2->A3 glimpse-walk line (this stage plays
    // without afterimage; a head-on blocker on the natural path would be cruel)
    { right: 3.8, forward: 0.8, width: 6.5, depth: 0.75, height: 2.6, color: 0x4a8dff, glow: 0.46, edge: 0xcce0ff },
    { right: 3.5, forward: -2, width: 2.2, depth: 2.2, height: 3.0, color: 0xb77cff, glow: 0.5, edge: 0xf0d1ff },
  ],

  // three landmarks at distinct bearings/heights (readability rule 4: >= 3 per room)
  columns: [
    { right: -8, forward: -6, radius: 0.7, height: 4.6, color: 0x44e7ff },
    { right: -7.5, forward: 6.5, radius: 0.55, height: 5.2, color: 0xff5fd7 },
    { right: 7.5, forward: -2.5, radius: 0.6, height: 3.6, color: 0xffc95a },
  ],

  // (no `markers`: floating wireframe debris was removed 2026-07-08 — at this room
  //  complexity the columns already give enough landmarks, and the compass covers
  //  bearing. The addMarkerBox engine path stays dormant for possible later use.)

  pickups: [
    {
      right: 0,
      forward: -3.5,
      color: 0x44e7ff,
      baseFreq: 330,
      label: 'hum',
      kind: 'still / heard',
      hint: 'Anchor 1: walk to the ring that hums.',
    },
    {
      // ~29° left of the approach heading at anchor 1 - inside the reveal flash
      right: -4.5,
      forward: 4.5,
      color: 0xffc95a,
      baseFreq: 410,
      label: 'flash',
      kind: 'still / glimpsed',
      hint: 'Anchor 2: the flash showed it. Walk from what you saw.',
    },
    {
      // ~4° off the A1->A2 heading - visible in anchor 2's flash
      right: -7.5,
      forward: 9,
      color: 0xff5fd7,
      baseFreq: 500,
      label: 'flash2',
      kind: 'still / glimpsed',
      hint: 'Anchor 3: listen, then trust the flash.',
    },
  ],

  portal: { right: 0, forward: 9.5, up: 1.7 },
};
