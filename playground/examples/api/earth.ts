import type { ApiProp } from "@/components/api-reference-table";

export const earthApiProps: ApiProp[] = [
  // ========== Earth.Root / Earth ==========
  {
    name: "radius",
    type: "number",
    default: "EARTH_RADIUS (6.371)",
    description: "[Root] Earth radius in scene units",
  },
  {
    name: "enableRotation",
    type: "boolean",
    default: "true",
    description: "[Root] Enable automatic rotation based on sidereal time",
  },
  {
    name: "timeScale",
    type: "number",
    default: "1",
    description: "[Root] Rotation speed multiplier (2 = 2x faster)",
  },
  {
    name: "brightness",
    type: "number",
    default: "1.0",
    description: "[Root] Overall scene brightness multiplier",
  },
  {
    name: "projection",
    type: "ProjectionType",
    default: '"globe"',
    description: '[Root] Map projection: "globe" | "equirectangular" | "mercator" | "miller"',
  },
  {
    name: "quality",
    type: "QualityLevel",
    default: '"high"',
    description: '[Root] Rendering quality: "low" | "medium" | "high" | "ultra"',
  },
  {
    name: "enableHelpers",
    type: "boolean",
    default: "false",
    description: "[Root] Enable development helpers (axis, grid, etc)",
  },

  // ========== Earth.Canvas ==========
  {
    name: "cameraPosition",
    type: "[number, number, number]",
    default: "[0, 5, 20]",
    description: "[Canvas] Camera position in 3D space [x, y, z]",
  },
  {
    name: "cameraFov",
    type: "number",
    default: "45",
    description: "[Canvas] Camera field of view in degrees",
  },
  {
    name: "enableShadows",
    type: "boolean",
    default: "true",
    description: "[Canvas] Enable shadow rendering",
  },
  {
    name: "height",
    type: "string | number",
    default: '"600px"',
    description: "[Canvas] Canvas height",
  },
  {
    name: "width",
    type: "string | number",
    default: '"100%"',
    description: "[Canvas] Canvas width",
  },
  {
    name: "dpr",
    type: "[number, number]",
    default: "[1, 2]",
    description: "[Canvas] Device pixel ratio range [min, max]",
  },

  // ========== Earth.Globe ==========
  {
    name: "textureUrl",
    type: "string",
    default: "-",
    description: "[Globe] Day surface texture (Earth's landmass and oceans)",
  },
  {
    name: "normalMapUrl",
    type: "string",
    default: "-",
    description: "[Globe] Normal map for surface detail and relief",
  },
  {
    name: "specularMapUrl",
    type: "string",
    default: "-",
    description: "[Globe] Specular/roughness map for ocean reflectivity",
  },
  {
    name: "segments",
    type: "number",
    default: "128",
    description: "[Globe] Sphere geometry segments (higher = smoother)",
  },
  {
    name: "metalness",
    type: "number",
    default: "0.4",
    description: "[Globe] Material metalness (PBR)",
  },
  {
    name: "roughness",
    type: "number",
    default: "0.7",
    description: "[Globe] Material roughness (PBR)",
  },

  // ========== Earth.Atmosphere ==========
  {
    name: "color",
    type: "string",
    default: '"#4488ff"',
    description: "[Atmosphere] Atmospheric glow color",
  },
  {
    name: "intensity",
    type: "number",
    default: "0.8",
    description: "[Atmosphere] Glow intensity multiplier",
  },
  {
    name: "falloff",
    type: "number",
    default: "3.5",
    description: "[Atmosphere] Falloff exponent (higher = sharper edge)",
  },
  {
    name: "scale",
    type: "number",
    default: "ATMOSPHERE_SCALE (1.0157)",
    description: "[Atmosphere] Scale relative to globe (100km Kármán line)",
  },

  // ========== Earth.Clouds ==========
  {
    name: "textureUrl (Clouds)",
    type: "string",
    default: "required",
    description: "[Clouds] Cloud layer transparency texture",
  },
  {
    name: "height",
    type: "number",
    default: "CLOUD_SCALE (1.00157)",
    description: "[Clouds] Cloud layer height scale (10km average altitude)",
  },
  {
    name: "opacity",
    type: "number",
    default: "0.5",
    description: "[Clouds] Cloud layer opacity (0-1)",
  },
  {
    name: "rotationSpeed",
    type: "number",
    default: "0.8",
    description: "[Clouds] Rotation speed multiplier relative to Earth",
  },

  // ========== Earth.Lighting ==========
  {
    name: "intensity",
    type: "number",
    default: "1.0",
    description: "[Lighting] Ambient light intensity",
  },
  {
    name: "color",
    type: "string",
    default: '"#ffffff"',
    description: "[Lighting] Ambient light color",
  },

  // ========== Earth.Graticule ==========
  {
    name: "showLatitudes",
    type: "boolean",
    default: "true",
    description: "[Graticule] Show latitude lines (horizontal circles)",
  },
  {
    name: "showLongitudes",
    type: "boolean",
    default: "true",
    description: "[Graticule] Show longitude lines (vertical circles)",
  },
  {
    name: "latitudeStep",
    type: "number",
    default: "15",
    description: "[Graticule] Latitude line spacing in degrees",
  },
  {
    name: "longitudeStep",
    type: "number",
    default: "15",
    description: "[Graticule] Longitude line spacing in degrees",
  },
  {
    name: "color",
    type: "string",
    default: '"#4488ff"',
    description: "[Graticule] Grid line color",
  },
  {
    name: "opacity",
    type: "number",
    default: "0.4",
    description: "[Graticule] Grid line opacity (0-1)",
  },
  {
    name: "highlightEquator",
    type: "boolean",
    default: "true",
    description: "[Graticule] Highlight equator in yellow",
  },
  {
    name: "highlightPrimeMeridian",
    type: "boolean",
    default: "true",
    description: "[Graticule] Highlight prime meridian (0° longitude) in red",
  },

  // ========== Earth.Controls ==========
  {
    name: "minDistance",
    type: "number",
    default: "8",
    description: "[Controls] Minimum zoom distance",
  },
  {
    name: "maxDistance",
    type: "number",
    default: "100",
    description: "[Controls] Maximum zoom distance",
  },
  {
    name: "enableRotate",
    type: "boolean",
    default: "true",
    description: "[Controls] Enable camera rotation",
  },
  {
    name: "enableZoom",
    type: "boolean",
    default: "true",
    description: "[Controls] Enable camera zoom",
  },
  {
    name: "enablePan",
    type: "boolean",
    default: "true",
    description: "[Controls] Enable camera panning",
  },
  {
    name: "enableDamping",
    type: "boolean",
    default: "true",
    description: "[Controls] Enable smooth camera damping",
  },

  // ========== Earth.FlatMap ==========
  {
    name: "textureUrl (FlatMap)",
    type: "string",
    default: "-",
    description: "[FlatMap] Flat projection map texture",
  },
  {
    name: "width",
    type: "number",
    default: "40",
    description: "[FlatMap] Map width in scene units",
  },
  {
    name: "height",
    type: "number",
    default: "20",
    description: "[FlatMap] Map height in scene units",
  },
  {
    name: "enableGrid",
    type: "boolean",
    default: "false",
    description: "[FlatMap] Enable latitude/longitude grid lines",
  },
  {
    name: "gridSpacing",
    type: "number",
    default: "15",
    description: "[FlatMap] Grid spacing in degrees",
  },
];
