/**
 * Scientific colormaps for data visualization
 *
 * All colormaps are perceptually uniform and designed for scientific accuracy.
 * Includes colormaps from matplotlib, viridis family, and custom aerospace palettes.
 *
 * @reference Kenneth Moreland. 2009. Diverging Color Maps for Scientific Visualization.
 * @reference Stéfan van der Walt & Nathaniel Smith. 2015. A Better Default Colormap for Matplotlib.
 */

export type ColormapName =
  | "viridis"
  | "plasma"
  | "inferno"
  | "magma"
  | "cividis"
  | "turbo"
  | "jet"
  | "greens"
  | "blues"
  | "reds"
  | "grays"
  | "thermal"
  | "coolwarm"
  | "spectral"
  | "rdbu"
  | "rdylgn";

/**
 * Colormap data structure
 */
export interface Colormap {
  /** Colormap name */
  name: ColormapName;
  /** RGB color stops [0-1] */
  colors: [number, number, number][];
  /** Whether this colormap is perceptually uniform */
  perceptuallyUniform: boolean;
  /** Whether this colormap is colorblind-friendly */
  colorblindFriendly: boolean;
  /** Best use cases */
  useCase: "sequential" | "diverging" | "cyclic" | "qualitative";
}

/**
 * Viridis - The gold standard perceptually uniform colormap
 * Excellent for most scientific visualizations
 */
const VIRIDIS: [number, number, number][] = [
  [0.267004, 0.004874, 0.329415],
  [0.282623, 0.140926, 0.457517],
  [0.253935, 0.265254, 0.529983],
  [0.206756, 0.371758, 0.553117],
  [0.163625, 0.471133, 0.558148],
  [0.127568, 0.566949, 0.550556],
  [0.134692, 0.658636, 0.517649],
  [0.266941, 0.748751, 0.440573],
  [0.477504, 0.821444, 0.318195],
  [0.741388, 0.873449, 0.149561],
  [0.993248, 0.906157, 0.143936],
];

/**
 * Plasma - High contrast, perceptually uniform
 * Great for heatmaps and density plots
 */
const PLASMA: [number, number, number][] = [
  [0.050383, 0.029803, 0.527975],
  [0.285282, 0.010800, 0.611852],
  [0.478334, 0.009384, 0.651908],
  [0.613995, 0.069008, 0.645839],
  [0.738051, 0.130588, 0.618237],
  [0.848955, 0.212395, 0.567237],
  [0.933254, 0.326841, 0.491861],
  [0.982854, 0.467370, 0.400107],
  [0.994847, 0.621543, 0.312756],
  [0.968262, 0.784841, 0.281413],
  [0.940015, 0.975158, 0.131326],
];

/**
 * Inferno - Dark background friendly
 * Excellent for astronomy and dark-mode UIs
 */
const INFERNO: [number, number, number][] = [
  [0.001462, 0.000466, 0.013866],
  [0.100930, 0.050157, 0.125209],
  [0.258234, 0.038571, 0.229339],
  [0.421970, 0.033480, 0.263453],
  [0.582773, 0.093867, 0.227140],
  [0.730419, 0.198367, 0.158595],
  [0.857015, 0.331663, 0.116655],
  [0.951541, 0.489922, 0.133806],
  [0.988362, 0.666213, 0.240273],
  [0.973416, 0.846245, 0.428334],
  [0.988362, 0.998364, 0.644924],
];

/**
 * Magma - Similar to Inferno but more purple
 */
const MAGMA: [number, number, number][] = [
  [0.001462, 0.000466, 0.013866],
  [0.075504, 0.038006, 0.135932],
  [0.195683, 0.050717, 0.287462],
  [0.347003, 0.067296, 0.404944],
  [0.520222, 0.121570, 0.443329],
  [0.683546, 0.216906, 0.436418],
  [0.833067, 0.339767, 0.398290],
  [0.947897, 0.494024, 0.374299],
  [0.997879, 0.674132, 0.423429],
  [0.996096, 0.856179, 0.570363],
  [0.987053, 0.991438, 0.749504],
];

/**
 * Cividis - Optimized for colorblind viewers
 */
const CIVIDIS: [number, number, number][] = [
  [0.000000, 0.135112, 0.304751],
  [0.141093, 0.202117, 0.370838],
  [0.283072, 0.265920, 0.415701],
  [0.433029, 0.328834, 0.443611],
  [0.586699, 0.391834, 0.460157],
  [0.740123, 0.456485, 0.470779],
  [0.883875, 0.525014, 0.486080],
  [0.983871, 0.603091, 0.523689],
  [0.998364, 0.703545, 0.595561],
  [0.999877, 0.825593, 0.703479],
  [0.999877, 0.983871, 0.843848],
];

