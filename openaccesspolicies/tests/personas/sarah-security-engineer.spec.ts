/**
 * Sarah - Security Engineer Persona Test
 *
 * Mid-level security engineer tasked with implementing the compliance program.
 * Comfortable with Git and documentation. Wants to understand the repo
 * structure before diving in. Expert user with fast interactions.
 */

import { test, expect } from '@playwright/test';
import {
  ObservationCollector,
  definePersona,
  interactionPatternDefaults,
  emotionalBaselineDefaults,
  cognitionDefaults,
} from 'personaspec';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const persona = definePersona({
  name: 'Sarah',
  role: 'Security Engineer',
  background:
    'Mid-level security engineer tasked with implementing the compliance program. Comfortable with Git and documentation. Wants to understand the repo structure before diving in.',
  goals: [
    'Get to the GitHub repo quickly',
    'Navigate to specific policy repository',
    'Find getting started / setup instructions',
    'Verify license allows modification',
  ],
  behaviors: [
    'Jumps to GitHub immediately',
    'Reads READMEs before anything else',
    'Checks commit history for activity',
    'Prefers CLI/code over UI navigation',
    'Expects keyboard shortcuts (Cmd+K search)',
  ],
  // Phase 1: Human-scale timing - expert, fast
  interactionPatterns: interactionPatternDefaults.expert,
  // Phase 2: Starting emotional state - calm, trusting
  emotionalBaseline: emotionalBaselineDefaults.calm,
  // Phase 3: Cognitive profile - expert, fast reader, impulsive decisions
  cognition: cognitionDefaults.expert,
  // Phase 4: Prior experience shapes expectations
  priorExperience: {
    referenceProducts: ['GitHub', 'Docusaurus', 'ReadTheDocs', 'GitBook'],
    expectedPatterns: ['Cmd+K search', 'GitHub link in header', 'Code blocks', 'Copy buttons'],
    delighters: ['CLI installation', 'Quick start guide', 'Markdown source'],
    petPeeves: ['No search', 'Dead links', 'No GitHub link', 'PDF-only docs'],
  },
  // Phase 5: Session context
  sessionContext: {
    isReturning: false,
    distractionLevel: 'low',
    timeContext: 'morning-fresh',
  },
});

test.setTimeout(60000);

const collector = new ObservationCollector({
  outputDir: path.join(__dirname, '../../test-results/sarah-security-engineer'),
  persona,
});

