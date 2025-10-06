import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const COMPONENT_REGISTRY: Record<string, { sourceUrl: string; filename: string; dependencies: string[] }> = {
  earth: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/earth/earth.tsx',
    filename: 'earth.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  mars: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/mars/mars.tsx',
    filename: 'mars.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  mercury: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/mercury/mercury.tsx',
    filename: 'mercury.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  venus: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/venus/venus.tsx',
    filename: 'venus.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  moon: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/moon/moon.tsx',
    filename: 'moon.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  jupiter: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/jupiter/jupiter.tsx',
    filename: 'jupiter.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  saturn: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/saturn/saturn.tsx',
    filename: 'saturn.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  uranus: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/uranus/uranus.tsx',
    filename: 'uranus.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  neptune: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/neptune/neptune.tsx',
    filename: 'neptune.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  gantt: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/gantt/gantt.tsx',
    filename: 'gantt.tsx',
    dependencies: ['react'],
  },
  'orbital-path': {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/orbital-path/orbital-path.tsx',
    filename: 'orbital-path.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  'ground-track': {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/ground-track/ground-track.tsx',
    filename: 'ground-track.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  trajectory: {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/trajectory/trajectory.tsx',
    filename: 'trajectory.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  'transfer-orbit': {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/transfer-orbit/transfer-orbit.tsx',
    filename: 'transfer-orbit.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  'lagrange-points': {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/lagrange-points/lagrange-points.tsx',
    filename: 'lagrange-points.tsx',
    dependencies: ['react', '@react-three/fiber', '@react-three/drei', 'three'],
  },
  'orbital-math': {
    sourceUrl: 'https://raw.githubusercontent.com/yourusername/ui-aerospace/main/packages/orbital-math/orbital-math.ts',
    filename: 'orbital-math.ts',
    dependencies: [],
  },
};

async function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

async function detectProjectStructure(): Promise<{ componentsDir: string; srcDir: string }> {
  const cwd = process.cwd();

  // Check for src/components directory (Next.js/React app)
  if (await fs.pathExists(path.join(cwd, 'src', 'components'))) {
    return {
      componentsDir: path.join(cwd, 'src', 'components', 'plexusui'),
      srcDir: path.join(cwd, 'src'),
    };
  }

  // Check for components directory (some Next.js setups)
  if (await fs.pathExists(path.join(cwd, 'components'))) {
    return {
      componentsDir: path.join(cwd, 'components', 'plexusui'),
      srcDir: cwd,
    };
  }

  // Default: create src/components
  return {
    componentsDir: path.join(cwd, 'src', 'components', 'plexusui'),
    srcDir: path.join(cwd, 'src'),
  };
}

export async function add(components: string[]) {
  // If no components specified, prompt
  if (components.length === 0) {
    const response = await prompts({
      type: 'multiselect',
      name: 'components',
      message: 'Which components would you like to add?',
      choices: AVAILABLE_COMPONENTS.map((c) => ({
        title: c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' '),
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
  const invalidComponents = components.filter(
    (c) => !AVAILABLE_COMPONENTS.includes(c.toLowerCase())
  );

  if (invalidComponents.length > 0) {
    console.log(chalk.red(`\n❌ Invalid components: ${invalidComponents.join(', ')}`));
    console.log(chalk.dim(`Available: ${AVAILABLE_COMPONENTS.join(', ')}`));
    return;
  }

  const spinner = ora('Setting up components...').start();

  try {
    // Detect project structure
    const { componentsDir } = await detectProjectStructure();

    // Create components directory
    await fs.ensureDir(componentsDir);
    spinner.text = 'Downloading components...';

    // Download and save each component
    for (const component of components) {
      const config = COMPONENT_REGISTRY[component];
      if (!config) continue;

      spinner.text = `Adding ${component}...`;

      // For local development/testing, copy from local packages
      // In production, this would download from GitHub
      const localSourcePath = path.join(__dirname, '..', '..', '..', component, config.filename);

      if (await fs.pathExists(localSourcePath)) {
        // Copy from local (development mode)
        const content = await fs.readFile(localSourcePath, 'utf-8');
        const destPath = path.join(componentsDir, config.filename);
        await fs.writeFile(destPath, content);
      } else {
        // Download from GitHub (production mode)
        try {
          const content = await downloadFile(config.sourceUrl);
          const destPath = path.join(componentsDir, config.filename);
          await fs.writeFile(destPath, content);
        } catch (err) {
          spinner.warn(chalk.yellow(`Could not download ${component} from GitHub. Using local fallback...`));
          // Try local fallback
          const fallbackPath = path.join(__dirname, '..', '..', '..', component, config.filename);
          if (await fs.pathExists(fallbackPath)) {
            const content = await fs.readFile(fallbackPath, 'utf-8');
            const destPath = path.join(componentsDir, config.filename);
            await fs.writeFile(destPath, content);
          }
        }
      }
    }

    spinner.succeed(chalk.green('Components added!'));

    // Collect all unique dependencies
    const allDeps = new Set<string>();
    components.forEach((c) => {
      const config = COMPONENT_REGISTRY[c];
      if (config) {
        config.dependencies.forEach((dep) => allDeps.add(dep));
      }
    });

    // Show next steps
    console.log(chalk.dim('\n✨ Components copied to:'));
    console.log(chalk.cyan(`   ${componentsDir}\n`));

    if (allDeps.size > 0) {
      console.log(chalk.dim('📦 Install dependencies:'));
      console.log(chalk.cyan(`   npm install ${Array.from(allDeps).join(' ')}\n`));
    }

    console.log(chalk.dim('🎨 Import and use:'));
    components.forEach((c) => {
      const fileName = COMPONENT_REGISTRY[c].filename.replace('.tsx', '').replace('.ts', '');
      const componentName = c.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      console.log(chalk.cyan(`   import { ${componentName} } from '@/components/plexusui/${fileName}'`));
    });

  } catch (error) {
    spinner.fail('Failed to add components');
    console.error(chalk.dim(error instanceof Error ? error.message : 'Unknown error'));
    process.exit(1);
  }
}
