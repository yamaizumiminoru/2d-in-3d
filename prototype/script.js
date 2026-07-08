import * as THREE from 'three';
import { DEFAULT_WORLD_BASIS as WORLD } from './modules/math/WorldBasis.js';

const SENSOR_RENDER_WIDTH = 96;
const TURN_SPEED = 1.75;
const MOVE_SPEED = 4.2;
const PLAYER_RADIUS = 0.48;
const EYE_HEIGHT = 1.2;
const PANORAMA_PIXELS_PER_RADIAN = 390;
const SCAN_DOPPLER_AMOUNT = 0.28;
const ECHO_PERIOD = 0.94;
const MOUSE_SCAN_SPEED = 0.0042;
const MAX_SCAN_ROLL = Math.PI / 3;
// Tilt is detented (0/±30/±45/±60°) and spring-loaded: scanRoll eases toward
// scanRollTarget. Gamepad holds a notch and springs back to 0 on release;
// keyboard/wheel tap-step the target and it persists. `sag` back ~0.15 s.
const TILT_STEPS = [-Math.PI / 3, -Math.PI / 4, -Math.PI / 6, 0, Math.PI / 6, Math.PI / 4, Math.PI / 3];
const TILT_NOTCH_DEG = [0, 30, 45, 60]; // gamepad: 0 / one shoulder / other / both
const TILT_SPRING = 13; // ease rate (1/s)
const GRAVITY = 17.5;
const JUMP_SPEED = 6.2;
const PICKUP_TOUCH_RADIUS = 1.18;
const AIR_TOUCH_HEIGHT = 1.05;
const AIR_TOUCH_TOLERANCE = 0.78;
const REVEAL_DURATION = 0.28;
const SOUND_SPEED = 34;
const MAX_ECHO_RANGE = 24;
const ECHO_RAY_OFFSETS = [-0.21, 0, 0.21];
const ECHO_GAIN = 0.16;
// Tilt-derived stereo (decision ③): the scan line's two ends are the ears.
// pan = -EAR_SEPARATION * |sin(scanRoll)| * sin(relativeYaw); mono when vertical.
const EAR_SEPARATION = 0.6;
// Ping modes (decision 2 A/B test — keys 0/1/2): 0 = periodic, 1 = on-demand, 2 = hybrid
const FOCUSED_PING_COOLDOWN = 0.35;
const HEARTBEAT_PING_SCALE = 0.22;
const HEARTBEAT_ECHO_RANGE = 6;
// Gamepad (standard mapping): left stick = move, right stick X = scan yaw
// (analog magnitude scales pan speed — the roadmap's movement/scan coupling).
// Tilt is spring-hold on the shoulders: R1=30°/R2=45°/R1+R2=60° (clockwise),
// L1/L2 mirror it counter-clockwise; release springs back to vertical.
const PAD_DEADZONE = 0.16;
const PAD_SCAN_SPEED = 2.4; // rad/s at full right-stick X deflection
// Default playable bounds; overridden per level by addWorld(level.bounds)
let BOUNDS = { minRight: -18.5, maxRight: 18.5, minForward: -18.5, maxForward: 18.5 };

const COLORS = {
  cyan: 0x44e7ff,
  amber: 0xffc95a,
  green: 0x7dff9a,
  magenta: 0xff5fd7,
  red: 0xff4d62,
  floor: 0x9db4b8,
  wall: 0x35d7ff,
  wallEdge: 0xd5fbff,
  blockAmber: 0xffb84a,
  blockBlue: 0x4a8dff,
  blockGreen: 0x70f2a4,
  blockViolet: 0xb77cff,
  dark: 0x020304,
};

const dom = {
  mentalCanvas: document.getElementById('mental-canvas'),
  signalBar: document.getElementById('signal-bar'),
  anchorSegments: document.getElementById('anchor-segments'),
  dirRibbon: document.getElementById('dir-ribbon'),
  ribDrift: document.getElementById('rib-drift'),
  modeReadout: document.getElementById('mode-readout'),
  message: document.getElementById('message'),
  startVeil: document.getElementById('start-veil'),
  reticle: document.getElementById('reticle'),
};

// 1D heading ribbon (memo 5): world yaw of each cardinal in the player-yaw convention
const RIBBON_PX_PER_RADIAN = 26;
const RIBBON_HALF_WIDTH = 34;
const ribbonLetters = [
  { el: dom.dirRibbon.querySelector('.rib-letter.n'), yaw: 0 },
  { el: dom.dirRibbon.querySelector('.rib-letter.e'), yaw: -Math.PI / 2 },
  { el: dom.dirRibbon.querySelector('.rib-letter.s'), yaw: Math.PI },
  { el: dom.dirRibbon.querySelector('.rib-letter.w'), yaw: Math.PI / 2 },
];

const mentalCtx = dom.mentalCanvas.getContext('2d', { alpha: false });
const copyCanvas = document.createElement('canvas');
const copyCtx = copyCanvas.getContext('2d', { alpha: false });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, SENSOR_RENDER_WIDTH / window.innerHeight, 0.03, 90);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setClearColor(COLORS.dark, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.domElement.id = 'hidden-renderer';
document.body.appendChild(renderer.domElement);

const player = {
  position: WORLD.fromBasisComponents(0, 0, -16),
  yaw: 0,
  lastYaw: 0,
  scanRoll: 0,
  scanRollTarget: 0, // detented tilt target; scanRoll springs toward it
  angularVelocity: 0,
  rollVelocity: 0,
  height: 0,
  verticalVelocity: 0,
  grounded: true,
};

const keys = new Set();
const solids = [];
const pickups = [];
const beacons = [];
const animated = [];

// Gamepad state: `focus` is a toggle (flipped on the focus button's edge);
// `tiltWasHeld` tracks the spring-release edge; `prev` holds last-frame button
// states for edge detection. Polled once per frame in updatePlayer.
const pad = {
  connected: false,
  focus: false,
  tiltWasHeld: false,
  prev: { jump: false, reset: false, ping: false, start: false, focusToggle: false },
};

const game = {
  started: false,
  won: false,
  collected: 0,
  compassFound: false,
  pingMode: 2,
  time: 0,
  pulse: 0,
  mouseScanDelta: 0,
  revealTimer: 0,
  devView: false,
  activePickupIndex: 0,
  lastAnchorHint: -Infinity,
  lastPortalHint: -Infinity,
  lastWallBumpAt: -Infinity,
  messageTimer: 0,
  lastTime: performance.now(),
};

let frameShard = null;
let portal = null;
let portalRing = null;
let portalCore = null;
let portalFloorRing = null;
let portalBeam = null;
let audioCtx = null;
let masterGain = null;
let nextSelfPingAt = 0;
let lastPingAt = -10;
let lastFocusedPingAt = -10;

function basisPosition(right = 0, up = 0, forward = 0) {
  return WORLD.fromBasisComponents(right, up, forward);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  let result = angle;
  while (result > Math.PI) result -= Math.PI * 2;
  while (result < -Math.PI) result += Math.PI * 2;
  return result;
}

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: options.emissive ?? color,
    emissiveIntensity: options.emissiveIntensity ?? 0.08,
    roughness: options.roughness ?? 0.62,
    metalness: options.metalness ?? 0.05,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    wireframe: options.wireframe ?? false,
  });
}

