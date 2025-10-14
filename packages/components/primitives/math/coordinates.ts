/**
 * Coordinate System Transforms
 *
 * Transforms between aerospace coordinate systems:
 * - ECI (Earth-Centered Inertial) - Fixed to stars, used for orbital mechanics
 * - ECEF (Earth-Centered Earth-Fixed) - Rotates with Earth, used for ground stations
 * - Geodetic (Latitude, Longitude, Altitude) - WGS84 ellipsoid
 * - ENU (East-North-Up) - Local tangent plane, used for local navigation
 * - UTM (Universal Transverse Mercator) - Map projection
 *
 * @reference Vallado, D. A. (2013). Fundamentals of Astrodynamics and Applications, 4th ed.
 * @reference NIMA (2000). Department of Defense World Geodetic System 1984
 * @reference Hofmann-Wellenhof, B. & Moritz, H. (2006). Physical Geodesy, 2nd ed.
 */

import type { Vec3 } from "./vectors";

// ============================================================================
// Constants - WGS84 Ellipsoid
// ============================================================================

/** WGS84 semi-major axis (equatorial radius) in meters */
export const WGS84_A = 6378137.0;

/** WGS84 flattening */
export const WGS84_F = 1.0 / 298.257223563;

/** WGS84 semi-minor axis (polar radius) in meters */
export const WGS84_B = WGS84_A * (1.0 - WGS84_F);

/** WGS84 first eccentricity squared */
export const WGS84_E2 = 2.0 * WGS84_F - WGS84_F * WGS84_F;

/** Earth's angular velocity (rad/s) - for ECI to ECEF conversion */
export const EARTH_OMEGA = 7.2921159e-5;

/** Seconds per day */
export const SECONDS_PER_DAY = 86400.0;

// ============================================================================
// ECI ↔ ECEF (Earth-Centered Inertial ↔ Earth-Centered Earth-Fixed)
// ============================================================================

/**
 * Convert ECI to ECEF coordinates
 *
 * Accounts for Earth's rotation. Requires UTC time to calculate rotation angle.
 *
 * @param eci Position in ECI frame [x, y, z] (meters)
 * @param utcSeconds Seconds since J2000 epoch (2000-01-01 12:00:00 UTC)
 * @returns Position in ECEF frame [x, y, z] (meters)
 *
 * @example
 * const eci = [7000000, 0, 0]; // Satellite position
 * const utcSeconds = Date.now() / 1000 - 946728000; // Seconds since J2000
 * const ecef = eciToEcef(eci, utcSeconds);
 */
export function eciToEcef(eci: Vec3, utcSeconds: number): Vec3 {
  // Calculate Earth rotation angle (GMST - Greenwich Mean Sidereal Time)
  const gmst = calculateGMST(utcSeconds);

  const cosGmst = Math.cos(gmst);
  const sinGmst = Math.sin(gmst);

  // Rotation matrix around Z-axis
  const x = cosGmst * eci[0] + sinGmst * eci[1];
  const y = -sinGmst * eci[0] + cosGmst * eci[1];
  const z = eci[2];

  return [x, y, z];
}

/**
 * Convert ECEF to ECI coordinates
 *
 * @param ecef Position in ECEF frame [x, y, z] (meters)
 * @param utcSeconds Seconds since J2000 epoch
 * @returns Position in ECI frame [x, y, z] (meters)
 */
export function ecefToEci(ecef: Vec3, utcSeconds: number): Vec3 {
  const gmst = calculateGMST(utcSeconds);

  const cosGmst = Math.cos(gmst);
  const sinGmst = Math.sin(gmst);

  // Inverse rotation around Z-axis
  const x = cosGmst * ecef[0] - sinGmst * ecef[1];
  const y = sinGmst * ecef[0] + cosGmst * ecef[1];
  const z = ecef[2];

  return [x, y, z];
}

/**
 * Calculate Greenwich Mean Sidereal Time (GMST)
 *
 * @param utcSeconds Seconds since J2000 epoch
 * @returns GMST angle in radians
 *
 * @reference Vallado Algorithm 15 (simplified)
 */
