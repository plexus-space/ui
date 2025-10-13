"use client";

import * as React from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sphere, Atmosphere, Clouds } from "./primitives/sphere";

// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================

export const EARTH_RADIUS_KM = 6371.0;
export const SCENE_SCALE = 0.001;
export const EARTH_RADIUS = EARTH_RADIUS_KM * SCENE_SCALE;
export const EARTH_ROTATION_PERIOD_SECONDS = 86164.0905; // Sidereal day
export const EARTH_ORBITAL_PERIOD_DAYS = 365.256363004; // Sidereal year
export const EARTH_AXIAL_TILT_DEG = 23.4392811;

// ============================================================================
// Utilities
// ============================================================================

export function getCurrentDayOfYear(): {
  dayOfYear: number;
  fractionOfDay: number;
} {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const fractionOfDay =
    (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
  return { dayOfYear, fractionOfDay };
}

export function calculateEarthRotation(timeScale: number = 1): number {
  const { fractionOfDay } = getCurrentDayOfYear();
  return fractionOfDay * 2 * Math.PI * timeScale;
}

/**
 * Convert geodetic coordinates (lat/lon) to 2D projection coordinates
 *
 * @param lat - Latitude in degrees (-90 to 90)
 * @param lon - Longitude in degrees (-180 to 180)
 * @param projection - Projection type
 * @param mapWidth - Width of the map in scene units
 * @param mapHeight - Height of the map in scene units
 * @returns [x, y] coordinates in scene space
 */
export function geodeticToProjection(
  lat: number,
  lon: number,
  projection: ProjectionType,
  mapWidth: number,
  mapHeight: number
): [number, number] {
  // Normalize lon to [-180, 180]
  let normalizedLon = lon;
  while (normalizedLon > 180) normalizedLon -= 360;
  while (normalizedLon < -180) normalizedLon += 360;

  let x: number, y: number;

  switch (projection) {
    case "equirectangular":
      // Simple linear projection (Plate Carrée)
      // x = λ, y = φ
      x = (normalizedLon / 360) * mapWidth;
      y = (lat / 180) * mapHeight;
      break;

    case "mercator":
      // Mercator projection (conformal, preserves angles)
      // x = λ
      // y = ln(tan(π/4 + φ/2))
      x = (normalizedLon / 360) * mapWidth;
      const latRad = (lat * Math.PI) / 180;
      // Clamp latitude to avoid infinity at poles
      const clampedLat = Math.max(-85, Math.min(85, lat));
      const clampedLatRad = (clampedLat * Math.PI) / 180;
      const mercatorY = Math.log(Math.tan(Math.PI / 4 + clampedLatRad / 2));
      // Normalize to map height (Mercator range is approximately -π to π)
      y = (mercatorY / Math.PI) * (mapHeight / 2);
      break;

    case "miller":
      // Miller Cylindrical projection (compromise between Mercator and equirectangular)
      // Similar to Mercator but with less polar distortion
      x = (normalizedLon / 360) * mapWidth;
      const latRadMiller = (lat * Math.PI) / 180;
      const clampedLatMiller = Math.max(-85, Math.min(85, lat));
      const clampedLatRadMiller = (clampedLatMiller * Math.PI) / 180;
      const millerY = (5 / 4) * Math.log(Math.tan(Math.PI / 4 + (2 * clampedLatRadMiller) / 5));
      y = (millerY / Math.PI) * (mapHeight / 2);
      break;

    case "globe":
    default:
      // Shouldn't be used for flat maps, but provide fallback
      x = (normalizedLon / 360) * mapWidth;
      y = (lat / 180) * mapHeight;
      break;
  }

  return [x, y];
}

// ============================================================================
// Context
// ============================================================================

export type ProjectionType = "globe" | "equirectangular" | "mercator" | "miller";

interface EarthContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  projection: ProjectionType;
  dayMapUrl?: string;
  nightMapUrl?: string;
  cloudsMapUrl?: string;
  normalMapUrl?: string;
  specularMapUrl?: string;
}

const EarthContext = React.createContext<EarthContext | null>(null);

