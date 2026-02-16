/**
 * David - VP Operations (Mobile) Persona Test
 *
 * Executive at a growing SaaS company. Heard from sales team that prospects
 * are asking about SOC2. Browsing on phone during commute to understand options.
 * Tests mobile viewport specifically.
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
  name: 'David',
  role: 'VP of Operations (Mobile)',
  background:
    'Executive at a growing SaaS company. Heard from sales team that prospects are asking about SOC2. Browsing on phone during commute to understand options.',
  goals: [
    'Quickly understand what this site offers',
    'Determine if it looks legitimate',
    'Decide if worth deeper investigation later',
    'Maybe bookmark for team to review',
  ],
  behaviors: [
    'Scrolls quickly through content',
    'Reads only headlines and key points',
    'Taps around to explore structure',
    'Low patience for poor mobile experience',
  ],
  // Phase 1: Human-scale timing - impatient mobile user
  interactionPatterns: interactionPatternDefaults.impatient,
  // Phase 2: Starting emotional state - neutral, moderate urgency
  emotionalBaseline: emotionalBaselineDefaults.neutral,
  // Phase 3: Cognitive profile - scanner, high distraction
  cognition: {
    ...cognitionDefaults.scanner,
    focusDuration: 3, // Very short attention span on mobile
  },
  // Phase 4: Prior experience shapes expectations
  priorExperience: {
    referenceProducts: ['LinkedIn mobile', 'HBR mobile', 'Notion mobile'],
    expectedPatterns: ['Responsive design', 'Readable headlines', 'Clear navigation'],
    delighters: ['Fast loading', 'No horizontal scroll', 'Touch-friendly'],
    petPeeves: ['Tiny text', 'Horizontal scrolling', 'Popups on mobile', 'Slow loading'],
  },
  // Phase 5: Session context
  sessionContext: {
    isReturning: false,
    distractionLevel: 'high', // Commuting
    timeContext: 'morning-fresh',
  },
});

test.setTimeout(60000);

const collector = new ObservationCollector({
  outputDir: path.join(__dirname, '../../test-results/david-vp-mobile'),
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

  test('page loads and is readable on mobile', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    // Viewport is set by playwright config (Pixel 5: 393x851)
    await page.goto('/');
    collector.trackPageLoad();

    await collector.screenshot(
      page,
      '01-mobile-homepage',
      'David arrives on mobile during commute'
    );

    // Check for horizontal overflow (bad mobile experience)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (!hasHorizontalScroll) {
      collector.observe('success', 'No horizontal scrolling required - mobile-friendly', 'Layout', {
        severity: 'positive',
      });
      success = true;
      notes = 'No horizontal scroll';
    } else {
      collector.observe('frustration', 'Horizontal scrolling required - poor mobile UX', 'Layout', {
        severity: 'critical',
        recommendation: 'Fix responsive design to prevent horizontal overflow',
      });
      notes = 'Has horizontal scroll - poor mobile UX';
    }

    // Check headline readability
    const headline = page.locator('h1').first();
    if (await headline.isVisible({ timeout: 2000 }).catch(() => false)) {
      const fontSize = await headline.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });

      if (fontSize >= 20) {
        collector.observe('success', 'Headline readable on mobile - good font size', 'Typography', {
          severity: 'positive',
        });
        success = true;
        notes += '; Headline readable';
      }
    }

    await collector.screenshot(
      page,
      '02-mobile-layout',
      'Checking mobile layout and readability'
    );

    collector.recordTask('Page loads and is readable', success, notes);
    expect(success).toBe(true);
  });

  test('navigation is accessible on mobile', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Look for mobile menu or visible nav
    const mobileMenu = page.locator('button[aria-label*="menu"], .menu-toggle, .hamburger, [aria-expanded]').first();
    const visibleNav = page.locator('nav a').first();

    if (await mobileMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      collector.observe('success', 'Mobile menu available', 'Navigation', {
        severity: 'positive',
      });
      success = true;
      notes = 'Mobile menu present';

      // Try to open it
      await mobileMenu.click();
      collector.trackClick();
      await page.waitForTimeout(500);

      await collector.screenshot(
        page,
        '03-mobile-menu-open',
        'Mobile navigation menu opened'
      );
    } else if (await visibleNav.isVisible({ timeout: 2000 }).catch(() => false)) {
      collector.observe('success', 'Navigation links visible on mobile', 'Navigation', {
        severity: 'positive',
      });
      success = true;
      notes = 'Nav links visible';
    } else {
      collector.observe('frustration', 'Navigation not easily accessible', 'Navigation', {
        severity: 'moderate',
        recommendation: 'Ensure navigation is accessible on mobile viewports',
      });
      notes = 'Navigation access unclear';
    }

    await collector.screenshot(
      page,
      '04-mobile-nav',
      'Checking mobile navigation accessibility'
    );

    collector.recordTask('Navigation accessible', success, notes);
  });

  test('can scroll and read key content', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';

    await page.goto('/');
    collector.trackPageLoad();

    // Scroll down like a mobile user
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);

    await collector.screenshot(
      page,
      '05-mobile-scroll-1',
      'Scrolling through content on mobile'
    );

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);

    // Check if content is readable during scroll
    const bodyText = await page.textContent('body');

    if (bodyText && bodyText.length > 100) {
      collector.observe('success', 'Content readable while scrolling', 'Content', {
        severity: 'positive',
      });
      success = true;
      notes = 'Content readable on scroll';
    }

    // Check for key terms David would care about
    if (bodyText?.toLowerCase().includes('soc2') || bodyText?.toLowerCase().includes('soc 2')) {
      collector.observe('success', 'SOC2 content visible on mobile', 'Content', {
        severity: 'positive',
      });
      notes += '; SOC2 visible';
    }

    if (bodyText?.toLowerCase().includes('free') || bodyText?.toLowerCase().includes('open source')) {
      collector.observe('success', 'Value proposition (free/open source) visible', 'Content', {
        severity: 'positive',
      });
      notes += '; Value prop visible';
    }

    await collector.screenshot(
      page,
      '06-mobile-scroll-2',
      'Further scrolling through mobile content'
    );

    success = true;
    collector.recordTask('Scroll and read content', success, notes || 'Content accessible');
  });

  test('quick assessment of legitimacy', async ({ page }) => {
    collector.startTask();
    let success = false;
    let notes = '';
    let legitimacyScore = 0;

    await page.goto('/');
    collector.trackPageLoad();

    const pageContent = await page.textContent('body');

    // Check for trust signals David would notice
    if (pageContent?.toLowerCase().includes('github')) {
      legitimacyScore++;
      notes = 'GitHub presence';
    }

    if (pageContent?.toLowerCase().includes('open source') || pageContent?.toLowerCase().includes('free')) {
      legitimacyScore++;
      notes += '; Open source/free';
    }

    if (pageContent?.toLowerCase().includes('ciso') || pageContent?.toLowerCase().includes('security')) {
      legitimacyScore++;
      notes += '; Security credentials';
    }

    // Check for professional appearance
    const hasLogo = await page.locator('header img, .logo, nav a:first-child').first().isVisible({ timeout: 1000 }).catch(() => false);
    if (hasLogo) {
      legitimacyScore++;
      notes += '; Professional branding';
    }

    await collector.screenshot(
      page,
      '07-legitimacy-check',
      'Quick legitimacy assessment on mobile'
    );

    if (legitimacyScore >= 2) {
      collector.observe('success', 'Site appears legitimate on quick mobile scan', 'Overall', {
        severity: 'positive',
      });
      success = true;
    } else {
      collector.observe('note', 'Limited trust signals visible on mobile', 'Overall', {
        recommendation: 'Add clear trust signals above the fold for mobile users',
      });
      success = true; // Not a failure, just an observation
    }

    collector.recordTask('Quick legitimacy assessment', success, notes || 'Assessment complete');
  });

  test('overall mobile experience assessment', async ({ page }) => {
    collector.startTask();
    const featureNotes: string[] = [];

    await page.goto('/');
    collector.trackPageLoad();

    // Final scroll through
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check tap target sizes
    const links = page.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();
      const box = await firstLink.boundingBox();
      if (box && box.height >= 44 && box.width >= 44) {
        collector.observe('success', 'Touch targets appear adequately sized', 'Accessibility', {
          severity: 'positive',
        });
        featureNotes.push('Good tap targets');
      } else if (box) {
        collector.observe('note', 'Some tap targets may be small for mobile touch', 'Accessibility', {
          recommendation: 'Ensure all interactive elements are at least 44x44 pixels',
        });
        featureNotes.push('Small tap targets');
      }
    }

    await collector.screenshot(
      page,
      '08-mobile-final',
      'Final mobile experience assessment'
    );

    // Overall assessment
    const observations = collector.getObservations();
    const successes = observations.filter((o) => o.type === 'success').length;
    const frustrations = observations.filter((o) => o.type === 'frustration').length;

    if (frustrations === 0 && successes >= 3) {
      collector.observe('success', 'Good mobile experience - worth sharing with team', 'Overall');
    } else if (frustrations > 0) {
      collector.observe('note', 'Mobile experience needs improvement', 'Overall');
    }

    featureNotes.push(`Total observations: ${observations.length}`);
    featureNotes.push(`Successes: ${successes}, Frustrations: ${frustrations}`);
    featureNotes.push(`Viewport: ${await page.viewportSize()?.width}x${await page.viewportSize()?.height}`);

    collector.recordTask('Mobile experience assessment', true, featureNotes.join('; '));
  });
});
