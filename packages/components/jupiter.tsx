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

export const JUPITER_RADIUS_KM = 69911;
export const SCENE_SCALE = 0.001;
export const JUPITER_RADIUS = JUPITER_RADIUS_KM * SCENE_SCALE;
export const JUPITER_ROTATION_PERIOD_SECONDS = 35730.0; // 9.9 hours (fastest rotation)
export const JUPITER_ORBITAL_PERIOD_DAYS = 4333; // 11.9 years
export const JUPITER_AXIAL_TILT_DEG = 3.1; // Nearly upright

// ============================================================================
// Context
// ============================================================================

interface JupiterContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const JupiterContext = React.createContext<JupiterContext | null>(null);

function useJupiter() {
  const ctx = React.useContext(JupiterContext);
  if (!ctx) throw new Error("useJupiter must be used within Jupiter.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface JupiterRootProps {
  /** Texture URL for Jupiter surface map */
  textureUrl?: string;
  /** Jupiter radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface JupiterCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
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

export interface JupiterControlsProps {
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

export interface JupiterGlobeProps {
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
const JupiterRoot = React.forwardRef<HTMLDivElement, JupiterRootProps>(
  (
    {
      textureUrl,
      radius = JUPITER_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.1,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (JUPITER_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(JUPITER_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: JupiterContext = React.useMemo(
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
      <JupiterContext.Provider value={contextValue}>
        <div ref={ref} className="jupiter-root relative h-full w-full">
          {children}
        </div>
      </JupiterContext.Provider>
    );
  }
);

JupiterRoot.displayName = "Jupiter.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const JupiterCanvas = React.forwardRef<HTMLDivElement, JupiterCanvasProps>(
  (
    {
      cameraPosition = [0, 50, 200],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useJupiter();

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

          <Suspense fallback={null}>
            <ambientLight intensity={0.4 * brightness} />
            <directionalLight
              position={[100, 50, 100]}
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

JupiterCanvas.displayName = "Jupiter.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const JupiterControls = React.forwardRef<any, JupiterControlsProps>(
  (
    {
      minDistance = 80,
      maxDistance = 500,
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

JupiterControls.displayName = "Jupiter.Controls";

/**
 * Globe component - renders the main Jupiter sphere
 */
const JupiterGlobe = React.forwardRef<any, JupiterGlobeProps>(
  ({ segments = 128, children }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useJupiter();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#c88b3a"}
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

JupiterGlobe.displayName = "Jupiter.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const JupiterAxis = React.forwardRef<any, { size?: number }>(({ size }, ref) => {
  const { radius } = useJupiter();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} />;
});

JupiterAxis.displayName = "Jupiter.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Jupiter = Object.assign(JupiterRoot, {
  Root: JupiterRoot,
  Canvas: JupiterCanvas,
  Controls: JupiterControls,
  Globe: JupiterGlobe,
  Axis: JupiterAxis,
});