function addEdgeGlow(mesh, color = COLORS.wallEdge, opacity = 0.72) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  mesh.add(edges);
  return edges;
}

function addLights() {
  scene.background = new THREE.Color(COLORS.dark);
  scene.fog = new THREE.FogExp2(COLORS.dark, 0.032);
  scene.add(new THREE.HemisphereLight(0xc8fbff, 0x071214, 1.55));

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.copy(basisPosition(-5, 10, -3));
  scene.add(key);

  const rim = new THREE.PointLight(COLORS.magenta, 2.2, 32, 2);
  rim.position.copy(basisPosition(8, 5, 6));
  scene.add(rim);
}

// Per-stage atmosphere (user decision 2026-07-08): levels may override the
// floor/grid palette; omitted fields fall back to the canonical bright floor.
function addFloor(palette = {}) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42, 1, 1),
    material(palette.floor ?? COLORS.floor, {
      emissive: palette.floorEmissive ?? 0x8fa7ab,
      emissiveIntensity: palette.floorGlow ?? 0.5,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  scene.add(floor);

  const grid = new THREE.GridHelper(42, 42, palette.grid1 ?? 0x72f5ff, palette.grid2 ?? 0x286b74);
  grid.position.y = 0.015;
  scene.add(grid);
}

function addSolidBox({ right, forward, width, depth, height, color = COLORS.wall, up = 0, glow = 0.36, edge = COLORS.wallEdge }) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material(color, { emissive: color, emissiveIntensity: glow }),
  );
  mesh.position.copy(basisPosition(right, up + height / 2, forward));
  addEdgeGlow(mesh, edge, 0.78);
  scene.add(mesh);

  solids.push({
    minRight: right - width / 2,
    maxRight: right + width / 2,
    minForward: forward - depth / 2,
    maxForward: forward + depth / 2,
  });

  return mesh;
}

function addMarkerBox({ right, forward, up, width, depth, height, color, spin = 0.2 }) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material(color, { emissive: color, emissiveIntensity: 0.42, wireframe: true }),
  );
  mesh.position.copy(basisPosition(right, up + height / 2, forward));
  scene.add(mesh);
  animated.push({ object: mesh, baseY: mesh.position.y, spin, bob: 0.12 });
  return mesh;
}

function addColumn(right, forward, radius, height, color) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.82, height, 18, 1),
    material(color, { emissive: color, emissiveIntensity: 0.42 }),
  );
  mesh.position.copy(basisPosition(right, height / 2, forward));
  addEdgeGlow(mesh, COLORS.wallEdge, 0.56);
  scene.add(mesh);

  solids.push({
    minRight: right - radius,
    maxRight: right + radius,
    minForward: forward - radius,
    maxForward: forward + radius,
  });

  return mesh;
}

function addPickup({
  right,
  forward,
  up = 0.68,
  color,
  baseFreq,
  label,
  kind,
  moving = false,
  airborne = false,
  approachYaw = null,
  approachArc = Math.PI / 3.3,
  motionRight = 0,
  motionForward = 0,
  motionSpeed = 1,
  hint,
}) {
  const group = new THREE.Group();
  group.position.copy(basisPosition(right, up, forward));

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.045, 14, 54),
    material(color, { emissive: color, emissiveIntensity: 0.85, metalness: 0.35 }),
  );
  ring.rotation.x = Math.PI / 2;

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28, 1),
    material(color, { emissive: color, emissiveIntensity: 1.15, metalness: 0.2 }),
  );

  const floorRing = new THREE.Mesh(
    new THREE.TorusGeometry(airborne ? 0.76 : 0.58, 0.025, 10, 64),
    material(color, { emissive: color, emissiveIntensity: airborne ? 0.32 : 0.52, transparent: true, opacity: 0.56 }),
  );
  floorRing.rotation.x = Math.PI / 2;
  floorRing.position.copy(basisPosition(right, 0.045, forward));
  scene.add(floorRing);

  const tether = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, Math.max(up - 0.08, 0.12), 8, 1),
    material(color, { emissive: color, emissiveIntensity: airborne ? 0.52 : 0.18, transparent: true, opacity: airborne ? 0.42 : 0.16 }),
  );
  tether.position.copy(basisPosition(right, up / 2, forward));
  scene.add(tether);

  group.add(ring, core);

  let gate = null;
  if (approachYaw !== null) {
    gate = new THREE.Group();

    const postMaterial = material(color, { emissive: color, emissiveIntensity: 0.7, metalness: 0.18 });
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.22, 0.08), postMaterial);
    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.22, 0.08), postMaterial);
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 0.08), postMaterial);
    const entryLine = new THREE.Mesh(
      new THREE.BoxGeometry(1.38, 0.035, 0.035),
      material(COLORS.green, { emissive: COLORS.green, emissiveIntensity: 0.82, transparent: true, opacity: 0.9 }),
    );

    leftPost.position.set(-0.62, 0, 0);
    rightPost.position.set(0.62, 0, 0);
    topBar.position.set(0, 0.62, 0);
    entryLine.position.set(0, -0.58, -0.18);
    gate.add(leftPost, rightPost, topBar, entryLine);
    gate.position.y = 0.05;
    gate.rotation.y = approachYaw;
    group.add(gate);
  }

  scene.add(group);

  const pickup = {
    group,
    ring,
    core,
    gate,
    floorRing,
    tether,
    color,
    label,
    kind,
    hint,
    collected: false,
    baseRight: right,
    baseForward: forward,
    right,
    forward,
    baseY: group.position.y,
    up,
    moving,
    airborne,
    approachYaw,
    approachArc,
    motionRight,
    motionForward,
    motionSpeed,
    phase: pickups.length * 0.71,
  };
  pickups.push(pickup);
  beacons.push({
    object: group,
    color,
    baseFreq,
    isActive: () => isPickupActive(pickup),
    gainScale: 0.72,
  });

  pickup.group.visible = false;
  pickup.floorRing.visible = false;
  pickup.tether.visible = false;
  return pickup;
}

function setPickupVisible(pickup, visible) {
  pickup.group.visible = visible;
  pickup.floorRing.visible = visible;
  pickup.tether.visible = visible;
}

function isPickupActive(pickup) {
  return !pickup.collected && pickups[game.activePickupIndex] === pickup;
}

function yawFromBasisDelta(right, forward) {
  return Math.atan2(right, forward);
}

