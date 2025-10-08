import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs-extra";
import * as path from "path";
import https from "https";

const AVAILABLE_COMPONENTS = [
  "earth",
  "mars",
  "mercury",
  "venus",
  "moon",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "orbital-path",
  "line-chart",
];

const COMPONENT_REGISTRY: Record<
  string,
  { sourceUrl: string; filename: string; dependencies: string[]; primitives?: string[] }
> = {
  earth: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/earth.tsx",
    filename: "earth.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  mars: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/mars.tsx",
    filename: "mars.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  mercury: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/mercury.tsx",
    filename: "mercury.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  venus: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/venus.tsx",
    filename: "venus.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  moon: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/moon.tsx",
    filename: "moon.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  jupiter: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/jupiter.tsx",
    filename: "jupiter.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  saturn: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/saturn.tsx",
    filename: "saturn.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  uranus: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/uranus.tsx",
    filename: "uranus.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  neptune: {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/neptune.tsx",
    filename: "neptune.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
    primitives: ["sphere"],
  },
  "orbital-path": {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/orbital-path.tsx",
    filename: "orbital-path.tsx",
    dependencies: ["react", "@react-three/fiber", "@react-three/drei", "three"],
  },
  "line-chart": {
    sourceUrl:
      "https://raw.githubusercontent.com/plexus-space/ui/main/components/line-chart.tsx",
    filename: "line-chart.tsx",
    dependencies: ["react"],
  },
};

const PRIMITIVES_REGISTRY: Record<string, { sourceUrl: string; filename: string }> = {
  sphere: {
    sourceUrl: "https://raw.githubusercontent.com/plexus-space/ui/main/components/primitives/sphere.tsx",
    filename: "sphere.tsx",
  },
};

async function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

async function detectProjectStructure(): Promise<{
  componentsDir: string;
  srcDir: string;
}> {
  const cwd = process.cwd();

  // Check for app/components directory (Next.js app router)
  if (await fs.pathExists(path.join(cwd, "app"))) {
    return {
      componentsDir: path.join(cwd, "components", "plexusui"),
      srcDir: cwd,
    };
  }

  // Check for src/app directory (Next.js app router with src)
  if (await fs.pathExists(path.join(cwd, "src", "app"))) {
    return {
      componentsDir: path.join(cwd, "src", "components", "plexusui"),
      srcDir: path.join(cwd, "src"),
    };
  }

  // Check for src/components directory (Next.js/React app)
  if (await fs.pathExists(path.join(cwd, "src", "components"))) {
    return {
      componentsDir: path.join(cwd, "src", "components", "plexusui"),
      srcDir: path.join(cwd, "src"),
    };
  }

  // Check for components directory (some Next.js setups)
  if (await fs.pathExists(path.join(cwd, "components"))) {
    return {
      componentsDir: path.join(cwd, "components", "plexusui"),
      srcDir: cwd,
    };
  }

  // Default: create components directory (app router style)
  return {
    componentsDir: path.join(cwd, "components", "plexusui"),
    srcDir: cwd,
  };
}

export async function add(components: string[]) {
  // If no components specified, prompt
  if (components.length === 0) {
    const response = await prompts({
      type: "multiselect",
      name: "components",
      message: "Which components would you like to add?",
      choices: AVAILABLE_COMPONENTS.map((c) => ({
        title: c.charAt(0).toUpperCase() + c.slice(1).replace("-", " "),
        value: c,
      })),
      min: 1,
    });

    if (!response.components || response.components.length === 0) {
      console.log(chalk.yellow("\n❌ No components selected."));
      return;
    }

    components = response.components;
  }

  // Validate components
  const invalidComponents = components.filter(
    (c) => !AVAILABLE_COMPONENTS.includes(c.toLowerCase())
  );

  if (invalidComponents.length > 0) {
    console.log(
      chalk.red(`\n❌ Invalid components: ${invalidComponents.join(", ")}`)
    );
    console.log(chalk.dim(`Available: ${AVAILABLE_COMPONENTS.join(", ")}`));
    return;
  }

  const spinner = ora("Setting up components...").start();

  try {
    // Detect project structure
    const { componentsDir } = await detectProjectStructure();

    // Create components directory
    await fs.ensureDir(componentsDir);
    spinner.text = "Downloading components...";

    // Collect all primitives needed
    const primitivesNeeded = new Set<string>();
    components.forEach((c) => {
      const config = COMPONENT_REGISTRY[c];
      if (config?.primitives) {
        config.primitives.forEach((p) => primitivesNeeded.add(p));
      }
    });

    // Download primitives first
    if (primitivesNeeded.size > 0) {
      const primitivesDir = path.join(componentsDir, "primitives");
      await fs.ensureDir(primitivesDir);

      for (const primitive of primitivesNeeded) {
        const config = PRIMITIVES_REGISTRY[primitive];
        if (!config) continue;

        spinner.text = `Adding primitive: ${primitive}...`;

        try {
          const content = await downloadFile(config.sourceUrl);
          const destPath = path.join(primitivesDir, config.filename);
          await fs.writeFile(destPath, content);
        } catch (err) {
          spinner.fail(`Failed to download primitive: ${primitive}`);
          throw new Error(`Could not download ${primitive}: ${err}`);
        }
      }
    }

    // Download and save each component
    for (const component of components) {
      const config = COMPONENT_REGISTRY[component];
      if (!config) continue;

      spinner.text = `Adding ${component}...`;

      try {
        const content = await downloadFile(config.sourceUrl);
        const destPath = path.join(componentsDir, config.filename);
        await fs.writeFile(destPath, content);
      } catch (err) {
        spinner.fail(`Failed to download ${component}`);
        throw new Error(`Could not download ${component}: ${err}`);
      }
    }

    spinner.succeed(chalk.green("Components added!"));

    // Collect all unique dependencies
    const allDeps = new Set<string>();
    components.forEach((c) => {
      const config = COMPONENT_REGISTRY[c];
      if (config) {
        config.dependencies.forEach((dep) => allDeps.add(dep));
      }
    });

    // Show next steps
    console.log(chalk.dim("\n✨ Components copied to:"));
    console.log(chalk.cyan(`   ${componentsDir}\n`));

    if (allDeps.size > 0) {
      console.log(chalk.dim("📦 Install dependencies:"));
      console.log(
        chalk.cyan(`   npm install ${Array.from(allDeps).join(" ")}\n`)
      );
    }

    console.log(chalk.dim("🎨 Import and use:"));
    components.forEach((c) => {
      const fileName = COMPONENT_REGISTRY[c].filename
        .replace(".tsx", "")
        .replace(".ts", "");
      const componentName = c
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      console.log(
        chalk.cyan(
          `   import { ${componentName} } from '@/components/plexusui/${fileName}'`
        )
      );
    });
  } catch (error) {
    spinner.fail("Failed to add components");
    console.error(
      chalk.dim(error instanceof Error ? error.message : "Unknown error")
    );
    process.exit(1);
  }
}
