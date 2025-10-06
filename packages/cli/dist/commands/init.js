import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
export async function init() {
    console.log(chalk.bold("\n🚀 Welcome to Plexus UI!\n"));
    console.log(chalk.dim("Plexus UI provides aerospace visualization components."));
    console.log(chalk.dim("Components are installed as npm packages.\n"));
    // Check if package.json exists
    const packageJsonPath = join(process.cwd(), "package.json");
    if (!existsSync(packageJsonPath)) {
        console.log(chalk.red("❌ No package.json found. Please run this in a Node.js project."));
        return;
    }
    const { installDeps } = await prompts({
        type: "confirm",
        name: "installDeps",
        message: "Install required peer dependencies (React, Three.js, R3F, Drei)?",
        initial: true,
    });
    if (!installDeps) {
        console.log(chalk.yellow("\nSkipped dependency installation."));
        console.log(chalk.dim("You'll need to install these manually:\n"));
        console.log("  npm install react react-dom three @react-three/fiber @react-three/drei");
        console.log("  npm install -D @types/react @types/react-dom @types/three\n");
        return;
    }
    const spinner = ora("Installing peer dependencies...").start();
    try {
        // Install runtime dependencies
        execSync("npm install react react-dom three @react-three/fiber @react-three/drei", {
            stdio: "pipe",
            cwd: process.cwd(),
        });
        // Install dev dependencies
        execSync("npm install -D @types/react @types/react-dom @types/three", {
            stdio: "pipe",
            cwd: process.cwd(),
        });
        spinner.succeed(chalk.green("Dependencies installed!"));
        console.log(chalk.green("\n✅ Ready to go!"));
        console.log(chalk.dim("\nAdd components with:"));
        console.log(chalk.cyan("  npx @plexusui/cli add earth"));
        console.log(chalk.cyan("  npx @plexusui/cli add mars venus moon"));
        console.log(chalk.dim("\nOr interactively:"));
        console.log(chalk.cyan("  npx @plexusui/cli add"));
    }
    catch (error) {
        spinner.fail("Failed to install dependencies");
        console.error(chalk.dim(error instanceof Error ? error.message : "Unknown error"));
        console.log(chalk.yellow("\nPlease install dependencies manually:\n"));
        console.log("  npm install react react-dom three @react-three/fiber @react-three/drei");
        console.log("  npm install -D @types/react @types/react-dom @types/three");
        process.exit(1);
    }
}
//# sourceMappingURL=init.js.map