/**
 * Aerospace UI Components - Main Export File
 *
 * Import everything you need from this single entry point
 */

// ============================================================================
// PRIMITIVES & COMPOSED COMPONENTS
// ============================================================================

// Earth
export {
  Earth,
  Globe,
  EarthScene,
  EarthSphereRoot,
  EARTH_RADIUS,
  EARTH_REAL_RADIUS_KM,
  EARTH_ROTATION_PERIOD,
  EARTH_ORBITAL_PERIOD,
  EARTH_DIAMETER_KM,
} from "../packages/earth";
export type {
  EarthProps,
  EarthSceneProps,
  EarthSphereRootProps,
} from "../packages/earth";

// Mars
export {
  Mars,
  MarsScene,
  MarsSphereRoot,
  MARS_RADIUS,
  MARS_REAL_RADIUS_KM,
  MARS_ROTATION_PERIOD,
  MARS_ORBITAL_PERIOD,
} from "../packages/mars";
export type {
  MarsProps,
  MarsSceneProps,
  MarsSphereRootProps,
} from "../packages/mars";

// Mercury
export { Mercury, MercuryScene, MercurySphereRoot } from "../packages/mercury";
export type {
  MercurySceneProps,
  MercurySphereRootProps,
} from "../packages/mercury";

// Venus
export { Venus, VenusScene, VenusSphereRoot } from "../packages/venus";
export type { VenusSceneProps, VenusSphereRootProps } from "../packages/venus";

// Moon
export { Moon, MoonScene, MoonSphereRoot } from "../packages/moon";
export type { MoonSceneProps, MoonSphereRootProps } from "../packages/moon";

// Jupiter
export { Jupiter, JupiterScene, JupiterSphereRoot } from "../packages/jupiter";
export type {
  JupiterSceneProps,
  JupiterSphereRootProps,
} from "../packages/jupiter";

// Saturn
export { Saturn, SaturnScene, SaturnSphereRoot } from "../packages/saturn";
export type {
  SaturnSceneProps,
  SaturnSphereRootProps,
} from "../packages/saturn";

// Uranus
export { Uranus, UranusScene, UranusSphereRoot } from "../packages/uranus";
export type {
  UranusSceneProps,
  UranusSphereRootProps,
} from "../packages/uranus";

// Neptune
export { Neptune, NeptuneScene, NeptuneSphereRoot } from "../packages/neptune";
export type {
  NeptuneSceneProps,
  NeptuneSphereRootProps,
} from "../packages/neptune";
