/**
 * Plexus UI Theme System
 *
 * Shared theme configuration for consistent styling across all components.
 * Follows the shadcn pattern with CSS variables and design tokens.
 *
 * @example
 * ```tsx
 * import { theme, applyTheme } from './lib/theme';
 *
 * // Use theme values
 * const color = theme.colors.primary;
 *
 * // Apply theme to component
 * <div style={{ color: `var(--plexus-primary)` }} />
 * ```
 */

// ============================================================================
// Color System
// ============================================================================

export interface ColorPalette {
  /** Primary brand color */
  primary: string;
  /** Secondary brand color */
  secondary: string;
  /** Accent color */
  accent: string;
  /** Background color */
  background: string;
  /** Foreground/text color */
  foreground: string;
  /** Muted color for subtle elements */
  muted: string;
  /** Muted foreground */
  mutedForeground: string;
  /** Border color */
  border: string;
  /** Input border color */
  input: string;
  /** Ring/focus color */
  ring: string;
  /** Destructive/error color */
  destructive: string;
  /** Success color */
  success: string;
  /** Warning color */
  warning: string;
  /** Info color */
  info: string;
}

export interface ThemeColors {
  light: ColorPalette;
  dark: ColorPalette;
}

/**
 * Default color palettes
 */
export const colors: ThemeColors = {
  light: {
    primary: "hsl(222.2, 47.4%, 11.2%)",
    secondary: "hsl(210, 40%, 96.1%)",
    accent: "hsl(210, 40%, 96.1%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(222.2, 47.4%, 11.2%)",
    muted: "hsl(210, 40%, 96.1%)",
    mutedForeground: "hsl(215.4, 16.3%, 46.9%)",
    border: "hsl(214.3, 31.8%, 91.4%)",
    input: "hsl(214.3, 31.8%, 91.4%)",
    ring: "hsl(222.2, 84%, 4.9%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    success: "hsl(142, 71%, 45%)",
    warning: "hsl(38, 92%, 50%)",
    info: "hsl(199, 89%, 48%)",
  },
  dark: {
    primary: "hsl(210, 40%, 98%)",
    secondary: "hsl(217.2, 32.6%, 17.5%)",
    accent: "hsl(217.2, 32.6%, 17.5%)",
    background: "hsl(222.2, 84%, 4.9%)",
    foreground: "hsl(210, 40%, 98%)",
    muted: "hsl(217.2, 32.6%, 17.5%)",
    mutedForeground: "hsl(215, 20.2%, 65.1%)",
    border: "hsl(217.2, 32.6%, 17.5%)",
    input: "hsl(217.2, 32.6%, 17.5%)",
    ring: "hsl(212.7, 26.8%, 83.9%)",
    destructive: "hsl(0, 62.8%, 30.6%)",
    success: "hsl(142, 76%, 36%)",
    warning: "hsl(38, 92%, 40%)",
    info: "hsl(199, 89%, 38%)",
  },
};

// ============================================================================
// Scientific Color Schemes (for data visualization)
// ============================================================================

export interface ScientificColorScheme {
  name: string;
  description: string;
  colors: string[];
}

export const scientificColorSchemes: Record<string, ScientificColorScheme> = {
  viridis: {
    name: "Viridis",
    description: "Perceptually uniform, colorblind-friendly",
    colors: [
      "#440154",
      "#482777",
      "#3e4989",
      "#31688e",
      "#26828e",
      "#1f9e89",
      "#35b779",
      "#6ece58",
      "#b5de2b",
      "#fde724",
    ],
  },
  plasma: {
    name: "Plasma",
    description: "High contrast, warm colors",
    colors: [
      "#0d0887",
      "#46039f",
      "#7201a8",
      "#9c179e",
      "#bd3786",
      "#d8576b",
      "#ed7953",
      "#fb9f3a",
      "#fdca26",
      "#f0f921",
    ],
  },
  inferno: {
    name: "Inferno",
    description: "Fire-like, dark to bright",
    colors: [
      "#000004",
      "#1b0c41",
      "#4a0c6b",
      "#781c6d",
      "#a52c60",
      "#cd4447",
      "#ed6925",
      "#fb9b06",
      "#f7d13d",
      "#fcffa4",
    ],
  },
  magma: {
    name: "Magma",
    description: "Volcanic, purple to white",
    colors: [
      "#000004",
      "#180f3d",
      "#440f76",
      "#721f81",
      "#9e2f7f",
      "#cd4071",
      "#f1605d",
      "#fd9668",
      "#feca8d",
      "#fcfdbf",
    ],
  },
  coolwarm: {
    name: "Cool-Warm",
    description: "Diverging blue-red",
    colors: [
      "#3b4cc0",
      "#6788ee",
      "#9abbff",
      "#c9d7f0",
      "#edd1c2",
      "#f7a889",
      "#e36a4a",
      "#b40426",
    ],
  },
};

