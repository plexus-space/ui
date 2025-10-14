/**
 * Validation Utilities for Primitives
 *
 * Type guards and validation functions for ensuring data integrity.
 * Prevents runtime errors from NaN, Infinity, undefined, and out-of-range values.
 *
 * @example
 * ```tsx
 * import { isValidVec3, isValidVec2 } from './validation';
 *
 * if (!isValidVec3(position)) {
 *   console.warn('Invalid position:', position);
 *   return null;
 * }
 * ```
 */

import type { Vec3, Vec2 } from "./math/vectors";

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for Vec3 (validates finite numbers)
 *
 * @param value - Value to check
 * @returns true if value is a valid Vec3 with finite numbers
 *
 * @example
 * ```tsx
 * if (isValidVec3(position)) {
 *   // position is guaranteed to be [number, number, number] with finite values
 * }
 * ```
 */
export function isValidVec3(value: unknown): value is Vec3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    typeof value[2] === "number" &&
    isFinite(value[0]) &&
    isFinite(value[1]) &&
    isFinite(value[2])
  );
}

/**
 * Type guard for Vec2 (validates finite numbers)
 *
 * @param value - Value to check
 * @returns true if value is a valid Vec2 with finite numbers
 */
export function isValidVec2(value: unknown): value is Vec2 {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    isFinite(value[0]) &&
    isFinite(value[1])
  );
}

/**
 * Validate that a number is finite and within optional range
 *
 * @param value - Value to check
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns true if value is finite and within range
 */
export function isValidNumber(
  value: unknown,
  min?: number,
  max?: number
): value is number {
  if (typeof value !== "number" || !isFinite(value)) {
    return false;
  }
  if (min !== undefined && value < min) {
    return false;
  }
  if (max !== undefined && value > max) {
    return false;
  }
  return true;
}

// ============================================================================
// Validation Functions (with warnings)
// ============================================================================

/**
 * Validate Vec3 with warning message
 *
 * @param value - Value to validate
 * @param paramName - Parameter name for error message
 * @returns true if valid, false if invalid (with console warning)
 */
export function validateVec3(
  value: unknown,
  paramName = "position"
): value is Vec3 {
  if (!isValidVec3(value)) {
    console.warn(
      `[Validation] Invalid ${paramName}:`,
      value,
      "- Expected [number, number, number] with finite values"
    );
    return false;
  }
  return true;
}

/**
 * Validate Vec2 with warning message
 *
 * @param value - Value to validate
 * @param paramName - Parameter name for error message
 * @returns true if valid, false if invalid (with console warning)
 */
export function validateVec2(
  value: unknown,
  paramName = "position"
): value is Vec2 {
  if (!isValidVec2(value)) {
    console.warn(
      `[Validation] Invalid ${paramName}:`,
      value,
      "- Expected [number, number] with finite values"
    );
    return false;
  }
  return true;
}

/**
 * Validate number with warning message
 *
 * @param value - Value to validate
 * @param paramName - Parameter name for error message
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns true if valid, false if invalid (with console warning)
 */
export function validateNumber(
  value: unknown,
  paramName = "value",
  min?: number,
  max?: number
): value is number {
  if (!isValidNumber(value, min, max)) {
    let message = `[Validation] Invalid ${paramName}: ${value}`;
    if (min !== undefined || max !== undefined) {
      message += ` - Expected finite number`;
      if (min !== undefined && max !== undefined) {
        message += ` in range [${min}, ${max}]`;
      } else if (min !== undefined) {
        message += ` >= ${min}`;
      } else if (max !== undefined) {
        message += ` <= ${max}`;
      }
    }
    console.warn(message);
    return false;
  }
  return true;
}

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitize Vec3 by replacing NaN/Infinity with default values
 *
 * @param value - Vec3 to sanitize
 * @param defaultValue - Default value to use for invalid elements
 * @returns Sanitized Vec3
 */
export function sanitizeVec3(
  value: Vec3,
  defaultValue: Vec3 = [0, 0, 0] as Vec3
): Vec3 {
  return [
    isFinite(value[0]) ? value[0] : defaultValue[0],
    isFinite(value[1]) ? value[1] : defaultValue[1],
    isFinite(value[2]) ? value[2] : defaultValue[2],
  ] as Vec3;
}

/**
 * Sanitize Vec2 by replacing NaN/Infinity with default values
 *
 * @param value - Vec2 to sanitize
 * @param defaultValue - Default value to use for invalid elements
 * @returns Sanitized Vec2
 */
export function sanitizeVec2(
  value: Vec2,
  defaultValue: Vec2 = [0, 0] as Vec2
): Vec2 {
  return [
    isFinite(value[0]) ? value[0] : defaultValue[0],
    isFinite(value[1]) ? value[1] : defaultValue[1],
  ] as Vec2;
}

/**
 * Clamp a number to a range
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
