/**
 * Plexus UI Utilities
 * Shared utility functions, constants, and helpers for all Plexus UI aerospace components
 *
 * This file combines:
 * - General utilities (cn, clamp, lerp, etc.)
 * - Chart utilities (scales, domains, formatting)
 * - Astronomical constants (planets, moons, orbital mechanics)
 * - Three.js utilities (materials, shaders, geometry)
 * - Theme system (colors, typography, spacing)
 *
 * @packageDocumentation
 */

import { useEffect, useState, type RefObject } from "react";
import * as THREE from "three";

// ============================================================================
// GENERAL UTILITIES
// ============================================================================

/**
 * Utility function for conditionally joining class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

// ============================================================================
// CHART UTILITIES
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Axis {
  label?: string;
  domain?: [number, number] | "auto";
  type?: "number" | "log" | "time";
  timezone?: string;
  formatter?: (value: number) => string;
}

/**
 * Hook to observe element resize
 */
export function useResizeObserver(ref: RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

/**
 * Calculate domain (min/max) for a set of points
 */
export function getDomain(
  points: Point[],
  accessor: (p: Point) => number,
  addPadding: boolean = true
): [number, number] {
  if (points.length === 0) return [0, 1];

  const values = points.map(accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!addPadding) return [min, max];

  const padding = (max - min) * 0.1 || 1;
  const minDomain = Math.round((min - padding) * 1e6) / 1e6;
  const maxDomain = Math.round((max + padding) * 1e6) / 1e6;
  return [minDomain, maxDomain];
}

/**
 * Create a scale function that maps domain to range
 */
export function createScale(
  domain: [number, number],
  range: [number, number],
  type: "number" | "log" = "number"
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;

  if (type === "log") {
    const logMin = Math.log10(d0 || 1);
    const logMax = Math.log10(d1 || 1);
    const slope = (r1 - r0) / (logMax - logMin);
    return (value: number) => {
      const logValue = Math.log10(Math.max(value, 0.0001));
      const result = r0 + slope * (logValue - logMin);
      return Math.round(result * 1e10) / 1e10;
    };
  }

  const slope = (r1 - r0) / (d1 - d0);
  return (value: number) => {
    const result = r0 + slope * (value - d0);
    return Math.round(result * 1e6) / 1e6;
  };
}

/**
 * Generate evenly spaced tick values
 */
export function getTicks(domain: [number, number], count: number = 5): number[] {
  const [min, max] = domain;
  const step = (max - min) / (count - 1);

  return Array.from({ length: count }, (_, i) => {
    const tick = min + i * step;
    return Math.round(tick * 1e6) / 1e6;
  });
}

/**
 * Format number values for display
 */
export function formatValue(value: number): string {
  const rounded = Math.round(value * 100) / 100;

  if (Math.abs(rounded) >= 1e9) return `${(rounded / 1e9).toFixed(1)}B`;
  if (Math.abs(rounded) >= 1e6) return `${(rounded / 1e6).toFixed(1)}M`;
  if (Math.abs(rounded) >= 1e3) return `${(rounded / 1e3).toFixed(1)}K`;
  if (Math.abs(rounded) < 0.01 && rounded !== 0) return rounded.toExponential(1);
  return rounded.toFixed(2);
}

/**
 * Format timestamp values
 */
export function formatTime(timestamp: number, timezone: string = "UTC"): string {
  try {
    const date = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
    return formatter.format(date);
  } catch (error) {
    const date = new Date(timestamp);
    return date.toISOString().substring(11, 19);
  }
}

/**
 * Decimate data to reduce point count
 */
export function decimateData(data: Point[], maxPoints: number): Point[] {
  if (data.length <= maxPoints) return data;
  const threshold = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % threshold === 0);
}

/**
 * Generate smooth Catmull-Rom spline path
 */
