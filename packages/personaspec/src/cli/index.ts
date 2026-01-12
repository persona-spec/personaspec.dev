import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { analyzeCommand } from './commands/analyze.js';
import { reportCommand } from './commands/report.js';

const program = new Command();

program
  .name('personaspec')
  .description('Persona-driven Playwright testing with AI vision analysis')
  .version('0.1.0');

program.addCommand(initCommand);
program.addCommand(analyzeCommand);
program.addCommand(reportCommand);

program.parse();
