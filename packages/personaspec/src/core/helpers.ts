import type { PersonaDefinition } from './types.js';

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
 * });
 * ```
 */
export function definePersona(config: {
  name: string;
  role: string;
  background: string;
  goals: string[];
  behaviors: string[];
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
      ...customization,
    }),
};
