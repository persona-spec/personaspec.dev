/**
 * PersonaSpec - Persona-driven Playwright testing with AI vision analysis
 *
 * @packageDocumentation
 */

// Core class
export { ObservationCollector } from './core/ObservationCollector.js';

// Helper functions
export { definePersona, personaTemplates } from './core/helpers.js';

// Types
export type {
  ObservationType,
  ObservationSeverity,
  Observation,
  Screenshot,
  TaskResult,
  SessionMetrics,
  PersonaDefinition,
  PersonaTestResults,
  TestSummary,
  CollectorConfig,
} from './core/types.js';
