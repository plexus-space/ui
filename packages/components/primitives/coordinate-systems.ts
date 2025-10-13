/**
 * Coordinate Systems & Transformations
 *
 * Universal coordinate transforms for aerospace, medical, and geospatial applications.
 * Scientifically accurate implementations with proper datum handling.
 *
 * Coordinate Systems:
 * - ECI (Earth-Centered Inertial) - Non-rotating frame for orbital mechanics
 * - ECEF (Earth-Centered Earth-Fixed) - Rotating frame fixed to Earth
 * - Geodetic (Lat/Lon/Alt) - Geographic coordinates on ellipsoid
 * - Local Tangent Plane (ENU/NED) - Local horizontal frame
 * - UTM (Universal Transverse Mercator) - Projected coordinates
 */

import {
  EARTH_EQUATORIAL_RADIUS_KM,
  EARTH_POLAR_RADIUS_KM,
  EARTH_ROTATION_PERIOD_SECONDS,
} from "../lib/astronomical-constants";

// ============================================================================
// Constants
// ============================================================================

/** WGS84 Ellipsoid Parameters */
export const WGS84 = {
  /** Semi-major axis (equatorial radius) in meters */
  a: EARTH_EQUATORIAL_RADIUS_KM * 1000,
  /** Semi-minor axis (polar radius) in meters */
  b: EARTH_POLAR_RADIUS_KM * 1000,
  /** Flattening */
  f:
    (EARTH_EQUATORIAL_RADIUS_KM - EARTH_POLAR_RADIUS_KM) /
    EARTH_EQUATORIAL_RADIUS_KM,
  /** First eccentricity squared */
  e2:
    1 -
    (EARTH_POLAR_RADIUS_KM * EARTH_POLAR_RADIUS_KM) /
      (EARTH_EQUATORIAL_RADIUS_KM * EARTH_EQUATORIAL_RADIUS_KM),
};

/** Earth rotation rate (radians per second) */
export const EARTH_ROTATION_RATE =
  (2 * Math.PI) / EARTH_ROTATION_PERIOD_SECONDS;

/** J2000 Epoch (January 1, 2000, 12:00 TT) */
export const J2000_EPOCH = new Date("2000-01-01T12:00:00Z").getTime();

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate latitude is in valid range [-90, 90]
 */
function validateLatitude(lat: number, paramName = "latitude"): void {
  if (!Number.isFinite(lat)) {
    throw new Error(`${paramName} must be a finite number, got ${lat}`);
  }
  if (lat < -90 || lat > 90) {
    throw new Error(`${paramName} must be in range [-90, 90] degrees, got ${lat}`);
  }
}

/**
 * Validate longitude is in valid range [-180, 180]
 */
function validateLongitude(lon: number, paramName = "longitude"): void {
  if (!Number.isFinite(lon)) {
    throw new Error(`${paramName} must be a finite number, got ${lon}`);
  }
  if (lon < -180 || lon > 180) {
    throw new Error(`${paramName} must be in range [-180, 180] degrees, got ${lon}`);
  }
}

/**
 * Validate altitude is reasonable (within 1000 km of surface)
 */
function validateAltitude(alt: number, paramName = "altitude"): void {
  if (!Number.isFinite(alt)) {
    throw new Error(`${paramName} must be a finite number, got ${alt}`);
  }
  // Allow from deep ocean to LEO satellites
  if (alt < -11000 || alt > 2000000) {
    throw new Error(`${paramName} must be in range [-11000, 2000000] meters, got ${alt}`);
  }
}

/**
 * Validate ECEF coordinates are reasonable (within Earth vicinity)
 */
function validateECEF(ecef: ECEFCoordinates, paramName = "ecef"): void {
  const magnitude = Math.sqrt(ecef.x ** 2 + ecef.y ** 2 + ecef.z ** 2);
  if (!Number.isFinite(magnitude)) {
    throw new Error(`${paramName} contains non-finite values`);
  }
  // Earth radius ~6371 km, allow up to 10x for high orbits
  if (magnitude > 100_000_000) {
    throw new Error(`${paramName} magnitude ${magnitude}m exceeds reasonable bounds (100,000 km)`);
  }
}

