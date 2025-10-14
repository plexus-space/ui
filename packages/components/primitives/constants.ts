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
export const GRAVITATIONAL_CONSTANT = 6.6743e-20;

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
export const MERCURY_ECCENTRICITY = 0.20563;

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
export const MARS_ORBITAL_PERIOD_DAYS = 686.98;
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
export const URANUS_MASS_KG = 8.681e25;
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
// Major Moons
// ============================================================================

// Jupiter's Galilean Moons
export const IO_RADIUS_KM = 1821.6;
export const IO_MASS_KG = 8.931938e22;
export const IO_ORBITAL_PERIOD_DAYS = 1.769;
export const IO_SEMI_MAJOR_AXIS_KM = 421700;
export const IO_ECCENTRICITY = 0.0041;

export const EUROPA_RADIUS_KM = 1560.8;
export const EUROPA_MASS_KG = 4.799844e22;
export const EUROPA_ORBITAL_PERIOD_DAYS = 3.551;
export const EUROPA_SEMI_MAJOR_AXIS_KM = 671034;
export const EUROPA_ECCENTRICITY = 0.0094;

export const GANYMEDE_RADIUS_KM = 2634.1;
export const GANYMEDE_MASS_KG = 1.4819e23;
export const GANYMEDE_ORBITAL_PERIOD_DAYS = 7.155;
export const GANYMEDE_SEMI_MAJOR_AXIS_KM = 1070412;
export const GANYMEDE_ECCENTRICITY = 0.0013;

export const CALLISTO_RADIUS_KM = 2410.3;
export const CALLISTO_MASS_KG = 1.075938e23;
export const CALLISTO_ORBITAL_PERIOD_DAYS = 16.689;
export const CALLISTO_SEMI_MAJOR_AXIS_KM = 1882709;
export const CALLISTO_ECCENTRICITY = 0.0074;

// Saturn's Major Moons
export const TITAN_RADIUS_KM = 2574.73;
export const TITAN_MASS_KG = 1.3452e23;
export const TITAN_ORBITAL_PERIOD_DAYS = 15.945;
export const TITAN_SEMI_MAJOR_AXIS_KM = 1221870;
export const TITAN_ECCENTRICITY = 0.0288;
export const TITAN_AXIAL_TILT_DEG = 0.3;

export const ENCELADUS_RADIUS_KM = 252.1;
export const ENCELADUS_MASS_KG = 1.08022e20;
export const ENCELADUS_ORBITAL_PERIOD_DAYS = 1.37;
export const ENCELADUS_SEMI_MAJOR_AXIS_KM = 238042;
export const ENCELADUS_ECCENTRICITY = 0.0047;

export const RHEA_RADIUS_KM = 763.8;
export const RHEA_MASS_KG = 2.306518e21;
export const RHEA_ORBITAL_PERIOD_DAYS = 4.518;
export const RHEA_SEMI_MAJOR_AXIS_KM = 527108;
export const RHEA_ECCENTRICITY = 0.0012;

// Uranus's Major Moons
export const MIRANDA_RADIUS_KM = 235.8;
export const MIRANDA_MASS_KG = 6.59e19;
export const MIRANDA_ORBITAL_PERIOD_DAYS = 1.413;
export const MIRANDA_SEMI_MAJOR_AXIS_KM = 129390;
export const MIRANDA_ECCENTRICITY = 0.0013;

export const ARIEL_RADIUS_KM = 578.9;
export const ARIEL_MASS_KG = 1.353e21;
export const ARIEL_ORBITAL_PERIOD_DAYS = 2.52;
export const ARIEL_SEMI_MAJOR_AXIS_KM = 191020;
export const ARIEL_ECCENTRICITY = 0.0012;

export const TITANIA_RADIUS_KM = 788.4;
export const TITANIA_MASS_KG = 3.527e21;
export const TITANIA_ORBITAL_PERIOD_DAYS = 8.706;
export const TITANIA_SEMI_MAJOR_AXIS_KM = 435910;
export const TITANIA_ECCENTRICITY = 0.0011;

export const OBERON_RADIUS_KM = 761.4;
export const OBERON_MASS_KG = 3.014e21;
export const OBERON_ORBITAL_PERIOD_DAYS = 13.463;
export const OBERON_SEMI_MAJOR_AXIS_KM = 583520;
export const OBERON_ECCENTRICITY = 0.0014;

