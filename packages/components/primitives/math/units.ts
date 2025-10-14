/**
 * Units System with Type-Safe Dimensional Analysis
 *
 * Prevents unit conversion errors (like Mars Climate Orbiter disaster).
 * Compile-time type checking for dimensional consistency.
 *
 * Features:
 * - Type-safe unit conversions
 * - Dimensional analysis at compile time
 * - Support for SI, Imperial, and astronomical units
 * - Zero runtime overhead with proper tree-shaking
 *
 * @reference "The Mars Climate Orbiter Mishap Investigation Board Report" (1999)
 * @reference ISO 80000 - Quantities and units
 * @reference Bureau International des Poids et Mesures (BIPM) SI Brochure
 */

// ============================================================================
// Dimension Types (Type-Level Arithmetic)
// ============================================================================

/**
 * Physical dimensions as type-level integers
 *
 * Dimensions: [L, M, T, I, Θ, N, J]
 * L = Length
 * M = Mass
 * T = Time
 * I = Electric Current
 * Θ = Temperature
 * N = Amount of Substance
 * J = Luminous Intensity
 */
export type Dimensions = readonly [
  number, // Length
  number, // Mass
  number, // Time
  number, // Current
  number, // Temperature
  number, // Amount
  number  // Luminous Intensity
];

/**
 * Dimensionless quantity (scalar)
 */
export type Dimensionless = readonly [0, 0, 0, 0, 0, 0, 0];

/**
 * Length dimension [L]
 */
export type LengthDim = readonly [1, 0, 0, 0, 0, 0, 0];

/**
 * Mass dimension [M]
 */
export type MassDim = readonly [0, 1, 0, 0, 0, 0, 0];

/**
 * Time dimension [T]
 */
export type TimeDim = readonly [0, 0, 1, 0, 0, 0, 0];

/**
 * Velocity dimension [L T^-1]
 */
export type VelocityDim = readonly [1, 0, -1, 0, 0, 0, 0];

/**
 * Acceleration dimension [L T^-2]
 */
export type AccelerationDim = readonly [1, 0, -2, 0, 0, 0, 0];

/**
 * Force dimension [M L T^-2]
 */
export type ForceDim = readonly [1, 1, -2, 0, 0, 0, 0];

/**
 * Energy dimension [M L^2 T^-2]
 */
export type EnergyDim = readonly [2, 1, -2, 0, 0, 0, 0];

/**
 * Power dimension [M L^2 T^-3]
 */
export type PowerDim = readonly [2, 1, -3, 0, 0, 0, 0];

/**
 * Pressure dimension [M L^-1 T^-2]
 */
export type PressureDim = readonly [-1, 1, -2, 0, 0, 0, 0];

/**
 * Area dimension [L^2]
 */
export type AreaDim = readonly [2, 0, 0, 0, 0, 0, 0];

/**
 * Volume dimension [L^3]
 */
export type VolumeDim = readonly [3, 0, 0, 0, 0, 0, 0];

/**
 * Temperature dimension [Θ]
 */
export type TemperatureDim = readonly [0, 0, 0, 0, 1, 0, 0];

/**
 * Angle dimension (dimensionless by SI convention)
 */
export type AngleDim = Dimensionless;

// ============================================================================
// Quantity Type (Value + Units)
// ============================================================================

/**
 * Physical quantity with dimensional type checking
 *
 * @example
 * ```ts
 * const distance: Quantity<LengthDim> = meters(100);
 * const time: Quantity<TimeDim> = seconds(10);
 * const speed: Quantity<VelocityDim> = divide(distance, time);
 * ```
 */
export interface Quantity<D extends Dimensions> {
  /** Value in base SI units */
  readonly value: number;
  /** Dimension signature (compile-time only) */
  readonly _dimensions?: D;
}

/**
 * Create quantity with specific dimensions
 */
function createQuantity<D extends Dimensions>(value: number): Quantity<D> {
  return { value };
}

// ============================================================================
// Arithmetic Operations (Type-Safe)
// ============================================================================

/**
 * Add two quantities (must have same dimensions)
 */
export function add<D extends Dimensions>(
  a: Quantity<D>,
  b: Quantity<D>
): Quantity<D> {
  return createQuantity(a.value + b.value);
}

/**
 * Subtract two quantities (must have same dimensions)
 */
