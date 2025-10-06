/**
 * @plexusui/constants
 *
 * Shared constants for aerospace and celestial mechanics calculations.
 * All measurements are in SI units unless otherwise specified.
 */

// ============================================================================
// CELESTIAL BODIES
// ============================================================================

/**
 * Physical and orbital constants for celestial bodies
 */
export const CELESTIAL_BODIES = {
  EARTH: {
    /** Mean radius in kilometers */
    RADIUS_KM: 6371,
    /** Equatorial radius in kilometers */
    EQUATORIAL_RADIUS_KM: 6378.137,
    /** Polar radius in kilometers */
    POLAR_RADIUS_KM: 6356.752,
    /** Diameter in kilometers */
    DIAMETER_KM: 12742,
    /** Mass in kilograms */
    MASS_KG: 5.972e24,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 398600,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: 1,
    /** Sidereal rotation period in hours */
    ROTATION_PERIOD_HOURS: 23.9344696,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 365.25,
    /** Axial tilt (obliquity of ecliptic) in degrees */
    AXIAL_TILT_DEG: 23.4397,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 29.78,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 9.80665,
  },

  MARS: {
    /** Mean radius in kilometers */
    RADIUS_KM: 3389.5,
    /** Equatorial radius in kilometers */
    EQUATORIAL_RADIUS_KM: 3396.2,
    /** Polar radius in kilometers */
    POLAR_RADIUS_KM: 3376.2,
    /** Diameter in kilometers */
    DIAMETER_KM: 6779,
    /** Mass in kilograms */
    MASS_KG: 6.4171e23,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 42828,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: 1.025957,
    /** Sidereal rotation period in hours */
    ROTATION_PERIOD_HOURS: 24.6229,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 687,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 25.19,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 24.07,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 3.71,
  },

  MERCURY: {
    /** Mean radius in kilometers */
    RADIUS_KM: 2439.7,
    /** Diameter in kilometers */
    DIAMETER_KM: 4879.4,
    /** Mass in kilograms */
    MASS_KG: 3.3011e23,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 22032,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: 58.646,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 87.969,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 0.034,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 47.36,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 3.7,
  },

  VENUS: {
    /** Mean radius in kilometers */
    RADIUS_KM: 6051.8,
    /** Diameter in kilometers */
    DIAMETER_KM: 12103.6,
    /** Mass in kilograms */
    MASS_KG: 4.8675e24,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 324859,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: -243.025,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 224.701,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 177.36,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 35.02,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 8.87,
  },

  MOON: {
    /** Mean radius in kilometers */
    RADIUS_KM: 1737.4,
    /** Diameter in kilometers */
    DIAMETER_KM: 3474.8,
    /** Mass in kilograms */
    MASS_KG: 7.342e22,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 4902.8,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: 27.321661,
    /** Orbital period around Earth in Earth days */
    ORBITAL_PERIOD_DAYS: 27.321661,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 6.687,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 1.022,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 1.62,
  },

  JUPITER: {
    /** Mean radius in kilometers */
    RADIUS_KM: 69911,
    /** Equatorial radius in kilometers */
    EQUATORIAL_RADIUS_KM: 71492,
    /** Polar radius in kilometers */
    POLAR_RADIUS_KM: 66854,
    /** Diameter in kilometers */
    DIAMETER_KM: 139822,
    /** Mass in kilograms */
    MASS_KG: 1.8982e27,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 126686534,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: 0.41354,
    /** Sidereal rotation period in hours */
    ROTATION_PERIOD_HOURS: 9.925,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 4332.59,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 3.13,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 13.07,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 24.79,
  },

  SATURN: {
    /** Mean radius in kilometers */
    RADIUS_KM: 58232,
    /** Equatorial radius in kilometers */
    EQUATORIAL_RADIUS_KM: 60268,
    /** Polar radius in kilometers */
    POLAR_RADIUS_KM: 54364,
    /** Diameter in kilometers */
    DIAMETER_KM: 116464,
    /** Mass in kilograms */
    MASS_KG: 5.6834e26,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 37931187,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: 0.44401,
    /** Sidereal rotation period in hours */
    ROTATION_PERIOD_HOURS: 10.656,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 10759.22,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 26.73,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 9.68,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 10.44,
  },

  URANUS: {
    /** Mean radius in kilometers */
    RADIUS_KM: 25362,
    /** Equatorial radius in kilometers */
    EQUATORIAL_RADIUS_KM: 25559,
    /** Polar radius in kilometers */
    POLAR_RADIUS_KM: 24973,
    /** Diameter in kilometers */
    DIAMETER_KM: 50724,
    /** Mass in kilograms */
    MASS_KG: 8.6810e25,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 5793939,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: -0.71833,
    /** Sidereal rotation period in hours */
    ROTATION_PERIOD_HOURS: -17.24,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 30688.5,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 97.77,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 6.80,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 8.87,
  },

  NEPTUNE: {
    /** Mean radius in kilometers */
    RADIUS_KM: 24622,
    /** Equatorial radius in kilometers */
    EQUATORIAL_RADIUS_KM: 24764,
    /** Polar radius in kilometers */
    POLAR_RADIUS_KM: 24341,
    /** Diameter in kilometers */
    DIAMETER_KM: 49244,
    /** Mass in kilograms */
    MASS_KG: 1.02413e26,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 6836529,
    /** Sidereal rotation period in Earth days */
    ROTATION_PERIOD_DAYS: 0.67125,
    /** Sidereal rotation period in hours */
    ROTATION_PERIOD_HOURS: 16.11,
    /** Orbital period around Sun in Earth days */
    ORBITAL_PERIOD_DAYS: 60182,
    /** Axial tilt in degrees */
    AXIAL_TILT_DEG: 28.32,
    /** Mean orbital velocity in km/s */
    ORBITAL_VELOCITY_KM_S: 5.43,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 11.15,
  },

  SUN: {
    /** Mean radius in kilometers */
    RADIUS_KM: 696000,
    /** Diameter in kilometers */
    DIAMETER_KM: 1392000,
    /** Mass in kilograms */
    MASS_KG: 1.9885e30,
    /** Standard gravitational parameter (GM) in km³/s² */
    MU: 132712440018,
    /** Sidereal rotation period in Earth days (at equator) */
    ROTATION_PERIOD_DAYS: 25.05,
    /** Surface gravity in m/s² */
    SURFACE_GRAVITY_M_S2: 274,
    /** Effective temperature in Kelvin */
    TEMPERATURE_K: 5778,
  },
} as const;

