# GameBlocks Usage

Source project: https://github.com/xt4d/GameBlocks

## Selected Modules

### `modules/math/WorldBasis.js`

- Status: copied into `prototype/modules/math/WorldBasis.js`.
- Purpose: single source of truth for the game's right/up/forward coordinate basis.
- Integration:
  - Player positions are stored in Three.js world coordinates but moved through basis-space components.
  - Heading-relative movement uses `yawPitchRollFrame`.
  - Collision and signal calculations use `toBasisComponents`, `fromBasisComponents`, and `forwardToYaw`.

## Adapted GameBlocks Concepts

- The prototype keeps the GameBlocks convention of separating gameplay-space directions from raw Three.js axes.
- The 2D-perception mechanic is custom: the game renders a narrow first-person 3D slice, shifts the previous mental image by yaw delta, and lets the player reconstruct the room from fading temporal persistence.
- The project does not pull in Rapier or larger motion/camera stacks because this prototype only needs lightweight first-person traversal, simple planar collision, and a custom perception renderer.

## Third-Party Notice

The copied GameBlocks module is MIT licensed. See `third_party/GameBlocks_LICENSE.txt`.
