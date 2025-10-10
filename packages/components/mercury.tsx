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

export const MERCURY_RADIUS_KM = 2439.7;
export const SCENE_SCALE = 0.001;
export const MERCURY_RADIUS = MERCURY_RADIUS_KM * SCENE_SCALE;
export const MERCURY_ROTATION_PERIOD_SECONDS = 5067360.0; // 58.6 days
export const MERCURY_ORBITAL_PERIOD_DAYS = 88;
export const MERCURY_AXIAL_TILT_DEG = 0.034; // Almost upright

// ============================================================================
// Context
// ============================================================================

interface MercuryContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const MercuryContext = React.createContext<MercuryContext | null>(null);

function useMercury() {
  const ctx = React.useContext(MercuryContext);
  if (!ctx) throw new Error("useMercury must be used within Mercury.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface MercuryRootProps {
  /** Texture URL for Mercury surface map */
  textureUrl?: string;
  /** Mercury radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface MercuryCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Camera position [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Camera field of view */
  cameraFov?: number;
  /** Canvas height */
  height?: string;
  /** Canvas width */
  width?: string;
}

export interface MercuryControlsProps extends Record<string, any> {
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

export interface MercuryGlobeProps extends Record<string, any> {
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
const MercuryRoot = React.forwardRef<HTMLDivElement, MercuryRootProps>(
  (
    {
      textureUrl,
      radius = MERCURY_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (MERCURY_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(MERCURY_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: MercuryContext = React.useMemo(
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
      <MercuryContext.Provider value={contextValue}>
        <div ref={ref} className="mercury-root relative h-full w-full">
          {children}
        </div>
      </MercuryContext.Provider>
    );
  }
);

MercuryRoot.displayName = "Mercury.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const MercuryCanvas = React.forwardRef<HTMLDivElement, MercuryCanvasProps>(
  (
    {
      cameraPosition = [0, 3, 10],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useMercury();

    return (
      <div ref={ref} className={className} style={style} {...props}>
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

MercuryCanvas.displayName = "Mercury.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const MercuryControls = React.forwardRef<any, MercuryControlsProps>(
  (
    {
      minDistance = 5,
      maxDistance = 50,
      zoomSpeed = 0.6,
      panSpeed = 0.5,
      rotateSpeed = 0.4,
      enablePan = true,
      enableZoom = true,
      enableRotate = true,
      enableDamping = true,
      dampingFactor = 0.05,
      ...props
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
        {...props}
      />
    );
  }
);

MercuryControls.displayName = "Mercury.Controls";

/**
 * Globe component - renders the main Mercury sphere
 */
const MercuryGlobe = React.forwardRef<any, MercuryGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useMercury();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#8c7853"}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        roughness={0.95}
        metalness={0.05}
        {...props}
      >
        {children}
      </Sphere>
    );
  }
);

MercuryGlobe.displayName = "Mercury.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const MercuryAxis = React.forwardRef<any, { size?: number } & Record<string, any>>(({ size, ...props }, ref) => {
  const { radius } = useMercury();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} {...props} />;
});

MercuryAxis.displayName = "Mercury.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Mercury = Object.assign(MercuryRoot, {
  Root: MercuryRoot,
  Canvas: MercuryCanvas,
  Controls: MercuryControls,
  Globe: MercuryGlobe,
  Axis: MercuryAxis,
});