// Neptune's Major Moon
export const TRITON_RADIUS_KM = 1353.4;
export const TRITON_MASS_KG = 2.14e22;
export const TRITON_ORBITAL_PERIOD_DAYS = -5.877; // Retrograde orbit
export const TRITON_SEMI_MAJOR_AXIS_KM = 354759;
export const TRITON_ECCENTRICITY = 0.000016;
export const TRITON_AXIAL_TILT_DEG = 156.885; // Retrograde rotation

// Mars Moons
export const PHOBOS_RADIUS_KM = 11.267; // Mean radius
export const PHOBOS_MASS_KG = 1.0659e16;
export const PHOBOS_ORBITAL_PERIOD_DAYS = 0.31891;
export const PHOBOS_SEMI_MAJOR_AXIS_KM = 9376;
export const PHOBOS_ECCENTRICITY = 0.0151;

export const DEIMOS_RADIUS_KM = 6.2; // Mean radius
export const DEIMOS_MASS_KG = 1.4762e15;
export const DEIMOS_ORBITAL_PERIOD_DAYS = 1.26244;
export const DEIMOS_SEMI_MAJOR_AXIS_KM = 23463.2;
export const DEIMOS_ECCENTRICITY = 0.00033;

// ============================================================================
// Dwarf Planets
// ============================================================================

export const PLUTO_RADIUS_KM = 1188.3;
export const PLUTO_MASS_KG = 1.303e22;
export const PLUTO_ROTATION_PERIOD_SECONDS = 551856; // 6.387 days
export const PLUTO_ORBITAL_PERIOD_DAYS = 90560;
export const PLUTO_AXIAL_TILT_DEG = 122.53;
export const PLUTO_SEMI_MAJOR_AXIS_KM = 5906.38e6;
export const PLUTO_ECCENTRICITY = 0.2488;

export const CERES_RADIUS_KM = 469.73;
export const CERES_MASS_KG = 9.3835e20;
export const CERES_ROTATION_PERIOD_SECONDS = 32667; // 9.074 hours
export const CERES_ORBITAL_PERIOD_DAYS = 1680;
export const CERES_AXIAL_TILT_DEG = 4;
export const CERES_SEMI_MAJOR_AXIS_KM = 413700000;
export const CERES_ECCENTRICITY = 0.0758;

export const ERIS_RADIUS_KM = 1163;
export const ERIS_MASS_KG = 1.66e22;
export const ERIS_ROTATION_PERIOD_SECONDS = 93000; // ~25.9 hours
export const ERIS_ORBITAL_PERIOD_DAYS = 203830;
export const ERIS_SEMI_MAJOR_AXIS_KM = 10166000000;
export const ERIS_ECCENTRICITY = 0.44177;

// ============================================================================
// Notable Asteroids
// ============================================================================

export const VESTA_RADIUS_KM = 262.7; // Mean radius
export const VESTA_MASS_KG = 2.59076e20;
export const VESTA_ROTATION_PERIOD_SECONDS = 19233; // 5.342 hours
export const VESTA_ORBITAL_PERIOD_DAYS = 1325.46;
export const VESTA_SEMI_MAJOR_AXIS_KM = 353268000;
export const VESTA_ECCENTRICITY = 0.0887;

export const PALLAS_RADIUS_KM = 256; // Mean radius
export const PALLAS_MASS_KG = 2.04e20;
export const PALLAS_ROTATION_PERIOD_SECONDS = 27700; // ~7.7 hours
export const PALLAS_ORBITAL_PERIOD_DAYS = 1686.42;
export const PALLAS_SEMI_MAJOR_AXIS_KM = 414750000;
export const PALLAS_ECCENTRICITY = 0.231;

export const HYGIEA_RADIUS_KM = 217; // Mean radius
export const HYGIEA_MASS_KG = 8.32e19;
export const HYGIEA_ROTATION_PERIOD_SECONDS = 99576; // ~27.6 hours
export const HYGIEA_ORBITAL_PERIOD_DAYS = 2029.15;
export const HYGIEA_SEMI_MAJOR_AXIS_KM = 470300000;
export const HYGIEA_ECCENTRICITY = 0.117;

// Near-Earth Asteroids
export const EROS_RADIUS_KM = 8.42; // Mean radius
export const EROS_MASS_KG = 6.687e15;
export const EROS_ROTATION_PERIOD_SECONDS = 19098; // 5.27 hours
export const EROS_ORBITAL_PERIOD_DAYS = 643.219;
export const EROS_SEMI_MAJOR_AXIS_KM = 218000000;
export const EROS_ECCENTRICITY = 0.223;

