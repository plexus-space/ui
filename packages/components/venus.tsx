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

export const VENUS_RADIUS_KM = 6051.8;
export const SCENE_SCALE = 0.001;
export const VENUS_RADIUS = VENUS_RADIUS_KM * SCENE_SCALE;
export const VENUS_ROTATION_PERIOD_SECONDS = 20995200.0; // 243 days (retrograde)
export const VENUS_ORBITAL_PERIOD_DAYS = 224.7;
export const VENUS_AXIAL_TILT_DEG = 177.4; // Retrograde rotation

// ============================================================================
// Context
// ============================================================================

interface VenusContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const VenusContext = React.createContext<VenusContext | null>(null);

function useVenus() {
  const ctx = React.useContext(VenusContext);
  if (!ctx) throw new Error("useVenus must be used within Venus.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface VenusRootProps {
  /** Texture URL for Venus surface map */
  textureUrl?: string;
  /** Venus radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface VenusCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
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

export interface VenusControlsProps {
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

export interface VenusGlobeProps {
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
const VenusRoot = React.forwardRef<HTMLDivElement, VenusRootProps>(
  (
    {
      textureUrl,
      radius = VENUS_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (VENUS_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(VENUS_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: VenusContext = React.useMemo(
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
      <VenusContext.Provider value={contextValue}>
        <div ref={ref} className="venus-root relative h-full w-full">
          {children}
        </div>
      </VenusContext.Provider>
    );
  }
);

VenusRoot.displayName = "Venus.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const VenusCanvas = React.forwardRef<HTMLDivElement, VenusCanvasProps>(
  (
    {
      cameraPosition = [0, 5, 20],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useVenus();

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

VenusCanvas.displayName = "Venus.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const VenusControls = React.forwardRef<any, VenusControlsProps>(
  (
    {
      minDistance = 8,
      maxDistance = 100,
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

VenusControls.displayName = "Venus.Controls";

/**
 * Globe component - renders the main Venus sphere
 */
const VenusGlobe = React.forwardRef<any, VenusGlobeProps>(
  ({ segments = 128, children }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useVenus();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#ffc649"}
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

VenusGlobe.displayName = "Venus.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const VenusAxis = React.forwardRef<any, { size?: number }>(({ size }, ref) => {
  const { radius } = useVenus();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} />;
});

VenusAxis.displayName = "Venus.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Venus = Object.assign(VenusRoot, {
  Root: VenusRoot,
  Canvas: VenusCanvas,
  Controls: VenusControls,
  Globe: VenusGlobe,
  Axis: VenusAxis,
});
