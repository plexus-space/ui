/**
 * Earth's radius in kilometers (mean radius)
 * @constant {number}
 */
declare const EARTH_RADIUS_KM = 6371;
/**
 * Scale factor for the scene (1 unit = 1000 km for manageable numbers)
 * @constant {number}
 */
declare const SCENE_SCALE = 0.001;
/**
 * Earth's radius in scene units
 * @constant {number}
 */
declare const EARTH_RADIUS: number;
/**
 * Earth's rotation period in seconds (sidereal day)
 * @constant {number}
 */
declare const EARTH_ROTATION_PERIOD_SECONDS = 86164.0905;
/**
 * Earth's orbital period in days
 * @constant {number}
 */
declare const EARTH_ORBITAL_PERIOD_DAYS = 365.256363004;
/**
 * Earth's axial tilt in degrees (obliquity of the ecliptic)
 * @constant {number}
 */
declare const EARTH_AXIAL_TILT_DEG = 23.4392811;
/**
 * Astronomical Unit in kilometers (mean Earth-Sun distance)
 * @constant {number}
 */
declare const ASTRONOMICAL_UNIT_KM = 149597870.7;
/**
 * Sun's radius in kilometers
 * @constant {number}
 */
declare const SUN_RADIUS_KM = 695700;
/**
 * Get current day of year and fraction of day
 * @returns {dayOfYear: number, fractionOfDay: number}
 */
declare function getCurrentDayOfYear(): {
    dayOfYear: number;
    fractionOfDay: number;
};
/**
 * Calculate Earth's rotation based on time
 * @param timeScale - Time acceleration factor (1 = real-time)
 * @returns Current rotation angle in radians
 */
declare function calculateEarthRotation(timeScale?: number): number;
export interface EarthSceneProps {
    cameraPosition?: [number, number, number];
    cameraFov?: number;
    minDistance?: number;
    maxDistance?: number;
    brightness?: number;
    children?: React.ReactNode;
}
export declare const EarthScene: import("react").ForwardRefExoticComponent<EarthSceneProps & import("react").RefAttributes<HTMLDivElement>>;
export interface EarthProps {
    dayMapUrl?: string;
    cloudsMapUrl?: string;
    brightness?: number;
    enableRotation?: boolean;
    cameraPosition?: [number, number, number];
    cameraFov?: number;
    minDistance?: number;
    maxDistance?: number;
    timeScale?: number;
    showAxis?: boolean;
    children?: React.ReactNode;
}
export declare const Earth: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<EarthProps & import("react").RefAttributes<HTMLDivElement>>>;
export { EARTH_RADIUS, EARTH_RADIUS_KM, EARTH_ROTATION_PERIOD_SECONDS, EARTH_ORBITAL_PERIOD_DAYS, EARTH_AXIAL_TILT_DEG, ASTRONOMICAL_UNIT_KM, SUN_RADIUS_KM, SCENE_SCALE, calculateEarthRotation, getCurrentDayOfYear, };
//# sourceMappingURL=earth.d.ts.map