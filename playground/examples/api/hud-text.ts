/**
 * HUD Text API Reference
 */

export const hudTextApiProps = {
  component: "MsdfTextRenderer",
  description:
    "High-performance GPU-accelerated text rendering using Signed Distance Fields. Perfect for HUD interfaces and tactical displays.",
  props: [
    {
      name: "canvas",
      type: "HTMLCanvasElement",
      required: true,
      description: "Canvas element to render text to",
    },
    {
      name: "labels",
      type: "TextLabel[]",
      required: true,
      description: "Array of text labels to render",
    },
    {
      name: "fontFamily",
      type: "string",
      default: "'Courier New'",
      description: "Font family for text rendering (monospace recommended)",
    },
    {
      name: "fontSize",
      type: "number",
      default: "16",
      description: "Base font size in pixels",
    },
    {
      name: "width",
      type: "number",
      required: true,
      description: "Canvas width in pixels",
    },
    {
      name: "height",
      type: "number",
      required: true,
      description: "Canvas height in pixels",
    },
    {
      name: "sdfThreshold",
      type: "number",
      default: "0.5",
      description: "SDF distance threshold for edge detection",
    },
    {
      name: "sdfSmoothing",
      type: "number",
      default: "0.1",
      description: "Anti-aliasing smoothing factor",
    },
    {
      name: "outlineWidth",
      type: "number",
      default: "0.05",
      description: "Outline thickness for outline style",
    },
    {
      name: "glowRadius",
      type: "number",
      default: "0.15",
      description: "Glow effect radius for glow style",
    },
    {
      name: "onReady",
      type: "() => void",
      description: "Callback when renderer is initialized",
    },
    {
      name: "onError",
      type: "(error: Error) => void",
      description: "Callback when initialization fails",
    },
  ],
  types: [
    {
      name: "TextLabel",
      description: "Configuration for a single text label",
      properties: [
        {
          name: "text",
          type: "string",
          required: true,
          description: "Text content to render",
        },
        {
          name: "x",
          type: "number",
          required: true,
          description: "X position in screen coordinates",
        },
        {
          name: "y",
          type: "number",
          required: true,
          description: "Y position in screen coordinates",
        },
        {
          name: "style",
          type: "'normal' | 'outline' | 'glow'",
          default: "'normal'",
          description: "Text rendering style",
        },
        {
          name: "color",
          type: "[number, number, number, number]",
          default: "[1, 1, 1, 1]",
          description: "RGBA color (values 0-1)",
        },
        {
          name: "scale",
          type: "number",
          default: "1.0",
          description: "Scale factor for text size",
        },
        {
          name: "align",
          type: "'left' | 'center' | 'right'",
          default: "'left'",
          description: "Text alignment",
        },
      ],
    },
  ],
  features: [
    "✓ 1000+ text labels @ 60fps",
    "✓ Instanced rendering (single draw call)",
    "✓ Zero-copy buffer updates",
    "✓ Crisp text at any zoom level",
    "✓ Multiple text styles (normal, outline, glow)",
    "✓ Text alignment support",
    "✓ Real-time text updates",
    "✓ Automatic font atlas generation",
  ],
  performance: {
    maxLabels: "10,000+",
    frameRate: "60fps",
    renderMethod: "Instanced draw calls",
    gpuMemory: "~512KB (font atlas)",
  },
  browserSupport: {
    chrome: "113+",
    firefox: "115+",
    safari: "18+",
    edge: "113+",
  },
};
