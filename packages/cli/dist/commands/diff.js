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
        // Check if component exists locally
        const mainFile = config.files[0];
        const filename = mainFile.split("/").pop();
        const localPath = mainFile.includes("/primitives/")
            ? path.join(componentsDir, "primitives", filename)
            : path.join(componentsDir, filename);
        if (!(await fs.pathExists(localPath))) {
            spinner.info(chalk.yellow(`Component "${componentName}" is not installed locally`));
            console.log(chalk.dim("\nTo install it, run:"));
            console.log(chalk.cyan(`  npx @plexusui/cli add ${componentName}\n`));
            return;
        }
        // Download remote version
        spinner.text = "Downloading latest version...";
        const remoteContent = await downloadFile(mainFile);
        const localContent = await fs.readFile(localPath, "utf-8");
        if (remoteContent === localContent) {
            spinner.succeed(chalk.green(`${componentName} is up to date!`));
        }
        else {
            spinner.warn(chalk.yellow(`${componentName} has updates available`));
            console.log(chalk.dim("\nLocal file:  ") + chalk.cyan(localPath));
            console.log(chalk.dim("Remote URL:  ") + chalk.cyan(mainFile));
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