// ============================================================================
// Types
// ============================================================================

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface GeodeticCoordinates {
  /** Latitude in degrees (North positive) */
  latitude: number;
  /** Longitude in degrees (East positive) */
  longitude: number;
  /** Altitude above ellipsoid in meters */
  altitude: number;
}

export interface ECEFCoordinates extends Vector3D {}

export interface ECICoordinates extends Vector3D {}

export interface ENUCoordinates extends Vector3D {}

export interface UTMCoordinates {
  easting: number;
  northing: number;
  zone: number;
  hemisphere: "N" | "S";
}

// ============================================================================
// Geodetic ↔ ECEF Transformations
// ============================================================================

/**
 * Convert Geodetic (Lat/Lon/Alt) to ECEF
 *
 * Uses WGS84 ellipsoid model.
 *
 * @param geodetic - Geodetic coordinates
 * @returns ECEF coordinates in meters
 */
export function geodeticToECEF(geodetic: GeodeticCoordinates): ECEFCoordinates {
  // Validate inputs
  validateLatitude(geodetic.latitude);
  validateLongitude(geodetic.longitude);
  validateAltitude(geodetic.altitude);

  const lat = (geodetic.latitude * Math.PI) / 180;
  const lon = (geodetic.longitude * Math.PI) / 180;
  const h = geodetic.altitude;

  // Radius of curvature in prime vertical
  const N = WGS84.a / Math.sqrt(1 - WGS84.e2 * Math.sin(lat) ** 2);

  const x = (N + h) * Math.cos(lat) * Math.cos(lon);
  const y = (N + h) * Math.cos(lat) * Math.sin(lon);
  const z = (N * (1 - WGS84.e2) + h) * Math.sin(lat);

  return { x, y, z };
}

/**
 * Convert ECEF to Geodetic (Lat/Lon/Alt)
 *
 * Uses Bowring's iterative method for accuracy.
 *
 * @param ecef - ECEF coordinates in meters
 * @returns Geodetic coordinates
 */
export function ecefToGeodetic(ecef: ECEFCoordinates): GeodeticCoordinates {
  // Validate inputs
  validateECEF(ecef);

  const { x, y, z } = ecef;

  // Longitude is straightforward
  const lon = Math.atan2(y, x);

  // Iterative solution for latitude
  const p = Math.sqrt(x ** 2 + y ** 2);
  let lat = Math.atan2(z, p * (1 - WGS84.e2));

  // Iterate to convergence (usually 2-3 iterations)
  for (let i = 0; i < 5; i++) {
    const sinLat = Math.sin(lat);
    const N = WGS84.a / Math.sqrt(1 - WGS84.e2 * sinLat ** 2);
    const h = p / Math.cos(lat) - N;

    lat = Math.atan2(z, p * (1 - (WGS84.e2 * N) / (N + h)));
  }

  // Final altitude calculation
  const sinLat = Math.sin(lat);
  const N = WGS84.a / Math.sqrt(1 - WGS84.e2 * sinLat ** 2);
  const h = p / Math.cos(lat) - N;

  return {
    latitude: (lat * 180) / Math.PI,
    longitude: (lon * 180) / Math.PI,
    altitude: h,
  };
}

// ============================================================================
// ECI ↔ ECEF Transformations
// ============================================================================

/**
 * Convert ECI to ECEF
 *
 * Accounts for Earth rotation using Greenwich Mean Sidereal Time (GMST).
 *
 * @param eci - ECI coordinates in meters
 * @param time - Time as Date object
 * @returns ECEF coordinates in meters
 */
export function eciToECEF(
  eci: ECICoordinates,
  time: Date = new Date()
): ECEFCoordinates {
  // Validate ECI coordinates
  validateECEF(eci as ECEFCoordinates);

  const gmst = calculateGMST(time);

  // Rotation matrix from ECI to ECEF (rotation about Z-axis)
  const cosTheta = Math.cos(gmst);
  const sinTheta = Math.sin(gmst);

  return {
    x: cosTheta * eci.x + sinTheta * eci.y,
    y: -sinTheta * eci.x + cosTheta * eci.y,
    z: eci.z,
  };
}

/**
 * Convert ECEF to ECI
 *
 * @param ecef - ECEF coordinates in meters
 * @param time - Time as Date object
 * @returns ECI coordinates in meters
 */
