/**
 * The four observation types from the PersonaSpec methodology.
 * Each represents a different category of feedback during testing.
 */
export type ObservationType = 'success' | 'note' | 'confusion' | 'frustration';

/**
 * Severity levels for observations.
 */
export type ObservationSeverity = 'positive' | 'minor' | 'moderate' | 'critical';

/**
 * A single observation recorded during testing.
 */
export interface Observation {
  /** The type of observation */
  type: ObservationType;
  /** Description of what was observed */
  description: string;
  /** Where in the app this was observed */
  location: string;
  /** When this observation was recorded */
  timestamp: string;
  /** Optional severity level */
  severity?: ObservationSeverity;
  /** Optional recommendation for improvement */
  recommendation?: string;
}

/**
 * A screenshot captured during testing.
 */
export interface Screenshot {
  /** Descriptive name for the screenshot */
  name: string;
  /** Context explaining what the user was doing/seeing */
  context: string;
  /** URL of the page when screenshot was taken */
  url: string;
  /** Title of the page */
  pageTitle: string;
  /** Path to the screenshot file on disk */
  filepath: string;
  /** Base64-encoded image data for AI analysis */
  base64: string;
  /** When the screenshot was captured */
  timestamp: string;
}

/**
 * Result of a single task test.
 */
export interface TaskResult {
  /** Name of the task */
  name: string;
  /** Whether the task was completed successfully */
  success: boolean;
  /** Time taken to complete in milliseconds */
  duration: number;
  /** Notes about the task execution */
  notes: string;
}

/**
 * Session metrics tracked during the test run.
 */
export interface SessionMetrics {
  /** When the session started (ISO timestamp) */
  startTime: string;
  /** When the session ended (ISO timestamp) */
  endTime?: string;
  /** Number of page loads/navigations */
  pagesVisited: number;
  /** Number of click interactions */
  clickCount: number;
  /** Number of search actions */
  searchCount: number;
  /** Number of back navigations (high counts may indicate confusion) */
  backNavCount: number;
  /** Console errors encountered */
  consoleErrors: string[];
  /** Viewports tested (if multiple) */
  viewportsTested?: string[];
  /** Total screenshots captured */
  screenshotsCaptured?: number;
}

/**
 * Complete persona definition with the 4 required attributes.
 */
export interface PersonaDefinition {
  /** The persona's name (e.g., "Alex") */
  name: string;
  /** The persona's role (e.g., "First-Time Visitor") */
  role: string;
  /** Background context about the persona */
  background: string;
  /** What the persona wants to accomplish */
  goals: string[];
  /** How the persona typically interacts with software */
  behaviors: string[];
}

/**
 * Summary of test results for reporting.
 */
export interface TestSummary {
  /** Overall score (e.g., "A", "B+", "C") */
  overallScore?: string;
  /** Things that worked well */
  strengths: string[];
  /** Areas that need improvement */
  areasForImprovement: string[];
  /** Count of critical issues found */
  criticalIssues: number;
  /** Count of moderate issues found */
  moderateIssues: number;
  /** Count of minor issues found */
  minorIssues: number;
}

/**
 * Complete output structure saved to JSON after a persona test run.
 */
export interface PersonaTestResults {
  /** Persona name and role */
  persona: string;
  /** Persona background */
  background: string;
  /** Persona goals */
  goals: string[];
  /** Persona behaviors */
  behaviors: string[];
  /** Session metrics */
  session: SessionMetrics;
  /** Task results */
  tasks: TaskResult[];
  /** Observations collected during testing */
  observations: Observation[];
  /** Screenshots captured */
  screenshots: Screenshot[];
  /** Optional summary (populated after AI analysis) */
  summary?: TestSummary;
}

/**
 * Configuration options for the ObservationCollector.
 */
export interface CollectorConfig {
  /** Directory to save results and screenshots */
  outputDir: string;
  /** The persona being tested */
  persona: PersonaDefinition;
  /** Whether to include base64 data in output (default: true) */
  includeBase64?: boolean;
  /** Screenshot format (default: 'png') */
  screenshotFormat?: 'png' | 'jpeg';
}
