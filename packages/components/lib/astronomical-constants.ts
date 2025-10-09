/**
 * Astronomical Constants
 * Scientifically accurate values for celestial bodies and orbital mechanics
 *
 * Sources:
 * - NASA Planetary Fact Sheets
 * - IAU Standards
 * - JPL Horizons System
 */

// ============================================================================
// Scaling & Units
// ============================================================================

/** Scene scale factor (km to scene units) */
export const SCENE_SCALE = 0.001;

/** Astronomical Unit in kilometers */
export const ASTRONOMICAL_UNIT_KM = 149597870.7;

/** Speed of light in km/s */
export const SPEED_OF_LIGHT_KM_S = 299792.458;

/** Gravitational constant in km³/kg/s² */
export const GRAVITATIONAL_CONSTANT = 6.67430e-20;

// ============================================================================
// Sun
// ============================================================================

export const SUN_RADIUS_KM = 695700;
export const SUN_MASS_KG = 1.98892e30;
export const SUN_ROTATION_PERIOD_DAYS = 25.05; // At equator

// ============================================================================
// Mercury
// ============================================================================

export const MERCURY_RADIUS_KM = 2439.7;
export const MERCURY_MASS_KG = 3.3011e23;
export const MERCURY_ROTATION_PERIOD_SECONDS = 5067014.4; // 58.646 days
export const MERCURY_ORBITAL_PERIOD_DAYS = 87.969;
export const MERCURY_AXIAL_TILT_DEG = 0.034;
export const MERCURY_SEMI_MAJOR_AXIS_KM = 57909050;
export const MERCURY_ECCENTRICITY = 0.205630;

// ============================================================================
// Venus
// ============================================================================

export const VENUS_RADIUS_KM = 6051.8;
export const VENUS_MASS_KG = 4.8675e24;
export const VENUS_ROTATION_PERIOD_SECONDS = -20996798.4; // Retrograde, 243.025 days
export const VENUS_ORBITAL_PERIOD_DAYS = 224.701;
export const VENUS_AXIAL_TILT_DEG = 177.36;
export const VENUS_SEMI_MAJOR_AXIS_KM = 108208000;
export const VENUS_ECCENTRICITY = 0.006772;

// ============================================================================
// Earth
// ============================================================================

export const EARTH_RADIUS_KM = 6371.0;
export const EARTH_EQUATORIAL_RADIUS_KM = 6378.137;
export const EARTH_POLAR_RADIUS_KM = 6356.752;
export const EARTH_MASS_KG = 5.97237e24;
export const EARTH_ROTATION_PERIOD_SECONDS = 86164.0905; // Sidereal day
export const EARTH_SOLAR_DAY_SECONDS = 86400; // Mean solar day
export const EARTH_ORBITAL_PERIOD_DAYS = 365.256363004; // Sidereal year
export const EARTH_TROPICAL_YEAR_DAYS = 365.24219; // Tropical year
export const EARTH_AXIAL_TILT_DEG = 23.4392811;
export const EARTH_SEMI_MAJOR_AXIS_KM = ASTRONOMICAL_UNIT_KM;
export const EARTH_ECCENTRICITY = 0.0167086;

// ============================================================================
// Moon (Earth's)
// ============================================================================

export const MOON_RADIUS_KM = 1737.4;
export const MOON_MASS_KG = 7.342e22;
export const MOON_ROTATION_PERIOD_SECONDS = 2360591.5; // Tidally locked
export const MOON_ORBITAL_PERIOD_DAYS = 27.321661;
export const MOON_SEMI_MAJOR_AXIS_KM = 384400;
export const MOON_ECCENTRICITY = 0.0549;
export const MOON_AXIAL_TILT_DEG = 6.687;

// ============================================================================
// Mars
// ============================================================================

export const MARS_RADIUS_KM = 3389.5;
export const MARS_MASS_KG = 6.4171e23;
export const MARS_ROTATION_PERIOD_SECONDS = 88642.66; // 24.6229 hours
export const MARS_ORBITAL_PERIOD_DAYS = 686.980;
export const MARS_AXIAL_TILT_DEG = 25.19;
export const MARS_SEMI_MAJOR_AXIS_KM = 227939200;
export const MARS_ECCENTRICITY = 0.0934;

