import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html'], ['list']],
  timeout: 60000,

  use: {
    baseURL: 'https://openaccesspolicies.org',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  projects: [
    // Carlos - Startup CTO (impatient, SOC2 urgency)
    {
      name: 'carlos-startup-cto',
      testMatch: /carlos-startup-cto\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Priya - Healthcare Compliance Officer (careful, HIPAA/HITRUST)
    {
      name: 'priya-healthcare-compliance',
      testMatch: /priya-healthcare-compliance\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Michael - External SOC2 Auditor (skeptical, verification)
    {
      name: 'michael-external-auditor',
      testMatch: /michael-external-auditor\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Sarah - Security Engineer (expert, GitHub-focused)
    {
      name: 'sarah-security-engineer',
      testMatch: /sarah-security-engineer\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // David - VP Operations (mobile viewport, quick assessment)
    {
      name: 'david-vp-mobile',
      testMatch: /david-vp-mobile\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
      },
    },

    // Jordan - Accessibility Auditor (keyboard-only, WCAG testing)
    {
      name: 'jordan-accessibility-auditor',
      testMatch: /jordan-accessibility-auditor\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Taylor - Junior GRC Analyst (exploratory, learning)
    {
      name: 'taylor-junior-grc-analyst',
      testMatch: /taylor-junior-grc-analyst\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Robert - Board Member (tablet viewport, quick due diligence)
    {
      name: 'robert-board-member-tablet',
      testMatch: /robert-board-member-tablet\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 }, // iPad-sized viewport
      },
    },
  ],

  outputDir: './test-results',
});
