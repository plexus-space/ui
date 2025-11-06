import chalk from "chalk";
import ora from "ora";
import * as fs from "fs-extra";
import * as path from "path";
import https from "https";
import { getComponent } from "../registry/index.js";
async function downloadFile(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
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
    if (await fs.pathExists(path.join(cwd, "app"))) {
        return { componentsDir: path.join(cwd, "components", "plexusui") };
    }
    if (await fs.pathExists(path.join(cwd, "src", "app"))) {
        return { componentsDir: path.join(cwd, "src", "components", "plexusui") };
    }
    if (await fs.pathExists(path.join(cwd, "src", "components"))) {
        return { componentsDir: path.join(cwd, "src", "components", "plexusui") };
    }
    if (await fs.pathExists(path.join(cwd, "components"))) {
        return { componentsDir: path.join(cwd, "components", "plexusui") };
    }
    return { componentsDir: path.join(cwd, "components", "plexusui") };
}
export async function diff(componentName) {
    const spinner = ora(`Checking ${componentName}...`).start();
    try {
        const config = getComponent(componentName);
        if (!config) {
            spinner.fail(chalk.red(`Component "${componentName}" not found`));
            return;
        }
        const { componentsDir } = await detectProjectStructure();
        // Check if component exists locally by checking for first file
        const mainFile = config.files[0];
        const filename = mainFile.split("/").pop();
        const dirname = path.dirname(mainFile);
        let localPath;
        if (dirname.includes("lib")) {
            localPath = path.join(componentsDir, "lib", filename);
        }
        else if (dirname.includes("primitives")) {
            if (dirname.includes("shaders")) {
                localPath = path.join(componentsDir, "primitives", "shaders", filename);
            }
            else {
                localPath = path.join(componentsDir, "primitives", filename);
            }
        }
        else if (dirname.includes("charts")) {
            localPath = path.join(componentsDir, "charts", filename);
        }
        else {
            localPath = path.join(componentsDir, filename);
        }
        if (!(await fs.pathExists(localPath))) {
            spinner.info(chalk.yellow(`Component "${componentName}" is not installed locally`));
            console.log(chalk.dim("\nTo install it, run:"));
            console.log(chalk.cyan(`  npx @plexusui/cli add ${componentName}\n`));
            return;
        }
        // Check all files in the component
        spinner.text = "Comparing files...";
        const filesWithDiff = [];
        const missingFiles = [];
        let totalFiles = 0;
        for (const file of config.files) {
            totalFiles++;
            const filename = file.split("/").pop();
            const dirname = path.dirname(file);
            // Determine local file path
            let filePath;
            if (dirname.includes("lib")) {
                filePath = path.join(componentsDir, "lib", filename);
            }
            else if (dirname.includes("primitives")) {
                if (dirname.includes("shaders")) {
                    filePath = path.join(componentsDir, "primitives", "shaders", filename);
                }
                else {
                    filePath = path.join(componentsDir, "primitives", filename);
                }
            }
            else if (dirname.includes("charts")) {
                filePath = path.join(componentsDir, "charts", filename);
            }
            else {
                filePath = path.join(componentsDir, filename);
            }
            // Check if file exists
            if (!(await fs.pathExists(filePath))) {
                missingFiles.push(file);
                continue;
            }
            // Download remote version and compare
            try {
                const remoteUrl = `https://raw.githubusercontent.com/plexus-space/ui/main/packages/components/${file}`;
                const remoteContent = await downloadFile(remoteUrl);
                const localContent = await fs.readFile(filePath, "utf-8");
                if (remoteContent !== localContent) {
                    filesWithDiff.push(file);
                }
            }
            catch (error) {
                // If download fails, skip this file
                console.log(chalk.dim(`\n⚠️  Could not download ${file}`));
            }
        }
        // Show results
        if (missingFiles.length > 0) {
            spinner.warn(chalk.yellow(`${componentName} is partially installed`));
            console.log(chalk.dim("\n⚠️  Missing files:"));
            missingFiles.forEach((file) => {
                console.log(chalk.yellow(`   • ${file}`));
            });
        }
        else if (filesWithDiff.length > 0) {
            spinner.warn(chalk.yellow(`${componentName} has updates available`));
            console.log(chalk.dim("\n📝 Files with changes:"));
            filesWithDiff.forEach((file) => {
                console.log(chalk.yellow(`   • ${file}`));
            });
            console.log(chalk.dim(`\n✓ ${totalFiles - filesWithDiff.length}/${totalFiles} files up to date`));
        }
        else {
            spinner.succeed(chalk.green(`${componentName} is up to date! (${totalFiles}/${totalFiles} files)`));
        }
        if (missingFiles.length > 0 || filesWithDiff.length > 0) {
            console.log(chalk.dim("\nTo update, run:"));
            console.log(chalk.cyan(`  npx @plexusui/cli add ${componentName}\n`));
        }
    }
    catch (error) {
        spinner.fail("Failed to check component");
        console.error(chalk.red("\n❌ Error:"));
        console.error(chalk.dim(error instanceof Error ? error.message : "Unknown error"));
    }
}
