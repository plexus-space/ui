import type { ApiProp } from "@/components/api-reference-table";

export const earthApiProps: ApiProp[] = [
  {
    name: "dayMapUrl",
    type: "string",
    default: "-",
    description: "URL to day surface texture map",
  },
  {
    name: "nightMapUrl",
    type: "string",
    default: "-",
    description: "URL to night lights emissive texture map",
  },
  {
    name: "cloudsMapUrl",
    type: "string",
    default: "-",
    description: "URL to cloud layer texture map",
  },
  {
    name: "normalMapUrl",
    type: "string",
    default: "-",
    description: "URL to normal/bump map for surface detail",
  },
  {
    name: "specularMapUrl",
    type: "string",
    default: "-",
    description: "URL to specular map for ocean reflectivity",
  },
  {
    name: "radius",
    type: "number",
    default: "EARTH_RADIUS",
    description: "Earth radius in scene units (default: 6.371)",
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
    default: "1.0",
    description: "Overall scene brightness multiplier",
  },
];