function updatePickupTransform(pickup, t) {
  const sway = pickup.moving ? Math.sin(t * pickup.motionSpeed + pickup.phase) : 0;
  pickup.right = pickup.baseRight + sway * pickup.motionRight;
  pickup.forward = pickup.baseForward + Math.cos(t * pickup.motionSpeed + pickup.phase) * pickup.motionForward;
  const bob = Math.sin(t * (pickup.airborne ? 2.4 : 1.7) + pickup.phase) * (pickup.airborne ? 0.14 : 0.05);

  pickup.group.position.copy(basisPosition(pickup.right, pickup.baseY + bob, pickup.forward));
  pickup.floorRing.position.copy(basisPosition(pickup.right, 0.045, pickup.forward));
  pickup.tether.position.copy(basisPosition(pickup.right, (pickup.baseY + bob) / 2, pickup.forward));
  pickup.tether.scale.y = Math.max((pickup.baseY + bob) / Math.max(pickup.baseY, 0.001), 0.05);
}

function activateCurrentPickup(prefix = '') {
  for (const pickup of pickups) setPickupVisible(pickup, isPickupActive(pickup));
  const active = pickups[game.activePickupIndex];
  if (active) showMessage(`${prefix}${active.hint}`, prefix ? 4.6 : 3.8);
}

function addPortal({ right, forward, up }) {
  portal = new THREE.Group();
  portal.position.copy(basisPosition(right, up, forward));

  portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.08, 18, 96),
    material(COLORS.green, { emissive: COLORS.green, emissiveIntensity: 0.22, metalness: 0.45 }),
  );
  portalRing.rotation.y = Math.PI / 2;

  portalCore = new THREE.Mesh(
    new THREE.CircleGeometry(1.16, 64),
    material(COLORS.cyan, { emissive: COLORS.cyan, emissiveIntensity: 0.04, transparent: true, opacity: 0.1 }),
  );
  portalCore.rotation.y = Math.PI / 2;

  portalFloorRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.72, 0.035, 12, 96),
    material(COLORS.green, { emissive: COLORS.green, emissiveIntensity: 0.36, transparent: true, opacity: 0.34 }),
  );
  portalFloorRing.rotation.x = Math.PI / 2;
  portalFloorRing.position.copy(basisPosition(right, 0.06, forward));
  scene.add(portalFloorRing);

  portalBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 3.8, 10, 1),
    material(COLORS.green, { emissive: COLORS.green, emissiveIntensity: 0.28, transparent: true, opacity: 0.18 }),
  );
  portalBeam.position.copy(basisPosition(right, up + 0.2, forward));
  scene.add(portalBeam);

  portal.add(portalRing, portalCore);
  scene.add(portal);

  beacons.push({
    object: portal,
    color: COLORS.green,
    baseFreq: 660,
    isActive: () => game.collected === pickups.length,
    gainScale: 1,
  });
}

function addWorld(level) {
  addLights();
  addFloor(level.palette ?? {});

  if (level.bounds) BOUNDS = { ...level.bounds };
  if (level.compassGranted) game.compassFound = true; // early stages pre-grant DIR (campaign rule: ST1-2)
  for (const box of level.walls ?? []) addSolidBox(box);
  for (const column of level.columns ?? []) addColumn(column.right, column.forward, column.radius, column.height, column.color);
  for (const marker of level.markers ?? []) addMarkerBox(marker);
  for (const pickup of level.pickups ?? []) addPickup(pickup);
  if (level.frameShard) addFrameShard(level.frameShard);
  addPortal(level.portal ?? { right: 0, forward: 17.4, up: 1.7 });

  const start = level.playerStart ?? { right: 0, forward: 0, yaw: 0 };
  WORLD.fromBasisComponents(start.right, 0, start.forward, player.position);
  player.yaw = start.yaw ?? 0;
  player.lastYaw = player.yaw;

  activateCurrentPickup();
}

// Decision 4(d): the compass is a shard of the painting's frame, found by ear.
function addFrameShard({ right, forward, up }) {
  const group = new THREE.Group();
  group.position.copy(basisPosition(right, up, forward));

  const wood = material(0xc98a4b, { emissive: 0x8a5a2e, emissiveIntensity: 0.5, roughness: 0.8 });
  const barA = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.1, 0.1), wood);
  const barB = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.1), wood);
  barA.rotation.z = 0.42;
  barB.position.set(-0.28, -0.2, 0);
  addEdgeGlow(barA, 0xffd9a0, 0.5);
  group.add(barA, barB);
  scene.add(group);

  frameShard = { group, baseY: group.position.y };
  beacons.push({
    object: group,
    color: 0xc98a4b,
    baseFreq: 236,
    isActive: () => !game.compassFound,
    gainScale: 0.55,
    timbre: 'wood',
  });
}

function updateFrameShard(t, dt) {
  if (!frameShard || game.compassFound) return;

  frameShard.group.position.y = frameShard.baseY + Math.sin(t * 1.3) * 0.06;
  frameShard.group.rotation.y += 0.5 * dt;

  if (WORLD.distanceSqPlanar(player.position, frameShard.group.position) < 1.1 * 1.1) {
    game.compassFound = true;
    frameShard.group.visible = false;
    playAnchorChime(0xc98a4b, 0.9);
    game.pulse = Math.max(game.pulse, 0.6);
    showMessage('A shard of the frame — the world regains its north.', 3.6);
  }
}

function buildAnchorSegments() {
  for (const pickup of pickups) {
    const segment = document.createElement('span');
    segment.className = 'anchor-segment';
    dom.anchorSegments.appendChild(segment);
    pickup.segment = segment;
  }
}

function directionFrame() {
  return WORLD.yawPitchRollFrame(player.yaw, 0, player.scanRoll);
}

function movementFrame() {
  return WORLD.yawPitchRollFrame(player.yaw, 0, 0);
}

function yawToObject(object) {
  const delta = object.position.clone().sub(player.position);
  return WORLD.forwardToYaw(delta);
}

function playerBasis() {
  return WORLD.toBasisComponents(player.position);
}

function signalForBeacon(beacon) {
  if (!beacon.isActive()) return 0;

  const distance = Math.sqrt(WORLD.distanceSqPlanar(player.position, beacon.object.position));
  const relativeYaw = Math.abs(normalizeAngle(yawToObject(beacon.object) - player.yaw));
  const alignment = Math.max(0, Math.cos(relativeYaw));
  return clamp((0.28 + alignment * 0.72) / (1 + distance * 0.1), 0, 1);
}

