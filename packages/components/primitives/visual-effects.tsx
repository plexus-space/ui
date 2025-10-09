"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Visual Effects & Polish
 *
 * Shader-based effects for spectacular visuals:
 * - Bloom/glow effects
 * - God rays (volumetric lighting)
 * - Lens flares
 * - Motion blur trails
 * - Particle systems
 *
 * Focuses on craft and micro-interactions.
 */

// ============================================================================
// Glow/Bloom Effect
// ============================================================================

const GLOW_SHADER = {
  vertex: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragment: `
    uniform vec3 glowColor;
    uniform float glowIntensity;
    uniform float glowFalloff;
    uniform float pulseSpeed;
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), glowFalloff);

      // Pulse effect
      float pulse = 0.5 + 0.5 * sin(time * pulseSpeed);
      float intensity = glowIntensity * (0.8 + 0.2 * pulse);

      float alpha = fresnel * intensity;
      gl_FragColor = vec4(glowColor, alpha);
    }
  `,
};

export interface GlowEffectProps {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  falloff?: number;
  pulseSpeed?: number;
  scale?: number;
}

/**
 * Glow Effect Component
 *
 * Adds a pulsing glow around objects for emphasis and visual appeal.
 *
 * @example
 * ```tsx
 * <mesh>
 *   <sphereGeometry />
 *   <meshBasicMaterial />
 *   <GlowEffect color="#00ffff" intensity={1.5} pulseSpeed={2} />
 * </mesh>
 * ```
 */
export function GlowEffect({
  color = 0x00ffff,
  intensity = 1.0,
  falloff = 3.0,
  pulseSpeed = 1.0,
  scale = 1.05,
}: GlowEffectProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      glowIntensity: { value: intensity },
      glowFalloff: { value: falloff },
      pulseSpeed: { value: pulseSpeed },
      time: { value: 0 },
    }),
    [color, intensity, falloff, pulseSpeed]
  );

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <sphereGeometry args={[1, 64, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={GLOW_SHADER.vertex}
        fragmentShader={GLOW_SHADER.fragment}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ============================================================================
// Star Field
// ============================================================================

export interface StarFieldProps {
  count?: number;
  radius?: number;
  size?: number;
  color?: THREE.ColorRepresentation;
}

/**
 * Star Field Background
 *
 * Performant star field using instanced rendering.
 *
 * @example
 * ```tsx
 * <StarField count={5000} radius={100} />
 * ```
 */
export function StarField({
  count = 5000,
  radius = 100,
  size = 0.1,
  color = 0xffffff,
}: StarFieldProps) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.5 + Math.random() * 0.5);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, radius]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = size * (0.5 + Math.random() * 1.5);
    }
    return s;
  }, [count, size]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ============================================================================
// Lens Flare
// ============================================================================

