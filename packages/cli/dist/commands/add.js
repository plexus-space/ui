import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs-extra";
import * as path from "path";
import https from "https";
import { execSync } from "child_process";
import { registry, getComponent, getLib, isMonorepo, getLocalFilePath, getFileUrl } from "../registry/index.js";
/**
 * Download file from URL
 */
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
/**
 * Get file content - either from local file system (monorepo) or download from URL
 */
async function getFileContent(filePath) {
    if (isMonorepo()) {
        const localPath = getLocalFilePath(filePath);
        return await fs.readFile(localPath, "utf-8");
    }
    else {
        const url = getFileUrl(filePath);
        return await downloadFile(url);
    }
}
/**
 * Check which dependencies are already installed
 */
async function getInstalledDependencies() {
    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, "package.json");
    if (!(await fs.pathExists(packageJsonPath))) {
        return new Set();
    }
    try {
        const packageJson = await fs.readJson(packageJsonPath);
        const installed = new Set();
        // Check both dependencies and devDependencies
        if (packageJson.dependencies) {
            Object.keys(packageJson.dependencies).forEach(dep => installed.add(dep));
        }
        if (packageJson.devDependencies) {
            Object.keys(packageJson.devDependencies).forEach(dep => installed.add(dep));
        }
        return installed;
    }
    catch {
        return new Set();
    }
}
/**
 * Install npm dependencies
 */
async function installDependencies(deps, devDeps) {
    const cwd = process.cwd();
    try {
        if (deps.length > 0) {
            console.log(chalk.dim("\n📦 Installing dependencies..."));
            execSync(`npm install ${deps.join(" ")}`, {
                cwd,
                stdio: "inherit",
            });
        }
        if (devDeps.length > 0) {
            console.log(chalk.dim("\n📦 Installing dev dependencies..."));
            execSync(`npm install -D ${devDeps.join(" ")}`, {
                cwd,
                stdio: "inherit",
            });
        }
    }
    catch (error) {
        throw new Error(`Failed to install dependencies. Please run manually:\n` +
            (deps.length > 0 ? `  npm install ${deps.join(" ")}\n` : "") +
            (devDeps.length > 0 ? `  npm install -D ${devDeps.join(" ")}` : ""));
    }
}
/**
 * Load plexusui.config.json
 */
