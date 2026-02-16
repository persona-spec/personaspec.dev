import type {
  PersonaDefinition,
  InteractionPatterns,
  EmotionalBaseline,
  CognitionProfile,
  PriorExperience,
  SessionContext,
} from './types.js';

/**
 * Default interaction patterns for common persona types.
 * Use these as starting points when defining personas.
 *
 * IMPORTANT: Even frustrated/impatient users don't click at machine speed.
 * These values represent realistic human interaction timing.
 */
export const interactionPatternDefaults = {
  /**
   * Patient, methodical user - reads carefully, hesitant to act.
   * Examples: Sarah (first-time visitor), Alex (IT administrator)
   */
  careful: {
    scanTime: { min: 3000, max: 8000 },
    retryDelay: { min: 5000, max: 10000 },
    maxRetries: 2,
    readingPace: 4000,
    typingSpeed: 150,
  } satisfies InteractionPatterns,

  /**
   * Average user - moderate pacing.
   * Examples: Emma (returning customer)
   */
  normal: {
    scanTime: { min: 1500, max: 4000 },
    retryDelay: { min: 3000, max: 6000 },
    maxRetries: 3,
    readingPace: 3000,
    typingSpeed: 200,
  } satisfies InteractionPatterns,

  /**
   * Impatient but still human - faster but not machine-speed.
   * Examples: Marcus (frustrated customer)
   *
   * Key insight: Even Marcus clicks retry every 2-4 seconds, not 100x/second!
   */
  impatient: {
    scanTime: { min: 500, max: 2000 },
    retryDelay: { min: 2000, max: 4000 }, // Still 2-4 seconds between retries!
    maxRetries: 3,
    readingPace: 2000,
    typingSpeed: 300,
  } satisfies InteractionPatterns,

  /**
   * User learning a new interface - click, wait, observe, click again.
   * Examples: Priya (new support agent)
   */
  exploratory: {
    scanTime: { min: 2000, max: 5000 },
    retryDelay: { min: 3000, max: 8000 },
    maxRetries: 5, // More patient when learning
    readingPace: 3500,
    typingSpeed: 150,
  } satisfies InteractionPatterns,

  /**
   * Power user who knows the interface - fast but controlled.
   * Examples: David (power agent)
   *
   * Note: Fast means keyboard shortcuts, not API flooding!
   */
  expert: {
    scanTime: { min: 200, max: 1000 },
    retryDelay: { min: 1500, max: 3000 },
    maxRetries: 4,
    readingPace: 1500,
    typingSpeed: 400,
  } satisfies InteractionPatterns,

  /**
   * Periodic checker - long intervals between sessions.
   * Examples: Linda (team supervisor)
   */
  monitoring: {
    scanTime: { min: 1000, max: 3000 },
    retryDelay: { min: 5000, max: 15000 },
    maxRetries: 2,
    readingPace: 2500,
    typingSpeed: 200,
  } satisfies InteractionPatterns,
} as const;

/**
 * Default emotional baselines for common persona states.
 */
export const emotionalBaselineDefaults = {
  /**
   * Calm, patient user with low frustration threshold.
   */
  calm: {
    frustrationLevel: 10,
    frustrationEscalation: 'patient',
    trustLevel: 'trusting',
    urgency: 'relaxed',
  } satisfies EmotionalBaseline,

  /**
   * Neutral starting point - moderate everything.
   */
  neutral: {
    frustrationLevel: 30,
    frustrationEscalation: 'moderate',
    trustLevel: 'neutral',
    urgency: 'moderate',
  } satisfies EmotionalBaseline,

  /**
   * Already frustrated - volatile escalation.
   * Example: Marcus arriving after failed email attempts
   */
  frustrated: {
    frustrationLevel: 60,
    frustrationEscalation: 'volatile',
    trustLevel: 'skeptical',
    urgency: 'urgent',
  } satisfies EmotionalBaseline,

  /**
   * In crisis mode - maximum urgency.
   */
  crisis: {
    frustrationLevel: 80,
    frustrationEscalation: 'volatile',
    trustLevel: 'skeptical',
    urgency: 'crisis',
  } satisfies EmotionalBaseline,
} as const;

/**
 * Default cognition profiles for common user types.
 */
