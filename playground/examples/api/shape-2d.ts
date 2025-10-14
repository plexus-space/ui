import type { ApiProp } from "@/components/api-reference-table";

export const shape2DApiProps: ApiProp[] = [
  {
    name: "canvas",
    type: "HTMLCanvasElement",
    default: "required",
    description: "The canvas element to render to",
  },
  {
    name: "shapes",
    type: "ReadonlyArray<Shape>",
    default: "required",
    description: "Array of shapes to render (use helper functions like createCircle, createLine, etc.)",
  },
  {
    name: "width",
    type: "number",
    default: "required",
    description: "Canvas width in pixels",
  },
  {
    name: "height",
    type: "number",
    default: "required",
    description: "Canvas height in pixels",
  },
  {
    name: "pixelScale",
    type: "number",
    default: "1.0",
    description: "DPI scaling factor for high-resolution displays",
  },
  {
    name: "antialiasWidth",
    type: "number",
    default: "1.0",
    description: "Anti-aliasing edge width in pixels (controls smoothness of shape edges)",
  },
  {
    name: "onReady",
    type: "() => void",
    default: "-",
    description: "Callback when renderer is initialized and ready to render",
  },
  {
    name: "onError",
    type: "(error: Error) => void",
    default: "-",
    description: "Error callback for initialization or rendering errors",
  },
];
