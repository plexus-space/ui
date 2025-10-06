#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
const program = new Command();
program
    .name('plexusui')
    .description('Add Plexus UI aerospace components to your project')
    .version('0.0.1');
program
    .command('init')
    .description('Initialize your project for Plexus UI components')
    .action(init);
program
    .command('add')
    .description('Add a component to your project')
    .argument('[components...]', 'components to add')
    .action(add);
program.parse();
//# sourceMappingURL=index.js.map