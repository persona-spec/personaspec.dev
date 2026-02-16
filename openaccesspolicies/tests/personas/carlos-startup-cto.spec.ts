/**
 * Carlos - Startup CTO Persona Test
 *
 * Series A startup just landed an enterprise deal requiring SOC2.
 * Has 3 weeks to show compliance progress. Technical but not a compliance expert.
 * Impatient, needs to find SOC2 policies and get to GitHub quickly.
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
  name: 'Carlos',
  role: 'Startup CTO',
  background:
    'Series A startup just landed an enterprise deal requiring SOC2. Has 3 weeks to show compliance progress. Technical but not a compliance expert. Time pressure is real.',
  goals: [
    'Find the right policy set for SOC2 quickly',
    'Get to the GitHub repo to assess templates',
    'Determine customization effort required',
    'Evaluate template quality and completeness',
  ],
  behaviors: [
    'Skips marketing copy, looks for technical details',
    'Checks GitHub activity and stars for credibility',
    'Impatient with slow or unclear navigation',
    'Makes quick decisions based on first impressions',
  ],
  // Phase 1: Human-scale timing - impatient but still human
  interactionPatterns: interactionPatternDefaults.impatient,
  // Phase 2: Starting emotional state - frustrated from time pressure
  emotionalBaseline: {
    frustrationLevel: 40,
    frustrationEscalation: 'volatile',
    trustLevel: 'neutral',
    urgency: 'urgent',
  },
  // Phase 3: Cognitive profile - scanner, center-first, impulsive
  cognition: cognitionDefaults.scanner,
  // Phase 4: Prior experience shapes expectations
  priorExperience: {
    referenceProducts: ['Vanta', 'Drata', 'Secureframe'],
    expectedPatterns: ['Quick access to templates', 'Clear pricing', 'GitHub links'],
    delighters: ['Free/open source', 'Clear getting started guide'],
    petPeeves: ['Marketing fluff', 'Hidden pricing', 'No GitHub link'],
  },
  // Phase 5: Session context
  sessionContext: {
    isReturning: false,
    distractionLevel: 'moderate',
    timeContext: 'midday-busy',
  },
});

test.setTimeout(60000);

const collector = new ObservationCollector({
  outputDir: path.join(__dirname, '../../test-results/carlos-startup-cto'),
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

  test('finds SOC2 policies from homepage', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-homepage',
      'Carlos arrives at openaccesspolicies.org looking for SOC2 templates'
    );

    // Look for SOC2 mention on the page
    const pageContent = await page.textContent('body');
    if (pageContent?.toLowerCase().includes('soc2') || pageContent?.toLowerCase().includes('soc 2')) {
      collector.observe('success', 'SOC2 mentioned on homepage - immediately relevant', 'Homepage', {
        severity: 'positive',
      });
      success = true;
      notes = 'SOC2 content visible on homepage';
    }

    // Look for navigation to policies
    const policiesLink = page.locator('a[href*="policies"], a:has-text("Policies"), nav a:has-text("SOC")');
    if (await policiesLink.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      collector.observe('success', 'Clear navigation to policies section', 'Navigation', {
        severity: 'positive',
      });
      success = true;
      notes += '; Clear policies navigation';
    }

    await collector.screenshot(
      page,
      '02-soc2-search',
      'Scanning for SOC2 content and navigation'
    );

    collector.recordTask('Find SOC2 policies from homepage', success, notes || 'SOC2 content not prominent');
    expect(success).toBe(true);
  });

  test('gets to GitHub repo quickly', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Look for GitHub links
    const githubLink = page.locator('a[href*="github.com"]').first();
    if (await githubLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      collector.observe('success', 'GitHub link visible and accessible', 'Navigation', {
        severity: 'positive',
      });

      const href = await githubLink.getAttribute('href');
      notes = `GitHub link found: ${href}`;
      success = true;

      // Click to verify it works
      await githubLink.click();
      collector.trackClick();
      await page.waitForTimeout(2000);

      await collector.screenshot(
        page,
        '03-github-repo',
        'Navigated to GitHub repository'
      );
    } else {
      // Check footer or other locations
      const footerGithub = page.locator('footer a[href*="github"], .footer a[href*="github"]').first();
      if (await footerGithub.isVisible({ timeout: 2000 }).catch(() => false)) {
        collector.observe('note', 'GitHub link in footer - not immediately visible', 'Footer', {
          recommendation: 'Consider adding GitHub link to main navigation for technical users',
        });
        success = true;
        notes = 'GitHub link found in footer';
      } else {
        collector.observe('frustration', 'Cannot find GitHub link quickly', 'Navigation', {
          severity: 'moderate',
          recommendation: 'Add prominent GitHub link for developer credibility',
        });
        notes = 'No obvious GitHub link';
      }
    }

    collector.recordTask('Get to GitHub repo quickly', success, notes);
  });

  test('assesses customization effort', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Go to getting started or documentation
    await page.goto('/');
    collector.trackPageLoad();

    // Look for getting started, docs, or how-to content
    const gettingStartedLink = page.locator('a:has-text("Getting Started"), a:has-text("Start"), a:has-text("How")').first();

    if (await gettingStartedLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gettingStartedLink.click();
      collector.trackClick();
      await page.waitForTimeout(1000);

      await collector.screenshot(
        page,
        '04-getting-started',
        'Looking for customization guidance'
      );

      const pageContent = await page.textContent('body');
      if (pageContent?.toLowerCase().includes('customiz') || pageContent?.toLowerCase().includes('fork')) {
        collector.observe('success', 'Customization guidance available', 'Getting Started', {
          severity: 'positive',
        });
        success = true;
        notes = 'Found customization instructions';
      }

      if (pageContent?.toLowerCase().includes('step') || pageContent?.toLowerCase().includes('1.')) {
        collector.observe('success', 'Step-by-step process documented', 'Getting Started', {
          severity: 'positive',
        });
        success = true;
        notes += '; Step-by-step guide available';
      }
    } else {
      // Try policies page for template info
      await page.goto('/policies');
      collector.trackPageLoad();

      await collector.screenshot(
        page,
        '04-policies-page',
        'Checking policies page for template details'
      );

      const pageContent = await page.textContent('body');
      if (pageContent?.includes('template') || pageContent?.includes('policy')) {
        success = true;
        notes = 'Template information on policies page';
      }
    }

    collector.recordTask('Assess customization effort', success, notes || 'Customization guidance unclear');
  });

  test('evaluates template quality', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Check about page or main content for quality indicators
    await page.goto('/about');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '05-about-page',
      'Looking for quality indicators and credibility'
    );

    const pageContent = await page.textContent('body');

    // Check for credentials, experience mentions
    if (pageContent?.toLowerCase().includes('ciso') ||
        pageContent?.toLowerCase().includes('security') ||
        pageContent?.toLowerCase().includes('experience')) {
      collector.observe('success', 'Author credentials visible', 'About', {
        severity: 'positive',
      });
      success = true;
      notes = 'Found author credentials';
    }

    // Check for production use or real-world validation
    if (pageContent?.toLowerCase().includes('production') ||
        pageContent?.toLowerCase().includes('companies') ||
        pageContent?.toLowerCase().includes('audit')) {
      collector.observe('success', 'Evidence of real-world use', 'About', {
        severity: 'positive',
      });
      success = true;
      notes += '; Real-world validation mentioned';
    }

    // Check for open source / license
    if (pageContent?.toLowerCase().includes('open source') ||
        pageContent?.toLowerCase().includes('mit') ||
        pageContent?.toLowerCase().includes('free')) {
      collector.observe('success', 'Open source/free nature clear', 'About', {
        severity: 'positive',
      });
      success = true;
      notes += '; Open source status clear';
    }

    await collector.screenshot(
      page,
      '06-quality-assessment',
      'Final quality assessment'
    );

    collector.recordTask('Evaluate template quality', success, notes || 'Limited quality indicators');
  });

  test('free exploration - overall UX assessment', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Quick scroll through the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));

    await collector.screenshot(
      page,
      '07-exploration',
      'Quick exploration of site structure'
    );

    // Check for key elements Carlos would care about
    const pageContent = await page.textContent('body');

    if (pageContent?.toLowerCase().includes('github')) {
      featureNotes.push('GitHub presence detected');
    }
    if (pageContent?.toLowerCase().includes('free')) {
      featureNotes.push('Free/open source messaging');
    }
    if (pageContent?.toLowerCase().includes('soc2') || pageContent?.toLowerCase().includes('soc 2')) {
      featureNotes.push('SOC2 focus clear');
    }

    // Overall assessment
    const observations = collector.getObservations();
    const frustrations = observations.filter((o) => o.type === 'frustration').length;
    const successes = observations.filter((o) => o.type === 'success').length;

    if (frustrations === 0 && successes > 0) {
      collector.observe('success', 'Site meets impatient CTO expectations', 'Overall');
    } else if (frustrations > 0) {
      collector.observe('note', `Found ${frustrations} friction points during assessment`, 'Overall');
    }

    featureNotes.push(`Total observations: ${observations.length}`);
    featureNotes.push(`Successes: ${successes}, Frustrations: ${frustrations}`);

    collector.recordTask('Free exploration', true, featureNotes.join('; '));
  });
});