export const APOPHIS_RADIUS_KM = 0.185; // Mean radius (370m diameter)
export const APOPHIS_MASS_KG = 6.1e10; // Estimated
export const APOPHIS_ROTATION_PERIOD_SECONDS = 1087; // ~30.1 hours
export const APOPHIS_ORBITAL_PERIOD_DAYS = 323.598;
export const APOPHIS_SEMI_MAJOR_AXIS_KM = 138350000;
export const APOPHIS_ECCENTRICITY = 0.191;

// ============================================================================
// Comets
// ============================================================================

export const HALLEY_NUCLEUS_RADIUS_KM = 5.5; // Mean radius (11km length)
export const HALLEY_MASS_KG = 2.2e14;
export const HALLEY_ORBITAL_PERIOD_DAYS = 27393; // ~75 years
export const HALLEY_SEMI_MAJOR_AXIS_KM = 2667950000;
export const HALLEY_ECCENTRICITY = 0.96714;

// ============================================================================
// Celestial Body Registry
// ============================================================================

export interface CelestialBody {
  name: string;
  type: "planet" | "moon" | "dwarf-planet" | "asteroid" | "comet";
  parent?: string;
  radiusKm: number;
  massKg: number;
  rotationPeriodSeconds?: number;
  orbitalPeriodDays?: number;
  semiMajorAxisKm?: number;
  eccentricity?: number;
  axialTiltDeg?: number;
}