function resolveCollision() {
  const planar = WORLD.toBasisComponents(player.position);
  const startRight = planar.right;
  const startForward = planar.forward;
  planar.right = clamp(planar.right, BOUNDS.minRight, BOUNDS.maxRight);
  planar.forward = clamp(planar.forward, BOUNDS.minForward, BOUNDS.maxForward);

  for (const solid of solids) {
    const nearestRight = clamp(planar.right, solid.minRight, solid.maxRight);
    const nearestForward = clamp(planar.forward, solid.minForward, solid.maxForward);
    let deltaRight = planar.right - nearestRight;
    let deltaForward = planar.forward - nearestForward;
    let distanceSq = deltaRight * deltaRight + deltaForward * deltaForward;

    if (distanceSq >= PLAYER_RADIUS * PLAYER_RADIUS) continue;

    if (distanceSq < 0.0001) {
      const exits = [
        { amount: Math.abs(planar.right - solid.minRight), axis: 'right', sign: -1 },
        { amount: Math.abs(solid.maxRight - planar.right), axis: 'right', sign: 1 },
        { amount: Math.abs(planar.forward - solid.minForward), axis: 'forward', sign: -1 },
        { amount: Math.abs(solid.maxForward - planar.forward), axis: 'forward', sign: 1 },
      ].sort((a, b) => a.amount - b.amount);
      const exit = exits[0];
      planar[exit.axis] += (exit.amount + PLAYER_RADIUS) * exit.sign;
      continue;
    }

    const distance = Math.sqrt(distanceSq);
    const push = PLAYER_RADIUS - distance;
    deltaRight /= distance;
    deltaForward /= distance;
    planar.right += deltaRight * push;
    planar.forward += deltaForward * push;
  }

  const collided =
    Math.abs(planar.right - startRight) > 0.0001 ||
    Math.abs(planar.forward - startForward) > 0.0001;
  planar.right = clamp(planar.right, BOUNDS.minRight, BOUNDS.maxRight);
  planar.forward = clamp(planar.forward, BOUNDS.minForward, BOUNDS.maxForward);
  WORLD.fromBasisComponents(planar.right, 0, planar.forward, player.position);
  return collided;
}

function syncCameraToPlayer() {
  const lookFrame = directionFrame();
  const eye = player.position.clone();
  WORLD.addHeight(eye, EYE_HEIGHT + player.height);
  camera.position.copy(eye);
  camera.up.copy(lookFrame.up);
  camera.lookAt(eye.clone().add(lookFrame.forward));
}

function inputLocked() {
  return game.revealTimer > 0;
}

function clearBufferedInput() {
  game.mouseScanDelta = 0;
  player.angularVelocity = 0;
  player.rollVelocity = 0;
}

// Snap the tilt target to the nearest notch shifted by `dir` steps (keyboard/wheel)
function stepTilt(dir) {
  let idx = 0;
  let best = Infinity;
  for (let i = 0; i < TILT_STEPS.length; i += 1) {
    const d = Math.abs(TILT_STEPS[i] - player.scanRollTarget);
    if (d < best) { best = d; idx = i; }
  }
  player.scanRollTarget = TILT_STEPS[clamp(idx + dir, 0, TILT_STEPS.length - 1)];
  game.pulse = Math.max(game.pulse, 0.2);
}

function applyDeadzone(value) {
  if (Math.abs(value) < PAD_DEADZONE) return 0;
  return (value - Math.sign(value) * PAD_DEADZONE) / (1 - PAD_DEADZONE);
}

// Poll the first connected gamepad. Returns analog axes (moveY/lookY already
// inverted so up = forward / up-tilt) plus one-shot button edges. Must be called
// exactly once per frame — it advances the edge-detection state in `pad`.
function readGamepad() {
  const idle = { moveX: 0, moveY: 0, lookX: 0, tiltActive: false, tiltTarget: 0, jumpEdge: false, pingEdge: false, resetEdge: false, startEdge: false };
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for (const candidate of pads) {
    if (candidate) { gp = candidate; break; }
  }
  if (!gp) {
    pad.connected = false;
    return idle;
  }
  pad.connected = true;

  const axis = (i) => gp.axes[i] || 0;
  const held = (i) => Boolean(gp.buttons[i] && gp.buttons[i].pressed);

  const jump = held(0); // A
  const reset = held(1); // B — explicit tilt reset
  const ping = held(11) || held(2); // R3 (click scan stick) or X — focused ping
  const focusToggle = held(10) || held(3); // L3 or Y — toggle focus mode
  const start = held(9); // Start

  // Shoulders hold a tilt notch: R1/R2 clockwise, L1/L2 counter-clockwise.
  const l1 = held(4);
  const l2 = held(6);
  const r1 = held(5);
  const r2 = held(7);
  const rNotch = (r1 && r2) ? 3 : r2 ? 2 : r1 ? 1 : 0;
  const lNotch = (l1 && l2) ? 3 : l2 ? 2 : l1 ? 1 : 0;
  const tiltActive = rNotch > 0 || lNotch > 0;
  const tiltTarget = (TILT_NOTCH_DEG[rNotch] - TILT_NOTCH_DEG[lNotch]) * (Math.PI / 180);

  if (focusToggle && !pad.prev.focusToggle) pad.focus = !pad.focus;

  const result = {
    moveX: applyDeadzone(axis(0)),
    moveY: -applyDeadzone(axis(1)),
    lookX: applyDeadzone(axis(2)),
    tiltActive,
    tiltTarget,
    jumpEdge: jump && !pad.prev.jump,
    pingEdge: ping && !pad.prev.ping,
    resetEdge: reset && !pad.prev.reset,
    startEdge: start && !pad.prev.start,
  };
  pad.prev.jump = jump;
  pad.prev.ping = ping;
  pad.prev.reset = reset;
  pad.prev.start = start;
  pad.prev.focusToggle = focusToggle;
  return result;
}

function isFocusMode() {
  return keys.has('ShiftLeft') || keys.has('ShiftRight') || pad.focus;
}

