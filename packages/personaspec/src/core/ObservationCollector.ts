import type { Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type {
  CollectorConfig,
  Observation,
  ObservationType,
  ObservationSeverity,
  ObservationContext,
  PersonaTestResults,
  Screenshot,
  SessionMetrics,
  TaskResult,
  TestMode,
  EmotionalJourneyEntry,
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
 *     interactionPatterns: interactionPatternDefaults.careful,
 *   }),
 *   mode: 'validation', // Enforce human-scale timing
 * });
 *
 * // In your test
 * await collector.beforeAction('click'); // Enforces timing in validation mode
 * await collector.screenshot(page, 'homepage', 'First view of the site');
 * collector.observe('success', 'Clear headline', 'Homepage hero');
 * collector.recordTask('Understand purpose', true, 'Headline was clear');
 * collector.afterAction(); // Record timing for next action
 *
 * // After all tests
 * await collector.save();
 * ```
 */
export class ObservationCollector {
  private config: Required<Pick<CollectorConfig, 'outputDir' | 'persona' | 'includeBase64' | 'screenshotFormat'>> & {
    mode: TestMode;
  };
  private observations: Observation[] = [];
  private screenshots: Screenshot[] = [];
  private tasks: TaskResult[] = [];
  private metrics: SessionMetrics;
  private currentTaskStart?: number;

  // Timing and emotional state tracking
  private lastActionTime: number = Date.now();
  private currentFrustration: number;
  private currentConfidence: number = 100;
  private actionSequence: string[] = [];
  private emotionalJourney: EmotionalJourneyEntry[] = [];

  constructor(config: CollectorConfig) {
    this.config = {
      includeBase64: true,
      screenshotFormat: 'png',
      mode: 'exploration',
      ...config,
    };

    // Initialize emotional state from persona baseline
    this.currentFrustration = config.persona.emotionalBaseline?.frustrationLevel ?? 30;
    this.currentConfidence = 100 - this.currentFrustration;

    // Record initial emotional state
    this.emotionalJourney.push({
      timestamp: new Date().toISOString(),
      frustration: this.currentFrustration,
      confidence: this.currentConfidence,
      trigger: 'session-start',
    });

    this.metrics = {
      startTime: new Date().toISOString(),
      pagesVisited: 0,
      clickCount: 0,
      searchCount: 0,
      backNavCount: 0,
      consoleErrors: [],
      emotionalJourney: this.emotionalJourney,
    };
  }

  /**
   * Enforce human-scale delay before action (validation mode only).
   * In exploration mode, this is a no-op.
   *
   * @param actionType - The type of action about to be performed
   */
  async beforeAction(actionType: 'click' | 'type' | 'navigate' | 'scroll' | 'retry'): Promise<void> {
    if (this.config.mode !== 'validation') {
      this.actionSequence.push(actionType);
      return;
    }

    const patterns = this.config.persona.interactionPatterns;
    if (!patterns) {
      this.actionSequence.push(actionType);
      return;
    }

    const elapsed = Date.now() - this.lastActionTime;

    let minDelay: number;
    if (actionType === 'retry') {
      minDelay = patterns.retryDelay?.min ?? 2000;
    } else {
      minDelay = patterns.scanTime?.min ?? 1000;
    }

    if (elapsed < minDelay) {
      await this.delay(minDelay - elapsed);
    }

    this.actionSequence.push(actionType);
  }

  /**
   * Record action completion and update timing.
   * Call this after each user action to maintain accurate timing.
   */
  afterAction(): void {
    this.lastActionTime = Date.now();
  }

  /**
   * Process an outcome and update emotional state.
   * Frustration compounds on failures based on persona's escalation rate.
   *
   * @param success - Whether the action succeeded
   * @param significance - How significant this outcome is
   * @param trigger - What caused this outcome
   */
  processOutcome(
    success: boolean,
    significance: 'minor' | 'moderate' | 'major',
    trigger?: string
  ): void {
    const escalation = this.config.persona.emotionalBaseline?.frustrationEscalation ?? 'moderate';
    const rate = { volatile: 2, moderate: 1, patient: 0.5 }[escalation];
    const significanceMultiplier = { minor: 1, moderate: 2, major: 3 }[significance];

    if (!success) {
      // Frustration COMPOUNDS - each failure hurts more
      const increase = 15 * significanceMultiplier * rate;
      this.currentFrustration = Math.min(100, this.currentFrustration + increase);
      this.currentConfidence = Math.max(0, this.currentConfidence - increase * 0.5);
    } else {
      // Success provides relief
      const relief = 5 * significanceMultiplier;
      this.currentFrustration = Math.max(0, this.currentFrustration - relief);
      this.currentConfidence = Math.min(100, this.currentConfidence + relief * 0.5);
    }

    // Record emotional state change
    this.emotionalJourney.push({
      timestamp: new Date().toISOString(),
      frustration: this.currentFrustration,
      confidence: this.currentConfidence,
      trigger: trigger ?? (success ? 'success' : 'failure'),
    });

    // Check abandonment threshold
    if (this.currentFrustration > 80) {
      this.observe(
        'frustration',
        'Persona would likely abandon at this point',
        'Overall',
        {
          severity: 'critical',
          recommendation: 'Critical friction point - user likely to give up',
        }
      );
    }
  }

  /**
   * Get current emotional state.
   */
  getEmotionalState(): { frustration: number; confidence: number } {
    return {
      frustration: this.currentFrustration,
      confidence: this.currentConfidence,
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
   * @param type - Observation type (success, note, confusion, frustration, etc.)
   * @param description - What was observed
   * @param location - Where in the app (e.g., "Homepage hero", "Settings page")
   * @param options - Optional severity, recommendation, and context overrides
   */
  observe(
    type: ObservationType,
    description: string,
    location: string,
    options?: {
      severity?: ObservationSeverity;
      recommendation?: string;
      context?: Partial<ObservationContext>;
    }
  ): void {
    const timeSinceLastAction = Date.now() - this.lastActionTime;
    const patterns = this.config.persona.interactionPatterns;

    // Determine if this observation is human-realistic
    const humanRealistic =
      this.config.mode === 'validation' ||
      (patterns && timeSinceLastAction >= (patterns.scanTime?.min ?? 0));

    const context: ObservationContext = {
      triggerSequence: [...this.actionSequence],
      timeSinceLastAction,
      humanRealistic,
      source: 'programmatic',
      emotionalState: {
        frustration: this.currentFrustration,
        confidence: this.currentConfidence,
      },
      ...options?.context,
    };

    this.observations.push({
      type,
      description,
      location,
      timestamp: new Date().toISOString(),
      severity: options?.severity,
      recommendation: options?.recommendation,
      context,
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

    // Update emotional state based on task outcome
    this.processOutcome(success, 'moderate', `task: ${name}`);

    return result;
  }

  /**
   * Track a page load/navigation event.
   */
  trackPageLoad(): void {
    this.metrics.pagesVisited++;
    this.actionSequence.push('navigate');
    this.afterAction();
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
    this.actionSequence.push('search');
  }

  /**
   * Track back navigation. High counts may indicate user confusion.
   */
  trackBackNav(): void {
    this.metrics.backNavCount++;
    this.actionSequence.push('back');
    // Back navigation suggests confusion
    this.processOutcome(false, 'minor', 'back-navigation');
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
    this.metrics.emotionalJourney = this.emotionalJourney;

    const results: PersonaTestResults = {
      persona: `${this.config.persona.name} - ${this.config.persona.role}`,
      background: this.config.persona.background,
      goals: this.config.persona.goals,
      behaviors: this.config.persona.behaviors,
      session: this.metrics,
      tasks: this.tasks,
      observations: this.observations,
      screenshots: this.screenshots,
      personaDefinition: this.config.persona,
      testMode: this.config.mode,
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
    return { ...this.metrics, emotionalJourney: [...this.emotionalJourney] };
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
   * Get the current test mode.
   */
  getMode(): TestMode {
    return this.config.mode;
  }

  /**
   * Reset the collector for a new test run (keeps persona, clears data).
   */
  reset(): void {
    this.observations = [];
    this.screenshots = [];
    this.tasks = [];
    this.currentTaskStart = undefined;
    this.lastActionTime = Date.now();
    this.actionSequence = [];

    // Reset emotional state to baseline
    this.currentFrustration = this.config.persona.emotionalBaseline?.frustrationLevel ?? 30;
    this.currentConfidence = 100 - this.currentFrustration;

    this.emotionalJourney = [{
      timestamp: new Date().toISOString(),
      frustration: this.currentFrustration,
      confidence: this.currentConfidence,
      trigger: 'session-reset',
    }];

    this.metrics = {
      startTime: new Date().toISOString(),
      pagesVisited: 0,
      clickCount: 0,
      searchCount: 0,
      backNavCount: 0,
      consoleErrors: [],
      emotionalJourney: this.emotionalJourney,
    };
  }

  /**
   * Delay execution for the specified duration.
   * Used internally to enforce human-scale timing.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
