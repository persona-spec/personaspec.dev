/**
 * Jordan - Accessibility Auditor Persona Test
 *
 * Testing for WCAG 2.1 AA compliance. Uses keyboard navigation exclusively
 * and checks for screen reader compatibility, focus states, and color contrast.
 * A completely different testing paradigm from click-based navigation.
 */

import { test, expect } from '@playwright/test';
import {
  ObservationCollector,
  definePersona,
  interactionPatternDefaults,
  emotionalBaselineDefaults,
} from 'personaspec';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const persona = definePersona({
  name: 'Jordan',
  role: 'Accessibility Auditor',
  background:
    'Testing for WCAG 2.1 AA compliance. Uses keyboard navigation and screen readers. Evaluating whether this compliance site is itself accessible - a key credibility signal.',
  goals: [
    'Navigate the entire site using only keyboard (Tab/Enter)',
    'Verify all interactive elements have visible focus states',
    'Check heading hierarchy is logical (H1 → H2 → H3)',
    'Ensure images have meaningful alt text',
    'Test at 200% zoom level',
  ],
  behaviors: [
    'Uses Tab key exclusively for navigation',
    'Never uses mouse/trackpad',
    'Checks focus visibility on every element',
    'Verifies skip links and landmarks',
    'Tests with browser zoom at 200%',
  ],
  // Phase 1: Human-scale timing - careful, methodical
  interactionPatterns: interactionPatternDefaults.careful,
  // Phase 2: Starting emotional state - neutral, professional
  emotionalBaseline: emotionalBaselineDefaults.neutral,
  // Phase 3: Cognitive profile - systematic learner
  cognition: {
    readingSpeed: 'average',
    decisionStyle: 'deliberate',
    focusDuration: 30, // Can focus for long periods on systematic testing
    uncertaintyResponse: 'explore',
    scanPattern: 'f-pattern',
  },
  // Phase 4: Prior experience shapes expectations
  priorExperience: {
    referenceProducts: ['GOV.UK', 'WebAIM', 'Deque University'],
    expectedPatterns: ['Skip links', 'Logical tab order', 'ARIA labels', 'Focus indicators'],
    delighters: ['Keyboard shortcuts', 'High contrast mode', 'Reduced motion support'],
    petPeeves: ['Focus traps', 'Missing focus styles', 'Mouse-only interactions', 'Auto-playing media'],
  },
  // Phase 5: Session context
  sessionContext: {
    isReturning: false,
    distractionLevel: 'none', // Focused testing environment
    timeContext: 'morning-fresh',
  },
});

test.setTimeout(90000);