function updatePlayer(dt) {
  const gp = readGamepad();

  // A / Start begins the game (a gamepad press is a user gesture for audio in
  // modern browsers; if not, a key/click still works). Capture wasStarted so the
  // same A press doesn't also jump on the frame it starts.
  const wasStarted = game.started;
  if (!wasStarted && (gp.startEdge || gp.jumpEdge)) begin();

  if (inputLocked()) {
    clearBufferedInput();
    dom.reticle.style.setProperty('--scan-roll', `${player.scanRoll}rad`);
    syncCameraToPlayer();
    return;
  }

  if (wasStarted && gp.jumpEdge) jump();
  if (gp.pingEdge) fireFocusedPing();
  if (gp.resetEdge) resetTilt();

  // keyboard is discrete (±1), gamepad is analog; both fold into the same axes
  const scanTurn = (keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0);
  const forward =
    (keys.has('KeyW') ? 1 : 0) -
    (keys.has('KeyS') ? 1 : 0) +
    gp.moveY;
  const strafe =
    (keys.has('KeyD') ? 1 : 0) -
    (keys.has('KeyA') ? 1 : 0) +
    gp.moveX;
  const focus = isFocusMode();

  const focusMul = focus ? 0.38 : 1;
  const oldYaw = player.yaw;
  // right-stick X turns the scan (push right = turn right = subtract yaw)
  const yawDelta = (scanTurn * TURN_SPEED - gp.lookX * PAD_SCAN_SPEED) * focusMul * dt;
  player.yaw = normalizeAngle(player.yaw + yawDelta + game.mouseScanDelta * MOUSE_SCAN_SPEED);
  player.angularVelocity = normalizeAngle(player.yaw - oldYaw) / Math.max(dt, 0.001);
  game.mouseScanDelta = 0;

  // Tilt: the gamepad holds a notch and springs back to 0 on release; keyboard/
  // wheel set the target via edges (persistent). scanRoll eases toward the target.
  if (gp.tiltActive) {
    player.scanRollTarget = gp.tiltTarget;
    pad.tiltWasHeld = true;
  } else if (pad.tiltWasHeld) {
    player.scanRollTarget = 0;
    pad.tiltWasHeld = false;
  }

  const oldRoll = player.scanRoll;
  const ease = 1 - Math.exp(-TILT_SPRING * dt);
  player.scanRoll += (player.scanRollTarget - player.scanRoll) * ease;
  if (Math.abs(player.scanRoll) < 1e-4) player.scanRoll = 0;
  player.scanRoll = clamp(player.scanRoll, -MAX_SCAN_ROLL, MAX_SCAN_ROLL);
  player.rollVelocity = (player.scanRoll - oldRoll) / Math.max(dt, 0.001);

  if (!player.grounded || player.verticalVelocity !== 0) {
    player.verticalVelocity -= GRAVITY * dt;
    player.height += player.verticalVelocity * dt;
    if (player.height <= 0) {
      player.height = 0;
      player.verticalVelocity = 0;
      player.grounded = true;
    }
  }

  const moveFrame = movementFrame();
  const movement = new THREE.Vector3();

  if (forward) movement.addScaledVector(moveFrame.forward, forward);
  if (strafe) movement.addScaledVector(moveFrame.right, strafe);

  if (movement.lengthSq() > 1) movement.normalize();
  const triedToMove = movement.lengthSq() > 0;
  if (movement.lengthSq() > 0) {
    const speed = MOVE_SPEED * (focus ? 0.46 : 1);
    player.position.addScaledVector(movement, speed * dt);
    game.pulse = Math.max(game.pulse, 0.08);
  }

  dom.reticle.style.setProperty('--scan-roll', `${player.scanRoll}rad`);

  const hitWall = resolveCollision();
  if (hitWall && triedToMove) playWallBump();
  syncCameraToPlayer();
}

function isPlayerInsidePickup(pickup) {
  const planarDistanceSq = WORLD.distanceSqPlanar(player.position, pickup.group.position);
  if (planarDistanceSq > PICKUP_TOUCH_RADIUS * PICKUP_TOUCH_RADIUS) return false;

  if (pickup.airborne) {
    const playerTouchHeight = player.height + AIR_TOUCH_HEIGHT;
    if (Math.abs(pickup.group.position.y - playerTouchHeight) > AIR_TOUCH_TOLERANCE) return false;
  }

  return true;
}

function isPlayerOnPickupApproachSide(pickup) {
  if (pickup.approachYaw === null) return true;

  const planar = playerBasis();
  const sideYaw = yawFromBasisDelta(planar.right - pickup.right, planar.forward - pickup.forward);
  return Math.abs(normalizeAngle(sideYaw - pickup.approachYaw)) <= pickup.approachArc;
}

function collectPickup(pickup) {
  pickup.collected = true;
  setPickupVisible(pickup, false);
  game.collected += 1;
  game.activePickupIndex += 1;
  game.pulse = 1;
  game.revealTimer = REVEAL_DURATION;
  playAnchorChime(pickup.color, 1);

  if (game.collected === pickups.length) {
    showMessage('All anchors stabilized. GOAL: follow the bright green door.', 5.2);
    return;
  }

  activateCurrentPickup(`Anchor ${game.collected} stabilized. `);
}

function updatePickups(t, dt) {
  for (const [index, pickup] of pickups.entries()) {
    const active = isPickupActive(pickup);
    if (!active) continue;

    updatePickupTransform(pickup, t);
    pickup.ring.rotation.z += (1.5 + index * 0.24) * dt;
    pickup.core.rotation.x += 1.08 * dt;
    pickup.core.rotation.y += 1.86 * dt;
    pickup.floorRing.rotation.z -= 0.6 * dt;
    if (pickup.gate) pickup.gate.rotation.z = Math.sin(t * 1.6 + pickup.phase) * 0.05;

    if (!isPlayerInsidePickup(pickup)) continue;

    if (!isPlayerOnPickupApproachSide(pickup)) {
      if (t - game.lastAnchorHint > 1.8) {
        game.lastAnchorHint = t;
        game.pulse = Math.max(game.pulse, 0.35);
        showMessage('This anchor has a face. Slip in from the lit side.', 1.6);
      }
      continue;
    }

    collectPickup(pickup);
  }
}

function updatePortal(t, dt) {
  if (!portal) return;

  const open = game.collected === pickups.length;
  const distanceSq = WORLD.distanceSqPlanar(player.position, portal.position);
  const glow = open ? 1.15 + Math.sin(t * 3) * 0.22 : 0.16;
  portalRing.material.emissiveIntensity = glow;
  portalCore.material.opacity = open ? 0.34 + Math.sin(t * 4) * 0.08 : 0.08;
  portalCore.material.emissiveIntensity = open ? 0.8 : 0.05;
  portalFloorRing.material.opacity = open ? 0.72 + Math.sin(t * 4.2) * 0.12 : 0.18;
  portalFloorRing.material.emissiveIntensity = open ? 1.1 : 0.24;
  portalBeam.material.opacity = open ? 0.54 + Math.sin(t * 3.6) * 0.1 : 0.1;
  portalBeam.material.emissiveIntensity = open ? 0.95 : 0.16;
  portalFloorRing.rotation.z -= (open ? 1.08 : 0.24) * dt;
  portalBeam.rotation.y += (open ? 0.6 : 0.18) * dt;
  portal.rotation.z += (open ? 0.72 : 0.18) * dt;

  if (!open && distanceSq < 2.2 * 2.2 && t - game.lastPortalHint > 2.4) {
    const rest = pickups.length - game.collected;
    game.lastPortalHint = t;
    game.pulse = Math.max(game.pulse, 0.45);
    showMessage(`${rest} anchor${rest === 1 ? '' : 's'} still hold the door flat.`, 2.2);
  }

  if (open && !game.won && distanceSq < 2.2 * 2.2) {
    game.won = true;
    playAnchorChime(COLORS.green, 1.35);
    game.revealTimer = REVEAL_DURATION;
    showMessage('The flat traveler crosses the third axis.', 8);
    dom.modeReadout.textContent = 'VOLUME HELD';
  }
}

function updateWorldAnimation(dt, t) {
  for (const item of animated) {
    item.object.rotation.y += item.spin * dt;
    item.object.position.y = item.baseY + Math.sin(t * 1.5 + item.baseY) * item.bob;
  }
}

