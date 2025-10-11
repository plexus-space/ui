import type { ApiProp } from "@/components/api-reference-table";

// For Mars, Mercury, Venus, Moon, Jupiter, Uranus, Neptune
export const planetApiProps: ApiProp[] = [
  {
    name: "textureUrl",
    type: "string",
    default: "-",
    description: "URL to surface texture map",
  },
  {
    name: "radius",
    type: "number",
    default: "{PLANET}_RADIUS",
    description: "Planet radius in scene units",
  },
  {
    name: "enableRotation",
    type: "boolean",
    default: "true",
    description: "Enable automatic rotation based on time",
  },
  {
    name: "timeScale",
    type: "number",
    default: "1",
    description: "Rotation speed multiplier (2 = 2x faster)",
  },
  {
    name: "brightness",
    type: "number",
    default: "1.2",
    description: "Overall scene brightness multiplier",
  },
];

// For Saturn (has rings)
export const saturnApiProps: ApiProp[] = [
  {
    name: "textureUrl",
    type: "string",
    default: "-",
    description: "URL to surface texture map",
  },
  {
    name: "ringsTextureUrl",
    type: "string",
    default: "-",
    description: "URL to Saturn rings texture map",
  },
  {
    name: "radius",
    type: "number",
    default: "SATURN_RADIUS",
    description: "Saturn radius in scene units (58.232)",
  },
  {
    name: "enableRotation",
    type: "boolean",
    default: "true",
    description: "Enable automatic rotation based on time",
  },
  {
    name: "timeScale",
    type: "number",
    default: "1",
    description: "Rotation speed multiplier (2 = 2x faster)",
  },
  {
    name: "brightness",
    type: "number",
    default: "1.2",
    description: "Overall scene brightness multiplier",
  },
  {
    name: "showRings",
    type: "boolean",
    default: "true",
    description: "Show Saturn's rings",
  },
];
