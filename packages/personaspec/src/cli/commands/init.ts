import { Command } from 'commander';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const PLAYWRIGHT_CONFIG = `import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config optimized for persona-driven testing.
 * - Serial execution simulates real user sessions
 * - Single worker ensures consistent test ordering
 */
export default defineConfig({
  testDir: './tests/personas',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: './test-results',
});
`;

const OBSERVATION_COLLECTOR_WRAPPER = `/**
 * Re-exports from personaspec for convenience.
 * Import from here in your test files.
 */
export {
  ObservationCollector,
  definePersona,
  personaTemplates,
} from 'personaspec';

export type {
  PersonaDefinition,
  Observation,
  ObservationType,
  CollectorConfig,
} from 'personaspec';
`;

const EXAMPLE_PERSONA_TEST = `/**
 * Persona: First-Time Visitor
 *
 * Tests the experience for users who are new to the site.
 * This persona represents someone with no prior context who needs
 * to understand the site's purpose quickly.
 */

import { test, expect } from '@playwright/test';
import {
  ObservationCollector,
  personaTemplates,
} from '../utils/observation-collector';

// Define the persona (customize as needed)
const persona = personaTemplates.firstTimeVisitor({
  name: 'Alex',
  // Override any defaults:
  // goals: ['Find pricing', 'Understand the product'],
});

// Create the collector
const collector = new ObservationCollector({
  outputDir: './test-results',
  persona,
});

// Run tests serially to simulate a real user session
test.describe.configure({ mode: 'serial' });

test.describe(\`\${persona.name} - \${persona.role}\`, () => {
  test.beforeEach(async ({ page }) => {
    // Track console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        collector.addConsoleError(msg.text());
      }
    });
  });

  test.afterAll(async () => {
    // Save all collected observations
    const filepath = await collector.save();
    console.log(\`Observations saved to: \${filepath}\`);
  });

  test('understand site purpose within 10 seconds', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('/');
    collector.trackPageLoad();
    await collector.screenshot(page, 'homepage-initial', 'First view of the homepage');

    // Check if there's a clear headline
    const headline = await page.locator('h1').first().textContent();

    if (headline && headline.length > 0) {
      collector.observe('success', \`Clear headline: "\${headline}"\`, 'Homepage hero');
      success = true;
    } else {
      collector.observe('confusion', 'No clear headline found', 'Homepage');
    }

    // Check for a clear value proposition
    const hasSubheadline = await page.locator('h1 + p, .hero p, [class*="subtitle"]').first().isVisible().catch(() => false);
    if (hasSubheadline) {
      collector.observe('success', 'Value proposition visible below headline', 'Homepage hero');
    } else {
      collector.observe('note', 'Consider adding a subheadline explaining the value', 'Homepage hero');
    }

    await collector.screenshot(page, 'homepage-scanned', 'After scanning the homepage');
    collector.recordTask('understand site purpose within 10 seconds', success, headline || 'No headline found');

    expect(success).toBe(true);
  });

  test('find getting started or signup', async ({ page }) => {
    collector.startTask();
    let success = false;

    // Look for common CTA patterns
    const ctaSelectors = [
      'text=/get started/i',
      'text=/sign up/i',
      'text=/try/i',
      'text=/start/i',
      '[class*="cta"]',
      '[class*="primary"] >> text=/./i',
    ];

    for (const selector of ctaSelectors) {
      const cta = page.locator(selector).first();
      if (await cta.isVisible().catch(() => false)) {
        const text = await cta.textContent();
        collector.observe('success', \`Found CTA: "\${text}"\`, 'Homepage');
        await cta.click();
        collector.trackClick();
        collector.trackPageLoad();
        await collector.screenshot(page, 'after-cta-click', 'After clicking the main CTA');
        success = true;
        break;
      }
    }

    if (!success) {
      collector.observe('frustration', 'Could not find a clear call-to-action', 'Homepage');
      await collector.screenshot(page, 'no-cta-found', 'Unable to locate getting started button');
    }

    collector.recordTask('find getting started or signup', success, success ? 'CTA found and clicked' : 'No CTA found');
  });

  test('find help or documentation', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('/');
    collector.trackPageLoad();

    // Look for help/docs links
    const helpSelectors = [
      'text=/docs/i',
      'text=/documentation/i',
      'text=/help/i',
      'text=/support/i',
      'text=/guide/i',
      'a[href*="docs"]',
      'a[href*="help"]',
    ];

    for (const selector of helpSelectors) {
      const link = page.locator(selector).first();
      if (await link.isVisible().catch(() => false)) {
        const text = await link.textContent();
        collector.observe('success', \`Found help link: "\${text}"\`, 'Navigation');
        success = true;
        break;
      }
    }

    if (!success) {
      collector.observe('note', 'Help/documentation link not immediately visible', 'Navigation');
    }

    await collector.screenshot(page, 'help-search', 'Looking for help/documentation');
    collector.recordTask('find help or documentation', success, success ? 'Help link found' : 'Help link not found');
  });

  test('free exploration', async ({ page }) => {
    collector.startTask();

    await page.goto('/');
    collector.trackPageLoad();
    await collector.screenshot(page, 'exploration-start', 'Beginning free exploration');

    // Simulate natural browsing behavior
    const actions = [
      {
        name: 'scroll down',
        fn: async () => {
          await page.mouse.wheel(0, 500);
          await page.waitForTimeout(300);
        },
      },
      {
        name: 'click first nav link',
        fn: async () => {
          const navLink = page.locator('nav a').first();
          if (await navLink.isVisible().catch(() => false)) {
            await navLink.click();
            collector.trackClick();
            collector.trackPageLoad();
            await collector.screenshot(page, 'nav-click-result', 'After clicking navigation');
          }
        },
      },
      {
        name: 'go back',
        fn: async () => {
          await page.goBack();
          collector.trackBackNav();
        },
      },
      {
        name: 'scroll more',
        fn: async () => {
          await page.mouse.wheel(0, 300);
          await page.waitForTimeout(300);
        },
      },
    ];

    for (const action of actions) {
      try {
        await action.fn();
        await page.waitForTimeout(500); // Human-like pace
      } catch (error) {
        collector.observe('note', \`Action "\${action.name}" failed: \${error}\`, page.url());
      }
    }

    await collector.screenshot(page, 'exploration-end', 'End of free exploration');
    collector.recordTask('free exploration', true, 'Exploration session completed');
  });
});
`;

