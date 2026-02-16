/**
 * The observation types from the PersonaSpec methodology.
 * Each represents a different category of feedback during testing.
 */
export type ObservationType =
  | 'success' // Task completed successfully
  | 'note' // Neutral observation
  | 'confusion' // User would be confused
  | 'frustration' // User would be frustrated
  | 'noticed' // Element entered visual attention
  | 'overlooked' // Element on screen but not noticed
  | 'relief' // Tension released
  | 'delight' // Exceeded expectations
  | 'disappointment' // Failed to meet expectations
  | 'better-than-expected' // Compares favorably to reference
  | 'worse-than-expected' // Compares unfavorably
  | 'familiar-pattern' // Recognized expected UX
  | 'unexpected-pattern'; // Pattern violated expectations

/**
 * Severity levels for observations.
 */
export type ObservationSeverity = 'positive' | 'minor' | 'moderate' | 'critical';

/**
 * Test execution mode.
 * - 'exploration': Fast, finds edge cases, includes test artifacts
 * - 'validation': Human-paced, confirms only realistic issues
 */
export type TestMode = 'exploration' | 'validation';

/**
 * Causal and timing context for an observation.
 */
export interface ObservationContext {
  /** What action sequence led to this observation */
  triggerSequence?: string[];
  /** Time since last user action (ms) */
  timeSinceLastAction?: number;
  /** Would this occur under human-realistic timing? */
  humanRealistic?: boolean;
  /** Source of the observation */
  source: 'programmatic' | 'ai-inferred' | 'manual';
  /** If ai-inferred, what evidence was used */
  inferenceEvidence?: string;
  /** Emotional state at time of observation */
  emotionalState?: {
    frustration: number;
    confidence: number;
  };
}

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
  /** Causal and timing context */
  context?: ObservationContext;
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
 * Emotional journey entry tracked during the test run.
 */
export interface EmotionalJourneyEntry {
  /** When this state was recorded */
  timestamp: string;
  /** Current frustration level (0-100) */
  frustration: number;
  /** Current confidence level (0-100) */
  confidence: number;
  /** What caused this change */
  trigger?: string;
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
  /** Emotional state changes over time */
  emotionalJourney?: EmotionalJourneyEntry[];
}

// ============================================================================
// Phase 1: Human-Scale Timing (Interaction Patterns)
// ============================================================================

/**
 * Physical interaction patterns - how this persona interacts at human scale.
 * Even frustrated users don't click 100x/second.
 */
export interface InteractionPatterns {
  /** Time spent scanning a page before acting (ms) */
  scanTime?: { min: number; max: number };
  /** Delay between repeated attempts (e.g., clicking retry) (ms) */
  retryDelay?: { min: number; max: number };
  /** Maximum retries before giving up */
  maxRetries?: number;
  /** Reading speed - time per 100 words (ms) */
  readingPace?: number;
  /** Typing speed - characters per minute */
  typingSpeed?: number;
}

// ============================================================================
// Phase 2: Emotional Journey (Emotional Baseline)
// ============================================================================

/**
 * How quickly frustration compounds on failures.
 */
export type FrustrationEscalation = 'volatile' | 'moderate' | 'patient';

/**
 * Trust level toward the product/company.
 */
export type TrustLevel = 'skeptical' | 'neutral' | 'trusting';

/**
 * Time pressure affecting patience.
 */
export type UrgencyLevel = 'relaxed' | 'moderate' | 'urgent' | 'crisis';

/**
 * Starting emotional state - affects frustration escalation.
 */
export interface EmotionalBaseline {
  /** Starting frustration level (0-100). Marcus starts at 60. */
  frustrationLevel: number;
  /** How quickly frustration compounds on failures */
  frustrationEscalation: FrustrationEscalation;
  /** Trust toward the product/company */
  trustLevel: TrustLevel;
  /** Time pressure affecting patience */
  urgency: UrgencyLevel;
}

// ============================================================================
// Phase 3: Discovery Simulation (Cognition)
// ============================================================================

/**
 * Reading speed categories.
 */
export type ReadingSpeed = 'slow' | 'average' | 'fast' | 'scanner';

/**
 * How they evaluate before acting.
 */
export type DecisionStyle = 'impulsive' | 'balanced' | 'deliberate' | 'anxious';

/**
 * How they handle ambiguity.
 */
export type UncertaintyResponse = 'explore' | 'seek-help' | 'abandon' | 'guess';

/**
 * Visual scan pattern.
 */
export type ScanPattern = 'f-pattern' | 'z-pattern' | 'center-first' | 'random';

/**
 * How this persona processes information.
 */
export interface CognitionProfile {
  /** Affects how long to wait before "seeing" content */
  readingSpeed: ReadingSpeed;
  /** How they evaluate before acting */
  decisionStyle: DecisionStyle;
  /** Attention span before fatigue (minutes) */
  focusDuration: number;
  /** How they handle ambiguity */
  uncertaintyResponse: UncertaintyResponse;
  /** Visual scan pattern */
  scanPattern: ScanPattern;
}

// ============================================================================
// Phase 4: Comparative Context (Prior Experience)
// ============================================================================

/**
 * Products/experiences that shape expectations.
 */
export interface PriorExperience {
  /** Products they've used (e.g., "Zendesk", "Intercom") */
  referenceProducts: string[];
  /** Patterns they expect based on experience */
  expectedPatterns: string[];
  /** Things that would pleasantly surprise them */
  delighters: string[];
  /** Things that trigger immediate frustration */
  petPeeves: string[];
}

// ============================================================================
// Phase 5: Memory & Session Context
// ============================================================================

/**
 * Time of day affecting energy/patience.
 */
export type TimeContext = 'morning-fresh' | 'midday-busy' | 'evening-tired';

/**
 * Environmental distraction level.
 */
export type DistractionLevel = 'none' | 'low' | 'moderate' | 'high';

/**
 * Context for this specific session.
 */
export interface SessionContext {
  /** Is this a returning user? */
  isReturning: boolean;
  /** What happened before this session? */
  priorActivity?: string;
  /** Environmental distractions */
  distractionLevel: DistractionLevel;
  /** Time of day (affects energy/patience) */
  timeContext?: TimeContext;
}

// ============================================================================
// Complete Persona Definition
// ============================================================================

/**
 * Complete persona definition with all focus-group fidelity attributes.
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

  // Phase 1: Human-Scale Timing
  /** Physical interaction patterns (human-scale timing) */
  interactionPatterns?: InteractionPatterns;

  // Phase 2: Emotional Journey
  /** Starting emotional state (affects frustration escalation) */
  emotionalBaseline?: EmotionalBaseline;

  // Phase 3: Discovery Simulation
  /** How this persona processes information */
  cognition?: CognitionProfile;

  // Phase 4: Comparative Context
  /** Products/experiences that shape expectations */
  priorExperience?: PriorExperience;

  // Phase 5: Memory & Session Context
  /** Context for this specific session */
  sessionContext?: SessionContext;
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
  /** Full persona definition including new attributes */
  personaDefinition?: PersonaDefinition;
  /** Test execution mode used */
  testMode?: TestMode;
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
  /** Test execution mode (default: 'exploration') */
  mode?: TestMode;
}
