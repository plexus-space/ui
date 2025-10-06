import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
const AVAILABLE_COMPONENTS = [
    'earth',
    'mars',
    'mercury',
    'venus',
    'moon',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'gantt',
    'orbital-path',
    'ground-track',
    'trajectory',
    'transfer-orbit',
    'lagrange-points',
    'orbital-math',
];
export async function add(components) {
    // If no components specified, prompt
    if (components.length === 0) {
        const response = await prompts({
            type: 'multiselect',
            name: 'components',
            message: 'Which components would you like to add?',
            choices: AVAILABLE_COMPONENTS.map((c) => ({
                title: c.charAt(0).toUpperCase() + c.slice(1),
                value: c,
            })),
            min: 1,
        });
        if (!response.components || response.components.length === 0) {
            console.log(chalk.yellow('\n❌ No components selected.'));
            return;
        }
        components = response.components;
    }
    // Validate components
    const invalidComponents = components.filter((c) => !AVAILABLE_COMPONENTS.includes(c.toLowerCase()));
    if (invalidComponents.length > 0) {
        console.log(chalk.red(`\n❌ Invalid components: ${invalidComponents.join(', ')}`));
        console.log(chalk.dim(`Available: ${AVAILABLE_COMPONENTS.join(', ')}`));
        return;
    }
    // Install packages
    const packages = components.map((c) => `@plexusui/${c.toLowerCase()}`);
    const spinner = ora(`Installing ${packages.join(', ')}...`).start();
    try {
        execSync(`npm install ${packages.join(' ')}`, {
            stdio: 'inherit',
            cwd: process.cwd(),
        });
        spinner.succeed(chalk.green('Components installed!'));
        console.log(chalk.dim('\nYou can now import components:'));
        components.forEach((c) => {
            const componentName = c.charAt(0).toUpperCase() + c.slice(1);
            console.log(chalk.cyan(`  import { ${componentName} } from '@plexusui/${c}'`));
        });
    }
    catch (error) {
        spinner.fail('Failed to install components');
        console.error(chalk.dim(error instanceof Error ? error.message : 'Unknown error'));
        process.exit(1);
    }
}
//# sourceMappingURL=add.js.map