import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs-extra";
import * as path from "path";
import https from "https";
import { registry, getComponent } from "../registry/index.js";
async function downloadFile(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                // Follow redirect
                https.get(res.headers.location, (res2) => {
                    if (res2.statusCode !== 200) {
                        reject(new Error(`Failed to download: ${res2.statusCode} ${res2.statusMessage}`));
                        return;
                    }
                    let data = "";
                    res2.on("data", (chunk) => (data += chunk));
                    res2.on("end", () => resolve(data));
                    res2.on("error", reject);
                });
            }
            else if (res.statusCode !== 200) {
                reject(new Error(`Failed to download: ${res.statusCode} ${res.statusMessage}`));
                return;
            }
            else {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => resolve(data));
                res.on("error", reject);
            }
        })
            .on("error", reject);
    });
}
async function detectProjectStructure() {
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
export async function add(components) {
    const availableComponents = Object.keys(registry);
    // If no components specified, prompt
    if (components.length === 0) {
        const response = await prompts({
            type: "multiselect",
            name: "components",
            message: "Which components would you like to add?",
            choices: availableComponents.map((c) => {
                const config = getComponent(c);
                return {
                    title: `${c} ${config?.description ? `- ${config.description}` : ""}`,
                    value: c,
                    description: config?.category,
                };
            }),
            min: 1,
        });
        if (!response.components || response.components.length === 0) {
            console.log(chalk.yellow("\n❌ No components selected."));
            return;
        }
        components = response.components;
    }
    // Validate components
    const invalidComponents = components.filter((c) => !availableComponents.includes(c.toLowerCase()));
    if (invalidComponents.length > 0) {
        console.log(chalk.red(`\n❌ Invalid components: ${invalidComponents.join(", ")}`));
        console.log(chalk.dim(`Available: ${availableComponents.join(", ")}`));
        return;
    }
    const spinner = ora("Setting up components...").start();
    try {
        // Detect project structure
        const { componentsDir } = await detectProjectStructure();
        // Create components directory
        await fs.ensureDir(componentsDir);
        spinner.text = "Resolving dependencies...";
        // Collect all components including registry dependencies
        const allComponentsToInstall = new Set(components);
        const processedComponents = new Set();
        function collectDependencies(componentName) {
            if (processedComponents.has(componentName))
                return;
            processedComponents.add(componentName);
            const config = getComponent(componentName);
            if (!config)
                return;
            // Add registry dependencies (other plexus components this depends on)
            if (config.registryDependencies) {
                config.registryDependencies.forEach((dep) => {
                    allComponentsToInstall.add(dep);
                    collectDependencies(dep);
                });
            }
        }
        components.forEach(collectDependencies);
        spinner.text = "Downloading components...";
        // Download and save each component
        const installedComponents = [];
        for (const component of allComponentsToInstall) {
            const config = getComponent(component);
            if (!config)
                continue;
            spinner.text = `Adding ${component}...`;
            try {
                // Download all files for this component
                for (const fileUrl of config.files) {
                    const content = await downloadFile(fileUrl);
                    // Extract filename from URL
                    const filename = fileUrl.split("/").pop();
                    // Determine destination path
                    let destPath;
                    if (fileUrl.includes("/primitives/")) {
                        // Primitive component - put in primitives folder
                        const primitivesDir = path.join(componentsDir, "primitives");
                        await fs.ensureDir(primitivesDir);
                        destPath = path.join(primitivesDir, filename);
                    }
                    else {
                        // Regular component
                        destPath = path.join(componentsDir, filename);
                    }
                    await fs.outputFile(destPath, content);
                }
                installedComponents.push(component);
            }
            catch (err) {
                spinner.warn(`Failed to download ${component}`);
                console.error(chalk.dim(`  Error: ${err instanceof Error ? err.message : "Unknown error"}`));
            }
        }
        spinner.succeed(chalk.green("Components added!"));
        // Collect all unique dependencies
        const allDeps = new Set();
        const allDevDeps = new Set();
        installedComponents.forEach((c) => {
            const config = getComponent(c);
            if (config) {
                config.dependencies?.forEach((dep) => allDeps.add(dep));
                config.devDependencies?.forEach((dep) => allDevDeps.add(dep));
            }
        });
        // Show results
        console.log(chalk.dim("\n✨ Components copied to:"));
        console.log(chalk.cyan(`   ${componentsDir}\n`));
        console.log(chalk.dim("📦 Installed components:"));
        installedComponents.forEach((c) => {
            const config = getComponent(c);
            console.log(chalk.cyan(`   • ${c}${config?.description ? ` - ${config.description}` : ""}`));
        });
        if (allDeps.size > 0) {
            console.log(chalk.dim("\n📦 Install dependencies:"));
            console.log(chalk.cyan(`   npm install ${Array.from(allDeps).join(" ")}\n`));
        }
        if (allDevDeps.size > 0) {
            console.log(chalk.dim("📦 Install dev dependencies:"));
            console.log(chalk.cyan(`   npm install -D ${Array.from(allDevDeps).join(" ")}\n`));
        }
        console.log(chalk.dim("🎨 Import and use:"));
        components.forEach((c) => {
            const componentName = c
                .split("-")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join("");
            console.log(chalk.cyan(`   import { ${componentName} } from '@/components/plexusui/${c}'`));
        });
    }
    catch (error) {
        spinner.fail("Failed to add components");
        console.error(chalk.red("\n❌ Error:"));
        console.error(chalk.dim(error instanceof Error ? error.message : "Unknown error"));
        if (error instanceof Error && error.stack) {
            console.error(chalk.dim("\nStack trace:"));
            console.error(chalk.dim(error.stack));
        }
        process.exit(1);
    }
}