// ============================================================================
// Typography
// ============================================================================

export interface Typography {
  /** Font family for body text */
  fontFamily: string;
  /** Font family for monospace/code */
  fontFamilyMono: string;
  /** Font sizes */
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };
  /** Font weights */
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  /** Line heights */
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export const typography: Typography = {
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMono: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, monospace',
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================================================
// Spacing
// ============================================================================

export interface Spacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
}

export const spacing: Spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
};

// ============================================================================
// Border Radius
// ============================================================================

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  full: string;
}

export const borderRadius: BorderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  full: "9999px",
};

// ============================================================================
// Shadows
// ============================================================================

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  inner: string;
  none: string;
}

export const shadows: Shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
};

// ============================================================================
// Animation
// ============================================================================

export interface AnimationTimings {
  fast: string;
  base: string;
  slow: string;
  slower: string;
}

export const animationTimings: AnimationTimings = {
  fast: "150ms",
  base: "250ms",
  slow: "350ms",
  slower: "500ms",
};

// ============================================================================
// Complete Theme
// ============================================================================

export interface Theme {
  colors: ThemeColors;
  scientificColors: typeof scientificColorSchemes;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  animation: AnimationTimings;
}

export const theme: Theme = {
  colors,
  scientificColors: scientificColorSchemes,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation: animationTimings,
};

// ============================================================================
// Theme Application
// ============================================================================

/**
 * Apply theme CSS variables to document root
 */
export function applyTheme(mode: "light" | "dark" = "light") {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const palette = colors[mode];

  // Apply color variables
  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--plexus-${key}`, value);
  });

  // Apply other variables
  root.style.setProperty("--plexus-font-family", typography.fontFamily);
  root.style.setProperty("--plexus-font-family-mono", typography.fontFamilyMono);

  // Set data attribute for CSS targeting
  root.setAttribute("data-theme", mode);
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  if (typeof document === "undefined") return;

  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}

/**
 * Get current theme mode
 */
export function getCurrentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
}

/**
 * Detect system preference
 */
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Apply system theme and listen for changes
 */
export function applySystemTheme() {
  if (typeof window === "undefined") return;

  const applySystem = () => applyTheme(getSystemTheme());
  applySystem();

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", applySystem);

  return () => mediaQuery.removeEventListener("change", applySystem);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get color from scientific color scheme
 */
export function getScientificColor(
  scheme: keyof typeof scientificColorSchemes,
  value: number // 0-1
): string {
  const colors = scientificColorSchemes[scheme].colors;
  const index = Math.floor(value * (colors.length - 1));
  return colors[Math.max(0, Math.min(colors.length - 1, index))];
}

/**
 * Generate gradient CSS from scientific color scheme
 */
export function getScientificGradient(
  scheme: keyof typeof scientificColorSchemes,
  direction: "to right" | "to bottom" | "to top" | "to left" = "to right"
): string {
  const colors = scientificColorSchemes[scheme].colors;
  return `linear-gradient(${direction}, ${colors.join(", ")})`;
}

/**
 * Convert HSL string to RGB
 */
export function hslToRgb(hsl: string): [number, number, number] {
  const match = hsl.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
  if (!match) return [0, 0, 0];

  let [, h, s, l] = match.map(Number);
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastingColor(backgroundColor: string): string {
  const [r, g, b] = hslToRgb(backgroundColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