export function subtract<D extends Dimensions>(
  a: Quantity<D>,
  b: Quantity<D>
): Quantity<D> {
  return createQuantity(a.value - b.value);
}

/**
 * Multiply two quantities (dimensions add)
 *
 * Note: TypeScript can't do type-level addition, so we return 'any'
 * In practice, use specific helper functions like multiplyLengthByLength
 */
export function multiply<D1 extends Dimensions, D2 extends Dimensions>(
  a: Quantity<D1>,
  b: Quantity<D2>
): Quantity<any> {
  return createQuantity(a.value * b.value);
}

/**
 * Divide two quantities (dimensions subtract)
 */
export function divide<D1 extends Dimensions, D2 extends Dimensions>(
  a: Quantity<D1>,
  b: Quantity<D2>
): Quantity<any> {
  return createQuantity(a.value / b.value);
}

/**
 * Multiply quantity by scalar
 */
export function scale<D extends Dimensions>(
  q: Quantity<D>,
  scalar: number
): Quantity<D> {
  return createQuantity(q.value * scalar);
}

/**
 * Negate quantity
 */
export function negate<D extends Dimensions>(q: Quantity<D>): Quantity<D> {
  return createQuantity(-q.value);
}

/**
 * Get absolute value
 */
export function abs<D extends Dimensions>(q: Quantity<D>): Quantity<D> {
  return createQuantity(Math.abs(q.value));
}

/**
 * Compare two quantities
 */
export function lessThan<D extends Dimensions>(
  a: Quantity<D>,
  b: Quantity<D>
): boolean {
  return a.value < b.value;
}

export function greaterThan<D extends Dimensions>(
  a: Quantity<D>,
  b: Quantity<D>
): boolean {
  return a.value > b.value;
}

export function equals<D extends Dimensions>(
  a: Quantity<D>,
  b: Quantity<D>,
  tolerance = 1e-10
): boolean {
  return Math.abs(a.value - b.value) < tolerance;
}

// ============================================================================
// Length Units
// ============================================================================

export function meters(value: number): Quantity<LengthDim> {
  return createQuantity(value);
}

export function kilometers(value: number): Quantity<LengthDim> {
  return createQuantity(value * 1000);
}

export function centimeters(value: number): Quantity<LengthDim> {
  return createQuantity(value * 0.01);
}

export function millimeters(value: number): Quantity<LengthDim> {
  return createQuantity(value * 0.001);
}

export function feet(value: number): Quantity<LengthDim> {
  return createQuantity(value * 0.3048);
}

export function inches(value: number): Quantity<LengthDim> {
  return createQuantity(value * 0.0254);
}

export function miles(value: number): Quantity<LengthDim> {
  return createQuantity(value * 1609.344);
}

export function nauticalMiles(value: number): Quantity<LengthDim> {
  return createQuantity(value * 1852);
}

export function astronomicalUnits(value: number): Quantity<LengthDim> {
  return createQuantity(value * 149597870700);
}

export function lightYears(value: number): Quantity<LengthDim> {
  return createQuantity(value * 9.4607304725808e15);
}

export function parsecs(value: number): Quantity<LengthDim> {
  return createQuantity(value * 3.0856775814913673e16);
}

// Conversions
export function toMeters(length: Quantity<LengthDim>): number {
  return length.value;
}

export function toKilometers(length: Quantity<LengthDim>): number {
  return length.value / 1000;
}

export function toFeet(length: Quantity<LengthDim>): number {
  return length.value / 0.3048;
}

export function toMiles(length: Quantity<LengthDim>): number {
  return length.value / 1609.344;
}

export function toAU(length: Quantity<LengthDim>): number {
  return length.value / 149597870700;
}

// ============================================================================
// Mass Units
// ============================================================================

export function kilograms(value: number): Quantity<MassDim> {
  return createQuantity(value);
}

export function grams(value: number): Quantity<MassDim> {
  return createQuantity(value * 0.001);
}

export function tonnes(value: number): Quantity<MassDim> {
  return createQuantity(value * 1000);
}

export function pounds(value: number): Quantity<MassDim> {
  return createQuantity(value * 0.45359237);
}

export function ounces(value: number): Quantity<MassDim> {
  return createQuantity(value * 0.028349523125);
}

export function solarMasses(value: number): Quantity<MassDim> {
  return createQuantity(value * 1.98847e30);
}

// Conversions
export function toKilograms(mass: Quantity<MassDim>): number {
  return mass.value;
}

