"use client";

import { useRef, useMemo, forwardRef, ReactNode, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Sphere Primitive
 *
 * Reusable sphere geometry with automatic LOD, texture loading, and shader support.
 * Base primitive for planets, moons, and other spherical bodies.
 *
 * Features:
 * - Automatic LOD based on camera distance
 * - Normal map support for surface detail
 * - Bump mapping for displacement
 * - Specular highlights
 * - Composable with Atmosphere, Clouds, Rings
 *
 * @example
 * ```tsx
 * <Sphere radius={6.371} textureUrl="/earth.jpg">
 *   <Atmosphere />
 * </Sphere>
 * ```
 */

export interface SphereProps {
  /** Radius in scene units */
  radius: number;
  /** Main texture (diffuse/albedo) */
  textureUrl?: string;
  /** Normal map for surface detail */
  normalMapUrl?: string;
  /** Bump map for displacement */
  bumpMapUrl?: string;
  /** Roughness map (replaces specular for PBR) */
  specularMapUrl?: string;
  /** Emissive texture (for night lights) */
  emissiveMapUrl?: string;
  /** Base color if no texture */
  color?: THREE.ColorRepresentation;
  /** Emissive color */
  emissiveColor?: THREE.ColorRepresentation;
  /** Emissive intensity */
  emissiveIntensity?: number;
  /** Use unlit material (meshBasicMaterial) - ignores lighting for full brightness */
  unlit?: boolean;
  /** Rotation speed (radians per frame) */
  rotationSpeed?: number;
  /** Initial rotation offset */
  rotation?: [number, number, number];
  /** Segments for geometry (higher = smoother) */
  segments?: number;
  /** Enable automatic LOD */
  autoLOD?: boolean;
  /** Metalness (PBR) */
  metalness?: number;
  /** Roughness (PBR) */
  roughness?: number;
  /** Composable children (Atmosphere, Clouds, etc) */
  children?: ReactNode;
  /** Ref to mesh */
  ref?: React.Ref<THREE.Mesh>;
}

export const Sphere = forwardRef<THREE.Mesh, SphereProps>(
  (
    {
      radius,
      textureUrl,
      normalMapUrl,
      bumpMapUrl,
      specularMapUrl,
      emissiveMapUrl,
      color = 0xffffff,
      emissiveColor,
      emissiveIntensity,
      unlit = false,
      rotationSpeed = 0,
      rotation = [0, 0, 0],
      segments = 64,
      autoLOD = true,
      metalness = 0,
      roughness = 1,
      children,
    },
    ref
  ) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Singleton texture loader (created once, reused)
    const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

    // Load textures
    const textures = useMemo(() => {
      return {
        map: textureUrl ? textureLoader.load(textureUrl) : null,
        normalMap: normalMapUrl ? textureLoader.load(normalMapUrl) : null,
        bumpMap: bumpMapUrl ? textureLoader.load(bumpMapUrl) : null,
        roughnessMap: specularMapUrl ? textureLoader.load(specularMapUrl) : null,
        emissiveMap: emissiveMapUrl ? textureLoader.load(emissiveMapUrl) : null,
      };
    }, [textureUrl, normalMapUrl, bumpMapUrl, specularMapUrl, emissiveMapUrl, textureLoader]);

    // Cleanup lifecycle: dispose geometries, materials, and textures
    useEffect(() => {
      return () => {
        // Dispose textures
        textures.map?.dispose();
        textures.normalMap?.dispose();
        textures.bumpMap?.dispose();
        textures.roughnessMap?.dispose();
        textures.emissiveMap?.dispose();

        // Dispose geometry and material
        if (meshRef.current) {
          meshRef.current.geometry.dispose();
          if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach((mat) => mat.dispose());
          } else {
            meshRef.current.material.dispose();
          }
        }
      };
    }, [textures]);

    // Apply rotation
    useFrame(() => {
      if (meshRef.current && rotationSpeed !== 0) {
        meshRef.current.rotation.y += rotationSpeed;
      }
    });

    // Set initial rotation
    useMemo(() => {
      if (groupRef.current) {
        groupRef.current.rotation.set(...rotation);
      }
    }, [rotation]);

    // Expose ref
    useMemo(() => {
      if (ref && meshRef.current) {
        if (typeof ref === "function") {
          ref(meshRef.current);
        } else {
          (ref as React.MutableRefObject<THREE.Mesh>).current = meshRef.current;
        }
      }
    }, [ref]);

    return (
      <group ref={groupRef}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[radius, segments, segments / 2]} />
          {unlit ? (
            <meshBasicMaterial
              map={textures.map}
              color={color}
              toneMapped={false}
            />
          ) : (
            <meshStandardMaterial
              map={textures.map}
              normalMap={textures.normalMap}
              bumpMap={textures.bumpMap}
              roughnessMap={textures.roughnessMap}
              emissiveMap={textures.emissiveMap}
              color={color}
              metalness={metalness}
              roughness={0.6}
              emissive={emissiveColor ?? (emissiveMapUrl ? 0xffffff : 0x000000)}
              emissiveIntensity={emissiveIntensity ?? (emissiveMapUrl ? 2.0 : 0)}
            />
          )}
        </mesh>
        {children}
      </group>
    );
  }
);