export function generateSmoothPath(
  points: Point[],
  xScale: (x: number) => number,
  yScale: (y: number) => number,
  tension: number = 0.3
): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    const x1 = xScale(points[0].x);
    const y1 = yScale(points[0].y);
    const x2 = xScale(points[1].x);
    const y2 = yScale(points[1].y);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  let path = "";

  for (let i = 0; i < points.length; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const x1 = xScale(p1.x);
    const y1 = yScale(p1.y);
    const x2 = xScale(p2.x);
    const y2 = yScale(p2.y);

    if (i === 0) {
      path = `M ${x1} ${y1}`;
    }

    if (i < points.length - 1) {
      const cp1x = x1 + (xScale(p2.x) - xScale(p0.x)) * tension;
      const cp1y = y1 + (yScale(p2.y) - yScale(p0.y)) * tension;
      const cp2x = x2 - (xScale(p3.x) - xScale(p1.x)) * tension;
      const cp2y = y2 - (yScale(p3.y) - yScale(p1.y)) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    }
  }

  return path;
}

/**
 * Calculate linear regression
 */
export function linearRegression(points: Point[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0,
    sumYY = 0;

  points.forEach((p) => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssTotal = sumYY - n * yMean * yMean;
  const ssResidual = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}

// ============================================================================
// ASTRONOMICAL CONSTANTS
// ============================================================================

/** Scene scale factor (km to scene units) */
export const SCENE_SCALE = 0.001;

/** Astronomical Unit in kilometers */
export const ASTRONOMICAL_UNIT_KM = 149597870.7;

/** Speed of light in km/s */
export const SPEED_OF_LIGHT_KM_S = 299792.458;

/** Gravitational constant in km³/kg/s² */
export const GRAVITATIONAL_CONSTANT = 6.67430e-20;

// Sun
export const SUN_RADIUS_KM = 695700;
export const SUN_MASS_KG = 1.98892e30;
export const SUN_ROTATION_PERIOD_DAYS = 25.05;

// Earth
export const EARTH_RADIUS_KM = 6371.0;
export const EARTH_MASS_KG = 5.97237e24;
export const EARTH_ROTATION_PERIOD_SECONDS = 86164.0905;
export const EARTH_ORBITAL_PERIOD_DAYS = 365.256363004;
export const EARTH_AXIAL_TILT_DEG = 23.4392811;
export const EARTH_SEMI_MAJOR_AXIS_KM = ASTRONOMICAL_UNIT_KM;
export const EARTH_ECCENTRICITY = 0.0167086;

// Mars
export const MARS_RADIUS_KM = 3389.5;
export const MARS_MASS_KG = 6.4171e23;
export const MARS_ROTATION_PERIOD_SECONDS = 88642.66;
export const MARS_ORBITAL_PERIOD_DAYS = 686.980;
export const MARS_AXIAL_TILT_DEG = 25.19;
export const MARS_SEMI_MAJOR_AXIS_KM = 227939200;
export const MARS_ECCENTRICITY = 0.0934;

// Add other planets as needed...

/**
 * Convert kilometers to scene units
 */
export function kmToSceneUnits(km: number): number {
  return km * SCENE_SCALE;
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

// ============================================================================
// THREE.JS UTILITIES
// ============================================================================

/**
 * Standard GL configuration for planetary visualizations
 */
export const STANDARD_GL_CONFIG = {
  antialias: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 2.0,
} as const;

/**
 * Convert hex color to THREE.Color
 */
export function hexToThreeColor(hex: string | number): THREE.Color {
  return new THREE.Color(hex);
}

/**
 * Create standard PBR material for planets
 */
export function createPlanetMaterial(options: {
  map?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  emissiveMap?: THREE.Texture | null;
  color?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  emissiveIntensity?: number;
}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: options.map || undefined,
    normalMap: options.normalMap || undefined,
    roughnessMap: options.roughnessMap || undefined,
    emissiveMap: options.emissiveMap || undefined,
    color: options.color || 0xffffff,
    roughness: options.roughness ?? 0.6,
    metalness: options.metalness ?? 0,
    emissive: options.emissiveMap ? 0xffffff : 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? (options.emissiveMap ? 2.0 : 0),
  });
}

/**
 * Apply rotation to a mesh based on rotation speed
 */
export function applyRotation(
  mesh: THREE.Mesh | THREE.Group,
  rotationSpeed: number,
  axis: "x" | "y" | "z" = "y"
): void {
  if (rotationSpeed === 0) return;
  mesh.rotation[axis] += rotationSpeed;
}