export function toPounds(mass: Quantity<MassDim>): number {
  return mass.value / 0.45359237;
}

// ============================================================================
// Time Units
// ============================================================================

export function seconds(value: number): Quantity<TimeDim> {
  return createQuantity(value);
}

export function minutes(value: number): Quantity<TimeDim> {
  return createQuantity(value * 60);
}

export function hours(value: number): Quantity<TimeDim> {
  return createQuantity(value * 3600);
}

export function days(value: number): Quantity<TimeDim> {
  return createQuantity(value * 86400);
}

export function years(value: number): Quantity<TimeDim> {
  return createQuantity(value * 31557600); // Julian year
}

export function milliseconds(value: number): Quantity<TimeDim> {
  return createQuantity(value * 0.001);
}

// Conversions
export function toSeconds(time: Quantity<TimeDim>): number {
  return time.value;
}

export function toMinutes(time: Quantity<TimeDim>): number {
  return time.value / 60;
}

export function toHours(time: Quantity<TimeDim>): number {
  return time.value / 3600;
}

export function toDays(time: Quantity<TimeDim>): number {
  return time.value / 86400;
}

// ============================================================================
// Velocity Units
// ============================================================================

export function metersPerSecond(value: number): Quantity<VelocityDim> {
  return createQuantity(value);
}

export function kilometersPerHour(value: number): Quantity<VelocityDim> {
  return createQuantity(value / 3.6);
}

export function milesPerHour(value: number): Quantity<VelocityDim> {
  return createQuantity(value * 0.44704);
}

export function knots(value: number): Quantity<VelocityDim> {
  return createQuantity(value * 0.514444);
}

export function speedOfLight(value: number): Quantity<VelocityDim> {
  return createQuantity(value * 299792458);
}

// Conversions
export function toMetersPerSecond(velocity: Quantity<VelocityDim>): number {
  return velocity.value;
}

export function toKilometersPerHour(velocity: Quantity<VelocityDim>): number {
  return velocity.value * 3.6;
}

export function toMilesPerHour(velocity: Quantity<VelocityDim>): number {
  return velocity.value / 0.44704;
}

// ============================================================================
// Force Units
// ============================================================================

export function newtons(value: number): Quantity<ForceDim> {
  return createQuantity(value);
}

export function kilonewtons(value: number): Quantity<ForceDim> {
  return createQuantity(value * 1000);
}

export function poundsForce(value: number): Quantity<ForceDim> {
  return createQuantity(value * 4.4482216152605);
}

// Conversions
export function toNewtons(force: Quantity<ForceDim>): number {
  return force.value;
}

export function toPoundsForce(force: Quantity<ForceDim>): number {
  return force.value / 4.4482216152605;
}

// ============================================================================
// Energy Units
// ============================================================================

export function joules(value: number): Quantity<EnergyDim> {
  return createQuantity(value);
}

export function kilojoules(value: number): Quantity<EnergyDim> {
  return createQuantity(value * 1000);
}

export function calories(value: number): Quantity<EnergyDim> {
  return createQuantity(value * 4.184);
}

export function kilowattHours(value: number): Quantity<EnergyDim> {
  return createQuantity(value * 3.6e6);
}

export function electronVolts(value: number): Quantity<EnergyDim> {
  return createQuantity(value * 1.602176634e-19);
}

// Conversions
export function toJoules(energy: Quantity<EnergyDim>): number {
  return energy.value;
}

export function toKilowattHours(energy: Quantity<EnergyDim>): number {
  return energy.value / 3.6e6;
}

// ============================================================================
// Pressure Units
// ============================================================================

export function pascals(value: number): Quantity<PressureDim> {
  return createQuantity(value);
}

export function kilopascals(value: number): Quantity<PressureDim> {
  return createQuantity(value * 1000);
}

export function bars(value: number): Quantity<PressureDim> {
  return createQuantity(value * 100000);
}

export function atmospheres(value: number): Quantity<PressureDim> {
  return createQuantity(value * 101325);
}

export function psi(value: number): Quantity<PressureDim> {
  return createQuantity(value * 6894.757293168);
}

// Conversions
export function toPascals(pressure: Quantity<PressureDim>): number {
  return pressure.value;
}

export function toBars(pressure: Quantity<PressureDim>): number {
  return pressure.value / 100000;
}

export function toPSI(pressure: Quantity<PressureDim>): number {
  return pressure.value / 6894.757293168;
}