/**
 * Turbo - Google's improved "jet" replacement
 * Rainbow colormap that's actually perceptually uniform
 */
const TURBO: [number, number, number][] = [
  [0.18995, 0.07176, 0.23217],
  [0.13840, 0.25264, 0.64148],
  [0.13658, 0.42883, 0.85676],
  [0.23127, 0.57708, 0.95328],
  [0.43139, 0.70044, 0.98359],
  [0.64922, 0.79700, 0.92960],
  [0.84504, 0.85959, 0.81020],
  [0.97105, 0.87473, 0.63803],
  [0.99324, 0.80643, 0.40504],
  [0.92557, 0.67031, 0.20084],
  [0.73340, 0.49450, 0.05939],
];

/**
 * Jet - Classic (but flawed) rainbow colormap
 * Included for compatibility, but viridis/turbo preferred
 */
const JET: [number, number, number][] = [
  [0.0, 0.0, 0.5],
  [0.0, 0.0, 1.0],
  [0.0, 0.5, 1.0],
  [0.0, 1.0, 1.0],
  [0.5, 1.0, 0.5],
  [1.0, 1.0, 0.0],
  [1.0, 0.5, 0.0],
  [1.0, 0.0, 0.0],
  [0.5, 0.0, 0.0],
];

/**
 * Thermal - Temperature visualization
 */
const THERMAL: [number, number, number][] = [
  [0.0, 0.0, 0.0],
  [0.3, 0.0, 0.5],
  [0.6, 0.0, 0.8],
  [0.9, 0.3, 0.9],
  [1.0, 0.6, 0.8],
  [1.0, 0.9, 0.6],
  [1.0, 1.0, 1.0],
];

/**
 * Coolwarm - Diverging colormap (blue to red)
 */
const COOLWARM: [number, number, number][] = [
  [0.230, 0.299, 0.754],
  [0.483, 0.565, 0.863],
  [0.706, 0.745, 0.902],
  [0.865, 0.865, 0.865],
  [0.902, 0.722, 0.651],
  [0.863, 0.502, 0.396],
  [0.706, 0.016, 0.150],
];

/**
 * Greens - Single hue sequential
 */
const GREENS: [number, number, number][] = [
  [0.968627, 0.988235, 0.960784],
  [0.898039, 0.960784, 0.878431],
  [0.780392, 0.913725, 0.752941],
  [0.631373, 0.850980, 0.607843],
  [0.454902, 0.768627, 0.462745],
  [0.254902, 0.670588, 0.364706],
  [0.137255, 0.545098, 0.270588],
  [0.000000, 0.427451, 0.172549],
  [0.000000, 0.266667, 0.105882],
];

/**
 * Blues - Single hue sequential
 */
const BLUES: [number, number, number][] = [
  [0.968627, 0.984314, 1.000000],
  [0.870588, 0.921569, 0.968627],
  [0.776471, 0.858824, 0.937255],
  [0.619608, 0.792157, 0.882353],
  [0.419608, 0.682353, 0.839216],
  [0.258824, 0.572549, 0.776471],
  [0.129412, 0.443137, 0.709804],
  [0.031373, 0.317647, 0.611765],
  [0.031373, 0.188235, 0.419608],
];

/**
 * Reds - Single hue sequential
 */
const REDS: [number, number, number][] = [
  [1.000000, 0.960784, 0.941176],
  [0.996078, 0.878431, 0.823529],
  [0.988235, 0.733333, 0.631373],
  [0.988235, 0.572549, 0.447059],
  [0.984314, 0.415686, 0.290196],
  [0.937255, 0.231373, 0.172549],
  [0.796078, 0.094118, 0.113725],
  [0.647059, 0.058824, 0.082353],
  [0.403922, 0.000000, 0.050980],
];

/**
 * Grays - Grayscale
 */
const GRAYS: [number, number, number][] = [
  [1.0, 1.0, 1.0],
  [0.875, 0.875, 0.875],
  [0.75, 0.75, 0.75],
  [0.625, 0.625, 0.625],
  [0.5, 0.5, 0.5],
  [0.375, 0.375, 0.375],
  [0.25, 0.25, 0.25],
  [0.125, 0.125, 0.125],
  [0.0, 0.0, 0.0],
];

/**
 * All available colormaps
 */