export function ecefToECI(
  ecef: ECEFCoordinates,
  time: Date = new Date()
): ECICoordinates {
  // Validate inputs
  validateECEF(ecef);

  const gmst = calculateGMST(time);

  // Rotation matrix from ECEF to ECI (inverse rotation about Z-axis)
  const cosTheta = Math.cos(gmst);
  const sinTheta = Math.sin(gmst);

  return {
    x: cosTheta * ecef.x - sinTheta * ecef.y,
    y: sinTheta * ecef.x + cosTheta * ecef.y,
    z: ecef.z,
  };
}

/**
 * Calculate Greenwich Mean Sidereal Time (GMST)
 *
 * High-precision formula from Vallado (2013), Algorithm 15.
 * Accurate to sub-arcsecond level for STK-level precision.
 *
 * @reference Vallado, D. A. (2013). Fundamentals of Astrodynamics, Algorithm 15
 * @param time - Time as Date object
 * @returns GMST in radians
 */
export function calculateGMST(time: Date): number {
  const ut1 = time.getTime() / 1000; // seconds since Unix epoch

  // Julian Date (UT1)
  const jdUT1 = (ut1 / 86400) + 2440587.5; // Unix epoch is JD 2440587.5

  // Julian centuries from J2000.0
  const tUT1 = (jdUT1 - 2451545.0) / 36525.0;

  // GMST in seconds (Vallado Eq. 3-47, IAU 2000B model)
  const gmstSeconds =
    67310.54841 +
    (876600.0 * 3600.0 + 8640184.812866) * tUT1 +
    0.093104 * tUT1 * tUT1 -
    6.2e-6 * tUT1 * tUT1 * tUT1;

  // Convert to degrees and normalize
  const gmstDegrees = (gmstSeconds / 240.0) % 360.0;

  // Ensure positive and convert to radians
  const gmstRadians = ((gmstDegrees + 360.0) % 360.0) * (Math.PI / 180.0);

  return gmstRadians;
}

// ============================================================================
// Geodetic ↔ ECI (convenience functions)
// ============================================================================

/**
 * Convert Geodetic to ECI
 *
 * @param geodetic - Geodetic coordinates
 * @param time - Time as Date object
 * @returns ECI coordinates in meters
 */
export function geodeticToECI(
  geodetic: GeodeticCoordinates,
  time: Date = new Date()
): ECICoordinates {
  const ecef = geodeticToECEF(geodetic);
  return ecefToECI(ecef, time);
}

/**
 * Convert ECI to Geodetic
 *
 * @param eci - ECI coordinates in meters
 * @param time - Time as Date object
 * @returns Geodetic coordinates
 */
export function eciToGeodetic(
  eci: ECICoordinates,
  time: Date = new Date()
): GeodeticCoordinates {
  const ecef = eciToECEF(eci, time);
  return ecefToGeodetic(ecef);
}

// ============================================================================
// Local Tangent Plane (ENU) Transformations
// ============================================================================

/**
 * Convert ECEF to East-North-Up (ENU) local coordinates
 *
 * @param ecef - ECEF coordinates in meters
 * @param reference - Reference geodetic position (origin)
 * @returns ENU coordinates in meters
 */
export function ecefToENU(
  ecef: ECEFCoordinates,
  reference: GeodeticCoordinates
): ENUCoordinates {
  const refECEF = geodeticToECEF(reference);

  // Vector from reference to point
  const dx = ecef.x - refECEF.x;
  const dy = ecef.y - refECEF.y;
  const dz = ecef.z - refECEF.z;

  const lat = (reference.latitude * Math.PI) / 180;
  const lon = (reference.longitude * Math.PI) / 180;

  // Rotation matrix to ENU
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);

  return {
    x: -sinLon * dx + cosLon * dy, // East
    y: -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz, // North
    z: cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz, // Up
  };
}

/**
 * Convert ENU to ECEF
 *
 * @param enu - ENU coordinates in meters
 * @param reference - Reference geodetic position (origin)
 * @returns ECEF coordinates in meters
 */