function startAudio() {
  if (audioCtx) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  audioCtx = new AudioContext();
  audioCtx.resume();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.9;
  const limiter = audioCtx.createDynamicsCompressor();
  limiter.threshold.value = -12;
  limiter.knee.value = 24;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  masterGain.connect(limiter);
  limiter.connect(audioCtx.destination);
  lastPingAt = audioCtx.currentTime;

  for (const beacon of beacons) {
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    const panner = audioCtx.createStereoPanner();

    const wooden = beacon.timbre === 'wood';
    osc.type = wooden ? 'triangle' : 'sine';
    osc.frequency.value = beacon.baseFreq;
    filter.type = wooden ? 'lowpass' : 'bandpass';
    filter.frequency.value = beacon.baseFreq * (wooden ? 3.2 : 1.6);
    filter.Q.value = wooden ? 2 : 6;
    gain.gain.value = 0;
    panner.pan.value = 0;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);

    osc.start();
    beacon.audio = { osc, filter, gain, panner };
  }

  playSelfPing();
}

function updateAudio() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  if (game.pingMode !== 1 && now >= nextSelfPingAt) {
    if (game.pingMode === 0) {
      playSelfPing(0.42);
      emitEchoes(0.42);
    } else {
      // hybrid heartbeat: presence, not information — center ray, short range, quiet
      playSelfPing(HEARTBEAT_PING_SCALE);
      emitEchoes(0.3, HEARTBEAT_ECHO_RANGE, true);
    }
    lastPingAt = now;
    nextSelfPingAt = now + ECHO_PERIOD;
  }

  const sincePing = Math.max(0, now - lastPingAt);
  const echoPulse = Math.exp(-9 * Math.min(sincePing / ECHO_PERIOD, 4));
  const tiltStereo = Math.abs(Math.sin(player.scanRoll));

  for (const beacon of beacons) {
    const signal = signalForBeacon(beacon);
    const rel = normalizeAngle(yawToObject(beacon.object) - player.yaw);
    const distance = Math.sqrt(WORLD.distanceSqPlanar(player.position, beacon.object.position));
    const alignment = Math.max(0, Math.cos(rel));
    const scanDoppler = clamp(rel * player.angularVelocity * SCAN_DOPPLER_AMOUNT, -0.26, 0.26);
    const scanEnergy = clamp(Math.abs(player.angularVelocity) * signal, 0, 1);
    const distancePitch = clamp(1.0 - distance / 24, 0, 1) * 0.22;
    const echoSweep = echoPulse * (0.14 + signal * 0.16);
    const targetGain = Math.pow(signal, 0.92) * (0.22 + echoPulse * 0.68 + scanEnergy * 0.66) * beacon.gainScale;
    const targetFreq = beacon.baseFreq * (0.82 + alignment * 0.16 + distancePitch + echoSweep + scanDoppler);
    const targetFilter = beacon.baseFreq * (1.4 + signal * 1.8 + echoPulse * 2.4 + scanEnergy * 2.8);

    const targetPan = clamp(-EAR_SEPARATION * tiltStereo * Math.sin(rel), -1, 1);

    beacon.audio.gain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.06);
    beacon.audio.osc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.045);
    beacon.audio.filter.frequency.setTargetAtTime(targetFilter, audioCtx.currentTime, 0.045);
    beacon.audio.filter.Q.setTargetAtTime(5 + scanEnergy * 10, audioCtx.currentTime, 0.06);
    beacon.audio.panner.pan.setTargetAtTime(targetPan, audioCtx.currentTime, 0.06);
  }
}

function playSelfPing(scale = 1) {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1700, now);
  osc.frequency.exponentialRampToValueAtTime(720, now + 0.055);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.1 * scale, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.09);
}

function fireFocusedPing() {
  if (!audioCtx || !game.started || inputLocked()) return;
  if (game.pingMode === 0) return;

  const now = audioCtx.currentTime;
  if (now - lastFocusedPingAt < FOCUSED_PING_COOLDOWN) return;
  lastFocusedPingAt = now;
  lastPingAt = now;
  playSelfPing(1);
  emitEchoes(1);
  game.pulse = Math.max(game.pulse, 0.3);
}

function rayAabbDistance(originRight, originForward, dirRight, dirForward, box) {
  let tMin = 0;
  let tMax = Infinity;

  if (Math.abs(dirRight) < 1e-9) {
    if (originRight < box.minRight || originRight > box.maxRight) return null;
  } else {
    let t1 = (box.minRight - originRight) / dirRight;
    let t2 = (box.maxRight - originRight) / dirRight;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }

  if (Math.abs(dirForward) < 1e-9) {
    if (originForward < box.minForward || originForward > box.maxForward) return null;
  } else {
    let t1 = (box.minForward - originForward) / dirForward;
    let t2 = (box.maxForward - originForward) / dirForward;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }

  return tMin > 1e-6 ? tMin : null;
}

function castEchoRay(originRight, originForward, dirRight, dirForward) {
  let nearest = Infinity;
  for (const solid of solids) {
    const distance = rayAabbDistance(originRight, originForward, dirRight, dirForward, solid);
    if (distance !== null && distance < nearest) nearest = distance;
  }
  return nearest;
}

function emitEchoes(scale = 1, maxRange = MAX_ECHO_RANGE, centerOnly = false) {
  if (!audioCtx || !masterGain || !game.started) return;

  const planar = playerBasis();
  const tiltStereo = Math.abs(Math.sin(player.scanRoll));
  for (const offset of ECHO_RAY_OFFSETS) {
    if (centerOnly && offset !== 0) continue;
    const rayYaw = player.yaw + offset;
    const dirRight = -Math.sin(rayYaw);
    const dirForward = Math.cos(rayYaw);
    const distance = castEchoRay(planar.right, planar.forward, dirRight, dirForward);
    if (!Number.isFinite(distance) || distance > maxRange) continue;

    const delay = (distance * 2) / SOUND_SPEED;
    // positive ray offset = scan-left ray; left = negative pan (decision ③)
    const pan = offset === 0 ? 0 : -Math.sign(offset) * EAR_SEPARATION * tiltStereo;
    playEchoReturn(delay, distance, scale * (offset === 0 ? 1 : 0.72), pan);
  }
}