Sphere.displayName = "Sphere";

/**
 * Atmosphere Primitive
 *
 * Composable atmospheric glow effect using custom shader.
 * Designed to be nested inside Sphere.
 *
 * @example
 * ```tsx
 * <Sphere radius={6.371}>
 *   <Atmosphere color="#4488ff" intensity={0.8} />
 * </Sphere>
 * ```
 */

const ATMOSPHERE_SHADER = {
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
};

export interface AtmosphereProps {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  falloff?: number;
  scale?: number;
  radius?: number; // Parent sphere radius for proper scaling
}

export function Atmosphere({
  color = 0x4488ff,
  intensity = 0.6,
  falloff = 3.0,
  scale = 1.015,
  radius, // If provided, use this radius; otherwise assume parent scale handles it
}: AtmosphereProps) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      falloff: { value: falloff },
    }),
    [color, intensity, falloff]
  );

  // If radius is provided, scale absolutely; otherwise use relative scale
  const atmosphereRadius = radius ? radius * scale : 1;
  const atmosphereScale = radius ? 1 : scale;

  return (
    <mesh scale={atmosphereScale}>
      <sphereGeometry args={[atmosphereRadius, 64, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={ATMOSPHERE_SHADER.vertex}
        fragmentShader={ATMOSPHERE_SHADER.fragment}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Clouds Primitive
 *
 * Rotating cloud layer with transparency.
 * Designed to be nested inside Sphere.
 *
 * @example
 * ```tsx
 * <Sphere radius={6.371}>
 *   <Clouds textureUrl="/clouds.jpg" height={1.005} />
 * </Sphere>
 * ```
 */

export interface CloudsProps {
  textureUrl: string;
  height?: number;
  opacity?: number;
  rotationSpeed?: number;
  radius?: number; // Parent sphere radius for proper scaling
}

export function Clouds({
  textureUrl,
  height = 1.003,
  opacity = 0.4,
  rotationSpeed = 0.0001,
  radius,
}: CloudsProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  // If radius is provided, scale absolutely; otherwise use relative scale
  const cloudRadius = radius ? radius * height : 1;
  const cloudScale = radius ? 1 : height;

  return (
    <mesh ref={meshRef} scale={cloudScale}>
      <sphereGeometry args={[cloudRadius, 64, 32]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Ring Primitive
 *
 * Flat ring geometry for Saturn-style rings or orbital paths.
 *
 * @example
 * ```tsx
 * <Ring innerRadius={1.5} outerRadius={2.5} textureUrl="/saturn-rings.png" />
 * ```
 */

export interface RingProps {
  innerRadius: number;
  outerRadius: number;
  textureUrl?: string;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  rotation?: [number, number, number];
  thetaSegments?: number;
}

export function Ring({
  innerRadius,
  outerRadius,
  textureUrl,
  color = 0xffffff,
  opacity = 1,
  rotation = [Math.PI / 2, 0, 0],
  thetaSegments = 128,
}: RingProps) {
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  return (
    <mesh rotation={rotation}>
      <ringGeometry args={[innerRadius, outerRadius, thetaSegments]} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