function calculateGMST(utcSeconds: number): number {
  // Julian centuries since J2000
  const tUT1 = utcSeconds / SECONDS_PER_DAY / 36525.0;

  // GMST in seconds (simplified formula, accurate to ~1 second)
  let gmstSeconds =
    67310.54841 +
    (876600.0 * 3600.0 + 8640184.812866) * tUT1 +
    0.093104 * tUT1 * tUT1 -
    6.2e-6 * tUT1 * tUT1 * tUT1;

  // Convert to radians and normalize to [0, 2π]
  gmstSeconds = gmstSeconds % SECONDS_PER_DAY;
  if (gmstSeconds < 0) gmstSeconds += SECONDS_PER_DAY;

  const gmst = (gmstSeconds / 240.0) * (Math.PI / 180.0); // Convert to radians

  return gmst % (2 * Math.PI);
}

// ============================================================================
// ECEF ↔ Geodetic (WGS84)
// ============================================================================

/**
 * Convert ECEF to Geodetic coordinates (WGS84)
 *
 * Uses iterative algorithm for altitude calculation.
 *
 * @param ecef Position in ECEF frame [x, y, z] (meters)
 * @returns [latitude (rad), longitude (rad), altitude (meters)]
 *
 * @reference Borkowski, K.M. (1989). "Accurate algorithms to transform geocentric to geodetic coordinates"
 */
export function ecefToGeodetic(
  ecef: Vec3
): [latitude: number, longitude: number, altitude: number] {
  const x = ecef[0];
  const y = ecef[1];
  const z = ecef[2];

  // Longitude (simple)
  const lon = Math.atan2(y, x);

  // Distance from Z-axis
  const p = Math.sqrt(x * x + y * y);

  // Iterative calculation for latitude and altitude
  let lat = Math.atan2(z, p * (1.0 - WGS84_E2));
  let alt = 0;

  // Iterate to converge (usually 2-3 iterations)
  for (let i = 0; i < 5; i++) {
    const sinLat = Math.sin(lat);
    const N = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * sinLat * sinLat);

    alt = p / Math.cos(lat) - N;

    const prevLat = lat;
    lat = Math.atan2(z, p * (1.0 - WGS84_E2 * (N / (N + alt))));

    // Check convergence
    if (Math.abs(lat - prevLat) < 1e-12) break;
  }

  return [lat, lon, alt];
}

/**
 * Convert Geodetic to ECEF coordinates (WGS84)
 *
 * @param latitude Latitude in radians (-π/2 to π/2)
 * @param longitude Longitude in radians (-π to π)
 * @param altitude Altitude above WGS84 ellipsoid in meters
 * @returns Position in ECEF frame [x, y, z] (meters)
 *
 * @example
 * const lat = 40.7128 * Math.PI / 180; // New York latitude
 * const lon = -74.0060 * Math.PI / 180; // New York longitude
 * const alt = 10.0; // meters
 * const ecef = geodeticToEcef(lat, lon, alt);
 */
export function geodeticToEcef(
  latitude: number,
  longitude: number,
  altitude: number
): Vec3 {
  const sinLat = Math.sin(latitude);
  const cosLat = Math.cos(latitude);
  const sinLon = Math.sin(longitude);
  const cosLon = Math.cos(longitude);

  // Radius of curvature in prime vertical
  const N = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * sinLat * sinLat);

  const x = (N + altitude) * cosLat * cosLon;
  const y = (N + altitude) * cosLat * sinLon;
  const z = (N * (1.0 - WGS84_E2) + altitude) * sinLat;

  return [x, y, z];
}

// ============================================================================
// ENU (East-North-Up) Local Tangent Plane
// ============================================================================

/**
 * Convert ECEF to ENU (East-North-Up) local coordinates
 *
 * ENU is a local Cartesian coordinate system:
 * - East: positive X
 * - North: positive Y
 * - Up: positive Z (perpendicular to ellipsoid)
 *
 * @param ecef Position in ECEF frame [x, y, z] (meters)
 * @param refLat Reference latitude in radians
 * @param refLon Reference longitude in radians
 * @param refAlt Reference altitude in meters
 * @returns Position in ENU frame [east, north, up] (meters)
 *
 * @example
 * // Calculate relative position of aircraft from ground station
 * const aircraftECEF = geodeticToEcef(aircraftLat, aircraftLon, aircraftAlt);
 * const stationLat = 40.7128 * Math.PI / 180;
 * const stationLon = -74.0060 * Math.PI / 180;
 * const stationAlt = 10.0;
 * const enu = ecefToEnu(aircraftECEF, stationLat, stationLon, stationAlt);
 * // enu = [east (m), north (m), up (m)] relative to station
 */
