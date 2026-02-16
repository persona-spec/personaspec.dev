/**
 * Michael - External SOC2 Auditor Persona Test
 *
 * Senior auditor at a CPA firm. Client is using these open-source templates
 * and Michael needs to evaluate if they meet audit requirements.
 * Skeptical of free resources - needs evidence.
 */

import { test, expect } from '@playwright/test';
import {
  ObservationCollector,
  definePersona,
  interactionPatternDefaults,
  cognitionDefaults,
} from 'personaspec';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const persona = definePersona({
  name: 'Michael',
  role: 'External SOC2 Auditor',
  background:
    'Senior auditor at a CPA firm. Client is using these open-source templates and Michael needs to evaluate if they meet audit requirements. Skeptical of free resources.',
  goals: [
    'Verify SOC2 control coverage claims are accurate',
    'Find control mapping documentation',
    'Assess template quality and completeness',
    'Check maintenance and version history',
  ],
  behaviors: [
    'Highly skeptical of marketing claims',
    'Looks for evidence and documentation',
    'Checks dates, versions, and update frequency',
    'Examines methodology and sources',
  ],
  // Phase 1: Human-scale timing - normal, methodical
  interactionPatterns: interactionPatternDefaults.normal,
  // Phase 2: Starting emotional state - neutral but skeptical
  emotionalBaseline: {
    frustrationLevel: 20,
    frustrationEscalation: 'patient',
    trustLevel: 'skeptical',
    urgency: 'moderate',
  },
  // Phase 3: Cognitive profile - balanced, F-pattern, deliberate
  cognition: cognitionDefaults.balanced,
  // Phase 4: Prior experience shapes expectations
  priorExperience: {
    referenceProducts: ['AICPA TSC Framework', 'SOC2 Academy', 'Big 4 audit templates'],
    expectedPatterns: ['Control mappings to TSC', 'Evidence documentation', 'Version control'],
    delighters: ['Detailed control descriptions', 'Gap analysis support'],
    petPeeves: ['Unsubstantiated claims', 'No version history', 'Missing control mappings'],
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
  outputDir: path.join(__dirname, '../../test-results/michael-external-auditor'),
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

  test('verifies SOC2 control coverage claims', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-homepage',
      'Michael arrives to verify SOC2 control coverage claims'
    );

    const pageContent = await page.textContent('body');

    // Look for TSC (Trust Services Criteria) mentions
    if (pageContent?.toLowerCase().includes('tsc') ||
        pageContent?.toLowerCase().includes('trust service') ||
        pageContent?.toLowerCase().includes('trust services criteria')) {
      collector.observe('success', 'TSC coverage mentioned - relevant for SOC2', 'Homepage', {
        severity: 'positive',
      });
      success = true;
      notes = 'TSC references found';
    }

    // Look for control coverage details
    if (pageContent?.toLowerCase().includes('control') &&
        (pageContent?.toLowerCase().includes('security') ||
         pageContent?.toLowerCase().includes('availability') ||
         pageContent?.toLowerCase().includes('processing integrity'))) {
      collector.observe('success', 'Control categories mentioned', 'Homepage', {
        severity: 'positive',
      });
      success = true;
      notes += '; Control categories visible';
    }

    // Navigate to policies page for detailed coverage
    await page.goto('/policies');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '02-policies-page',
      'Checking policies page for control coverage details'
    );

    const policiesContent = await page.textContent('body');
    if (policiesContent?.toLowerCase().includes('soc2') || policiesContent?.toLowerCase().includes('soc 2')) {
      collector.observe('success', 'SOC2 policies section exists', 'Policies', {
        severity: 'positive',
      });
      success = true;
      notes += '; SOC2 section present';
    }

    collector.recordTask('Verify SOC2 control coverage', success, notes || 'Control coverage unclear');
    expect(success).toBe(true);
  });

  test('finds control mapping documentation', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Check auditors page
    await page.goto('/auditors');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '03-auditors-page',
      'Looking for control mapping documentation'
    );

    const pageContent = await page.textContent('body');

    // Look for mapping documentation
    if (pageContent?.toLowerCase().includes('mapping') ||
        pageContent?.toLowerCase().includes('crosswalk') ||
        pageContent?.toLowerCase().includes('tsc')) {
      collector.observe('success', 'Control mapping documentation referenced', 'Auditors', {
        severity: 'positive',
      });
      success = true;
      notes = 'Control mappings mentioned';
    }

    // Look for GitHub link with detailed mappings
    const githubLink = page.locator('a[href*="github"]').first();
    if (await githubLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      const href = await githubLink.getAttribute('href');
      collector.observe('success', 'GitHub source for detailed mappings', 'Auditors', {
        severity: 'positive',
      });
      success = true;
      notes += `; GitHub available (${href})`;
    }

    // Look for specific control references
    if (pageContent?.toLowerCase().includes('cc') ||
        pageContent?.toLowerCase().includes('security') ||
        pageContent?.toLowerCase().includes('criteria')) {
      collector.observe('success', 'Specific control criteria referenced', 'Auditors', {
        severity: 'positive',
      });
      success = true;
    }

    collector.recordTask('Find control mapping documentation', success, notes || 'Mappings not found');
  });

  test('assesses template quality indicators', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Check about page for quality indicators
    await page.goto('/about');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '04-about-page',
      'Assessing template quality and author credibility'
    );

    const pageContent = await page.textContent('body');

    // Look for professional credentials
    if (pageContent?.toLowerCase().includes('ciso') ||
        pageContent?.toLowerCase().includes('security officer') ||
        pageContent?.toLowerCase().includes('certified')) {
      collector.observe('success', 'Author has security credentials', 'About', {
        severity: 'positive',
      });
      success = true;
      notes = 'CISO/security credentials visible';
    }

    // Look for production use evidence
    if (pageContent?.toLowerCase().includes('production') ||
        pageContent?.toLowerCase().includes('companies') ||
        pageContent?.toLowerCase().includes('passed audit')) {
      collector.observe('success', 'Evidence of production use', 'About', {
        severity: 'positive',
      });
      success = true;
      notes += '; Production use mentioned';
    }

    // Check for methodology or process
    if (pageContent?.toLowerCase().includes('methodology') ||
        pageContent?.toLowerCase().includes('process') ||
        pageContent?.toLowerCase().includes('approach')) {
      collector.observe('success', 'Clear methodology documented', 'About', {
        severity: 'positive',
      });
      success = true;
    }

    // Note: auditors look for testimonials
    if (!pageContent?.toLowerCase().includes('testimonial') &&
        !pageContent?.toLowerCase().includes('review')) {
      collector.observe('note', 'No testimonials visible', 'About', {
        recommendation: 'Add testimonials from companies that passed SOC2 using these templates',
      });
    }

    collector.recordTask('Assess template quality', success, notes || 'Limited quality indicators');
  });

  test('checks maintenance and version history', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Look for GitHub to check version history
    await page.goto('/');
    collector.trackPageLoad();

    const githubLink = page.locator('a[href*="github"]').first();

    if (await githubLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await githubLink.getAttribute('href');
      collector.observe('success', 'GitHub available for version history verification', 'Navigation', {
        severity: 'positive',
      });
      success = true;
      notes = `GitHub link available: ${href}`;

      await collector.screenshot(
        page,
        '05-github-access',
        'Found GitHub link for version history check'
      );
    }

    // Check if there are any date/version mentions on the site
    const pageContent = await page.textContent('body');
    if (pageContent?.toLowerCase().includes('updated') ||
        pageContent?.toLowerCase().includes('version') ||
        pageContent?.toLowerCase().includes('release')) {
      collector.observe('success', 'Version/update information visible', 'Homepage', {
        severity: 'positive',
      });
      success = true;
      notes += '; Version info mentioned';
    }

    await collector.screenshot(
      page,
      '06-version-check',
      'Checking for version and maintenance information'
    );

    collector.recordTask('Check maintenance history', success, notes || 'No version info visible');
  });

  test('free exploration - auditor skepticism assessment', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Auditors are thorough - check footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await collector.screenshot(
      page,
      '07-exploration',
      'Thorough exploration as skeptical auditor'
    );

    const pageContent = await page.textContent('body');

    // Key checks for auditor confidence
    if (pageContent?.toLowerCase().includes('github')) {
      featureNotes.push('Open source - verifiable');
    }
    if (pageContent?.toLowerCase().includes('ciso')) {
      featureNotes.push('Security credentials present');
    }
    if (pageContent?.toLowerCase().includes('free') || pageContent?.toLowerCase().includes('open source')) {
      featureNotes.push('Free/open source clearly stated');
    }

    const observations = collector.getObservations();
    const successes = observations.filter((o) => o.type === 'success').length;
    const frustrations = observations.filter((o) => o.type === 'frustration').length;

    if (successes >= 4 && frustrations === 0) {
      collector.observe('success', 'Site provides sufficient evidence for auditor confidence', 'Overall');
    }

    featureNotes.push(`Total observations: ${observations.length}`);
    featureNotes.push(`Successes: ${successes}, Frustrations: ${frustrations}`);

    collector.recordTask('Free exploration', true, featureNotes.join('; '));
  });
});
