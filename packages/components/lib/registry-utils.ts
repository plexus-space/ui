/**
 * Shared registry utilities for transforming component metadata
 * Used by both CLI and playground to ensure consistency
 */

export interface ComponentMetadata {
  id: string;
  name: string;
  displayName?: string;
  category: string;
  description?: string;
  files: string[];
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  tier?: "free" | "pro";
  textures?: string[];
}

/**
 * Extract chart components from registry
 * Filters to only include components in the "charts" category
 */
export function getChartsFromRegistry(
  registry: any
): ComponentMetadata[] {
  return Object.entries(registry.components)
    .filter(([_, component]: [string, any]) => {
      return component.category === "charts";
    })
    .map(([id, component]: [string, any]) => ({
      id,
      name: component.name,
      displayName: component.displayName || component.name,
      category: component.category,
      description: component.description,
      files: component.files || [],
      dependencies: component.dependencies,
      devDependencies: component.devDependencies,
      registryDependencies: component.registryDependencies,
      tier: component.tier || "free",
      textures: component.textures || [],
    }));
}

/**
 * Get all components from registry regardless of category
 */
export function getAllComponentsFromRegistry(
  registry: any
): ComponentMetadata[] {
  return Object.entries(registry.components).map(
    ([id, component]: [string, any]) => ({
      id,
      name: component.name,
      displayName: component.displayName || component.name,
      category: component.category,
      description: component.description,
      files: component.files || [],
      dependencies: component.dependencies,
      devDependencies: component.devDependencies,
      registryDependencies: component.registryDependencies,
      tier: component.tier || "free",
      textures: component.textures || [],
    })
  );
}

/**
 * Convert component ID to example export name
 * Example: "waveform-monitor" -> "WaveformMonitorExamples"
 */
export function getExampleExportName(componentId: string): string {
  return (
    componentId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") + "Examples"
  );
}