// ============================================================================
// Jupiter
// ============================================================================

export const JUPITER_RADIUS_KM = 69911;
export const JUPITER_EQUATORIAL_RADIUS_KM = 71492;
export const JUPITER_POLAR_RADIUS_KM = 66854;
export const JUPITER_MASS_KG = 1.8982e27;
export const JUPITER_ROTATION_PERIOD_SECONDS = 35730; // 9.925 hours
export const JUPITER_ORBITAL_PERIOD_DAYS = 4332.589;
export const JUPITER_AXIAL_TILT_DEG = 3.13;
export const JUPITER_SEMI_MAJOR_AXIS_KM = 778.57e6;
export const JUPITER_ECCENTRICITY = 0.0489;

// ============================================================================
// Saturn
// ============================================================================

export const SATURN_RADIUS_KM = 58232;
export const SATURN_EQUATORIAL_RADIUS_KM = 60268;
export const SATURN_POLAR_RADIUS_KM = 54364;
export const SATURN_MASS_KG = 5.6834e26;
export const SATURN_ROTATION_PERIOD_SECONDS = 38362; // 10.656 hours
export const SATURN_ORBITAL_PERIOD_DAYS = 10759.22;
export const SATURN_AXIAL_TILT_DEG = 26.73;
export const SATURN_SEMI_MAJOR_AXIS_KM = 1433.53e6;
export const SATURN_ECCENTRICITY = 0.0565;

// Saturn's Rings
export const SATURN_RING_INNER_RADIUS_KM = 66900;
export const SATURN_RING_OUTER_RADIUS_KM = 140220;

// ============================================================================
// Uranus
// ============================================================================

export const URANUS_RADIUS_KM = 25362;
export const URANUS_EQUATORIAL_RADIUS_KM = 25559;
export const URANUS_POLAR_RADIUS_KM = 24973;
export const URANUS_MASS_KG = 8.6810e25;
export const URANUS_ROTATION_PERIOD_SECONDS = -62063.712; // Retrograde, 17.24 hours
export const URANUS_ORBITAL_PERIOD_DAYS = 30688.5;
export const URANUS_AXIAL_TILT_DEG = 97.77; // Extreme tilt
export const URANUS_SEMI_MAJOR_AXIS_KM = 2872.46e6;
export const URANUS_ECCENTRICITY = 0.0457;

// ============================================================================
// Neptune
// ============================================================================

export const NEPTUNE_RADIUS_KM = 24622;
export const NEPTUNE_EQUATORIAL_RADIUS_KM = 24764;
export const NEPTUNE_POLAR_RADIUS_KM = 24341;
export const NEPTUNE_MASS_KG = 1.02413e26;
export const NEPTUNE_ROTATION_PERIOD_SECONDS = 57996; // 16.11 hours
export const NEPTUNE_ORBITAL_PERIOD_DAYS = 60182;
export const NEPTUNE_AXIAL_TILT_DEG = 28.32;
export const NEPTUNE_SEMI_MAJOR_AXIS_KM = 4495.06e6;
export const NEPTUNE_ECCENTRICITY = 0.0113;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert kilometers to scene units
 */
export function kmToSceneUnits(km: number): number {
  return km * SCENE_SCALE;
}

/**
 * Convert scene units to kilometers
 */
export function sceneUnitsToKm(units: number): number {
  return units / SCENE_SCALE;
}

/**
 * Calculate rotation speed in radians per frame (60fps)
 */
export function calculateRotationSpeed(
  rotationPeriodSeconds: number,
  timeScale: number = 1
): number {
  return ((2 * Math.PI) / (rotationPeriodSeconds * 60)) * timeScale;
}

/**
 * Get current day of year and fraction
 */
export function getCurrentDayOfYear(): {
  dayOfYear: number;
  fractionOfDay: number;
} {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const fractionOfDay =
    (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
  return { dayOfYear, fractionOfDay };
}
