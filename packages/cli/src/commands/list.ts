import chalk from "chalk";
import * as fs from "fs-extra";
import * as path from "path";
import { getAllComponents, getComponentsByCategory } from "../registry/index.js";

interface PlexusConfig {
  resolvedPaths?: {
    plexusui: string;
  };
}

async function loadConfig(): Promise<PlexusConfig | null> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "plexusui.config.json");

  if (await fs.pathExists(configPath)) {
    try {
      return await fs.readJson(configPath);
    } catch {
      return null;
    }
  }
  return null;
}

async function detectProjectStructure(): Promise<string> {
  const cwd = process.cwd();

  // Try to load from config first
  const config = await loadConfig();
  if (config?.resolvedPaths?.plexusui) {
    return config.resolvedPaths.plexusui;
  }

  // Fallback to detection
  if (await fs.pathExists(path.join(cwd, "src", "app"))) {
    return path.join(cwd, "src", "components", "plexusui");
  }
  if (await fs.pathExists(path.join(cwd, "app"))) {
    return path.join(cwd, "components", "plexusui");
  }
  if (await fs.pathExists(path.join(cwd, "src", "components"))) {
    return path.join(cwd, "src", "components", "plexusui");
  }
  if (await fs.pathExists(path.join(cwd, "components"))) {
    return path.join(cwd, "components", "plexusui");
  }

  return path.join(cwd, "components", "plexusui");
}

async function isComponentInstalled(componentName: string, componentsDir: string, files: string[]): Promise<boolean> {
  if (files.length === 0) return false;

  // Check if the main file exists
  const mainFile = files[0];
  const filename = mainFile.split("/").pop()!;
  const dirname = path.dirname(mainFile);

  let filePath: string;
  if (dirname.includes("lib")) {
    filePath = path.join(componentsDir, "lib", filename);
  } else if (dirname.includes("primitives")) {
    if (dirname.includes("shaders")) {
      filePath = path.join(componentsDir, "primitives", "shaders", filename);
    } else {
      filePath = path.join(componentsDir, "primitives", filename);
    }
  } else if (dirname.includes("charts")) {
    filePath = path.join(componentsDir, "charts", filename);
  } else {
    filePath = path.join(componentsDir, filename);
  }

  return await fs.pathExists(filePath);
}

export async function list(options: { category?: string } = {}) {
  console.log(chalk.bold("\n📦 Available Plexus UI Components\n"));

  const componentsDir = await detectProjectStructure();

  if (options.category) {
    const components = getComponentsByCategory(options.category);

    if (components.length === 0) {
      console.log(chalk.yellow(`No components found in category: ${options.category}`));
      return;
    }

    console.log(chalk.bold(`Category: ${options.category}\n`));
    for (const component of components) {
      const installed = await isComponentInstalled(component.name, componentsDir, component.files);
      const status = installed ? chalk.green("✓") : chalk.dim("○");
      console.log(`${status} ${chalk.cyan(component.name)}`);
      if (component.description) {
        console.log(chalk.dim(`    ${component.description}`));
      }
      console.log();
    }
  } else {
    // Group by category - dynamically derived from registry
    const allComponents = getAllComponents();
    const categories = [...new Set(
      allComponents
        .map((c) => c.category)
        .filter((cat) => cat !== undefined)
    )].sort() as string[];

    for (const cat of categories) {
      const components = getComponentsByCategory(cat);
      if (components.length === 0) continue;

      console.log(chalk.bold(`${cat.toUpperCase()}`));
      for (const component of components) {
        const installed = await isComponentInstalled(component.name, componentsDir, component.files);
        const status = installed ? chalk.green("✓") : chalk.dim("○");
        console.log(`  ${status} ${chalk.cyan(component.name)}`);
        if (component.description) {
          console.log(chalk.dim(`      ${component.description}`));
        }
      }
      console.log();
    }
  }

  console.log(chalk.dim("Legend: ") + chalk.green("✓") + chalk.dim(" installed  ") + chalk.dim("○ not installed"));
  console.log(chalk.dim("\nTo add a component, run:"));
  console.log(chalk.cyan("  npx @plexusui/cli add <component-name>\n"));
}