// ============================================================================
// Temperature Units (Requires Special Handling)
// ============================================================================

/**
 * Temperature in Kelvin (absolute)
 */
export function kelvin(value: number): Quantity<TemperatureDim> {
  return createQuantity(value);
}

/**
 * Temperature in Celsius (converted to Kelvin)
 */
export function celsius(value: number): Quantity<TemperatureDim> {
  return createQuantity(value + 273.15);
}

/**
 * Temperature in Fahrenheit (converted to Kelvin)
 */
export function fahrenheit(value: number): Quantity<TemperatureDim> {
  return createQuantity((value - 32) * 5/9 + 273.15);
}

// Conversions
export function toKelvin(temp: Quantity<TemperatureDim>): number {
  return temp.value;
}

export function toCelsius(temp: Quantity<TemperatureDim>): number {
  return temp.value - 273.15;
}

export function toFahrenheit(temp: Quantity<TemperatureDim>): number {
  return (temp.value - 273.15) * 9/5 + 32;
}

// ============================================================================
// Angle Units (Dimensionless but commonly used)
// ============================================================================

export function radians(value: number): Quantity<AngleDim> {
  return createQuantity(value);
}

export function degrees(value: number): Quantity<AngleDim> {
  return createQuantity(value * Math.PI / 180);
}

export function arcminutes(value: number): Quantity<AngleDim> {
  return createQuantity(value * Math.PI / 10800);
}

export function arcseconds(value: number): Quantity<AngleDim> {
  return createQuantity(value * Math.PI / 648000);
}

// Conversions
export function toRadians(angle: Quantity<AngleDim>): number {
  return angle.value;
}

export function toDegrees(angle: Quantity<AngleDim>): number {
  return angle.value * 180 / Math.PI;
}

// ============================================================================
// Area Units
// ============================================================================

export function squareMeters(value: number): Quantity<AreaDim> {
  return createQuantity(value);
}

export function squareKilometers(value: number): Quantity<AreaDim> {
  return createQuantity(value * 1e6);
}

export function squareFeet(value: number): Quantity<AreaDim> {
  return createQuantity(value * 0.09290304);
}

export function acres(value: number): Quantity<AreaDim> {
  return createQuantity(value * 4046.8564224);
}

// ============================================================================
// Volume Units
// ============================================================================

export function cubicMeters(value: number): Quantity<VolumeDim> {
  return createQuantity(value);
}

export function liters(value: number): Quantity<VolumeDim> {
  return createQuantity(value * 0.001);
}

export function gallons(value: number): Quantity<VolumeDim> {
  return createQuantity(value * 0.003785411784);
}

// ============================================================================
// Derived Quantities (Type-Safe Operations)
// ============================================================================

/**
 * Compute velocity from distance and time
 */
export function velocityFromDistanceTime(
  distance: Quantity<LengthDim>,
  time: Quantity<TimeDim>
): Quantity<VelocityDim> {
  return divide(distance, time) as Quantity<VelocityDim>;
}

/**
 * Compute energy from mass and velocity (kinetic energy)
 * KE = ½mv²
 */
export function kineticEnergy(
  mass: Quantity<MassDim>,
  velocity: Quantity<VelocityDim>
): Quantity<EnergyDim> {
  const v2 = multiply(velocity, velocity);
  const mv2 = multiply(mass, v2);
  return scale(mv2 as Quantity<EnergyDim>, 0.5);
}

/**
 * Compute force from mass and acceleration
 * F = ma
 */
export function forceFromMassAcceleration(
  mass: Quantity<MassDim>,
  acceleration: Quantity<AccelerationDim>
): Quantity<ForceDim> {
  return multiply(mass, acceleration) as Quantity<ForceDim>;
}

/**
 * Compute power from energy and time
 * P = E/t
 */
export function powerFromEnergyTime(
  energy: Quantity<EnergyDim>,
  time: Quantity<TimeDim>
): Quantity<PowerDim> {
  return divide(energy, time) as Quantity<PowerDim>;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format quantity with units
 */
export function format<D extends Dimensions>(
  quantity: Quantity<D>,
  unit: string,
  precision = 2
): string {
  return `${quantity.value.toFixed(precision)} ${unit}`;
}

/**
 * Extract raw value (use with caution!)
 */
export function getValue<D extends Dimensions>(quantity: Quantity<D>): number {
  return quantity.value;
}
