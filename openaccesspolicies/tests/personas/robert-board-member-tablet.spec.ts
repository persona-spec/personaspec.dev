/**
 * Robert - Board Member on Tablet Persona Test
 *
 * Investor/board member doing quick due diligence during a meeting break.
 * Using iPad to check if a portfolio company's compliance approach is credible.
 * Has 3 minutes maximum. Needs trust signals fast.
 */

import { test, expect } from '@playwright/test';
import {
  ObservationCollector,
  definePersona,
  interactionPatternDefaults,
} from 'personaspec';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const persona = definePersona({
  name: 'Robert',
  role: 'Board Member (Tablet)',
  background:
    'Board member at a SaaS company. Portfolio company CEO mentioned using "open source compliance templates." Robert has 3 minutes during a meeting break to assess if this is legitimate or a red flag.',
  goals: [
    'Quick legitimacy check in under 3 minutes',
    'Find trust signals (who made this, is it credible)',
    'Determine if this is appropriate for enterprise use',
    'Decide: is this a red flag or acceptable approach?',
  ],
  behaviors: [
    'Skims headlines only - no deep reading',
    'Looks for logos, credentials, social proof',
    'Taps around quickly to assess professionalism',
    'Makes snap judgments based on appearance',
    'Will close tab if anything looks sketchy',
  ],
  // Phase 1: Human-scale timing - very impatient
  interactionPatterns: {
    scanTime: { min: 300, max: 1500 }, // Even faster than impatient
    retryDelay: { min: 1000, max: 2000 },
    maxRetries: 1,
    readingPace: 1500,
    typingSpeed: 200,
  },
  // Phase 2: Starting emotional state - skeptical due diligence
  emotionalBaseline: {
    frustrationLevel: 20,
    frustrationEscalation: 'volatile', // Will abandon quickly
    trustLevel: 'skeptical',
    urgency: 'urgent',
  },
  // Phase 3: Cognitive profile - scanner with 3-minute max
  cognition: {
    readingSpeed: 'scanner',
    decisionStyle: 'impulsive',
    focusDuration: 3, // 3 minutes max
    uncertaintyResponse: 'abandon',
    scanPattern: 'center-first',
  },
  // Phase 4: Prior experience - enterprise software
  priorExperience: {
    referenceProducts: ['Vanta', 'Drata', 'Secureframe', 'OneTrust'],
    expectedPatterns: ['Professional design', 'Company logos', 'Enterprise pricing', 'SOC2 badge'],
    delighters: ['Clear credibility signals', 'Known company names', 'Professional appearance'],
    petPeeves: ['Amateurish design', 'No company info', 'Suspicious claims', 'No social proof'],
  },
  // Phase 5: Session context
  sessionContext: {
    isReturning: false,
    distractionLevel: 'high', // In a meeting, checking between agenda items
    timeContext: 'midday-busy',
  },
});

// Shorter timeout - Robert won't wait long
test.setTimeout(45000);