// ============================================================================
// ORBITAL MECHANICS CONSTANTS
// ============================================================================

/**
 * Universal constants for orbital mechanics
 */
export const ORBITAL_CONSTANTS = {
  /** Astronomical Unit in kilometers (mean Earth-Sun distance) */
  AU_KM: 149597870.7,

  /** Astronomical Unit in meters */
  AU_M: 149597870700,

  /** Gravitational constant in m³/(kg·s²) */
  G: 6.67430e-11,

  /** Speed of light in vacuum in m/s */
  C: 299792458,

  /** Days per Julian year */
  JULIAN_YEAR_DAYS: 365.25,

  /** Seconds per day */
  SECONDS_PER_DAY: 86400,

  /** Seconds per hour */
  SECONDS_PER_HOUR: 3600,

  /** Degrees per radian */
  DEG_TO_RAD: Math.PI / 180,

  /** Radians per degree */
  RAD_TO_DEG: 180 / Math.PI,
} as const;

// ============================================================================
// COMMON ORBITAL PARAMETERS
// ============================================================================

/**
 * Common orbital altitudes and parameters (all in km from Earth's surface)
 */
export const COMMON_ORBITS = {
  /** Low Earth Orbit - typical range */
  LEO: {
    MIN_ALTITUDE_KM: 160,
    MAX_ALTITUDE_KM: 2000,
    TYPICAL_ALTITUDE_KM: 400,
  },

  /** Medium Earth Orbit - GPS satellites */
  MEO: {
    MIN_ALTITUDE_KM: 2000,
    MAX_ALTITUDE_KM: 35786,
    TYPICAL_ALTITUDE_KM: 20200,
  },

  /** Geostationary Orbit */
  GEO: {
    ALTITUDE_KM: 35786,
    RADIUS_KM: 42164, // From Earth's center
    PERIOD_HOURS: 23.9344696, // Matches Earth's rotation
  },

  /** International Space Station */
  ISS: {
    ALTITUDE_KM: 408,
    INCLINATION_DEG: 51.6,
    PERIOD_MINUTES: 92.68,
  },

  /** Hubble Space Telescope */
  HUBBLE: {
    ALTITUDE_KM: 540,
    INCLINATION_DEG: 28.5,
    PERIOD_MINUTES: 95,
  },
} as const;

// ============================================================================
// PHYSICAL CONSTANTS
// ============================================================================

/**
 * Miscellaneous physical constants
 */
export const PHYSICAL_CONSTANTS = {
  /** Standard Earth gravity in m/s² */
  STANDARD_GRAVITY: 9.80665,

  /** Stefan-Boltzmann constant in W/(m²·K⁴) */
  STEFAN_BOLTZMANN: 5.670374419e-8,

  /** Solar constant at 1 AU in W/m² */
  SOLAR_CONSTANT: 1361,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CelestialBodyKey = keyof typeof CELESTIAL_BODIES;
export type CelestialBody = typeof CELESTIAL_BODIES[CelestialBodyKey];