function useEarth() {
  const ctx = React.useContext(EarthContext);
  if (!ctx) throw new Error("useEarth must be used within Earth.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Earth.Root component
 * Root component that provides context for all Earth sub-components
 */
export interface EarthRootProps {
  /**
   * Texture URL for day map (Earth's surface in daylight)
   * @example "/textures/earth-day.jpg"
   */
  dayMapUrl?: string;
  /**
   * Texture URL for night lights map (city lights visible on night side)
   * @example "/textures/earth-night.jpg"
   */
  nightMapUrl?: string;
  /**
   * Texture URL for clouds map (cloud layer texture)
   * @example "/textures/earth-clouds.jpg"
   */
  cloudsMapUrl?: string;
  /**
   * Texture URL for normal map (surface detail and elevation)
   * @example "/textures/earth-normal.jpg"
   */
  normalMapUrl?: string;
  /**
   * Texture URL for specular map (controls reflectivity of oceans)
   * @example "/textures/earth-specular.jpg"
   */
  specularMapUrl?: string;
  /**
   * Earth radius in scene units
   * @default EARTH_RADIUS (6.371 scene units, representing 6371 km)
   * @example 5, 10, 15
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Earth's actual rotation period
   * @default true
   */
  enableRotation?: boolean;
  /**
   * Time scale multiplier for rotation speed
   * 1 = real-time, 10 = 10x faster, 0.1 = 10x slower
   * @default 1
   * @range 0.1-1000
   * @example 1 (real-time), 10 (10x faster), 0.1 (10x slower)
   */
  timeScale?: number;
  /**
   * Overall brightness multiplier for lighting and emissive maps
   * @default 1.0
   * @range 0.0-2.0
   * @example 0.8 (dimmer), 1.2 (brighter)
   */
  brightness?: number;
  /**
   * Map projection type for visualization
   * - "globe": 3D spherical Earth (default)
   * - "equirectangular": Flat 2D map with simple lat/lon projection
   * - "mercator": Flat 2D map preserving angles (good for navigation)
   * - "miller": Flat 2D map with reduced polar distortion
   * @default "globe"
   * @example "equirectangular", "mercator"
   */
  projection?: ProjectionType;
  /**
   * Child components (Canvas, Globe, Atmosphere, etc.)
   */
  children?: React.ReactNode;
}

/**
 * Props for Earth.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface EarthCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 5, 20]
   * @example [0, 10, 30], [10, 5, 15]
   */
  cameraPosition?: [number, number, number];
  /**
   * Camera field of view in degrees
   * @default 45
   * @range 20-120
   * @example 35 (narrow), 60 (wide)
   */
  cameraFov?: number;
  /**
   * Canvas height (CSS value)
   * @default "600px"
   * @example "400px", "100vh", "50%"
   */
  height?: string;
  /**
   * Canvas width (CSS value)
   * @default "100%"
   * @example "800px", "100vw", "50%"
   */
  width?: string;
}

/**
 * Props for Earth.Controls component
 * Orbit controls for camera manipulation
 */
export interface EarthControlsProps
  extends React.ComponentPropsWithRef<typeof OrbitControls> {
  /**
   * Minimum zoom distance from Earth center
   * @default 8
   * @example 5, 10, 15
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Earth center
   * @default 100
   * @example 50, 200, 500
   */
  maxDistance?: number;
  /**
   * Zoom speed multiplier
   * @default 0.6
   * @range 0.1-2.0
   */
  zoomSpeed?: number;
  /**
   * Pan speed multiplier
   * @default 0.5
   * @range 0.1-2.0
   */
  panSpeed?: number;
  /**
   * Rotation speed multiplier
   * @default 0.4
   * @range 0.1-2.0
   */
  rotateSpeed?: number;
  /**
   * Enable panning with right mouse button
   * @default true
   */
  enablePan?: boolean;
  /**
   * Enable zooming with mouse wheel
   * @default true
   */
  enableZoom?: boolean;
  /**
   * Enable rotation with left mouse button
   * @default true
   */
  enableRotate?: boolean;
  /**
   * Enable smooth camera damping
   * @default true
   */
  enableDamping?: boolean;
  /**
   * Damping inertia factor (lower = more damping)
   * @default 0.05
   * @range 0.01-0.3
   */
  dampingFactor?: number;
}

/**
 * Props for Earth.Globe component
 * Main Earth sphere with textures
 */
export interface EarthGlobeProps
  extends Omit<React.ComponentPropsWithRef<typeof Sphere>, 'radius' | 'textureUrl' | 'normalMapUrl' | 'specularMapUrl' | 'emissiveMapUrl' | 'rotationSpeed' | 'rotation'> {
  /**
   * Number of segments for sphere geometry (higher = smoother)
   * @default 128
   * @range 32-256
   * @example 64 (lower detail), 256 (highest detail)
   */
  segments?: number;
}

/**
 * Props for Earth.Atmosphere component
 * Atmospheric glow effect around Earth
 */
export interface EarthAtmosphereProps
  extends React.ComponentPropsWithRef<typeof Atmosphere> {
  /**
   * Atmosphere color (any CSS color format)
   * @default "#4488ff"
   * @example "#88ccff", "rgb(68, 136, 255)", "hsl(210, 100%, 64%)"
   */
  color?: string;
  /**
   * Atmosphere glow intensity
   * @default 0.8
   * @range 0.0-2.0
   * @example 0.5 (subtle), 1.5 (intense)
   */
  intensity?: number;
  /**
   * Atmosphere falloff exponent (higher = sharper edge)
   * @default 3.5
   * @range 1.0-6.0
   * @example 2.0 (soft edge), 5.0 (sharp edge)
   */
  falloff?: number;
  /**
   * Atmosphere size scale relative to globe
   * @default 1.02
   * @range 1.01-1.1
   * @example 1.01 (thin), 1.05 (thick)
   */
  scale?: number;
}

/**
 * Props for Earth.Clouds component
 * Cloud layer with independent rotation
 */
export interface EarthCloudsProps
  extends React.ComponentPropsWithRef<typeof Clouds> {
  /**
   * Cloud layer height relative to Earth surface
   * @default 1.005
   * @range 1.001-1.02
   * @example 1.003, 1.01
   */
  height?: number;
  /**
   * Cloud layer opacity
   * @default 0.5
   * @range 0.0-1.0
   * @example 0.3 (transparent), 0.7 (opaque)
   */
  opacity?: number;
  /**
   * Cloud rotation speed relative to Earth rotation
   * @default 0.8
   * @range 0.0-2.0
   * @example 0.5 (slower), 1.5 (faster)
   */
  rotationSpeedMultiplier?: number;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const EarthRoot = React.forwardRef<HTMLDivElement, EarthRootProps>(
  (
    {
      dayMapUrl,
      nightMapUrl,
      cloudsMapUrl,
      normalMapUrl,
      specularMapUrl,
      radius = EARTH_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.0,
      projection = "globe",
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (EARTH_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(EARTH_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: EarthContext = React.useMemo(
      () => ({
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        projection,
        dayMapUrl,
        nightMapUrl,
        cloudsMapUrl,
        normalMapUrl,
        specularMapUrl,
      }),
      [
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        projection,
        dayMapUrl,
        nightMapUrl,
        cloudsMapUrl,
        normalMapUrl,
        specularMapUrl,
      ]
    );

    return (
      <EarthContext.Provider value={contextValue}>
        <div ref={ref} className="earth-root relative h-full w-full">
          {children}
        </div>
      </EarthContext.Provider>
    );
  }
);

EarthRoot.displayName = "Earth.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const EarthCanvas = React.forwardRef<HTMLDivElement, EarthCanvasProps>(
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
    const { brightness } = useEarth();

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
            toneMappingExposure: 2.0,
          }}
        >
          <color attach="background" args={[0, 0, 0]} />

          <Suspense fallback={null}>
            <ambientLight intensity={1.2 * brightness} color={0xffffff} />
            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

EarthCanvas.displayName = "Earth.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const EarthControls = React.forwardRef<any, EarthControlsProps>(
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

EarthControls.displayName = "Earth.Controls";

/**
 * Globe component - renders the main Earth sphere
 */
const EarthGlobe = React.forwardRef<any, EarthGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const {
      radius,
      rotationSpeed,
      axialTilt,
      dayMapUrl,
      nightMapUrl,
      normalMapUrl,
      specularMapUrl,
    } = useEarth();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={dayMapUrl}
        normalMapUrl={normalMapUrl}
        specularMapUrl={specularMapUrl}
        emissiveMapUrl={nightMapUrl}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        {...props}
      >
        {children}
      </Sphere>
    );
  }
);

