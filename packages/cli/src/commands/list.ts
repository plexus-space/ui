import chalk from "chalk";
import { getAllComponents, getComponentsByCategory } from "../registry/index.js";

export async function list(options: { category?: string } = {}) {
  console.log(chalk.bold("\n📦 Available Plexus UI Components\n"));

  if (options.category) {
    const components = getComponentsByCategory(options.category);

    if (components.length === 0) {
      console.log(chalk.yellow(`No components found in category: ${options.category}`));
      return;
    }

    console.log(chalk.bold(`Category: ${options.category}\n`));
    components.forEach((component) => {
      console.log(chalk.cyan(`  ${component.name}`));
      if (component.description) {
        console.log(chalk.dim(`    ${component.description}`));
      }
      console.log();
    });
  } else {
    // Group by category
    const categories = ["3d", "charts", "orbital", "primitives"];

    categories.forEach((cat) => {
      const components = getComponentsByCategory(cat);
      if (components.length === 0) return;

      console.log(chalk.bold(`${cat.toUpperCase()}`));
      components.forEach((component) => {
        console.log(chalk.cyan(`  • ${component.name}`));
        if (component.description) {
          console.log(chalk.dim(`    ${component.description}`));
        }
      });
      console.log();
    });
  }

  console.log(chalk.dim("To add a component, run:"));
  console.log(chalk.cyan("  npx @plexusui/cli add <component-name>\n"));
}
