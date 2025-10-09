/**
 * Three.js / React Three Fiber Utilities
 * Shared helpers for 3D components
 */

import * as THREE from "three";

// ============================================================================
// Types
// ============================================================================

export interface PlanetaryBodyProps {
  /** Radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface CanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Camera position [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Camera field of view */
  cameraFov?: number;
  /** Canvas height */
  height?: string;
  /** Canvas width */
  width?: string;
  children?: React.ReactNode;
}

export interface ControlsProps {
  /** Minimum zoom distance */
  minDistance?: number;
  /** Maximum zoom distance */
  maxDistance?: number;
  /** Zoom speed */
  zoomSpeed?: number;
  /** Pan speed */
  panSpeed?: number;
  /** Rotate speed */
  rotateSpeed?: number;
  /** Enable pan */
  enablePan?: boolean;
  /** Enable zoom */
  enableZoom?: boolean;
  /** Enable rotate */
  enableRotate?: boolean;
  /** Enable damping */
  enableDamping?: boolean;
  /** Damping factor */
  dampingFactor?: number;
}

export interface GlobeProps {
  /** Number of segments for sphere geometry */
  segments?: number;
  children?: React.ReactNode;
}

// ============================================================================
// Canvas Configuration
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
 * Standard camera configuration
 */
export const STANDARD_CAMERA_CONFIG = {
  position: [0, 5, 20] as [number, number, number],
  fov: 45,
} as const;

/**
 * Standard controls configuration
 */
export const STANDARD_CONTROLS_CONFIG = {
  minDistance: 8,
  maxDistance: 100,
  zoomSpeed: 0.6,
  panSpeed: 0.5,
  rotateSpeed: 0.4,
  enablePan: true,
  enableZoom: true,
  enableRotate: true,
  enableDamping: true,
  dampingFactor: 0.05,
} as const;

/**
 * Standard lighting configuration for planets
 */
export const STANDARD_PLANET_LIGHTING = {
  ambientIntensity: 1.0,
  ambientColor: 0xffffff,
  directionalIntensity: 2.0,
  directionalPosition: [10, 5, 10] as [number, number, number],
} as const;

// ============================================================================
// Color & Material Utilities
// ============================================================================

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

// ============================================================================
// Geometry Utilities
// ============================================================================

/**
 * Create sphere geometry with LOD support
 */
export function createSphereGeometry(
  radius: number,
  segments: number = 64
): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, segments, segments / 2);
}

/**
 * Create ring geometry
 */
export function createRingGeometry(
  innerRadius: number,
  outerRadius: number,
  thetaSegments: number = 128
): THREE.RingGeometry {
  return new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
}

// ============================================================================
// Shader Utilities
// ============================================================================

/**
 * Standard atmosphere shader
 */
export const ATMOSPHERE_SHADER = {
  vertex: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: `
    uniform vec3 glowColor;
    uniform float intensity;
    uniform float falloff;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), falloff);
      float alpha = fresnel * intensity;

      gl_FragColor = vec4(glowColor, alpha);
    }
  `,
} as const;

/**
 * Create atmosphere shader material
 */
export function createAtmosphereShader(
  color: THREE.ColorRepresentation,
  intensity: number,
  falloff: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      falloff: { value: falloff },
    },
    vertexShader: ATMOSPHERE_SHADER.vertex,
    fragmentShader: ATMOSPHERE_SHADER.fragment,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

// ============================================================================
// Animation Utilities
// ============================================================================

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

/**
 * Calculate axial tilt rotation
 */
export function calculateAxialTilt(tiltDegrees: number): [number, number, number] {
  return [0, 0, THREE.MathUtils.degToRad(tiltDegrees)];
}