EarthGlobe.displayName = "Earth.Globe";

/**
 * Atmosphere component - renders the atmospheric glow
 */
const EarthAtmosphere = React.forwardRef<any, EarthAtmosphereProps>(
  (
    {
      color = "#4488ff",
      intensity = 0.8,
      falloff = 3.5,
      scale = 1.02,
      ...props
    },
    ref
  ) => {
    return (
      <Atmosphere
        color={color}
        intensity={intensity}
        falloff={falloff}
        scale={scale}
        {...props}
      />
    );
  }
);

EarthAtmosphere.displayName = "Earth.Atmosphere";

/**
 * Clouds component - renders the cloud layer
 */
const EarthClouds = React.forwardRef<any, EarthCloudsProps>(
  (
    { height = 1.005, opacity = 0.5, rotationSpeedMultiplier = 0.8, ...props },
    ref
  ) => {
    const { cloudsMapUrl, rotationSpeed } = useEarth();

    if (!cloudsMapUrl) return null;

    return (
      <Clouds
        textureUrl={cloudsMapUrl}
        height={height}
        opacity={opacity}
        rotationSpeed={rotationSpeed * rotationSpeedMultiplier}
        {...props}
      />
    );
  }
);

EarthClouds.displayName = "Earth.Clouds";

/**
 * Props for Earth.Axis component
 * Debug helper that displays XYZ coordinate axes
 */