export function ecefToEnu(
  ecef: Vec3,
  refLat: number,
  refLon: number,
  refAlt: number
): Vec3 {
  // Convert reference point to ECEF
  const refEcef = geodeticToEcef(refLat, refLon, refAlt);

  // Calculate difference vector
  const dx = ecef[0] - refEcef[0];
  const dy = ecef[1] - refEcef[1];
  const dz = ecef[2] - refEcef[2];

  const sinLat = Math.sin(refLat);
  const cosLat = Math.cos(refLat);
  const sinLon = Math.sin(refLon);
  const cosLon = Math.cos(refLon);

  // Rotation matrix: ECEF to ENU
  const east = -sinLon * dx + cosLon * dy;
  const north = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz;
  const up = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz;

  return [east, north, up];
}

/**
 * Convert ENU to ECEF coordinates
 *
 * @param enu Position in ENU frame [east, north, up] (meters)
 * @param refLat Reference latitude in radians
 * @param refLon Reference longitude in radians
 * @param refAlt Reference altitude in meters
 * @returns Position in ECEF frame [x, y, z] (meters)
 */
export function enuToEcef(
  enu: Vec3,
  refLat: number,
  refLon: number,
  refAlt: number
): Vec3 {
  const refEcef = geodeticToEcef(refLat, refLon, refAlt);

  const sinLat = Math.sin(refLat);
  const cosLat = Math.cos(refLat);
  const sinLon = Math.sin(refLon);
  const cosLon = Math.cos(refLon);

  const east = enu[0];
  const north = enu[1];
  const up = enu[2];

  // Inverse rotation: ENU to ECEF
  const dx = -sinLon * east - sinLat * cosLon * north + cosLat * cosLon * up;
  const dy = cosLon * east - sinLat * sinLon * north + cosLat * sinLon * up;
  const dz = cosLat * north + sinLat * up;

  return [refEcef[0] + dx, refEcef[1] + dy, refEcef[2] + dz];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate great circle distance between two geodetic points (Haversine formula)
 *
 * @param lat1 Latitude of point 1 in radians
 * @param lon1 Longitude of point 1 in radians
 * @param lat2 Latitude of point 2 in radians
 * @param lon2 Longitude of point 2 in radians
 * @returns Distance in meters
 *
 * @example
 * const lat1 = 40.7128 * Math.PI / 180; // New York
 * const lon1 = -74.0060 * Math.PI / 180;
 * const lat2 = 51.5074 * Math.PI / 180; // London
 * const lon2 = -0.1278 * Math.PI / 180;
 * const distance = greatCircleDistance(lat1, lon1, lat2, lon2);
 * console.log(`Distance: ${(distance / 1000).toFixed(0)} km`); // ~5570 km
 */
export function greatCircleDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return WGS84_A * c;
}

/**
 * Calculate azimuth and elevation from observer to target (ENU frame)
 *
 * @param enu Target position in ENU frame [east, north, up] (meters)
 * @returns [azimuth (rad), elevation (rad), range (meters)]
 *
 * Azimuth: 0 = North, π/2 = East, π = South, 3π/2 = West
 * Elevation: 0 = horizon, π/2 = zenith, -π/2 = nadir
 *
 * @example
 * // Calculate look angles from ground station to satellite
 * const satelliteENU = ecefToEnu(satelliteECEF, stationLat, stationLon, stationAlt);
 * const [azimuth, elevation, range] = enuToAzElRange(satelliteENU);
 * console.log(`Look angles: Az=${azimuth * 180/Math.PI}°, El=${elevation * 180/Math.PI}°`);
 */
export function enuToAzElRange(
  enu: Vec3
): [azimuth: number, elevation: number, range: number] {
  const east = enu[0];
  const north = enu[1];
  const up = enu[2];

  // Range
  const range = Math.sqrt(east * east + north * north + up * up);

  // Azimuth (clockwise from North)
  let azimuth = Math.atan2(east, north);
  if (azimuth < 0) azimuth += 2 * Math.PI;

  // Elevation
  const elevation = Math.asin(up / range);

  return [azimuth, elevation, range];
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Normalize longitude to [-π, π]
 */
export function normalizeLongitude(lon: number): number {
  let normalized = lon % (2 * Math.PI);
  if (normalized > Math.PI) normalized -= 2 * Math.PI;
  if (normalized < -Math.PI) normalized += 2 * Math.PI;
  return normalized;
}

/**
 * Clamp latitude to [-π/2, π/2]
 */
export function clampLatitude(lat: number): number {
  return Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lat));
}