export function enuToECEF(
  enu: ENUCoordinates,
  reference: GeodeticCoordinates
): ECEFCoordinates {
  const refECEF = geodeticToECEF(reference);

  const lat = (reference.latitude * Math.PI) / 180;
  const lon = (reference.longitude * Math.PI) / 180;

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);

  // Inverse rotation matrix
  const dx =
    -sinLon * enu.x - sinLat * cosLon * enu.y + cosLat * cosLon * enu.z;
  const dy = cosLon * enu.x - sinLat * sinLon * enu.y + cosLat * sinLon * enu.z;
  const dz = cosLat * enu.y + sinLat * enu.z;

  return {
    x: refECEF.x + dx,
    y: refECEF.y + dy,
    z: refECEF.z + dz,
  };
}

// ============================================================================
// UTM Transformations
// ============================================================================

/**
 * Convert Geodetic to UTM
 *
 * @param geodetic - Geodetic coordinates
 * @returns UTM coordinates
 */
export function geodeticToUTM(geodetic: GeodeticCoordinates): UTMCoordinates {
  const lat = geodetic.latitude;
  const lon = geodetic.longitude;

  // Determine UTM zone
  const zone = Math.floor((lon + 180) / 6) + 1;
  const hemisphere = lat >= 0 ? "N" : "S";

  // Central meridian of zone
  const lon0 = (zone - 1) * 6 - 180 + 3;

  // Convert to radians
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const lon0Rad = (lon0 * Math.PI) / 180;

  // UTM parameters
  const k0 = 0.9996; // Scale factor
  const N = WGS84.a / Math.sqrt(1 - WGS84.e2 * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = (WGS84.e2 / (1 - WGS84.e2)) * Math.cos(latRad) ** 2;
  const A = (lonRad - lon0Rad) * Math.cos(latRad);

  // Meridional arc
  const M =
    WGS84.a *
    ((1 - WGS84.e2 / 4 - (3 * WGS84.e2 ** 2) / 64 - (5 * WGS84.e2 ** 3) / 256) *
      latRad -
      ((3 * WGS84.e2) / 8 +
        (3 * WGS84.e2 ** 2) / 32 +
        (45 * WGS84.e2 ** 3) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * WGS84.e2 ** 2) / 256 + (45 * WGS84.e2 ** 3) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * WGS84.e2 ** 3) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * A ** 3) / 6 +
        ((5 - 18 * T + T ** 2 + 72 * C - 58 * WGS84.e2) * A ** 5) / 120) +
    500000;

  const northing =
    k0 *
      (M +
        N *
          Math.tan(latRad) *
          (A ** 2 / 2 +
            ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 +
            ((61 - 58 * T + T ** 2 + 600 * C - 330 * WGS84.e2) * A ** 6) /
              720)) +
    (hemisphere === "S" ? 10000000 : 0);

  return {
    easting,
    northing,
    zone,
    hemisphere,
  };
}

/**
 * Convert UTM to Geodetic
 *
 * @param utm - UTM coordinates
 * @returns Geodetic coordinates
 */