async function loadConfig() {
    const cwd = process.cwd();
    const configPath = path.join(cwd, "plexusui.config.json");
    if (await fs.pathExists(configPath)) {
        try {
            return await fs.readJson(configPath);
        }
        catch (error) {
            console.log(chalk.yellow("⚠️  Failed to parse plexusui.config.json"));
            return null;
        }
    }
    return null;
}
async function detectProjectStructure() {
    const cwd = process.cwd();
    // First, try to load config
    const config = await loadConfig();
    if (config?.resolvedPaths?.plexusui) {
        return {
            componentsDir: config.resolvedPaths.plexusui,
            srcDir: path.dirname(config.resolvedPaths.components),
        };
    }
    // Fallback to detection
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
        // Check if lib already exists
        const libUtilsPath = path.join(componentsDir, "lib", "utils.ts");
        const libExists = await fs.pathExists(libUtilsPath);
        // Always install lib infrastructure if not present
        if (!libExists) {
            const libConfig = getLib();
            if (libConfig) {
                allComponentsToInstall.add("lib");
            }
        }
        // Download and save each component
        const installedComponents = [];
        const skippedComponents = [];
        const failedComponents = [];
        for (const component of allComponentsToInstall) {
            let config = getComponent(component);
            // Handle lib specially - it's infrastructure, not a component
            if (component === "lib") {
                config = getLib();
                if (libExists) {
                    spinner.text = `Skipping lib (already exists)...`;
                    skippedComponents.push("lib");
                    continue;
                }
            }
            if (!config)
                continue;
            spinner.text = `Adding ${component}...`;
            try {
                // Download or copy all files for this component
                for (const filePath of config.files) {
                    const content = await getFileContent(filePath);
                    // Extract filename and directory structure from path
                    const filename = path.basename(filePath);
                    const dirname = path.dirname(filePath);
                    // Determine destination path based on source structure
                    let destPath;
                    if (dirname.includes("lib")) {
                        // Library files - preserve lib folder structure
                        const libDir = path.join(componentsDir, "lib");
                        await fs.ensureDir(libDir);
                        destPath = path.join(libDir, filename);
                    }
                    else if (dirname.includes("primitives")) {
                        // Primitive component - preserve primitives folder structure
                        const primitivesDir = path.join(componentsDir, "primitives");
                        await fs.ensureDir(primitivesDir);
                        // Handle shaders subdirectory if present
                        if (dirname.includes("shaders")) {
                            const shadersDir = path.join(primitivesDir, "shaders");
                            await fs.ensureDir(shadersDir);
                            destPath = path.join(shadersDir, filename);
                        }
                        else {
                            destPath = path.join(primitivesDir, filename);
                        }
                    }
                    else if (dirname.includes("charts")) {
                        // Chart component - preserve charts folder structure
                        const chartsDir = path.join(componentsDir, "charts");
                        await fs.ensureDir(chartsDir);
                        destPath = path.join(chartsDir, filename);
                    }
                    else {
                        // Regular component - put at root
                        destPath = path.join(componentsDir, filename);
                    }
                    await fs.outputFile(destPath, content);
                }
                installedComponents.push(component);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                failedComponents.push({ name: component, error: errorMessage });
            }
        }
        // Show completion status
        if (failedComponents.length === 0) {
            spinner.succeed(chalk.green("Components added!"));
        }
        else if (installedComponents.length > 0) {
            spinner.warn(chalk.yellow("Some components failed to install"));
        }
        else {
            spinner.fail(chalk.red("All components failed to install"));
        }
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
        if (skippedComponents.length > 0) {
            console.log(chalk.dim("\n⏭️  Skipped (already exists):"));
            skippedComponents.forEach((c) => {
                console.log(chalk.yellow(`   • ${c}`));
            });
        }
        if (failedComponents.length > 0) {
            console.log(chalk.red("\n❌ Failed components:"));
            failedComponents.forEach(({ name, error }) => {
                console.log(chalk.red(`   • ${name}: ${error}`));
            });
            // Exit with error code if all components failed
            if (installedComponents.length === 0) {
                process.exit(1);
            }
        }
        // Check what's already installed
        const installedDeps = await getInstalledDependencies();
        const missingDeps = Array.from(allDeps).filter(dep => !installedDeps.has(dep));
        const missingDevDeps = Array.from(allDevDeps).filter(dep => !installedDeps.has(dep));
        // Install missing dependencies
        if (missingDeps.length > 0 || missingDevDeps.length > 0) {
            console.log(chalk.dim("\n📦 Required dependencies:"));
            if (missingDeps.length > 0) {
                console.log(chalk.yellow(`   ${missingDeps.join(", ")}`));
            }
            if (missingDevDeps.length > 0) {
                console.log(chalk.yellow(`   ${missingDevDeps.join(", ")} (dev)`));
            }
            const shouldInstall = await prompts({
                type: "confirm",
                name: "value",
                message: "Install missing dependencies automatically?",
                initial: true,
            });
            if (shouldInstall.value) {
                try {
                    await installDependencies(missingDeps, missingDevDeps);
                    console.log(chalk.green("\n✅ Dependencies installed successfully!"));
                }
                catch (error) {
                    console.log(chalk.yellow("\n⚠️  " + (error instanceof Error ? error.message : "Unknown error")));
                }
            }
            else {
                console.log(chalk.dim("\n📦 To install dependencies manually, run:"));
                if (missingDeps.length > 0) {
                    console.log(chalk.cyan(`   npm install ${missingDeps.join(" ")}`));
                }
                if (missingDevDeps.length > 0) {
                    console.log(chalk.cyan(`   npm install -D ${missingDevDeps.join(" ")}`));
                }
            }
        }
        else {
            console.log(chalk.green("\n✅ All dependencies already installed!"));
        }
        console.log(chalk.dim("\n🎨 Import and use:"));
        const config = await loadConfig();
        const importAlias = config?.aliases?.plexusui || "@/components/plexusui";
        components.forEach((c) => {
            const componentName = c
                .split("-")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join("");
            console.log(chalk.cyan(`   import { ${componentName} } from '${importAlias}/${c}'`));
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
