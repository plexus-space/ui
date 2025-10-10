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

export const MARS_RADIUS_KM = 3389.5;
export const SCENE_SCALE = 0.001;
export const MARS_RADIUS = MARS_RADIUS_KM * SCENE_SCALE;
export const MARS_ROTATION_PERIOD_SECONDS = 88642.0; // 24.6 hours
export const MARS_ORBITAL_PERIOD_DAYS = 687;
export const MARS_AXIAL_TILT_DEG = 25.2;

// ============================================================================
// Context
// ============================================================================

interface MarsContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const MarsContext = React.createContext<MarsContext | null>(null);

function useMars() {
  const ctx = React.useContext(MarsContext);
  if (!ctx) throw new Error("useMars must be used within Mars.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface MarsRootProps {
  /** Texture URL for Mars surface map */
  textureUrl?: string;
  /** Mars radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface MarsCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Camera position [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Camera field of view */
  cameraFov?: number;
  /** Canvas height */
  height?: string;
  /** Canvas width */
  width?: string;
}

export interface MarsControlsProps {
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

export interface MarsGlobeProps {
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
const MarsRoot = React.forwardRef<HTMLDivElement, MarsRootProps>(
  (
    {
      textureUrl,
      radius = MARS_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (MARS_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(MARS_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: MarsContext = React.useMemo(
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
      <MarsContext.Provider value={contextValue}>
        <div ref={ref} className="mars-root relative h-full w-full">
          {children}
        </div>
      </MarsContext.Provider>
    );
  }
);

MarsRoot.displayName = "Mars.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const MarsCanvas = React.forwardRef<HTMLDivElement, MarsCanvasProps>(
  (
    {
      cameraPosition = [0, 5, 20],
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
    const { brightness } = useMars();

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

MarsCanvas.displayName = "Mars.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const MarsControls = React.forwardRef<any, MarsControlsProps>(
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

MarsControls.displayName = "Mars.Controls";

/**
 * Globe component - renders the main Mars sphere
 */
const MarsGlobe = React.forwardRef<any, MarsGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useMars();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#cd5c5c"}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        roughness={0.9}
        metalness={0.1}
        {...props}
      >
        {children}
      </Sphere>
    );
  }
);

MarsGlobe.displayName = "Mars.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const MarsAxis = React.forwardRef<any, { size?: number }>(({ size, ...props }, ref) => {
  const { radius } = useMars();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} {...props} />;
});

MarsAxis.displayName = "Mars.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Mars = Object.assign(MarsRoot, {
  Root: MarsRoot,
  Canvas: MarsCanvas,
  Controls: MarsControls,
  Globe: MarsGlobe,
  Axis: MarsAxis,
});