function playEchoReturn(delay, distance, scale, pan = 0) {
  const start = audioCtx.currentTime + delay;
  const closeness = clamp(1 - distance / MAX_ECHO_RANGE, 0, 1);
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  // near = sharp "kin", far = dull "bon"
  const freq = 240 + closeness * 900;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq * 1.12, start);
  osc.frequency.exponentialRampToValueAtTime(freq, start + 0.03);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500 + closeness * 3800, start);

  const peak = Math.max(ECHO_GAIN * scale * (0.18 + closeness * 0.82), 0.0002);
  const duration = 0.05 + (1 - closeness) * 0.09;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(filter);
  filter.connect(gain);
  if (pan !== 0) {
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(clamp(pan, -1, 1), start);
    gain.connect(panner);
    panner.connect(masterGain);
  } else {
    gain.connect(masterGain);
  }
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playWallBump() {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  if (now - game.lastWallBumpAt < 0.22) return;
  game.lastWallBumpAt = now;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.setValueAtTime(115, now);
  osc.frequency.exponentialRampToValueAtTime(72, now + 0.13);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(310, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playAnchorChime(color, scale = 1) {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const base = color === COLORS.green ? 740 : color === COLORS.red ? 620 : color === COLORS.magenta ? 560 : color === COLORS.amber ? 470 : 390;
  const output = audioCtx.createGain();
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(0.22 * scale, now + 0.018);
  output.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
  output.connect(masterGain);

  for (const [index, ratio] of [1, 1.5, 2.02].entries()) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = index === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(base * ratio, now);
    osc.frequency.exponentialRampToValueAtTime(base * ratio * 1.18, now + 0.12);
    gain.gain.value = 1 / (index + 1.2);
    osc.connect(gain);
    gain.connect(output);
    osc.start(now + index * 0.018);
    osc.stop(now + 0.42);
  }
}

function showMessage(text, duration = 3.2) {
  dom.message.textContent = text;
  game.messageTimer = duration;
}

function updateMessage(dt) {
  if (game.messageTimer <= 0) return;
  game.messageTimer -= dt;
  if (game.messageTimer <= 0 && !game.won) {
    const active = pickups[game.activePickupIndex];
    dom.message.textContent =
      game.collected === pickups.length
        ? 'GOAL: enter the bright green door.'
        : active
          ? active.hint
          : 'The ruin is legible only while it moves.';
  }
}

function updateHud(t) {
  const strongest = beacons.reduce((max, beacon) => Math.max(max, signalForBeacon(beacon)), 0);
  dom.signalBar.style.width = `${Math.round(strongest * 100)}%`;

  for (const pickup of pickups) {
    pickup.segment.style.background = pickup.collected
      ? `#${pickup.color.toString(16).padStart(6, '0')}`
      : 'rgba(2, 3, 4, 0.4)';
    pickup.segment.classList.toggle('active', isPickupActive(pickup));
  }

  if (game.compassFound) {
    dom.ribDrift.style.opacity = '0';
    for (const letter of ribbonLetters) {
      const offset = -normalizeAngle(letter.yaw - player.yaw) * RIBBON_PX_PER_RADIAN;
      letter.el.style.opacity = Math.abs(offset) < RIBBON_HALF_WIDTH ? '1' : '0';
      letter.el.style.transform = `translate(calc(-50% + ${offset.toFixed(1)}px), -50%)`;
    }
  } else {
    // uncalibrated: no letters, just a faint mark adrift
    dom.ribDrift.style.opacity = '1';
    const wander = Math.sin(t * 0.7) * 12 + Math.sin(t * 1.7) * 5;
    dom.ribDrift.style.transform = `translate(calc(-50% + ${wander.toFixed(1)}px), -50%)`;
    for (const letter of ribbonLetters) letter.el.style.opacity = '0';
  }

  if (game.devView) {
    dom.modeReadout.textContent = 'DEV 3D';
    dom.modeReadout.title = 'Developer 3D view';
    return;
  }

  if (!game.won) {
    const active = pickups[game.activePickupIndex];
    dom.modeReadout.textContent = game.collected === pickups.length ? 'GOAL' : `ANCHOR ${game.activePickupIndex + 1}`;
    if (active) dom.modeReadout.title = active.kind;
  }
}

function drawFull3D(width, height, alpha = 1) {
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  mentalCtx.globalCompositeOperation = 'source-over';
  mentalCtx.globalAlpha = alpha;
  mentalCtx.drawImage(renderer.domElement, 0, 0, width, height);
  mentalCtx.globalAlpha = 1;

  renderer.setSize(SENSOR_RENDER_WIDTH, height, false);
  camera.aspect = SENSOR_RENDER_WIDTH / height;
  camera.updateProjectionMatrix();
}

function drawMentalImage(dt) {
  const width = dom.mentalCanvas.width;
  const height = dom.mentalCanvas.height;
  const yawDelta = normalizeAngle(player.yaw - player.lastYaw);
  const shift = yawDelta * PANORAMA_PIXELS_PER_RADIAN;

  copyCtx.fillStyle = '#020304';
  copyCtx.fillRect(0, 0, width, height);
  copyCtx.drawImage(dom.mentalCanvas, shift, 0);
  mentalCtx.drawImage(copyCanvas, 0, 0);

  const drift = Math.hypot(player.angularVelocity, player.rollVelocity * 0.75);
  const motionDecay = clamp(Math.abs(drift) * 0.005, 0, 0.03);
  mentalCtx.fillStyle = `rgba(2, 3, 4, ${0.03 + motionDecay})`;
  mentalCtx.fillRect(0, 0, width, height);

  if (game.devView) {
    drawFull3D(width, height);
    player.lastYaw = player.yaw;
    return;
  }

  if (game.revealTimer > 0) {
    const revealAlpha = clamp(game.revealTimer / REVEAL_DURATION, 0, 1);
    drawFull3D(width, height, 0.18 + revealAlpha * 0.62);
    mentalCtx.fillStyle = `rgba(125, 255, 154, ${revealAlpha * 0.08})`;
    mentalCtx.fillRect(0, 0, width, height);
  }

  renderer.render(scene, camera);

  const source = renderer.domElement;
  const focus = isFocusMode();
  const sourceWidth = focus ? 8 : 3;
  const drawWidth = focus ? 18 : 8;
  const sourceX = Math.floor(source.width / 2 - sourceWidth / 2);

  mentalCtx.globalCompositeOperation = 'source-over';
  mentalCtx.globalAlpha = 0.86;
  mentalCtx.save();
  mentalCtx.translate(width / 2, height / 2);
  mentalCtx.rotate(player.scanRoll);
  mentalCtx.drawImage(source, sourceX, 0, sourceWidth, source.height, -drawWidth / 2, -height / 2, drawWidth, height);
  mentalCtx.restore();
  mentalCtx.globalAlpha = 1;

  if (game.pulse > 0.01) {
    const alpha = game.pulse * 0.12;
    mentalCtx.globalCompositeOperation = 'source-atop';
    mentalCtx.fillStyle = `rgba(68, 231, 255, ${alpha})`;
    mentalCtx.save();
    mentalCtx.translate(width / 2, height / 2);
    mentalCtx.rotate(player.scanRoll);
    mentalCtx.fillRect(-drawWidth / 2 - 2, -height / 2, drawWidth + 4, height);
    mentalCtx.restore();
    mentalCtx.globalCompositeOperation = 'source-over';
    game.pulse *= Math.pow(0.08, dt);
  }

  mentalCtx.globalCompositeOperation = 'source-over';
  mentalCtx.fillStyle = 'rgba(255,255,255,0.72)';
  mentalCtx.save();
  mentalCtx.translate(width / 2, height / 2);
  mentalCtx.rotate(player.scanRoll);
  mentalCtx.fillRect(0, height / 2 - 24, 1, 18);
  mentalCtx.restore();

  player.lastYaw = player.yaw;
}

function resize() {
  const width = Math.max(320, window.innerWidth);
  const height = Math.max(240, window.innerHeight);

  dom.mentalCanvas.width = width;
  dom.mentalCanvas.height = height;
  copyCanvas.width = width;
  copyCanvas.height = height;

  renderer.setSize(SENSOR_RENDER_WIDTH, height, false);
  camera.aspect = SENSOR_RENDER_WIDTH / height;
  camera.updateProjectionMatrix();

  mentalCtx.fillStyle = '#020304';
  mentalCtx.fillRect(0, 0, width, height);
}

function begin() {
  if (game.started) return;
  game.started = true;
  dom.startVeil.classList.add('hidden');
  startAudio();
  if (audioCtx) audioCtx.resume();
  showMessage('The echo line finds depth.', 3.2);
}

function jump() {
  if (!game.started || !player.grounded || inputLocked()) return;
  player.grounded = false;
  player.verticalVelocity = JUMP_SPEED;
  game.pulse = 1;
  playSelfPing(1.25);
  emitEchoes(1);
  if (audioCtx) lastPingAt = audioCtx.currentTime;
}

function resetTilt() {
  if (inputLocked()) return;
  player.scanRollTarget = 0;
  player.rollVelocity = 0;
  pad.tiltWasHeld = false;
  game.pulse = Math.max(game.pulse, 0.45);
  showMessage('Scan tilt reset.', 1.4);
}

function requestPointerLock() {
  if (document.pointerLockElement || !dom.mentalCanvas.requestPointerLock) return;
  dom.mentalCanvas.requestPointerLock();
}

function handleKeyDown(event) {
  if (event.code === 'Digit3') {
    event.preventDefault();
    game.devView = !game.devView;
    showMessage(game.devView ? 'Developer 3D view enabled.' : 'Developer 3D view disabled.', 1.8);
    return;
  }

  if (event.code === 'Digit0' || event.code === 'Digit1' || event.code === 'Digit2') {
    event.preventDefault();
    game.pingMode = Number(event.code.slice(-1));
    const labels = [
      'periodic — auto sonar every beat',
      'on-demand — F / right-click to listen',
      'hybrid — quiet heartbeat + focused ping (F / right-click)',
    ];
    showMessage(`Ping mode ${game.pingMode}: ${labels[game.pingMode]}`, 3);
    return;
  }

  if (inputLocked()) {
    if (event.code === 'Space' || event.code.startsWith('Arrow') || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      event.preventDefault();
    }
    return;
  }

  keys.add(event.code);

  if (
    event.code === 'Space' ||
    event.code.startsWith('Arrow') ||
    event.code === 'ShiftLeft' ||
    event.code === 'ShiftRight'
  ) {
    event.preventDefault();
  }

  if (event.code === 'Enter') begin();
  // Keyboard tilt is tap-step (persistent notches): Up steps toward +60, Down
  // toward -60; both at once resets to vertical.
  if ((event.code === 'ArrowUp' || event.code === 'ArrowDown') && !event.repeat) {
    if (!game.started) begin();
    if (keys.has('ArrowUp') && keys.has('ArrowDown')) resetTilt();
    else stepTilt(event.code === 'ArrowUp' ? 1 : -1);
  }
  if (event.code === 'Space' && !event.repeat) {
    if (!game.started) {
      begin();
    } else {
      jump();
    }
  }
  if (event.code === 'KeyF' && !event.repeat) fireFocusedPing();
}

function handleKeyUp(event) {
  keys.delete(event.code);
}

function resetTiltFromMiddleButton(event) {
  if (event.button !== 1) return false;
  event.preventDefault();
  if (inputLocked()) return true;
  if (!game.started) begin();
  resetTilt();
  return true;
}

function handlePointerDown(event) {
  if (inputLocked()) {
    event.preventDefault();
    return;
  }
  if (resetTiltFromMiddleButton(event)) return;
  if (event.button === 2) {
    event.preventDefault();
    fireFocusedPing();
    return;
  }
  if (event.button !== 0) return;
  if (!game.started) {
    begin();
    requestPointerLock();
    return;
  }

  jump();
  requestPointerLock();
}

function handleMouseMove(event) {
  if (!game.started || inputLocked()) return;
  game.mouseScanDelta -= clamp(event.movementX || 0, -80, 80);
}

function handleWheel(event) {
  event.preventDefault();
  if (!game.started || inputLocked()) return;
  // one wheel notch = one tilt step (up = tilt toward +60)
  if (event.deltaY) stepTilt(event.deltaY < 0 ? 1 : -1);
}

function handleMouseDown(event) {
  resetTiltFromMiddleButton(event);
}

function handleAuxClick(event) {
  resetTiltFromMiddleButton(event);
}

function loop(time) {
  const dt = Math.min(0.05, (time - game.lastTime) / 1000 || 0);
  game.lastTime = time;

  const locked = inputLocked();
  updatePlayer(dt);
  if (!locked) {
    game.time += dt;
    updateWorldAnimation(dt, game.time);
    updatePickups(game.time, dt);
    updateFrameShard(game.time, dt);
    updatePortal(game.time, dt);
  }
  updateAudio();
  updateMessage(dt);
  updateHud(time / 1000);
  drawMentalImage(dt);
  // reveal timer lives here, not in the draw path — DEV 3D early-returns there
  // and used to freeze the game forever after an anchor collect (fixed 2026-07-07)
  if (game.revealTimer > 0) game.revealTimer = Math.max(0, game.revealTimer - dt);

  requestAnimationFrame(loop);
}

async function loadLevel() {
  const requested = new URLSearchParams(window.location.search).get('level') || '1';
  const id = String(parseInt(requested, 10) || 1).padStart(2, '0');
  try {
    return (await import(`./levels/level${id}.js`)).default;
  } catch (error) {
    console.warn(`Level "${requested}" failed to load; falling back to level 01.`, error);
    return (await import('./levels/level01.js')).default;
  }
}

async function init() {
  addWorld(await loadLevel());
  buildAnchorSegments();
  resize();
  updatePlayer(0);
  window.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('auxclick', handleAuxClick);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeyDown, { passive: false });
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('resize', resize);
  window.addEventListener('gamepadconnected', () => showMessage('Controller linked. Left stick moves, right stick scans.', 3.4));
  window.addEventListener('gamepaddisconnected', () => showMessage('Controller unlinked.', 2));
  // Dev hook: read-only state access for debugging/automation. Not part of the game.
  window.coplanar = { player, game, pickups, beacons, solids };
  requestAnimationFrame(loop);
}

init();
