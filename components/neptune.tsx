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

export const NEPTUNE_RADIUS_KM = 24622;
export const SCENE_SCALE = 0.001;
export const NEPTUNE_RADIUS = NEPTUNE_RADIUS_KM * SCENE_SCALE;
export const NEPTUNE_ROTATION_PERIOD_SECONDS = 57600.0; // 16 hours
export const NEPTUNE_ORBITAL_PERIOD_DAYS = 60190; // 164.8 years
export const NEPTUNE_AXIAL_TILT_DEG = 28.3;

// ============================================================================
// Context
// ============================================================================

interface NeptuneContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const NeptuneContext = React.createContext<NeptuneContext | null>(null);

function useNeptune() {
  const ctx = React.useContext(NeptuneContext);
  if (!ctx) throw new Error("useNeptune must be used within Neptune.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface NeptuneRootProps {
  /** Texture URL for Neptune surface map */
  textureUrl?: string;
  /** Neptune radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface NeptuneCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
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

export interface NeptuneControlsProps {
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

export interface NeptuneGlobeProps {
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
const NeptuneRoot = React.forwardRef<HTMLDivElement, NeptuneRootProps>(
  (
    {
      textureUrl,
      radius = NEPTUNE_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.3,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (NEPTUNE_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(NEPTUNE_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: NeptuneContext = React.useMemo(
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
      <NeptuneContext.Provider value={contextValue}>
        <div ref={ref} className="neptune-root relative h-full w-full">
          {children}
        </div>
      </NeptuneContext.Provider>
    );
  }
);

NeptuneRoot.displayName = "Neptune.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const NeptuneCanvas = React.forwardRef<HTMLDivElement, NeptuneCanvasProps>(
  (
    {
      cameraPosition = [0, 30, 100],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useNeptune();

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

NeptuneCanvas.displayName = "Neptune.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const NeptuneControls = React.forwardRef<any, NeptuneControlsProps>(
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

NeptuneControls.displayName = "Neptune.Controls";

/**
 * Globe component - renders the main Neptune sphere
 */
const NeptuneGlobe = React.forwardRef<any, NeptuneGlobeProps>(
  ({ segments = 128, children }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useNeptune();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#4166f5"}
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

NeptuneGlobe.displayName = "Neptune.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const NeptuneAxis = React.forwardRef<any, { size?: number }>(({ size }, ref) => {
  const { radius } = useNeptune();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} />;
});

NeptuneAxis.displayName = "Neptune.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Neptune = Object.assign(NeptuneRoot, {
  Root: NeptuneRoot,
  Canvas: NeptuneCanvas,
  Controls: NeptuneControls,
  Globe: NeptuneGlobe,
  Axis: NeptuneAxis,
});
