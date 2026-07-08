// Level 07 — The Scattered Hall (the original prototype room; ST7 midterm in the campaign).
// Level file numbers = campaign stage numbers; play this room via ?level=7.
// Plain data consumed by addWorld() in script.js. Coordinates are WorldBasis components
// (right / up / forward); colors are raw hex so level files stay self-contained.
// The authoring template with full commentary is level01.js.
export default {
  name: 'The Scattered Hall',
  playerStart: { right: 0, forward: -16, yaw: 0 },
  bounds: { minRight: -18.5, maxRight: 18.5, minForward: -18.5, maxForward: 18.5 },

  walls: [
    { right: 0, forward: -20.5, width: 42, depth: 0.8, height: 3.4, color: 0x35d7ff, glow: 0.5 },
    { right: 0, forward: 20.5, width: 42, depth: 0.8, height: 3.4, color: 0x35d7ff, glow: 0.5 },
    { right: -20.5, forward: 0, width: 0.8, depth: 42, height: 3.4, color: 0x35d7ff, glow: 0.5 },
    { right: 20.5, forward: 0, width: 0.8, depth: 42, height: 3.4, color: 0x35d7ff, glow: 0.5 },

    { right: -8.6, forward: -8.5, width: 8.4, depth: 0.75, height: 2.4, color: 0xffb84a, glow: 0.46, edge: 0xfff1b8 },
    { right: 7.7, forward: -8.5, width: 7.8, depth: 0.75, height: 2.4, color: 0xffb84a, glow: 0.46, edge: 0xfff1b8 },
    { right: 0.2, forward: 0.6, width: 3.2, depth: 3.2, height: 5.2, color: 0xb77cff, glow: 0.5, edge: 0xf0d1ff },
    { right: -10.2, forward: 6.8, width: 0.9, depth: 8.8, height: 2.7, color: 0x4a8dff, glow: 0.46, edge: 0xcce0ff },
    { right: 10.1, forward: 7.6, width: 0.9, depth: 7.3, height: 2.7, color: 0x4a8dff, glow: 0.46, edge: 0xcce0ff },
    { right: 4.8, forward: 12.2, width: 7.6, depth: 0.7, height: 2.4, color: 0x70f2a4, glow: 0.44, edge: 0xd8ffe6 },
  ],

  columns: [
    { right: -13, forward: -1.8, radius: 0.72, height: 4.8, color: 0x44e7ff },
    { right: 13, forward: -1.8, radius: 0.72, height: 4.8, color: 0x44e7ff },
    { right: -4.9, forward: 11.7, radius: 0.6, height: 4.3, color: 0xff5fd7 },
    { right: 7.7, forward: -14, radius: 0.52, height: 3.8, color: 0xffc95a },
  ],

  markers: [
    { right: -14, forward: -14, up: 1.9, width: 0.35, depth: 0.35, height: 3.1, color: 0x44e7ff, spin: 0.4 },
    { right: 13.5, forward: -5.7, up: 2.1, width: 0.48, depth: 0.48, height: 2.4, color: 0xffc95a, spin: -0.32 },
    { right: -13, forward: 14, up: 2.2, width: 0.42, depth: 0.42, height: 2.8, color: 0xff5fd7, spin: 0.27 },
    { right: 13.7, forward: 15.2, up: 1.8, width: 0.36, depth: 0.36, height: 3.5, color: 0x7dff9a, spin: -0.18 },
  ],

  pickups: [
    {
      right: -5.6,
      forward: -12.6,
      color: 0x44e7ff,
      baseFreq: 330,
      label: 'still',
      kind: 'still / any side',
      hint: 'Anchor 1: touch the floor ring from any side.',
    },
    {
      right: 8.9,
      forward: -4.8,
      color: 0xffc95a,
      baseFreq: 410,
      label: 'gate',
      kind: 'still / gated side',
      approachYaw: Math.PI,
      approachArc: Math.PI / 4.4,
      hint: 'Anchor 2: enter the gate from its open side.',
    },
    {
      right: -10.2,
      forward: 3.1,
      color: 0xff5fd7,
      baseFreq: 500,
      label: 'shuttle',
      kind: 'moving line / any side',
      moving: true,
      motionRight: 2.6,
      motionSpeed: 1.05,
      hint: 'Anchor 3: read the regular left-right shuttle, then touch it.',
    },
    {
      right: 8.4,
      forward: 10.6,
      color: 0x7dff9a,
      baseFreq: 570,
      label: 'moving gate',
      kind: 'moving ellipse / gated side',
      moving: true,
      approachYaw: -Math.PI / 2,
      approachArc: Math.PI / 5,
      motionRight: 1.8,
      motionForward: 0.9,
      motionSpeed: 0.86,
      hint: 'Anchor 4: track the oval motion and enter through the lit side.',
    },
    {
      right: -14.2,
      forward: 15.1,
      up: 2.05,
      color: 0xff4d62,
      baseFreq: 650,
      label: 'air',
      kind: 'air / jump',
      airborne: true,
      hint: 'Anchor 5: jump through the suspended anchor.',
    },
  ],

  frameShard: { right: 14.8, forward: -15.2, up: 0.82 },
  portal: { right: 0, forward: 17.4, up: 1.7 },
};