const collector = new ObservationCollector({
  outputDir: path.join(__dirname, '../../test-results/robert-board-member-tablet'),
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

  test('first impression - is this legitimate?', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';
    let legitimacyScore = 0;

    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-first-impression-tablet',
      'Robert\'s first impression on iPad - does this look legit?'
    );

    const pageContent = await page.textContent('body');
    const lowerContent = pageContent?.toLowerCase() || '';

    // Quick legitimacy checks Robert would do in 30 seconds
    // 1. Professional design (subjective, but check for basic elements)
    const hasNavigation = await page.locator('nav').isVisible().catch(() => false);
    if (hasNavigation) legitimacyScore++;

    // 2. Clear value proposition visible
    const headline = await page.locator('h1').first().textContent().catch(() => '');
    if (headline && headline.length > 5) legitimacyScore++;

    // 3. Open source / free is mentioned (transparency)
    if (lowerContent.includes('open source') || lowerContent.includes('free')) {
      legitimacyScore++;
      collector.observe('success', 'Transparent about being open source - builds trust', 'Homepage', {
        severity: 'positive',
      });
    }

    // 4. Professional terminology
    if (lowerContent.includes('soc2') || lowerContent.includes('soc 2')) {
      legitimacyScore++;
    }

    // 5. GitHub presence (verifiable)
    if (lowerContent.includes('github')) {
      legitimacyScore++;
      collector.observe('success', 'GitHub presence - can verify claims', 'Homepage', {
        severity: 'positive',
      });
    }

    await collector.screenshot(
      page,
      '02-quick-scan',
      'Quick scan for trust signals'
    );

    if (legitimacyScore >= 4) {
      collector.observe('success', 'Site passes quick legitimacy check', 'Overall', {
        severity: 'positive',
      });
      success = true;
      notes = `Looks legitimate (score: ${legitimacyScore}/5)`;
    } else if (legitimacyScore >= 2) {
      collector.observe('note', 'Acceptable but could use more trust signals', 'Overall');
      success = true;
      notes = `Borderline legitimate (score: ${legitimacyScore}/5)`;
    } else {
      collector.observe('frustration', 'Insufficient trust signals visible', 'Overall', {
        severity: 'moderate',
        recommendation: 'Add more visible credibility indicators above the fold',
      });
      notes = `Lacks trust signals (score: ${legitimacyScore}/5)`;
    }

    collector.recordTask('First impression check', success, notes);
    expect(success).toBe(true);
  });

  test('finds credibility information quickly', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/about');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '03-about-page-tablet',
      'Checking about page for credentials'
    );

    const pageContent = await page.textContent('body');
    const lowerContent = pageContent?.toLowerCase() || '';

    // What a board member looks for
    const credibilitySignals = {
      credentials: lowerContent.includes('ciso') || lowerContent.includes('security officer') || lowerContent.includes('certified'),
      experience: lowerContent.includes('years') || lowerContent.includes('experience'),
      production: lowerContent.includes('production') || lowerContent.includes('companies'),
      audit: lowerContent.includes('audit') || lowerContent.includes('passed'),
    };

    const signalCount = Object.values(credibilitySignals).filter(Boolean).length;

    if (credibilitySignals.credentials) {
      collector.observe('success', 'Author has security credentials (CISO) - credible source', 'About', {
        severity: 'positive',
      });
      success = true;
      notes = 'CISO credentials visible';
    }

    if (credibilitySignals.production) {
      collector.observe('success', 'Evidence of production use - not just theoretical', 'About', {
        severity: 'positive',
      });
      success = true;
      notes += '; Production use mentioned';
    }

    if (signalCount === 0) {
      collector.observe('confusion', 'No credibility signals found on about page', 'About', {
        severity: 'moderate',
        recommendation: 'Add author credentials and track record prominently',
      });
      notes = 'No credibility signals';
    }

    collector.recordTask('Find credibility info', success || signalCount > 0, notes);
  });

  test('assesses enterprise appropriateness', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    const pageContent = await page.textContent('body');
    const lowerContent = pageContent?.toLowerCase() || '';

    // Enterprise concerns
    const enterpriseSignals = {
      compliance: lowerContent.includes('compliance') || lowerContent.includes('audit'),
      frameworks: lowerContent.includes('soc2') || lowerContent.includes('hipaa') || lowerContent.includes('hitrust'),
      customizable: lowerContent.includes('customize') || lowerContent.includes('adapt') || lowerContent.includes('template'),
      professional: lowerContent.includes('enterprise') || lowerContent.includes('organization') || lowerContent.includes('company'),
    };

    const enterpriseScore = Object.values(enterpriseSignals).filter(Boolean).length;

    await collector.screenshot(
      page,
      '04-enterprise-assessment',
      'Assessing if appropriate for enterprise'
    );

    if (enterpriseScore >= 3) {
      collector.observe('success', 'Site speaks to enterprise compliance needs', 'Content', {
        severity: 'positive',
      });
      success = true;
      notes = `Enterprise-appropriate (${enterpriseScore}/4 signals)`;
    } else {
      collector.observe('note', 'May need more enterprise-focused messaging', 'Content', {
        recommendation: 'Add enterprise use cases or customer examples',
      });
      notes = `Limited enterprise signals (${enterpriseScore}/4)`;
      success = true;
    }

    // Check for red flags
    if (lowerContent.includes('guarantee') || lowerContent.includes('100%') || lowerContent.includes('instant')) {
      collector.observe('frustration', 'Suspicious claims detected - red flag for board member', 'Content', {
        severity: 'critical',
      });
      notes += '; Suspicious claims found';
    }

    collector.recordTask('Enterprise appropriateness', success, notes);
  });

  test('tablet-specific UX check', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Check tablet rendering
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    await collector.screenshot(
      page,
      '05-tablet-rendering',
      'Checking tablet-specific rendering'
    );

    if (!hasHorizontalScroll) {
      collector.observe('success', 'Clean tablet rendering - no horizontal scroll', 'Layout', {
        severity: 'positive',
      });
      success = true;
      notes = 'Good tablet layout';
    } else {
      collector.observe('frustration', 'Poor tablet rendering - horizontal scroll required', 'Layout', {
        severity: 'moderate',
      });
      notes = 'Tablet layout issues';
    }

    // Check tap targets
    const links = page.locator('a');
    const firstLink = links.first();
    const box = await firstLink.boundingBox().catch(() => null);

    if (box && box.height >= 40) {
      collector.observe('success', 'Touch targets adequately sized for tablet', 'Accessibility', {
        severity: 'positive',
      });
      notes += '; Good tap targets';
    }

    collector.recordTask('Tablet UX check', success, notes);
  });

  test('final verdict - 3 minute assessment', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Quick final scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    await collector.screenshot(
      page,
      '06-final-verdict',
      'Robert\'s final 3-minute verdict'
    );

    // Overall assessment
    const observations = collector.getObservations();
    const successes = observations.filter((o) => o.type === 'success').length;
    const frustrations = observations.filter((o) => o.type === 'frustration').length;

    // Board member's verdict
    if (successes >= 4 && frustrations === 0) {
      collector.observe('success', 'VERDICT: Acceptable for portfolio company to use', 'Final');
      featureNotes.push('Verdict: APPROVED - looks legitimate');
    } else if (successes >= 2 && frustrations <= 1) {
      collector.observe('note', 'VERDICT: Needs further review but not a red flag', 'Final');
      featureNotes.push('Verdict: ACCEPTABLE - recommend deeper review');
    } else {
      collector.observe('confusion', 'VERDICT: Concerns raised - recommend alternatives', 'Final');
      featureNotes.push('Verdict: CONCERNS - needs discussion');
    }

    featureNotes.push(`Assessment time: ~3 minutes`);
    featureNotes.push(`Trust signals: ${successes}, Red flags: ${frustrations}`);
    featureNotes.push(`Device: iPad (768x1024)`);

    collector.recordTask('Final verdict', true, featureNotes.join('; '));
  });
});