const GITIGNORE_ADDITIONS = `
# PersonaSpec test results
test-results/
*.observations.json
`;

export const initCommand = new Command('init')
  .description('Initialize a new PersonaSpec project')
  .option('-f, --force', 'Overwrite existing files')
  .option('--skip-gitignore', 'Skip modifying .gitignore')
  .action(async (options: { force?: boolean; skipGitignore?: boolean }) => {
    const cwd = process.cwd();
    console.log('Initializing PersonaSpec project...\n');

    // Create directory structure
    const dirs = ['tests/personas', 'tests/utils', 'test-results'];
    for (const dir of dirs) {
      await fs.mkdir(path.join(cwd, dir), { recursive: true });
      console.log(`  Created: ${dir}/`);
    }

    // Define files to create
    const files: Record<string, string> = {
      'playwright.config.ts': PLAYWRIGHT_CONFIG,
      'tests/utils/observation-collector.ts': OBSERVATION_COLLECTOR_WRAPPER,
      'tests/personas/first-visitor.spec.ts': EXAMPLE_PERSONA_TEST,
    };

    // Write files
    for (const [filepath, content] of Object.entries(files)) {
      const fullPath = path.join(cwd, filepath);

      // Check if file exists
      try {
        await fs.access(fullPath);
        if (!options.force) {
          console.log(`  Skipped: ${filepath} (exists, use --force to overwrite)`);
          continue;
        }
      } catch {
        // File doesn't exist, proceed
      }

      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
      console.log(`  Created: ${filepath}`);
    }

    // Update .gitignore if it exists
    if (!options.skipGitignore) {
      const gitignorePath = path.join(cwd, '.gitignore');
      try {
        const existing = await fs.readFile(gitignorePath, 'utf-8');
        if (!existing.includes('test-results/')) {
          await fs.appendFile(gitignorePath, GITIGNORE_ADDITIONS);
          console.log(`  Updated: .gitignore`);
        }
      } catch {
        // No .gitignore, that's fine
      }
    }

    console.log(`
PersonaSpec initialized!

Next steps:
  1. Install dependencies:
     npm install personaspec @playwright/test

  2. Install browsers:
     npx playwright install chromium

  3. Update the BASE_URL in playwright.config.ts

  4. Run your first persona test:
     npx playwright test

  5. Generate a report:
     npx personaspec report test-results/*.json

  6. (Optional) Get AI analysis:
     ANTHROPIC_API_KEY=xxx npx personaspec analyze test-results/*.json
`);
  });
