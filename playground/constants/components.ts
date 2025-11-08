/**
 * Component metadata for playground
 * Loaded from the single source of truth: packages/components/registry.json
 */

import registryData from "@plexusui/components/registry.json";
import { getAllComponentsFromRegistry } from "@plexusui/components/lib/registry-utils";

export type ComponentTier = "free" | "pro";

export interface Component {
  id: string;
  name: string;
  category: string;
  description?: string;
  textures: string[];
  tier?: ComponentTier;
}

/**
 * Transform registry components into playground format
 */
function transformToPlaygroundFormat(
  metadata: ReturnType<typeof getAllComponentsFromRegistry>
): Component[] {
  return metadata.map((component) => ({
    id: component.id,
    name: component.displayName || component.name,
    category:
      component.category.charAt(0).toUpperCase() + component.category.slice(1),
    description: component.description,
    textures: component.textures || [],
    tier: component.tier || "free",
  }));
}

export const components: Component[] = transformToPlaygroundFormat(
  getAllComponentsFromRegistry(registryData)
);