export function utmToGeodetic(utm: UTMCoordinates): GeodeticCoordinates {
  const { easting, northing, zone, hemisphere } = utm;

  // Central meridian of zone
  const lon0 = (zone - 1) * 6 - 180 + 3;

  // Remove false northing for Southern Hemisphere
  const N = hemisphere === "S" ? northing - 10000000 : northing;

  // UTM parameters
  const k0 = 0.9996;
  const e1 = (1 - Math.sqrt(1 - WGS84.e2)) / (1 + Math.sqrt(1 - WGS84.e2));

  // Footpoint latitude
  const M = N / k0;
  const mu =
    M /
    (WGS84.a *
      (1 -
        WGS84.e2 / 4 -
        (3 * WGS84.e2 ** 2) / 64 -
        (5 * WGS84.e2 ** 3) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

  const N1 = WGS84.a / Math.sqrt(1 - WGS84.e2 * Math.sin(phi1) ** 2);
  const T1 = Math.tan(phi1) ** 2;
  const C1 = (WGS84.e2 / (1 - WGS84.e2)) * Math.cos(phi1) ** 2;
  const R1 =
    (WGS84.a * (1 - WGS84.e2)) /
    Math.pow(1 - WGS84.e2 * Math.sin(phi1) ** 2, 1.5);
  const D = (easting - 500000) / (N1 * k0);

  // Calculate latitude
  const lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      (D ** 2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * WGS84.e2) * D ** 4) / 24 +
        ((61 +
          90 * T1 +
          298 * C1 +
          45 * T1 ** 2 -
          252 * WGS84.e2 -
          3 * C1 ** 2) *
          D ** 6) /
          720);

  // Calculate longitude
  const lon =
    (lon0 * Math.PI) / 180 +
    (D -
      ((1 + 2 * T1 + C1) * D ** 3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * WGS84.e2 + 24 * T1 ** 2) *
        D ** 5) /
        120) /
      Math.cos(phi1);

  return {
    latitude: (lat * 180) / Math.PI,
    longitude: (lon * 180) / Math.PI,
    altitude: 0, // UTM doesn't include altitude
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate great circle distance between two geodetic positions
 *
 * Uses Haversine formula.
 *
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Distance in meters
 */
export function greatCircleDistance(
  pos1: GeodeticCoordinates,
  pos2: GeodeticCoordinates
): number {
  const lat1 = (pos1.latitude * Math.PI) / 180;
  const lat2 = (pos2.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return WGS84.a * c;
}

/**
 * Calculate azimuth (bearing) from pos1 to pos2
 *
 * @param pos1 - Starting position
 * @param pos2 - Target position
 * @returns Azimuth in degrees (0-360, measured clockwise from North)
 */
export function calculateAzimuth(
  pos1: GeodeticCoordinates,
  pos2: GeodeticCoordinates
): number {
  const lat1 = (pos1.latitude * Math.PI) / 180;
  const lat2 = (pos2.latitude * Math.PI) / 180;
  const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let azimuth = (Math.atan2(y, x) * 180) / Math.PI;

  // Normalize to 0-360
  azimuth = (azimuth + 360) % 360;

  return azimuth;
}

/**
 * Calculate elevation angle from observer to target
 *
 * @param observer - Observer position
 * @param target - Target position
 * @returns Elevation angle in degrees (positive is above horizon)
 */
export function calculateElevation(
  observer: GeodeticCoordinates,
  target: GeodeticCoordinates
): number {
  const tarECEF = geodeticToECEF(target);

  // Vector from observer to target in ENU
  const enu = ecefToENU(tarECEF, observer);

  // Elevation angle
  const range = Math.sqrt(enu.x ** 2 + enu.y ** 2 + enu.z ** 2);
  const elevation = Math.asin(enu.z / range);

  return (elevation * 180) / Math.PI;
}

// ============================================================================
// Coordinate System Conversions (Universal Interface)
// ============================================================================

export type CoordinateSystem = "eci" | "ecef" | "geodetic" | "enu" | "utm";

export type Coordinates =
  | ECICoordinates
  | ECEFCoordinates
  | GeodeticCoordinates
  | ENUCoordinates
  | UTMCoordinates;

/**
 * Universal coordinate converter
 *
 * @param coords - Input coordinates
 * @param from - Source coordinate system
 * @param to - Target coordinate system
 * @param options - Additional options (reference point for ENU, time for ECI/ECEF)
 * @returns Converted coordinates
 */
export function convertCoordinates(
  coords: Coordinates,
  from: CoordinateSystem,
  to: CoordinateSystem,
  options?: {
    reference?: GeodeticCoordinates;
    time?: Date;
  }
): Coordinates {
  // Direct conversions
  if (from === "geodetic" && to === "ecef") {
    return geodeticToECEF(coords as GeodeticCoordinates);
  }
  if (from === "ecef" && to === "geodetic") {
    return ecefToGeodetic(coords as ECEFCoordinates);
  }
  if (from === "eci" && to === "ecef") {
    return eciToECEF(coords as ECICoordinates, options?.time);
  }
  if (from === "ecef" && to === "eci") {
    return ecefToECI(coords as ECEFCoordinates, options?.time);
  }
  if (from === "geodetic" && to === "utm") {
    return geodeticToUTM(coords as GeodeticCoordinates);
  }
  if (from === "utm" && to === "geodetic") {
    return utmToGeodetic(coords as UTMCoordinates);
  }

  // Multi-step conversions (go through ECEF as intermediate)
  // Add more paths as needed

  throw new Error(`Conversion from ${from} to ${to} not yet implemented`);
}
