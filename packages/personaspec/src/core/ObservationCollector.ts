import type { Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type {
  CollectorConfig,
  Observation,
  ObservationType,
  ObservationSeverity,
  PersonaTestResults,
  Screenshot,
  SessionMetrics,
  TaskResult,
} from './types.js';

/**
 * Collects observations, screenshots, and metrics during persona-driven tests.
 *
 * @example
 * ```typescript
 * const collector = new ObservationCollector({
 *   outputDir: './test-results',
 *   persona: definePersona({
 *     name: 'Alex',
 *     role: 'First-Time Visitor',
 *     background: 'New to the site',
 *     goals: ['Understand the product'],
 *     behaviors: ['Skims headings'],
 *   }),
 * });
 *
 * // In your test
 * await collector.screenshot(page, 'homepage', 'First view of the site');
 * collector.observe('success', 'Clear headline', 'Homepage hero');
 * collector.recordTask('Understand purpose', true, 'Headline was clear');
 *
 * // After all tests
 * await collector.save();
 * ```
 */
export class ObservationCollector {
  private config: Required<CollectorConfig>;
  private observations: Observation[] = [];
  private screenshots: Screenshot[] = [];
  private tasks: TaskResult[] = [];
  private metrics: SessionMetrics;
  private currentTaskStart?: number;

  constructor(config: CollectorConfig) {
    this.config = {
      includeBase64: true,
      screenshotFormat: 'png',
      ...config,
    };

    this.metrics = {
      startTime: new Date().toISOString(),
      pagesVisited: 0,
      clickCount: 0,
      searchCount: 0,
      backNavCount: 0,
      consoleErrors: [],
    };
  }

  /**
   * Capture a screenshot with context for AI analysis.
   *
   * @param page - Playwright page object
   * @param name - Descriptive name for the screenshot (used in filename)
   * @param context - Explanation of what the user was doing/seeing
   * @returns The captured screenshot metadata
   */
  async screenshot(page: Page, name: string, context: string): Promise<Screenshot> {
    const timestamp = new Date().toISOString();
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-');
    const filename = `${safeName}-${Date.now()}.${this.config.screenshotFormat}`;
    const screenshotDir = path.join(this.config.outputDir, 'screenshots');
    const filepath = path.join(screenshotDir, filename);

    // Ensure directory exists
    await fs.mkdir(screenshotDir, { recursive: true });

    // Take screenshot
    const buffer = await page.screenshot({
      type: this.config.screenshotFormat,
      fullPage: false,
    });

    // Save to disk
    await fs.writeFile(filepath, buffer);

    const screenshot: Screenshot = {
      name,
      context,
      url: page.url(),
      pageTitle: await page.title(),
      filepath,
      base64: this.config.includeBase64 ? buffer.toString('base64') : '',
      timestamp,
    };

    this.screenshots.push(screenshot);
    return screenshot;
  }

  /**
   * Record an observation during testing.
   *
   * @param type - One of: 'success', 'note', 'confusion', 'frustration'
   * @param description - What was observed
   * @param location - Where in the app (e.g., "Homepage hero", "Settings page")
   * @param options - Optional severity and recommendation
   */
  observe(
    type: ObservationType,
    description: string,
    location: string,
    options?: { severity?: ObservationSeverity; recommendation?: string }
  ): void {
    this.observations.push({
      type,
      description,
      location,
      timestamp: new Date().toISOString(),
      ...options,
    });
  }

  /**
   * Start timing a task. Call this at the beginning of each task test.
   */
  startTask(): void {
    this.currentTaskStart = Date.now();
  }

  /**
   * Record a completed task with its results.
   *
   * @param name - Name of the task (should match test name)
   * @param success - Whether the task was completed successfully
   * @param notes - Notes about the task execution
   * @returns The recorded task result
   */
  recordTask(name: string, success: boolean, notes: string): TaskResult {
    const duration = this.currentTaskStart ? Date.now() - this.currentTaskStart : 0;

    const result: TaskResult = { name, success, duration, notes };
    this.tasks.push(result);
    this.currentTaskStart = undefined;
    return result;
  }

  /**
   * Track a page load/navigation event.
   */
  trackPageLoad(): void {
    this.metrics.pagesVisited++;
  }

  /**
   * Track a click interaction.
   */
  trackClick(): void {
    this.metrics.clickCount++;
  }

  /**
   * Track a search action.
   */
  trackSearch(): void {
    this.metrics.searchCount++;
  }

  /**
   * Track back navigation. High counts may indicate user confusion.
   */
  trackBackNav(): void {
    this.metrics.backNavCount++;
  }

  /**
   * Add a console error to the session log.
   *
   * @param message - The error message from the console
   */
  addConsoleError(message: string): void {
    this.metrics.consoleErrors.push(message);
  }

  /**
   * Save all collected data to a JSON file.
   *
   * @returns Path to the saved JSON file
   */
  async save(): Promise<string> {
    this.metrics.endTime = new Date().toISOString();
    this.metrics.screenshotsCaptured = this.screenshots.length;

    const results: PersonaTestResults = {
      persona: `${this.config.persona.name} - ${this.config.persona.role}`,
      background: this.config.persona.background,
      goals: this.config.persona.goals,
      behaviors: this.config.persona.behaviors,
      session: this.metrics,
      tasks: this.tasks,
      observations: this.observations,
      screenshots: this.screenshots,
    };

    const safeName = this.config.persona.name.toLowerCase().replace(/\s+/g, '-');
    const filename = `${safeName}-observations.json`;
    const filepath = path.join(this.config.outputDir, filename);

    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));

    return filepath;
  }

  /**
   * Get current observations (useful for debugging or mid-test assertions).
   */
  getObservations(): Observation[] {
    return [...this.observations];
  }

  /**
   * Get current metrics (useful for debugging or mid-test assertions).
   */
  getMetrics(): SessionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current tasks (useful for debugging or mid-test assertions).
   */
  getTasks(): TaskResult[] {
    return [...this.tasks];
  }

  /**
   * Get the persona being tested.
   */
  getPersona() {
    return { ...this.config.persona };
  }

  /**
   * Reset the collector for a new test run (keeps persona, clears data).
   */
  reset(): void {
    this.observations = [];
    this.screenshots = [];
    this.tasks = [];
    this.currentTaskStart = undefined;
    this.metrics = {
      startTime: new Date().toISOString(),
      pagesVisited: 0,
      clickCount: 0,
      searchCount: 0,
      backNavCount: 0,
      consoleErrors: [],
    };
  }
}