export const cognitionDefaults = {
  /**
   * Slow, careful reader who seeks help when confused.
   */
  careful: {
    readingSpeed: 'slow',
    decisionStyle: 'deliberate',
    focusDuration: 15,
    uncertaintyResponse: 'seek-help',
    scanPattern: 'f-pattern',
  } satisfies CognitionProfile,

  /**
   * Average reader with balanced decision-making.
   */
  balanced: {
    readingSpeed: 'average',
    decisionStyle: 'balanced',
    focusDuration: 10,
    uncertaintyResponse: 'explore',
    scanPattern: 'f-pattern',
  } satisfies CognitionProfile,

  /**
   * Scanner who acts impulsively and abandons when confused.
   */
  scanner: {
    readingSpeed: 'scanner',
    decisionStyle: 'impulsive',
    focusDuration: 5,
    uncertaintyResponse: 'abandon',
    scanPattern: 'center-first',
  } satisfies CognitionProfile,

  /**
   * Fast reader who guesses when unsure.
   */
  expert: {
    readingSpeed: 'fast',
    decisionStyle: 'impulsive',
    focusDuration: 60,
    uncertaintyResponse: 'guess',
    scanPattern: 'f-pattern',
  } satisfies CognitionProfile,

  /**
   * Methodical learner who explores deliberately.
   */
  learner: {
    readingSpeed: 'average',
    decisionStyle: 'deliberate',
    focusDuration: 20,
    uncertaintyResponse: 'explore',
    scanPattern: 'z-pattern',
  } satisfies CognitionProfile,
} as const;

/**
 * Create a well-formed persona definition with validation.
 *
 * @example
 * ```typescript
 * const persona = definePersona({
 *   name: 'Alex',
 *   role: 'Trial Evaluator',
 *   background: 'PM at a Series A startup, has 10 min between meetings',
 *   goals: ['Determine if the product delivers on its promise'],
 *   behaviors: ['Skims content quickly', 'Looks for social proof'],
 *   interactionPatterns: interactionPatternDefaults.impatient,
 *   emotionalBaseline: emotionalBaselineDefaults.neutral,
 * });
 * ```
 */
export function definePersona(config: {
  name: string;
  role: string;
  background: string;
  goals: string[];
  behaviors: string[];
  interactionPatterns?: InteractionPatterns;
  emotionalBaseline?: EmotionalBaseline;
  cognition?: CognitionProfile;
  priorExperience?: PriorExperience;
  sessionContext?: SessionContext;
}): PersonaDefinition {
  if (!config.name?.trim()) {
    throw new Error('Persona must have a name');
  }
  if (!config.role?.trim()) {
    throw new Error('Persona must have a role');
  }
  if (!config.background?.trim()) {
    throw new Error('Persona must have a background');
  }
  if (!config.goals?.length) {
    throw new Error('Persona must have at least one goal');
  }
  if (!config.behaviors?.length) {
    throw new Error('Persona must have at least one behavior');
  }

  return {
    name: config.name.trim(),
    role: config.role.trim(),
    background: config.background.trim(),
    goals: config.goals.map((g) => g.trim()),
    behaviors: config.behaviors.map((b) => b.trim()),
    interactionPatterns: config.interactionPatterns,
    emotionalBaseline: config.emotionalBaseline,
    cognition: config.cognition,
    priorExperience: config.priorExperience,
    sessionContext: config.sessionContext,
  };
}

/**
 * Pre-built persona templates that can be customized.
 * Use these as starting points and override any attributes as needed.
 *
 * @example
 * ```typescript
 * // Use default template
 * const visitor = personaTemplates.firstTimeVisitor();
 *
 * // Customize the template
 * const customVisitor = personaTemplates.firstTimeVisitor({
 *   name: 'Jordan',
 *   goals: ['Find pricing information', 'Compare with competitors'],
 * });
 * ```
 */