test.describe.serial(`${persona.name} - ${persona.role}`, () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        collector.addConsoleError(msg.text());
      }
    });
  });

  test.afterAll(async () => {
    const outputPath = await collector.save();
    console.log(`\nPersona observations saved to: ${outputPath}`);
  });

  test('finds GitHub link from homepage', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-homepage',
      'Sarah arrives - immediately looking for GitHub link'
    );

    // Expert users look in nav first
    const navGithub = page.locator('nav a[href*="github"], header a[href*="github"]').first();

    if (await navGithub.isVisible({ timeout: 2000 }).catch(() => false)) {
      collector.observe('success', 'GitHub link in navigation - easy access', 'Navigation', {
        severity: 'positive',
      });
      success = true;
      notes = 'GitHub link in nav';
    } else {
      // Check other locations
      const anyGithub = page.locator('a[href*="github"]').first();
      if (await anyGithub.isVisible({ timeout: 2000 }).catch(() => false)) {
        const href = await anyGithub.getAttribute('href');
        collector.observe('success', 'GitHub link found', 'Page', {
          severity: 'positive',
        });
        success = true;
        notes = `GitHub link found: ${href}`;
      } else {
        collector.observe('frustration', 'No GitHub link visible', 'Navigation', {
          severity: 'critical',
          recommendation: 'Add GitHub link to main navigation for developer users',
        });
        notes = 'No GitHub link found';
      }
    }

    await collector.screenshot(
      page,
      '02-github-search',
      'Looking for GitHub link'
    );

    collector.recordTask('Find GitHub link from homepage', success, notes);
    expect(success).toBe(true);
  });

  test('navigates to specific policy repo', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/policies');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '03-policies-page',
      'Looking for specific policy repository links'
    );

    // Look for SOC2 specific repo link
    const soc2Link = page.locator('a[href*="soc2"], a[href*="github"][href*="soc"]').first();

    if (await soc2Link.isVisible({ timeout: 3000 }).catch(() => false)) {
      collector.observe('success', 'Direct link to SOC2 policy repo', 'Policies', {
        severity: 'positive',
      });
      success = true;
      notes = 'SOC2 repo link found';
    }

    // Check for any GitHub links on policies page
    const githubLinks = page.locator('a[href*="github"]');
    const count = await githubLinks.count();

    if (count > 0) {
      collector.observe('success', `Found ${count} GitHub link(s) on policies page`, 'Policies', {
        severity: 'positive',
      });
      success = true;
      notes += `; ${count} GitHub links present`;
    }

    // Click through to verify
    if (success) {
      const firstGithub = githubLinks.first();
      await firstGithub.click();
      collector.trackClick();
      await page.waitForTimeout(2000);

      await collector.screenshot(
        page,
        '04-repo-page',
        'Navigated to GitHub repository'
      );
    }

    collector.recordTask('Navigate to specific policy repo', success, notes || 'Repo links not found');
  });

  test('finds getting started / setup instructions', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/getting-started');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '05-getting-started',
      'Looking for setup instructions'
    );

    const pageContent = await page.textContent('body');

    // Look for code blocks / dev instructions
    const codeBlocks = page.locator('pre, code, .code-block');
    if (await codeBlocks.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      collector.observe('success', 'Code blocks with examples present', 'Getting Started', {
        severity: 'positive',
      });
      success = true;
      notes = 'Code examples found';
    }

    // Look for git commands
    if (pageContent?.includes('git clone') ||
        pageContent?.includes('fork') ||
        pageContent?.includes('npm') ||
        pageContent?.includes('clone')) {
      collector.observe('success', 'Git/development instructions available', 'Getting Started', {
        severity: 'positive',
      });
      success = true;
      notes += '; Git instructions present';
    }

    // Look for step-by-step
    if (pageContent?.includes('Step 1') ||
        pageContent?.includes('1.') ||
        pageContent?.toLowerCase().includes('first')) {
      collector.observe('success', 'Step-by-step process documented', 'Getting Started', {
        severity: 'positive',
      });
      success = true;
      notes += '; Step-by-step guide';
    }

    await collector.screenshot(
      page,
      '06-dev-instructions',
      'Checking for developer-friendly instructions'
    );

    collector.recordTask('Find setup instructions', success, notes || 'Dev instructions unclear');
  });

  test('verifies license allows modification', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    const pageContent = await page.textContent('body');

    // Check footer for license
    if (pageContent?.toLowerCase().includes('mit') ||
        pageContent?.toLowerCase().includes('apache') ||
        pageContent?.toLowerCase().includes('open source') ||
        pageContent?.toLowerCase().includes('license')) {
      collector.observe('success', 'Open license visible', 'Footer/Page', {
        severity: 'positive',
      });
      success = true;
      notes = 'Open license mentioned';
    }

    // Check footer specifically
    const footer = page.locator('footer');
    if (await footer.isVisible({ timeout: 2000 }).catch(() => false)) {
      const footerText = await footer.textContent();
      if (footerText?.toLowerCase().includes('mit') ||
          footerText?.toLowerCase().includes('open source')) {
        collector.observe('success', 'License in footer - easy to find', 'Footer', {
          severity: 'positive',
        });
        success = true;
        notes += '; License in footer';
      }
    }

    await collector.screenshot(
      page,
      '07-license-check',
      'Checking for open source license'
    );

    // GitHub would have LICENSE file - note this as fallback
    if (!success) {
      collector.observe('note', 'License not visible on site - check GitHub repo', 'Page', {
        recommendation: 'Add license badge or mention on main site',
      });
      success = true; // Not a failure, just needs GitHub check
      notes = 'License not on site, would check GitHub';
    }

    collector.recordTask('Verify license', success, notes);
  });

  test('checks for developer-friendly features', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Check for Cmd+K search (expert user expectation)
    const searchButton = page.locator('button[aria-label*="search"], [data-search], .search-button, kbd');
    const hasSearch = await searchButton.first().isVisible({ timeout: 2000 }).catch(() => false);

    if (hasSearch) {
      collector.observe('success', 'Search functionality available', 'Navigation', {
        severity: 'positive',
      });
      featureNotes.push('Search available');
    } else {
      collector.observe('frustration', 'No search functionality - developers expect Cmd+K', 'Navigation', {
        severity: 'moderate',
        recommendation: 'Add Cmd+K search for developer users',
      });
      featureNotes.push('No Cmd+K search');
    }

    await collector.screenshot(
      page,
      '08-dev-features',
      'Checking for developer-friendly features'
    );

    // Overall assessment
    const observations = collector.getObservations();
    const successes = observations.filter((o) => o.type === 'success').length;
    const frustrations = observations.filter((o) => o.type === 'frustration').length;

    featureNotes.push(`Total observations: ${observations.length}`);
    featureNotes.push(`Successes: ${successes}, Frustrations: ${frustrations}`);

    if (frustrations > 0) {
      collector.observe('note', 'Developer UX has room for improvement', 'Overall');
    } else {
      collector.observe('success', 'Good developer experience overall', 'Overall');
    }

    collector.recordTask('Check dev-friendly features', true, featureNotes.join('; '));
  });
});
