"use client";

import * as React from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sphere } from "./primitives/sphere";

// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================

export const URANUS_RADIUS_KM = 25362;
export const SCENE_SCALE = 0.001;
export const URANUS_RADIUS = URANUS_RADIUS_KM * SCENE_SCALE;
export const URANUS_ROTATION_PERIOD_SECONDS = 62064.0; // 17.2 hours (retrograde)
export const URANUS_ORBITAL_PERIOD_DAYS = 30687; // 84 years
export const URANUS_AXIAL_TILT_DEG = 97.8; // On its side!

// ============================================================================
// Context
// ============================================================================

interface UranusContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const UranusContext = React.createContext<UranusContext | null>(null);

function useUranus() {
  const ctx = React.useContext(UranusContext);
  if (!ctx) throw new Error("useUranus must be used within Uranus.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface UranusRootProps {
  /** Texture URL for Uranus surface map */
  textureUrl?: string;
  /** Uranus radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface UranusCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
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

export interface UranusControlsProps {
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

export interface UranusGlobeProps {
  /** Number of segments for sphere geometry */
  segments?: number;
  children?: React.ReactNode;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const UranusRoot = React.forwardRef<HTMLDivElement, UranusRootProps>(
  (
    {
      textureUrl,
      radius = URANUS_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (URANUS_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(URANUS_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: UranusContext = React.useMemo(
      () => ({
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        textureUrl,
      }),
      [radius, rotationSpeed, axialTilt, brightness, timeScale, textureUrl]
    );

    return (
      <UranusContext.Provider value={contextValue}>
        <div ref={ref} className="uranus-root relative h-full w-full">
          {children}
        </div>
      </UranusContext.Provider>
    );
  }
);

UranusRoot.displayName = "Uranus.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const UranusCanvas = React.forwardRef<HTMLDivElement, UranusCanvasProps>(
  (
    {
      cameraPosition = [0, 5, 50],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useUranus();

    return (
      <div ref={ref} className={className} {...props}>
        <Canvas
          style={{
            height: `${height}`,
            width: `${width}`,
          }}
          camera={{ position: cameraPosition, fov: cameraFov }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
        >
          <color attach="background" args={[0, 0, 0]} />
          <fog attach="fog" args={[0x000511, 50, 200]} />

          <Suspense fallback={null}>
            <ambientLight intensity={0.4 * brightness} />
            <directionalLight
              position={[10, 5, 10]}
              intensity={2.0 * brightness}
              castShadow={false}
            />
            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

UranusCanvas.displayName = "Uranus.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const UranusControls = React.forwardRef<any, UranusControlsProps>(
  (
    {
      minDistance = 30,
      maxDistance = 200,
      zoomSpeed = 0.6,
      panSpeed = 0.5,
      rotateSpeed = 0.4,
      enablePan = true,
      enableZoom = true,
      enableRotate = true,
      enableDamping = true,
      dampingFactor = 0.05,
    },
    ref
  ) => {
    return (
      <OrbitControls
        ref={ref}
        makeDefault
        enablePan={enablePan}
        enableZoom={enableZoom}
        enableRotate={enableRotate}
        zoomSpeed={zoomSpeed}
        panSpeed={panSpeed}
        rotateSpeed={rotateSpeed}
        minDistance={minDistance}
        maxDistance={maxDistance}
        enableDamping={enableDamping}
        dampingFactor={dampingFactor}
      />
    );
  }
);

UranusControls.displayName = "Uranus.Controls";

/**
 * Globe component - renders the main Uranus sphere
 */
const UranusGlobe = React.forwardRef<any, UranusGlobeProps>(
  ({ segments = 128, children }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useUranus();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#4fd0e7"}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        roughness={0.7}
        metalness={0.1}
      >
        {children}
      </Sphere>
    );
  }
);

UranusGlobe.displayName = "Uranus.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const UranusAxis = React.forwardRef<any, { size?: number }>(({ size }, ref) => {
  const { radius } = useUranus();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} />;
});

UranusAxis.displayName = "Uranus.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Uranus = Object.assign(UranusRoot, {
  Root: UranusRoot,
  Canvas: UranusCanvas,
  Controls: UranusControls,
  Globe: UranusGlobe,
  Axis: UranusAxis,
});
