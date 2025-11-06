import registryData from "../../../components/registry.json" assert { type: "json" };
import * as path from "path";
import { fileURLToPath } from "url";
/**
 * Base URL for downloading components from GitHub
 * Can be overridden with PLEXUSUI_REGISTRY_URL environment variable
 */
export const BASE_URL = process.env.PLEXUSUI_REGISTRY_URL ||
    "https://raw.githubusercontent.com/plexus-space/ui/main/packages/components";
/**
 * Check if we're running in the monorepo (for local development)
 * If so, we can copy files directly from the file system
 */
export function isMonorepo() {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const componentsPath = path.resolve(__dirname, "../../../components");
        const fs = require("fs");
        return fs.existsSync(componentsPath);
    }
    catch {
        return false;
    }
}
/**
 * Get local components path (only valid in monorepo)
 */
export function getLocalComponentsPath() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.resolve(__dirname, "../../../components");
}
/**
 * Convert registry data to Registry type
 * Does NOT prepend URLs - that happens at download time
 */
function loadRegistry(data) {
    const registry = {};
    for (const [key, component] of Object.entries(data.components)) {
        registry[key] = component;
    }
    return registry;
}
/**
 * Get file URL for downloading (prepends BASE_URL)
 * Use this at download time, not at registry load time
 */
export function getFileUrl(filePath) {
    return `${BASE_URL}/${filePath}`;
}
/**
 * Get local file path (for monorepo development)
 */
export function getLocalFilePath(filePath) {
    return path.join(getLocalComponentsPath(), filePath);
}
// Load registry from the single source of truth (registry.json)
export const registry = loadRegistry(registryData);
export function getComponent(name) {
    return registry[name];
}
export function getAllComponents() {
    return Object.values(registry);
}
export function getComponentsByCategory(category) {
    return Object.values(registry).filter((c) => c.category === category);
}
