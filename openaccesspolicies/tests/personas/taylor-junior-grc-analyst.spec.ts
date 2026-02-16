/**
 * Taylor - Junior GRC Analyst Persona Test
 *
 * Entry-level compliance professional on their first SOC2 project.
 * Doesn't know compliance jargon yet. Needs education, not just templates.
 * Exploratory, asks "what does this mean?" frequently.
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
  name: 'Taylor',
  role: 'Junior GRC Analyst',
  background:
    'Fresh out of college, 3 months into first GRC role. Boss said "figure out SOC2" with no further guidance. Doesn\'t know the difference between SOC1 and SOC2, or what TSC means. Needs to learn while doing.',
  goals: [
    'Understand what SOC2 actually is (not just get templates)',
    'Learn the terminology (TSC, controls, evidence)',
    'Find a clear starting point for someone new',
    'Determine if this is the right resource or too advanced',
  ],
  behaviors: [
    'Reads everything carefully, multiple times',
    'Looks up unfamiliar terms',
    'Seeks help when confused rather than guessing',
    'Takes notes and bookmarks pages',
    'Easily overwhelmed by jargon',
  ],
  // Phase 1: Human-scale timing - exploratory, learning pace
  interactionPatterns: interactionPatternDefaults.exploratory,
  // Phase 2: Starting emotional state - anxious about new responsibility
  emotionalBaseline: {
    frustrationLevel: 30,
    frustrationEscalation: 'moderate',
    trustLevel: 'neutral',
    urgency: 'moderate',
  },
  // Phase 3: Cognitive profile - learner who seeks help
  cognition: {
    readingSpeed: 'slow',
    decisionStyle: 'deliberate',
    focusDuration: 20,
    uncertaintyResponse: 'seek-help',
    scanPattern: 'f-pattern',
  },
  // Phase 4: Prior experience - minimal
  priorExperience: {
    referenceProducts: ['Google', 'Wikipedia', 'YouTube tutorials'],
    expectedPatterns: ['Beginner-friendly explanations', 'Glossaries', 'Step-by-step guides'],
    delighters: ['Plain English explanations', 'Video tutorials', '"What is X?" sections'],
    petPeeves: ['Assumed knowledge', 'Undefined acronyms', 'No beginner resources'],
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
  outputDir: path.join(__dirname, '../../test-results/taylor-junior-grc-analyst'),
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

  test('understands what the site offers from homepage', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-homepage-first-look',
      'Taylor arrives confused about what SOC2 even is'
    );

    const pageContent = await page.textContent('body');
    const lowerContent = pageContent?.toLowerCase() || '';

    // Check for beginner-friendly signals
    const hasExplanation = lowerContent.includes('what is') ||
                          lowerContent.includes('learn') ||
                          lowerContent.includes('guide') ||
                          lowerContent.includes('introduction');

    const hasJargon = lowerContent.includes('tsc') ||
                      lowerContent.includes('trust service') ||
                      lowerContent.includes('criteria');

    const definesTerms = lowerContent.includes('soc2') || lowerContent.includes('soc 2');

    if (hasExplanation) {
      collector.observe('success', 'Found educational content - helps newcomers understand', 'Homepage', {
        severity: 'positive',
      });
      success = true;
      notes = 'Educational content present';
    }

    if (definesTerms && !hasExplanation) {
      collector.observe('note', 'SOC2 mentioned but not explained for beginners', 'Homepage', {
        recommendation: 'Add a "What is SOC2?" section for newcomers',
      });
      notes += '; Terms used but not explained';
    }

    if (hasJargon) {
      collector.observe('confusion', 'Technical jargon (TSC, criteria) may confuse beginners', 'Homepage', {
        severity: 'minor',
        recommendation: 'Define acronyms on first use or link to glossary',
      });
    }

    // Check for clear value proposition
    if (lowerContent.includes('free') || lowerContent.includes('open source')) {
      collector.observe('success', 'Clear that resources are free - reduces barrier for learning', 'Homepage', {
        severity: 'positive',
      });
      success = true;
    }

    await collector.screenshot(
      page,
      '02-scanning-for-help',
      'Looking for beginner-friendly explanations'
    );

    collector.recordTask('Understand site offering', success, notes || 'Initial assessment complete');
  });

  test('finds beginner-friendly starting point', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Look for "getting started" or similar beginner content
    const gettingStartedLink = page.locator('a:has-text("Getting Started"), a:has-text("Start"), a:has-text("Begin"), a:has-text("How to")').first();

    if (await gettingStartedLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      collector.observe('success', 'Clear "Getting Started" entry point for beginners', 'Navigation', {
        severity: 'positive',
      });
      success = true;

      await gettingStartedLink.click();
      collector.trackClick();
      await page.waitForTimeout(1000);

      await collector.screenshot(
        page,
        '03-getting-started-page',
        'Found getting started content'
      );

      const pageContent = await page.textContent('body');

      // Check if getting started is actually beginner-friendly
      if (pageContent?.toLowerCase().includes('step') || pageContent?.includes('1.')) {
        collector.observe('success', 'Step-by-step instructions help beginners follow along', 'Getting Started', {
          severity: 'positive',
        });
        notes = 'Step-by-step guide found';
      }

      // Check for overwhelming technical content
      const codeBlocks = await page.locator('pre, code').count();
      if (codeBlocks > 5) {
        collector.observe('note', 'Many code blocks - may overwhelm non-technical beginners', 'Getting Started', {
          recommendation: 'Consider a non-technical track for compliance officers vs engineers',
        });
        notes += '; Code-heavy (may overwhelm)';
      }
    } else {
      collector.observe('confusion', 'No clear beginner entry point visible', 'Navigation', {
        severity: 'moderate',
        recommendation: 'Add prominent "New to SOC2? Start here" link',
      });
      notes = 'No beginner entry point found';
    }

    collector.recordTask('Find beginner starting point', success, notes);
  });

  test('looks for educational content about SOC2', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Try to find an "about" or educational page
    await page.goto('/about');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '04-about-page',
      'Looking for educational content about SOC2'
    );

    const pageContent = await page.textContent('body');
    const lowerContent = pageContent?.toLowerCase() || '';

    // Check for educational explanations
    const educationalSignals = {
      whatIs: lowerContent.includes('what is'),
      why: lowerContent.includes('why') && lowerContent.includes('compliance'),
      benefits: lowerContent.includes('benefit'),
      overview: lowerContent.includes('overview'),
    };

    const educationalCount = Object.values(educationalSignals).filter(Boolean).length;

    if (educationalCount >= 2) {
      collector.observe('success', 'Educational content helps beginners understand the "why"', 'About', {
        severity: 'positive',
      });
      success = true;
      notes = 'Good educational content';
    } else if (educationalCount >= 1) {
      collector.observe('note', 'Some educational content, could be expanded for beginners', 'About', {
        recommendation: 'Add "Why SOC2 matters" or "SOC2 101" section',
      });
      success = true;
      notes = 'Limited educational content';
    } else {
      collector.observe('confusion', 'No educational content for beginners', 'About', {
        severity: 'moderate',
        recommendation: 'Beginners need context before templates',
      });
      notes = 'Missing educational content';
    }

    collector.recordTask('Find educational content', success, notes);
  });

  test('checks for glossary or term definitions', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Look for glossary link
    const glossaryLink = page.locator('a:has-text("Glossary"), a:has-text("Terms"), a:has-text("Definitions")').first();
    const hasGlossary = await glossaryLink.isVisible({ timeout: 2000 }).catch(() => false);

    // Check if terms are defined inline
    const pageContent = await page.textContent('body');
    const hasInlineDefinitions = pageContent?.includes('(') &&
                                  (pageContent?.includes('Trust Service') ||
                                   pageContent?.includes('Service Organization'));

    await collector.screenshot(
      page,
      '05-looking-for-definitions',
      'Searching for term definitions'
    );

    if (hasGlossary) {
      collector.observe('success', 'Glossary available for learning terminology', 'Resources', {
        severity: 'positive',
      });
      success = true;
      notes = 'Glossary found';
    } else if (hasInlineDefinitions) {
      collector.observe('success', 'Terms defined inline - helpful for beginners', 'Content', {
        severity: 'positive',
      });
      success = true;
      notes = 'Inline definitions found';
    } else {
      collector.observe('note', 'No glossary or term definitions visible', 'Resources', {
        recommendation: 'Add glossary or define acronyms (TSC, SOC, etc.) for newcomers',
      });
      notes = 'No glossary found';
      success = true; // Not a blocker
    }

    collector.recordTask('Check for glossary', success, notes);
  });

  test('evaluates if site is appropriate for beginners', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';
    let beginnerScore = 0;

    await page.goto('/');
    collector.trackPageLoad();

    const pageContent = await page.textContent('body');
    const lowerContent = pageContent?.toLowerCase() || '';

    // Score beginner-friendliness
    if (lowerContent.includes('getting started') || lowerContent.includes('begin')) beginnerScore++;
    if (lowerContent.includes('step') || lowerContent.includes('guide')) beginnerScore++;
    if (lowerContent.includes('free') || lowerContent.includes('open source')) beginnerScore++;
    if (lowerContent.includes('template')) beginnerScore++;
    if (lowerContent.includes('customize') || lowerContent.includes('adapt')) beginnerScore++;

    // Check navigation clarity
    const navLinks = await page.locator('nav a').allTextContents();
    const clearNavigation = navLinks.some(link =>
      link.toLowerCase().includes('start') ||
      link.toLowerCase().includes('policies') ||
      link.toLowerCase().includes('about')
    );
    if (clearNavigation) beginnerScore++;

    await collector.screenshot(
      page,
      '06-beginner-assessment',
      'Final assessment of beginner-friendliness'
    );

    if (beginnerScore >= 4) {
      collector.observe('success', 'Site is accessible for beginners with clear guidance', 'Overall', {
        severity: 'positive',
      });
      success = true;
      notes = `Beginner-friendly (score: ${beginnerScore}/6)`;
    } else if (beginnerScore >= 2) {
      collector.observe('note', 'Site usable but could be more beginner-friendly', 'Overall', {
        recommendation: 'Add more educational context for newcomers to compliance',
      });
      success = true;
      notes = `Moderate beginner support (score: ${beginnerScore}/6)`;
    } else {
      collector.observe('confusion', 'Site assumes prior compliance knowledge', 'Overall', {
        severity: 'moderate',
        recommendation: 'Add beginner track or "New to compliance?" pathway',
      });
      notes = `Limited beginner support (score: ${beginnerScore}/6)`;
    }

    collector.recordTask('Evaluate beginner appropriateness', success, notes);
  });

  test('free exploration - learning journey', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Explore like a curious beginner
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    await collector.screenshot(
      page,
      '07-exploration',
      'Exploring as a curious beginner'
    );

    // Check for helpful patterns
    const pageContent = await page.textContent('body');

    if (pageContent?.toLowerCase().includes('github')) {
      featureNotes.push('GitHub links (good for learning by example)');
    }

    if (pageContent?.toLowerCase().includes('contact') || pageContent?.toLowerCase().includes('help')) {
      featureNotes.push('Help/contact options available');
      collector.observe('success', 'Help options available if Taylor gets stuck', 'Support');
    }

    // Overall assessment
    const observations = collector.getObservations();
    const successes = observations.filter((o) => o.type === 'success').length;
    const confusions = observations.filter((o) => o.type === 'confusion').length;

    if (confusions > successes) {
      collector.observe('note', 'Site may be challenging for complete beginners', 'Overall');
    } else {
      collector.observe('success', 'Site provides enough guidance for motivated beginners', 'Overall');
    }

    featureNotes.push(`Total observations: ${observations.length}`);
    featureNotes.push(`Successes: ${successes}, Confusions: ${confusions}`);

    collector.recordTask('Learning journey exploration', true, featureNotes.join('; '));
  });
});