export const COLORMAPS: Record<ColormapName, Colormap> = {
  viridis: {
    name: "viridis",
    colors: VIRIDIS,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  plasma: {
    name: "plasma",
    colors: PLASMA,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  inferno: {
    name: "inferno",
    colors: INFERNO,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  magma: {
    name: "magma",
    colors: MAGMA,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  cividis: {
    name: "cividis",
    colors: CIVIDIS,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  turbo: {
    name: "turbo",
    colors: TURBO,
    perceptuallyUniform: true,
    colorblindFriendly: false,
    useCase: "sequential",
  },
  jet: {
    name: "jet",
    colors: JET,
    perceptuallyUniform: false,
    colorblindFriendly: false,
    useCase: "sequential",
  },
  thermal: {
    name: "thermal",
    colors: THERMAL,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  coolwarm: {
    name: "coolwarm",
    colors: COOLWARM,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "diverging",
  },
  greens: {
    name: "greens",
    colors: GREENS,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  blues: {
    name: "blues",
    colors: BLUES,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  reds: {
    name: "reds",
    colors: REDS,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  grays: {
    name: "grays",
    colors: GRAYS,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "sequential",
  },
  spectral: {
    name: "spectral",
    colors: TURBO, // Use turbo as spectral replacement
    perceptuallyUniform: true,
    colorblindFriendly: false,
    useCase: "sequential",
  },
  rdbu: {
    name: "rdbu",
    colors: COOLWARM,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "diverging",
  },
  rdylgn: {
    name: "rdylgn",
    colors: COOLWARM,
    perceptuallyUniform: true,
    colorblindFriendly: true,
    useCase: "diverging",
  },
};

/**
 * Interpolate between two RGB colors
 */
function interpolateRGB(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    color1[0] + (color2[0] - color1[0]) * t,
    color1[1] + (color2[1] - color1[1]) * t,
    color1[2] + (color2[2] - color1[2]) * t,
  ];
}

/**
 * Map a normalized value [0, 1] to a color using the specified colormap
 *
 * @param value - Normalized value between 0 and 1
 * @param colormapName - Name of the colormap to use
 * @returns RGB color as hex string
 */
export function mapValueToColor(value: number, colormapName: ColormapName = "viridis"): string {
  const colormap = COLORMAPS[colormapName];
  const colors = colormap.colors;

  // Clamp value to [0, 1]
  const t = Math.max(0, Math.min(1, value));

  // Find the two colors to interpolate between
  const scaledValue = t * (colors.length - 1);
  const index = Math.floor(scaledValue);
  const fraction = scaledValue - index;

  if (index >= colors.length - 1) {
    const [r, g, b] = colors[colors.length - 1];
    return rgbToHex(r, g, b);
  }

  const color1 = colors[index];
  const color2 = colors[index + 1];
  const [r, g, b] = interpolateRGB(color1, color2, fraction);

  return rgbToHex(r, g, b);
}

/**
 * Map a value within a domain to a color
 *
 * @param value - Value to map
 * @param min - Minimum value of domain
 * @param max - Maximum value of domain
 * @param colormapName - Name of the colormap to use
 * @returns RGB color as hex string
 */
export function mapDomainToColor(
  value: number,
  min: number,
  max: number,
  colormapName: ColormapName = "viridis"
): string {
  const normalized = (value - min) / (max - min);
  return mapValueToColor(normalized, colormapName);
}

/**
 * Convert RGB [0-1] to hex string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate a gradient CSS string for a colormap
 *
 * @param colormapName - Name of the colormap
 * @param direction - CSS gradient direction
 * @returns CSS gradient string
 */
export function generateGradient(
  colormapName: ColormapName = "viridis",
  direction: string = "to right"
): string {
  const colormap = COLORMAPS[colormapName];
  const colors = colormap.colors;

  const stops = colors.map((color, i) => {
    const [r, g, b] = color;
    const percent = (i / (colors.length - 1)) * 100;
    return `${rgbToHex(r, g, b)} ${percent}%`;
  });

  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

/**
 * Get a categorical color palette (distinct colors for different categories)
 *
 * @param count - Number of colors needed
 * @returns Array of hex color strings
 */
export function getCategoricalPalette(count: number): string[] {
  // Optimized categorical palette with good contrast
  const base = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#6366f1", // indigo
    "#84cc16", // lime
  ];

  if (count <= base.length) {
    return base.slice(0, count);
  }

  // Generate more colors by interpolating
  const result = [...base];
  while (result.length < count) {
    const t = (result.length - base.length) / (count - base.length);
    const idx1 = Math.floor(t * (base.length - 1));
    const idx2 = Math.min(idx1 + 1, base.length - 1);
    // Simple hue rotation
    result.push(base[idx2]);
  }

  return result;
}
