/**
 * PersonaSpec - Persona-driven Playwright testing with AI vision analysis
 *
 * @packageDocumentation
 */

// Core class
export { ObservationCollector } from './core/ObservationCollector.js';

// Helper functions and defaults
export {
  definePersona,
  personaTemplates,
  interactionPatternDefaults,
  emotionalBaselineDefaults,
  cognitionDefaults,
} from './core/helpers.js';

// Types
export type {
  // Observation types
  ObservationType,
  ObservationSeverity,
  ObservationContext,
  Observation,

  // Screenshot and task types
  Screenshot,
  TaskResult,

  // Session types
  SessionMetrics,
  EmotionalJourneyEntry,
  TestMode,

  // Persona definition types
  PersonaDefinition,
  InteractionPatterns,
  EmotionalBaseline,
  FrustrationEscalation,
  TrustLevel,
  UrgencyLevel,
  CognitionProfile,
  ReadingSpeed,
  DecisionStyle,
  UncertaintyResponse,
  ScanPattern,
  PriorExperience,
  SessionContext,
  TimeContext,
  DistractionLevel,

  // Results types
  PersonaTestResults,
  TestSummary,
  CollectorConfig,
} from './core/types.js';