export interface EarthAxisProps
  extends React.ComponentPropsWithRef<"axesHelper"> {
  /**
   * Axis line length in scene units
   * @default radius * 3
   * @example 10, 20, 50
   */
  size?: number;
}

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const EarthAxis = React.forwardRef<any, EarthAxisProps>(
  ({ size, ...props }, ref) => {
    const { radius } = useEarth();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

EarthAxis.displayName = "Earth.Axis";

/**
 * Props for Earth.FlatMap component
 * 2D flat map projection for mission planning and ground track visualization
 */
export interface EarthFlatMapProps {
  /**
   * Map width in scene units
   * @default 40
   * @example 30, 50, 60
   */
  width?: number;
  /**
   * Map height in scene units
   * @default 20
   * @example 15, 25, 30
   */
  height?: number;
  /**
   * Show latitude/longitude grid lines
   * @default false
   */
  showGrid?: boolean;
  /**
   * Grid line color
   * @default "#ffffff"
   */
  gridColor?: string;
  /**
   * Grid line opacity
   * @default 0.2
   * @range 0.0-1.0
   */
  gridOpacity?: number;
  /**
   * Grid spacing in degrees
   * @default 15
   * @example 10, 30, 45
   */
  gridSpacing?: number;
}

/**
 * FlatMap component - renders Earth as a 2D projected map
 * Perfect for mission planning, ground track visualization, and coverage analysis
 */
const EarthFlatMap = React.forwardRef<THREE.Group, EarthFlatMapProps>(
  (
    {
      width = 40,
      height = 20,
      showGrid = false,
      gridColor = "#ffffff",
      gridOpacity = 0.2,
      gridSpacing = 15,
    },
    ref
  ) => {
    const { dayMapUrl, projection } = useEarth();
    const textureLoader = React.useMemo(() => new THREE.TextureLoader(), []);
    const [texture, setTexture] = React.useState<THREE.Texture | null>(null);

    // Load texture
    React.useEffect(() => {
      if (!dayMapUrl) return;

      textureLoader.load(dayMapUrl, (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
      });
    }, [dayMapUrl, textureLoader]);

    // Create grid lines
    const gridLines = React.useMemo(() => {
      if (!showGrid) return null;

      const lines: THREE.BufferGeometry[] = [];

      // Latitude lines (horizontal)
      for (let lat = -90; lat <= 90; lat += gridSpacing) {
        const points: THREE.Vector3[] = [];
        for (let lon = -180; lon <= 180; lon += 1) {
          const [x, y] = geodeticToProjection(lat, lon, projection, width, height);
          points.push(new THREE.Vector3(x, y, 0.01)); // Slightly above map
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        lines.push(geometry);
      }

      // Longitude lines (vertical)
      for (let lon = -180; lon <= 180; lon += gridSpacing) {
        const points: THREE.Vector3[] = [];
        for (let lat = -90; lat <= 90; lat += 1) {
          const [x, y] = geodeticToProjection(lat, lon, projection, width, height);
          points.push(new THREE.Vector3(x, y, 0.01));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        lines.push(geometry);
      }

      return lines;
    }, [showGrid, gridSpacing, projection, width, height]);

    return (
      <group ref={ref}>
        {/* Map plane */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={texture}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Grid lines */}
        {showGrid && gridLines && gridLines.map((geometry, i) => (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={gridColor}
              opacity={gridOpacity}
              transparent
            />
          </line>
        ))}

        {/* Border frame */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(width, height)]} />
          <lineBasicMaterial color={gridColor} opacity={gridOpacity * 2} transparent />
        </lineSegments>
      </group>
    );
  }
);

EarthFlatMap.displayName = "Earth.FlatMap";

// ============================================================================
// Exports
// ============================================================================

export const Earth = Object.assign(EarthRoot, {
  Root: EarthRoot,
  Canvas: EarthCanvas,
  Controls: EarthControls,
  Globe: EarthGlobe,
  FlatMap: EarthFlatMap,
  Atmosphere: EarthAtmosphere,
  Clouds: EarthClouds,
  Axis: EarthAxis,
});