export const celestialBodies: Record<string, CelestialBody> = {
  // Sun
  sun: {
    name: "Sun",
    type: "planet",
    radiusKm: SUN_RADIUS_KM,
    massKg: SUN_MASS_KG,
    rotationPeriodSeconds: SUN_ROTATION_PERIOD_DAYS * 86400,
  },

  // Planets
  mercury: {
    name: "Mercury",
    type: "planet",
    parent: "sun",
    radiusKm: MERCURY_RADIUS_KM,
    massKg: MERCURY_MASS_KG,
    rotationPeriodSeconds: MERCURY_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: MERCURY_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: MERCURY_SEMI_MAJOR_AXIS_KM,
    eccentricity: MERCURY_ECCENTRICITY,
    axialTiltDeg: MERCURY_AXIAL_TILT_DEG,
  },
  venus: {
    name: "Venus",
    type: "planet",
    parent: "sun",
    radiusKm: VENUS_RADIUS_KM,
    massKg: VENUS_MASS_KG,
    rotationPeriodSeconds: VENUS_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: VENUS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: VENUS_SEMI_MAJOR_AXIS_KM,
    eccentricity: VENUS_ECCENTRICITY,
    axialTiltDeg: VENUS_AXIAL_TILT_DEG,
  },
  earth: {
    name: "Earth",
    type: "planet",
    parent: "sun",
    radiusKm: EARTH_RADIUS_KM,
    massKg: EARTH_MASS_KG,
    rotationPeriodSeconds: EARTH_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: EARTH_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: EARTH_SEMI_MAJOR_AXIS_KM,
    eccentricity: EARTH_ECCENTRICITY,
    axialTiltDeg: EARTH_AXIAL_TILT_DEG,
  },
  mars: {
    name: "Mars",
    type: "planet",
    parent: "sun",
    radiusKm: MARS_RADIUS_KM,
    massKg: MARS_MASS_KG,
    rotationPeriodSeconds: MARS_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: MARS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: MARS_SEMI_MAJOR_AXIS_KM,
    eccentricity: MARS_ECCENTRICITY,
    axialTiltDeg: MARS_AXIAL_TILT_DEG,
  },
  jupiter: {
    name: "Jupiter",
    type: "planet",
    parent: "sun",
    radiusKm: JUPITER_RADIUS_KM,
    massKg: JUPITER_MASS_KG,
    rotationPeriodSeconds: JUPITER_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: JUPITER_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: JUPITER_SEMI_MAJOR_AXIS_KM,
    eccentricity: JUPITER_ECCENTRICITY,
    axialTiltDeg: JUPITER_AXIAL_TILT_DEG,
  },
  saturn: {
    name: "Saturn",
    type: "planet",
    parent: "sun",
    radiusKm: SATURN_RADIUS_KM,
    massKg: SATURN_MASS_KG,
    rotationPeriodSeconds: SATURN_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: SATURN_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: SATURN_SEMI_MAJOR_AXIS_KM,
    eccentricity: SATURN_ECCENTRICITY,
    axialTiltDeg: SATURN_AXIAL_TILT_DEG,
  },
  uranus: {
    name: "Uranus",
    type: "planet",
    parent: "sun",
    radiusKm: URANUS_RADIUS_KM,
    massKg: URANUS_MASS_KG,
    rotationPeriodSeconds: URANUS_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: URANUS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: URANUS_SEMI_MAJOR_AXIS_KM,
    eccentricity: URANUS_ECCENTRICITY,
    axialTiltDeg: URANUS_AXIAL_TILT_DEG,
  },
  neptune: {
    name: "Neptune",
    type: "planet",
    parent: "sun",
    radiusKm: NEPTUNE_RADIUS_KM,
    massKg: NEPTUNE_MASS_KG,
    rotationPeriodSeconds: NEPTUNE_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: NEPTUNE_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: NEPTUNE_SEMI_MAJOR_AXIS_KM,
    eccentricity: NEPTUNE_ECCENTRICITY,
    axialTiltDeg: NEPTUNE_AXIAL_TILT_DEG,
  },

  // Major Moons
  moon: {
    name: "Moon",
    type: "moon",
    parent: "earth",
    radiusKm: MOON_RADIUS_KM,
    massKg: MOON_MASS_KG,
    rotationPeriodSeconds: MOON_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: MOON_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: MOON_SEMI_MAJOR_AXIS_KM,
    eccentricity: MOON_ECCENTRICITY,
    axialTiltDeg: MOON_AXIAL_TILT_DEG,
  },
  io: {
    name: "Io",
    type: "moon",
    parent: "jupiter",
    radiusKm: IO_RADIUS_KM,
    massKg: IO_MASS_KG,
    orbitalPeriodDays: IO_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: IO_SEMI_MAJOR_AXIS_KM,
    eccentricity: IO_ECCENTRICITY,
  },
  europa: {
    name: "Europa",
    type: "moon",
    parent: "jupiter",
    radiusKm: EUROPA_RADIUS_KM,
    massKg: EUROPA_MASS_KG,
    orbitalPeriodDays: EUROPA_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: EUROPA_SEMI_MAJOR_AXIS_KM,
    eccentricity: EUROPA_ECCENTRICITY,
  },
  ganymede: {
    name: "Ganymede",
    type: "moon",
    parent: "jupiter",
    radiusKm: GANYMEDE_RADIUS_KM,
    massKg: GANYMEDE_MASS_KG,
    orbitalPeriodDays: GANYMEDE_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: GANYMEDE_SEMI_MAJOR_AXIS_KM,
    eccentricity: GANYMEDE_ECCENTRICITY,
  },
  callisto: {
    name: "Callisto",
    type: "moon",
    parent: "jupiter",
    radiusKm: CALLISTO_RADIUS_KM,
    massKg: CALLISTO_MASS_KG,
    orbitalPeriodDays: CALLISTO_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: CALLISTO_SEMI_MAJOR_AXIS_KM,
    eccentricity: CALLISTO_ECCENTRICITY,
  },
  titan: {
    name: "Titan",
    type: "moon",
    parent: "saturn",
    radiusKm: TITAN_RADIUS_KM,
    massKg: TITAN_MASS_KG,
    orbitalPeriodDays: TITAN_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: TITAN_SEMI_MAJOR_AXIS_KM,
    eccentricity: TITAN_ECCENTRICITY,
    axialTiltDeg: TITAN_AXIAL_TILT_DEG,
  },
  triton: {
    name: "Triton",
    type: "moon",
    parent: "neptune",
    radiusKm: TRITON_RADIUS_KM,
    massKg: TRITON_MASS_KG,
    orbitalPeriodDays: TRITON_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: TRITON_SEMI_MAJOR_AXIS_KM,
    eccentricity: TRITON_ECCENTRICITY,
    axialTiltDeg: TRITON_AXIAL_TILT_DEG,
  },
  phobos: {
    name: "Phobos",
    type: "moon",
    parent: "mars",
    radiusKm: PHOBOS_RADIUS_KM,
    massKg: PHOBOS_MASS_KG,
    orbitalPeriodDays: PHOBOS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: PHOBOS_SEMI_MAJOR_AXIS_KM,
    eccentricity: PHOBOS_ECCENTRICITY,
  },
  deimos: {
    name: "Deimos",
    type: "moon",
    parent: "mars",
    radiusKm: DEIMOS_RADIUS_KM,
    massKg: DEIMOS_MASS_KG,
    orbitalPeriodDays: DEIMOS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: DEIMOS_SEMI_MAJOR_AXIS_KM,
    eccentricity: DEIMOS_ECCENTRICITY,
  },

  // Dwarf Planets
  pluto: {
    name: "Pluto",
    type: "dwarf-planet",
    parent: "sun",
    radiusKm: PLUTO_RADIUS_KM,
    massKg: PLUTO_MASS_KG,
    rotationPeriodSeconds: PLUTO_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: PLUTO_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: PLUTO_SEMI_MAJOR_AXIS_KM,
    eccentricity: PLUTO_ECCENTRICITY,
    axialTiltDeg: PLUTO_AXIAL_TILT_DEG,
  },
  ceres: {
    name: "Ceres",
    type: "dwarf-planet",
    parent: "sun",
    radiusKm: CERES_RADIUS_KM,
    massKg: CERES_MASS_KG,
    rotationPeriodSeconds: CERES_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: CERES_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: CERES_SEMI_MAJOR_AXIS_KM,
    eccentricity: CERES_ECCENTRICITY,
    axialTiltDeg: CERES_AXIAL_TILT_DEG,
  },
  eris: {
    name: "Eris",
    type: "dwarf-planet",
    parent: "sun",
    radiusKm: ERIS_RADIUS_KM,
    massKg: ERIS_MASS_KG,
    rotationPeriodSeconds: ERIS_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: ERIS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: ERIS_SEMI_MAJOR_AXIS_KM,
    eccentricity: ERIS_ECCENTRICITY,
  },

  // Notable Asteroids
  vesta: {
    name: "Vesta",
    type: "asteroid",
    parent: "sun",
    radiusKm: VESTA_RADIUS_KM,
    massKg: VESTA_MASS_KG,
    rotationPeriodSeconds: VESTA_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: VESTA_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: VESTA_SEMI_MAJOR_AXIS_KM,
    eccentricity: VESTA_ECCENTRICITY,
  },
  pallas: {
    name: "Pallas",
    type: "asteroid",
    parent: "sun",
    radiusKm: PALLAS_RADIUS_KM,
    massKg: PALLAS_MASS_KG,
    rotationPeriodSeconds: PALLAS_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: PALLAS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: PALLAS_SEMI_MAJOR_AXIS_KM,
    eccentricity: PALLAS_ECCENTRICITY,
  },
  eros: {
    name: "Eros",
    type: "asteroid",
    parent: "sun",
    radiusKm: EROS_RADIUS_KM,
    massKg: EROS_MASS_KG,
    rotationPeriodSeconds: EROS_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: EROS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: EROS_SEMI_MAJOR_AXIS_KM,
    eccentricity: EROS_ECCENTRICITY,
  },
  apophis: {
    name: "Apophis",
    type: "asteroid",
    parent: "sun",
    radiusKm: APOPHIS_RADIUS_KM,
    massKg: APOPHIS_MASS_KG,
    rotationPeriodSeconds: APOPHIS_ROTATION_PERIOD_SECONDS,
    orbitalPeriodDays: APOPHIS_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: APOPHIS_SEMI_MAJOR_AXIS_KM,
    eccentricity: APOPHIS_ECCENTRICITY,
  },

  // Comets
  halley: {
    name: "Halley's Comet",
    type: "comet",
    parent: "sun",
    radiusKm: HALLEY_NUCLEUS_RADIUS_KM,
    massKg: HALLEY_MASS_KG,
    orbitalPeriodDays: HALLEY_ORBITAL_PERIOD_DAYS,
    semiMajorAxisKm: HALLEY_SEMI_MAJOR_AXIS_KM,
    eccentricity: HALLEY_ECCENTRICITY,
  },
};

/**
 * Get celestial body by name
 */
export function getCelestialBody(name: string): CelestialBody | undefined {
  return celestialBodies[name.toLowerCase()];
}

/**
 * Get all bodies of a specific type
 */
export function getBodiesByType(
  type: "planet" | "moon" | "dwarf-planet" | "asteroid" | "comet"
): CelestialBody[] {
  return Object.values(celestialBodies).filter((body) => body.type === type);
}

/**
 * Get all moons of a parent body
 */
export function getMoonsOf(parent: string): CelestialBody[] {
  return Object.values(celestialBodies).filter(
    (body) =>
      body.type === "moon" &&
      body.parent?.toLowerCase() === parent.toLowerCase()
  );
}

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