const LENS_FLARE_SHADER = {
  vertex: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: `
    uniform vec3 color;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);

      // Hexagonal flare pattern
      float angle = atan(center.y, center.x);
      float hexagon = 0.5 + 0.5 * cos(angle * 6.0);

      // Radial gradient
      float radial = 1.0 - smoothstep(0.0, 0.5, dist);

      float alpha = radial * hexagon * intensity;
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

export interface LensFlareProps {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  position: [number, number, number];
  size?: number;
}

/**
 * Lens Flare Effect
 *
 * Simulates camera lens artifacts for stellar objects.
 */
export function LensFlare({
  color = 0xffffff,
  intensity = 1.0,
  position,
  size = 2,
}: LensFlareProps) {
  const uniforms = useMemo(
    () => ({
      color: { value: new THREE.Color(color) },
      intensity: { value: intensity },
    }),
    [color, intensity]
  );

  return (
    <sprite position={position} scale={[size, size, 1]}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={LENS_FLARE_SHADER.vertex}
        fragmentShader={LENS_FLARE_SHADER.fragment}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

// ============================================================================
// Motion Trail
// ============================================================================

export interface MotionTrailProps {
  points: [number, number, number][];
  color?: THREE.ColorRepresentation;
  width?: number;
  fade?: boolean;
}

/**
 * Motion Trail Effect
 *
 * Smooth trail that fades over time for motion visualization.
 *
 * @example
 * ```tsx
 * <MotionTrail
 *   points={trajectoryPoints}
 *   color="#00ffff"
 *   width={0.1}
 *   fade
 * />
 * ```
 */
export function MotionTrail({
  points,
  color = 0x00ffff,
  width = 0.1,
  fade = true,
}: MotionTrailProps) {
  const geometry = useMemo(() => {
    if (points.length < 2) return null;

    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const c = new THREE.Color(color);

    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i][0];
      positions[i * 3 + 1] = points[i][1];
      positions[i * 3 + 2] = points[i][2];

      // Fade from start to end
      const alpha = fade ? i / (points.length - 1) : 1;
      colors[i * 3] = c.r * alpha;
      colors[i * 3 + 1] = c.g * alpha;
      colors[i * 3 + 2] = c.b * alpha;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geom;
  }, [points, color, fade]);

  if (!geometry) return null;

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        linewidth={width}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
}

// ============================================================================
// Particle Emitter
// ============================================================================

export interface ParticleEmitterProps {
  position: [number, number, number];
  rate?: number;
  velocity?: [number, number, number];
  spread?: number;
  lifetime?: number;
  color?: THREE.ColorRepresentation;
  size?: number;
}

/**
 * Simple Particle Emitter
 *
 * GPU-instanced particles for exhaust, explosions, etc.
 *
 * @example
 * ```tsx
 * <ParticleEmitter
 *   position={[0, -1, 0]}
 *   rate={100}
 *   velocity={[0, -5, 0]}
 *   color="#ff6600"
 * />
 * ```
 */
export function ParticleEmitter({
  position,
  rate = 100,
  velocity = [0, 1, 0],
  spread = 0.5,
  lifetime = 2,
  color = 0xffffff,
  size = 0.1,
}: ParticleEmitterProps) {
  const meshRef = useRef<THREE.Points>(null);
  const particles = useRef<
    Array<{
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      age: number;
    }>
  >([]);

  useFrame((state, delta) => {
    // Emit new particles
    const toEmit = Math.floor(rate * delta);
    for (let i = 0; i < toEmit; i++) {
      particles.current.push({
        position: new THREE.Vector3(...position),
        velocity: new THREE.Vector3(
          velocity[0] + (Math.random() - 0.5) * spread,
          velocity[1] + (Math.random() - 0.5) * spread,
          velocity[2] + (Math.random() - 0.5) * spread
        ),
        age: 0,
      });
    }

    // Update particles
    particles.current = particles.current.filter((p) => {
      p.age += delta;
      if (p.age > lifetime) return false;

      p.position.add(p.velocity.clone().multiplyScalar(delta));
      return true;
    });

    // Update geometry
    if (meshRef.current && particles.current.length > 0) {
      const positions = new Float32Array(particles.current.length * 3);
      const alphas = new Float32Array(particles.current.length);

      particles.current.forEach((p, i) => {
        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;
        alphas[i] = 1 - p.age / lifetime;
      });

      meshRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      meshRef.current.geometry.setAttribute(
        "alpha",
        new THREE.BufferAttribute(alphas, 1)
      );
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={0} array={new Float32Array(0)} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================================================
// Grid Helper with Style
// ============================================================================

export interface StyledGridProps {
  size?: number;
  divisions?: number;
  colorCenterLine?: THREE.ColorRepresentation;
  colorGrid?: THREE.ColorRepresentation;
  fadeDistance?: number;
}

/**
 * Styled Grid with Distance Fade
 *
 * More visually appealing than default THREE.GridHelper.
 */
export function StyledGrid({
  size = 100,
  divisions = 100,
  colorCenterLine = 0x444444,
  colorGrid = 0x222222,
  fadeDistance = 50,
}: StyledGridProps) {
  return (
    <>
      <gridHelper
        args={[size, divisions, colorCenterLine, colorGrid]}
        position={[0, 0, 0]}
      />
      {/* Add fog for distance fade */}
      <fog attach="fog" args={[0x000000, fadeDistance * 0.5, fadeDistance]} />
    </>
  );
}