const collector = new ObservationCollector({
  outputDir: path.join(__dirname, '../../test-results/jordan-accessibility-auditor'),
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

  test('keyboard navigation through main page', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';
    let focusableElements = 0;
    let elementsWithVisibleFocus = 0;

    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-homepage-initial',
      'Jordan arrives to test keyboard accessibility'
    );

    // Tab through the page and check focus visibility
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      // Check if focused element has visible focus indicator
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;

        const styles = window.getComputedStyle(el);
        const hasOutline = styles.outline !== 'none' && styles.outline !== '';
        const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
        const hasBorder = styles.borderColor !== styles.backgroundColor;

        return {
          tag: el.tagName,
          text: el.textContent?.slice(0, 50),
          hasVisibleFocus: hasOutline || hasBoxShadow,
          outlineStyle: styles.outline,
        };
      });

      if (focusedElement) {
        focusableElements++;
        if (focusedElement.hasVisibleFocus) {
          elementsWithVisibleFocus++;
        }
      }
    }

    await collector.screenshot(
      page,
      '02-after-tabbing',
      'After tabbing through navigation elements'
    );

    const focusRatio = focusableElements > 0 ? elementsWithVisibleFocus / focusableElements : 0;

    if (focusRatio >= 0.8) {
      collector.observe('success', `Good focus visibility: ${elementsWithVisibleFocus}/${focusableElements} elements have visible focus`, 'Navigation', {
        severity: 'positive',
      });
      success = true;
      notes = `Focus visible on ${Math.round(focusRatio * 100)}% of elements`;
    } else if (focusRatio >= 0.5) {
      collector.observe('confusion', `Inconsistent focus visibility: ${elementsWithVisibleFocus}/${focusableElements} elements`, 'Navigation', {
        severity: 'moderate',
        recommendation: 'Add visible focus indicators to all interactive elements',
      });
      success = true;
      notes = `Focus inconsistent: ${Math.round(focusRatio * 100)}%`;
    } else {
      collector.observe('frustration', 'Poor focus visibility - difficult to navigate by keyboard', 'Navigation', {
        severity: 'critical',
        recommendation: 'Implement :focus-visible styles for all interactive elements',
      });
      notes = 'Focus indicators largely missing';
    }

    collector.recordTask('Keyboard navigation test', success, notes);
  });

  test('checks heading hierarchy', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Extract all headings and their levels
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map((h) => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim().slice(0, 50),
      }));
    });

    await collector.screenshot(
      page,
      '03-heading-structure',
      'Analyzing heading hierarchy'
    );

    // Check for issues
    const h1Count = headings.filter((h) => h.level === 1).length;
    let hasSkippedLevels = false;
    let previousLevel = 0;

    for (const heading of headings) {
      if (heading.level > previousLevel + 1 && previousLevel !== 0) {
        hasSkippedLevels = true;
      }
      previousLevel = heading.level;
    }

    if (h1Count === 1 && !hasSkippedLevels) {
      collector.observe('success', 'Heading hierarchy is logical and accessible', 'Structure', {
        severity: 'positive',
      });
      success = true;
      notes = `Good hierarchy: 1 H1, ${headings.length} total headings`;
    } else if (h1Count !== 1) {
      collector.observe('confusion', `Found ${h1Count} H1 elements (should be exactly 1)`, 'Structure', {
        severity: 'moderate',
        recommendation: 'Each page should have exactly one H1 element',
      });
      notes = `${h1Count} H1 elements found`;
      success = true;
    }

    if (hasSkippedLevels) {
      collector.observe('note', 'Heading levels skip (e.g., H2 to H4)', 'Structure', {
        recommendation: 'Maintain sequential heading levels for screen readers',
      });
      notes += '; Skipped heading levels';
    }

    collector.recordTask('Check heading hierarchy', success || headings.length > 0, notes || 'Headings analyzed');
  });

  test('verifies image alt text', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Check all images for alt text
    const imageAnalysis = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let withAlt = 0;
      let withoutAlt = 0;
      let decorative = 0;

      images.forEach((img) => {
        if (img.hasAttribute('alt')) {
          if (img.alt === '') {
            decorative++; // Empty alt = decorative, which is valid
          } else {
            withAlt++;
          }
        } else {
          withoutAlt++;
        }
      });

      return { total: images.length, withAlt, withoutAlt, decorative };
    });

    await collector.screenshot(
      page,
      '04-image-analysis',
      'Checking image accessibility'
    );

    if (imageAnalysis.total === 0) {
      collector.observe('success', 'No images on page - CSS-first design is accessibility-friendly', 'Images', {
        severity: 'positive',
      });
      success = true;
      notes = 'No images (CSS-based design)';
    } else if (imageAnalysis.withoutAlt === 0) {
      collector.observe('success', `All ${imageAnalysis.total} images have alt attributes`, 'Images', {
        severity: 'positive',
      });
      success = true;
      notes = `All ${imageAnalysis.total} images have alt text`;
    } else {
      collector.observe('frustration', `${imageAnalysis.withoutAlt} images missing alt text`, 'Images', {
        severity: 'critical',
        recommendation: 'Add descriptive alt text to all informative images',
      });
      notes = `${imageAnalysis.withoutAlt}/${imageAnalysis.total} images missing alt`;
    }

    collector.recordTask('Verify image alt text', success || imageAnalysis.total === 0, notes);
  });

  test('tests zoom at 200%', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Set viewport to simulate 200% zoom (half the pixels = 2x zoom effect)
    await page.setViewportSize({ width: 640, height: 400 });
    await page.waitForTimeout(500);

    await collector.screenshot(
      page,
      '05-zoom-200',
      'Testing page at 200% zoom level'
    );

    // Check for horizontal overflow at zoom
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Check if text is still readable (not truncated)
    const contentVisible = await page.evaluate(() => {
      const mainContent = document.querySelector('main, article, .content, body');
      return mainContent && mainContent.textContent && mainContent.textContent.length > 100;
    });

    if (!hasHorizontalScroll && contentVisible) {
      collector.observe('success', 'Page works well at 200% zoom - no horizontal scroll required', 'Zoom', {
        severity: 'positive',
      });
      success = true;
      notes = 'Good 200% zoom support';
    } else if (hasHorizontalScroll) {
      collector.observe('confusion', 'Horizontal scrolling required at 200% zoom', 'Zoom', {
        severity: 'moderate',
        recommendation: 'Ensure responsive design works at high zoom levels',
      });
      notes = 'Horizontal scroll at 200% zoom';
      success = true;
    }

    collector.recordTask('Test 200% zoom', success, notes || 'Zoom tested');
  });

  test('checks skip link and landmarks', async ({ page }) => {
    collector.startTask();
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Check for skip link
    const hasSkipLink = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        const text = link.textContent?.toLowerCase() || '';
        const href = link.getAttribute('href') || '';
        if (text.includes('skip') || href.includes('#main') || href.includes('#content')) {
          return true;
        }
      }
      return false;
    });

    // Check for ARIA landmarks
    const landmarks = await page.evaluate(() => {
      const main = document.querySelector('main, [role="main"]');
      const nav = document.querySelector('nav, [role="navigation"]');
      const header = document.querySelector('header, [role="banner"]');
      const footer = document.querySelector('footer, [role="contentinfo"]');

      return {
        hasMain: !!main,
        hasNav: !!nav,
        hasHeader: !!header,
        hasFooter: !!footer,
      };
    });

    await collector.screenshot(
      page,
      '06-landmarks',
      'Checking ARIA landmarks and skip links'
    );

    const landmarkCount = Object.values(landmarks).filter(Boolean).length;

    if (landmarkCount >= 3) {
      collector.observe('success', `Good landmark structure: ${landmarkCount}/4 landmarks present`, 'Landmarks', {
        severity: 'positive',
      });
      notes = `${landmarkCount} landmarks found`;
    } else {
      collector.observe('note', `Only ${landmarkCount}/4 landmarks present`, 'Landmarks', {
        recommendation: 'Add semantic HTML5 elements (main, nav, header, footer) for better screen reader navigation',
      });
      notes = `${landmarkCount} landmarks (could improve)`;
    }

    if (hasSkipLink) {
      collector.observe('success', 'Skip link present for keyboard users', 'Navigation', {
        severity: 'positive',
      });
      notes += '; Skip link found';
    } else {
      collector.observe('note', 'No skip link found', 'Navigation', {
        recommendation: 'Add a "Skip to main content" link for keyboard users',
      });
      notes += '; No skip link';
    }

    collector.recordTask('Check landmarks and skip links', true, notes);
  });

  test('overall accessibility assessment', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Check color contrast (basic check via computed styles)
    const contrastCheck = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      return { bgColor, textColor };
    });

    featureNotes.push(`Colors: ${contrastCheck.textColor} on ${contrastCheck.bgColor}`);

    // Check for reduced motion support
    const hasReducedMotion = await page.evaluate(() => {
      const styles = document.querySelectorAll('style');
      for (const style of styles) {
        if (style.textContent?.includes('prefers-reduced-motion')) {
          return true;
        }
      }
      return false;
    });

    if (hasReducedMotion) {
      collector.observe('success', 'Respects prefers-reduced-motion preference', 'Motion', {
        severity: 'positive',
      });
      featureNotes.push('Reduced motion supported');
    }

    await collector.screenshot(
      page,
      '07-final-assessment',
      'Final accessibility assessment'
    );

    // Overall assessment
    const observations = collector.getObservations();
    const successes = observations.filter((o) => o.type === 'success').length;
    const frustrations = observations.filter((o) => o.type === 'frustration').length;
    const confusions = observations.filter((o) => o.type === 'confusion').length;

    if (frustrations === 0 && successes >= 3) {
      collector.observe('success', 'Site demonstrates good accessibility practices', 'Overall');
    } else if (frustrations > 0) {
      collector.observe('note', `Found ${frustrations} critical accessibility issues`, 'Overall');
    }

    featureNotes.push(`Total: ${observations.length} observations`);
    featureNotes.push(`Successes: ${successes}, Issues: ${frustrations + confusions}`);

    collector.recordTask('Overall accessibility assessment', true, featureNotes.join('; '));
  });
});