export const personaTemplates = {
  /**
   * A new user with no prior context, evaluating if this is worth their time.
   */
  firstTimeVisitor: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Alex',
      role: 'First-Time Visitor',
      background: 'New to the site with no prior context. Found this via search or social media.',
      goals: [
        'Understand what this site/product does within 10 seconds',
        'Find how to get started or sign up',
        'Locate help, documentation, or support',
      ],
      behaviors: [
        'Skims headings before reading full content',
        'Looks for familiar UI patterns',
        'Quick to leave if confused or overwhelmed',
        'Scrolls to get a sense of page length',
      ],
      interactionPatterns: interactionPatternDefaults.careful,
      emotionalBaseline: emotionalBaselineDefaults.calm,
      cognition: cognitionDefaults.careful,
      sessionContext: {
        isReturning: false,
        distractionLevel: 'low',
        timeContext: 'midday-busy',
      },
      ...customization,
    }),

  /**
   * An experienced user who knows what they want and values efficiency.
   */
  powerUser: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Sam',
      role: 'Power User',
      background:
        'Has used similar tools extensively. Values efficiency and keyboard shortcuts.',
      goals: [
        'Complete tasks as efficiently as possible',
        'Use keyboard navigation when available',
        'Access advanced features without hunting',
        'Customize the experience to their workflow',
      ],
      behaviors: [
        'Uses search heavily instead of browsing',
        'Memorizes and uses keyboard shortcuts',
        'Expects instant feedback on actions',
        'Gets frustrated by unnecessary confirmations',
      ],
      interactionPatterns: interactionPatternDefaults.expert,
      emotionalBaseline: emotionalBaselineDefaults.calm,
      cognition: cognitionDefaults.expert,
      sessionContext: {
        isReturning: true,
        distractionLevel: 'low',
        timeContext: 'morning-fresh',
      },
      ...customization,
    }),

  /**
   * Someone testing for WCAG compliance and assistive technology support.
   */
  accessibilityAuditor: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Jordan',
      role: 'Accessibility Auditor',
      background:
        'Testing for WCAG 2.1 AA compliance. Uses keyboard navigation and screen readers.',
      goals: [
        'Navigate the entire site using only keyboard',
        'Verify screen reader announces content correctly',
        'Check color contrast meets WCAG standards',
        'Ensure all interactive elements have focus states',
      ],
      behaviors: [
        'Uses Tab key exclusively for navigation',
        'Tests at 200% zoom level',
        'Checks heading hierarchy (H1, H2, H3)',
        'Verifies all images have meaningful alt text',
        'Tests with browser extensions like axe or WAVE',
      ],
      interactionPatterns: interactionPatternDefaults.careful,
      emotionalBaseline: emotionalBaselineDefaults.neutral,
      cognition: cognitionDefaults.learner,
      sessionContext: {
        isReturning: false,
        distractionLevel: 'none',
        timeContext: 'morning-fresh',
      },
      ...customization,
    }),

  /**
   * A designer reviewing the UI for consistency and polish.
   */
  designReviewer: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Casey',
      role: 'UI/UX Designer',
      background:
        'Senior designer with an eye for detail. Reviews interfaces for consistency and polish.',
      goals: [
        'Verify visual hierarchy guides users correctly',
        'Check spacing and alignment consistency',
        'Ensure responsive design works at all breakpoints',
        'Identify any jarring transitions or animations',
      ],
      behaviors: [
        'Resizes browser to test responsive breakpoints',
        'Inspects spacing with browser dev tools',
        'Notices subtle color and typography inconsistencies',
        'Tests hover states and micro-interactions',
      ],
      interactionPatterns: interactionPatternDefaults.exploratory,
      emotionalBaseline: emotionalBaselineDefaults.neutral,
      cognition: cognitionDefaults.learner,
      sessionContext: {
        isReturning: true,
        distractionLevel: 'low',
        timeContext: 'morning-fresh',
      },
      ...customization,
    }),

  /**
   * A skeptical evaluator comparing options before committing.
   */
  skepticalEvaluator: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Morgan',
      role: 'Skeptical Evaluator',
      background:
        'Has been burned by overpromising products before. Needs to see proof before committing.',
      goals: [
        'Find evidence that this actually works',
        'Understand pricing before investing time',
        'Read real user testimonials or case studies',
        'Find limitations or downsides (red flags if hidden)',
      ],
      behaviors: [
        'Scrolls past marketing to find substance',
        'Looks for pricing page early',
        'Searches for reviews and comparisons externally',
        'Tests claims by trying the product immediately',
      ],
      interactionPatterns: interactionPatternDefaults.normal,
      emotionalBaseline: {
        frustrationLevel: 40,
        frustrationEscalation: 'moderate',
        trustLevel: 'skeptical',
        urgency: 'moderate',
      },
      cognition: cognitionDefaults.balanced,
      priorExperience: {
        referenceProducts: ['Competitor A', 'Competitor B'],
        expectedPatterns: ['Clear pricing', 'Social proof', 'Free trial'],
        delighters: ['Transparent limitations', 'Real customer stories'],
        petPeeves: ['Hidden pricing', 'Fake testimonials', 'Aggressive sales tactics'],
      },
      sessionContext: {
        isReturning: false,
        distractionLevel: 'moderate',
        timeContext: 'midday-busy',
      },
      ...customization,
    }),

  /**
   * Someone trying to get help or resolve an issue.
   */
  supportSeeker: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Riley',
      role: 'Support Seeker',
      background: 'Encountered a problem and needs help. May be frustrated or confused.',
      goals: [
        'Find contact information or support chat quickly',
        'Search documentation for their specific issue',
        'Understand error messages and how to resolve them',
        'Get a response time estimate for support',
      ],
      behaviors: [
        'Looks for help/support links in header or footer',
        'Uses search with error message text',
        'Prefers self-service over waiting for support',
        'Gets more frustrated if help is hard to find',
      ],
      interactionPatterns: interactionPatternDefaults.impatient,
      emotionalBaseline: emotionalBaselineDefaults.frustrated,
      cognition: cognitionDefaults.scanner,
      priorExperience: {
        referenceProducts: ['Zendesk', 'Intercom', 'Apple Support'],
        expectedPatterns: ['Visible help button', 'Search docs', 'Live chat option'],
        delighters: ['Instant answers', 'Response time estimates'],
        petPeeves: ['Hidden contact info', 'Long wait times', 'Form-only support'],
      },
      sessionContext: {
        isReturning: true,
        priorActivity: 'Encountered an error',
        distractionLevel: 'moderate',
        timeContext: 'midday-busy',
      },
      ...customization,
    }),

  /**
   * A mobile-first user with limited patience for desktop-optimized UIs.
   */
  mobileUser: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Taylor',
      role: 'Mobile-First User',
      background:
        'Primarily uses phone for everything. Limited patience for pinch-zooming or horizontal scrolling.',
      goals: [
        'Complete core tasks on a phone screen',
        'Tap targets should be large enough',
        'Content should be readable without zooming',
        'Forms should work with mobile keyboards',
      ],
      behaviors: [
        'Holds phone one-handed, uses thumb',
        'Expects tap targets to be 44px minimum',
        'Abandons if horizontal scrolling required',
        'Uses autofill for forms whenever possible',
      ],
      interactionPatterns: interactionPatternDefaults.impatient,
      emotionalBaseline: emotionalBaselineDefaults.neutral,
      cognition: cognitionDefaults.scanner,
      sessionContext: {
        isReturning: false,
        distractionLevel: 'high',
        timeContext: 'midday-busy',
      },
      ...customization,
    }),

  /**
   * A frustrated customer arriving after failed attempts elsewhere.
   * Example: Marcus who tried email support first.
   */
  frustratedCustomer: (customization?: Partial<PersonaDefinition>): PersonaDefinition =>
    definePersona({
      name: 'Marcus',
      role: 'Frustrated Customer',
      background: 'Has already tried email support without success. Patience is running low.',
      goals: [
        'Get immediate help without waiting',
        'Talk to a human, not a bot',
        'Resolve issue quickly and completely',
        'Confirm the company actually cares',
      ],
      behaviors: [
        'Expects near-instant responses',
        'Will abandon if forced through hoops',
        'Looks for live chat or phone number first',
        'Skeptical of automated responses',
      ],
      interactionPatterns: interactionPatternDefaults.impatient,
      emotionalBaseline: emotionalBaselineDefaults.frustrated,
      cognition: cognitionDefaults.scanner,
      priorExperience: {
        referenceProducts: ['Zendesk', 'Intercom'],
        expectedPatterns: ['Quick response', 'Human available', 'Clear escalation path'],
        delighters: ['Proactive acknowledgment', 'Immediate human connection'],
        petPeeves: ['Bot loops', 'Long wait times', 'Having to repeat information'],
      },
      sessionContext: {
        isReturning: true,
        priorActivity: 'Failed email support attempts',
        distractionLevel: 'low',
        timeContext: 'midday-busy',
      },
      ...customization,
    }),
};
