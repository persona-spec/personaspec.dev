/**
 * Priya - Healthcare Compliance Officer Persona Test
 *
 * Works at a regional hospital system evaluating compliance options.
 * Needs to present HIPAA vs HITRUST comparison to leadership.
 * Has compliance background but not deeply technical.
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
  name: 'Priya',
  role: 'Healthcare Compliance Officer',
  background:
    'Works at a regional hospital system evaluating compliance options. Needs to present HIPAA vs HITRUST comparison to leadership. Has compliance background but not deeply technical.',
  goals: [
    'Find healthcare-specific policy options',
    'Understand the difference between HIPAA and HITRUST offerings',
    'Find control mapping documents for audit preparation',
    'Assess if templates are audit-ready',
  ],
  behaviors: [
    'Reads carefully before making decisions',
    'Looks for authoritative signals (credentials, experience)',
    'Compares options side-by-side',
    'Downloads documentation for offline review',
  ],
  // Phase 1: Human-scale timing - careful, methodical
  interactionPatterns: interactionPatternDefaults.careful,
  // Phase 2: Starting emotional state - calm, patient
  emotionalBaseline: emotionalBaselineDefaults.calm,
  // Phase 3: Cognitive profile - careful reader, F-pattern, deliberate
  cognition: cognitionDefaults.careful,
  // Phase 4: Prior experience shapes expectations
  priorExperience: {
    referenceProducts: ['HITRUST CSF Portal', 'CMS HIPAA guidance', 'HHS.gov'],
    expectedPatterns: ['Healthcare-specific language', 'Compliance frameworks listed', 'Control mappings'],
    delighters: ['Pre-built HIPAA templates', 'HITRUST crosswalk documents'],
    petPeeves: ['Generic security content', 'No healthcare mention', 'Unclear applicability'],
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
  outputDir: path.join(__dirname, '../../test-results/priya-healthcare-compliance'),
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

  test('finds healthcare-specific policy options', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-homepage',
      'Priya arrives looking for healthcare compliance templates'
    );

    const pageContent = await page.textContent('body');

    // Check for HIPAA mention
    if (pageContent?.toLowerCase().includes('hipaa')) {
      collector.observe('success', 'HIPAA mentioned - healthcare relevance clear', 'Homepage', {
        severity: 'positive',
      });
      success = true;
      notes = 'HIPAA content visible';
    }

    // Check for HITRUST mention
    if (pageContent?.toLowerCase().includes('hitrust')) {
      collector.observe('success', 'HITRUST mentioned - comprehensive healthcare coverage', 'Homepage', {
        severity: 'positive',
      });
      success = true;
      notes += '; HITRUST content visible';
    }

    // Check for healthcare-specific language
    if (pageContent?.toLowerCase().includes('healthcare') || pageContent?.toLowerCase().includes('health')) {
      collector.observe('success', 'Healthcare-specific language used', 'Homepage', {
        severity: 'positive',
      });
      success = true;
    }

    await collector.screenshot(
      page,
      '02-healthcare-scan',
      'Scanning for healthcare compliance content'
    );

    collector.recordTask('Find healthcare-specific options', success, notes || 'Healthcare content not prominent');
    expect(success).toBe(true);
  });

  test('understands HIPAA vs HITRUST difference', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Navigate to policies page
    await page.goto('/policies');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '03-policies-page',
      'Looking for HIPAA and HITRUST policy options'
    );

    const pageContent = await page.textContent('body');

    const hasHipaa = pageContent?.toLowerCase().includes('hipaa');
    const hasHitrust = pageContent?.toLowerCase().includes('hitrust');

    if (hasHipaa && hasHitrust) {
      collector.observe('success', 'Both HIPAA and HITRUST options available', 'Policies', {
        severity: 'positive',
      });
      success = true;
      notes = 'Both frameworks represented';
    } else if (hasHipaa) {
      collector.observe('note', 'HIPAA available, HITRUST not visible', 'Policies');
      success = true;
      notes = 'HIPAA found, HITRUST unclear';
    } else if (hasHitrust) {
      collector.observe('note', 'HITRUST available, HIPAA not visible', 'Policies');
      success = true;
      notes = 'HITRUST found, HIPAA unclear';
    }

    // Look for comparison or difference explanation
    if (pageContent?.toLowerCase().includes('comparison') ||
        pageContent?.toLowerCase().includes('difference') ||
        pageContent?.toLowerCase().includes('vs')) {
      collector.observe('success', 'Comparison content available', 'Policies', {
        severity: 'positive',
      });
      notes += '; Comparison available';
    } else {
      collector.observe('note', 'No side-by-side comparison visible', 'Policies', {
        recommendation: 'Add HIPAA vs HITRUST comparison table for compliance officers',
      });
    }

    collector.recordTask('Understand HIPAA vs HITRUST', success, notes || 'Framework comparison unclear');
  });

  test('finds control mapping documents', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Check auditors page or documentation
    await page.goto('/auditors');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '04-auditors-page',
      'Looking for control mappings for audit preparation'
    );

    const pageContent = await page.textContent('body');

    // Look for control mapping content
    if (pageContent?.toLowerCase().includes('control') ||
        pageContent?.toLowerCase().includes('mapping') ||
        pageContent?.toLowerCase().includes('tsc')) {
      collector.observe('success', 'Control mapping information found', 'Auditors', {
        severity: 'positive',
      });
      success = true;
      notes = 'Control mappings available';
    }

    // Look for downloadable documents
    const downloadLinks = page.locator('a[href*=".pdf"], a[href*="download"], a:has-text("Download")');
    if (await downloadLinks.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      collector.observe('success', 'Downloadable documentation available', 'Auditors', {
        severity: 'positive',
      });
      success = true;
      notes += '; Downloads available';
    }

    // Check for GitHub as source of control mappings
    const githubMappings = page.locator('a[href*="github"]');
    if (await githubMappings.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      collector.observe('success', 'GitHub source for detailed mappings', 'Auditors', {
        severity: 'positive',
      });
      success = true;
      notes += '; GitHub source available';
    }

    collector.recordTask('Find control mapping documents', success, notes || 'Control mappings not found');
  });

  test('assesses audit-readiness of templates', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Check about page for credibility
    await page.goto('/about');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '05-about-page',
      'Assessing credibility and audit-readiness'
    );

    const pageContent = await page.textContent('body');

    // Look for professional credentials
    if (pageContent?.toLowerCase().includes('ciso') ||
        pageContent?.toLowerCase().includes('security officer') ||
        pageContent?.toLowerCase().includes('certification')) {
      collector.observe('success', 'Professional credentials visible - builds trust', 'About', {
        severity: 'positive',
      });
      success = true;
      notes = 'Author has security credentials';
    }

    // Look for audit experience
    if (pageContent?.toLowerCase().includes('audit') ||
        pageContent?.toLowerCase().includes('compliance')) {
      collector.observe('success', 'Audit/compliance experience mentioned', 'About', {
        severity: 'positive',
      });
      success = true;
      notes += '; Audit experience evident';
    }

    // Look for production use
    if (pageContent?.toLowerCase().includes('production') ||
        pageContent?.toLowerCase().includes('companies') ||
        pageContent?.toLowerCase().includes('organizations')) {
      collector.observe('success', 'Evidence of real-world use', 'About', {
        severity: 'positive',
      });
      success = true;
      notes += '; Production use mentioned';
    }

    await collector.screenshot(
      page,
      '06-credibility-check',
      'Final credibility assessment'
    );

    collector.recordTask('Assess audit-readiness', success, notes || 'Limited credibility signals');
  });

  test('free exploration - healthcare UX assessment', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Priya reads carefully - scroll through content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await collector.screenshot(
      page,
      '07-exploration',
      'Careful exploration of site content'
    );

    // Check for key elements Priya would care about
    const pageContent = await page.textContent('body');

    if (pageContent?.toLowerCase().includes('hipaa')) {
      featureNotes.push('HIPAA framework supported');
    }
    if (pageContent?.toLowerCase().includes('hitrust')) {
      featureNotes.push('HITRUST framework supported');
    }
    if (pageContent?.toLowerCase().includes('contact') || pageContent?.toLowerCase().includes('support')) {
      featureNotes.push('Contact/support options visible');
    }

    // Overall assessment
    const observations = collector.getObservations();
    const successes = observations.filter((o) => o.type === 'success').length;
    const frustrations = observations.filter((o) => o.type === 'frustration').length;

    if (successes > 3) {
      collector.observe('success', 'Site meets healthcare compliance officer needs', 'Overall');
    }

    featureNotes.push(`Total observations: ${observations.length}`);
    featureNotes.push(`Successes: ${successes}, Frustrations: ${frustrations}`);

    collector.recordTask('Free exploration', true, featureNotes.join('; '));
  });
});
