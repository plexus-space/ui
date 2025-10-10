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

export const MOON_RADIUS_KM = 1737.4;
export const SCENE_SCALE = 0.001;
export const MOON_RADIUS = MOON_RADIUS_KM * SCENE_SCALE;
export const MOON_ROTATION_PERIOD_SECONDS = 2360592.0; // 27.3 days (tidally locked)
export const MOON_ORBITAL_PERIOD_DAYS = 27.3;
export const MOON_AXIAL_TILT_DEG = 6.7;

// ============================================================================
// Context
// ============================================================================

interface MoonContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const MoonContext = React.createContext<MoonContext | null>(null);

function useMoon() {
  const ctx = React.useContext(MoonContext);
  if (!ctx) throw new Error("useMoon must be used within Moon.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface MoonRootProps {
  /** Texture URL for Moon surface map */
  textureUrl?: string;
  /** Moon radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface MoonCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Camera position [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Camera field of view */
  cameraFov?: number;
  /** Canvas height */
  height?: string;
  /** Canvas width */
  width?: string;
}

export interface MoonControlsProps extends React.ComponentPropsWithoutRef<any> {
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

export interface MoonGlobeProps extends React.ComponentPropsWithoutRef<any> {
  /** Number of segments for sphere geometry */
  segments?: number;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const MoonRoot = React.forwardRef<HTMLDivElement, MoonRootProps>(
  (
    {
      textureUrl,
      radius = MOON_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (MOON_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(MOON_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: MoonContext = React.useMemo(
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
      <MoonContext.Provider value={contextValue}>
        <div ref={ref} className="moon-root relative h-full w-full">
          {children}
        </div>
      </MoonContext.Provider>
    );
  }
);

MoonRoot.displayName = "Moon.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const MoonCanvas = React.forwardRef<HTMLDivElement, MoonCanvasProps>(
  (
    {
      cameraPosition = [0, 2, 8],
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
    const { brightness } = useMoon();

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

MoonCanvas.displayName = "Moon.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const MoonControls = React.forwardRef<any, MoonControlsProps>(
  (
    {
      minDistance = 3,
      maxDistance = 30,
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

MoonControls.displayName = "Moon.Controls";

/**
 * Globe component - renders the main Moon sphere
 */
const MoonGlobe = React.forwardRef<any, MoonGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useMoon();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#aaaaaa"}
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

MoonGlobe.displayName = "Moon.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
export interface MoonAxisProps extends React.ComponentPropsWithoutRef<any> {
  size?: number;
}

const MoonAxis = React.forwardRef<any, MoonAxisProps>(
  ({ size, ...props }, ref) => {
    const { radius } = useMoon();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

MoonAxis.displayName = "Moon.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Moon = Object.assign(MoonRoot, {
  Root: MoonRoot,
  Canvas: MoonCanvas,
  Controls: MoonControls,
  Globe: MoonGlobe,
  Axis: MoonAxis,
});
