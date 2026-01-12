# PersonaSpec

Persona-driven Playwright testing with AI vision analysis.

**PersonaSpec** helps you write E2E tests that validate user journeys, not just features. Instead of asking "Does this button work?", PersonaSpec asks "Can this type of user accomplish their goal?"

## Quick Start

```bash
# Initialize a new project
npx personaspec init

# Install dependencies
npm install personaspec @playwright/test
npx playwright install chromium

# Run tests
npx playwright test

# Generate HTML report
npx personaspec report test-results/alex-observations.json

# Get AI analysis (requires Anthropic API key)
ANTHROPIC_API_KEY=sk-ant-... npx personaspec analyze test-results/alex-observations.json
```

## What is Persona-Driven Testing?

Traditional E2E tests verify that features work:

```typescript
// Traditional: Does the feature work?
test('login form submits', async ({ page }) => {
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

Persona-driven tests verify that **users can accomplish their goals**:

```typescript
// Persona-driven: Can this user succeed?
test('find the feature from the demo video', async ({ page }) => {
  collector.startTask();

  await page.goto('/dashboard');
  await collector.screenshot(page, 'dashboard-first-look', 'Alex lands on dashboard, looking for AI feature');

  const feature = page.getByRole('button', { name: /ai|analyze/i });

  if (await feature.isVisible({ timeout: 5000 })) {
    collector.observe('success', 'Found promoted feature quickly', 'Dashboard');
  } else {
    collector.observe('frustration', 'Cannot find advertised feature', 'Dashboard');
  }

  collector.recordTask('find the feature from the demo video', success, notes);
});
```

## Core Concepts

### Personas

A persona is a fictional user with defined characteristics:

```typescript
import { definePersona } from 'personaspec';

const persona = definePersona({
  name: 'Alex',
  role: 'Trial Evaluator',
  background: 'PM at a Series A startup, has 10 min between meetings',
  goals: [
    'Determine if the product delivers on its promise',
    'Find pricing information',
  ],
  behaviors: [
    'Skims content quickly',
    'Looks for social proof',
    'Opens multiple tabs to compare',
  ],
});
```

### Observation Types

PersonaSpec uses four observation types:

| Type | Meaning | Example |
|------|---------|---------|
| `success` | Goal achieved smoothly | "Found CTA immediately" |
| `note` | Room for improvement | "Could be more discoverable" |
| `confusion` | Unclear what to do | "Not sure if form submitted" |
| `frustration` | Goal blocked | "Feature doesn't exist" |

### Screenshots for AI Analysis

Every screenshot includes context that helps AI understand what the user was trying to do:

```typescript
await collector.screenshot(
  page,
  'pricing-search',           // name
  'Alex scrolls looking for pricing, getting impatient'  // context
);
```

## API Reference

### `ObservationCollector`

The main class for collecting test data.

```typescript
import { ObservationCollector, definePersona } from 'personaspec';

const collector = new ObservationCollector({
  outputDir: './test-results',
  persona: definePersona({ /* ... */ }),
});
```

#### Methods

| Method | Description |
|--------|-------------|
| `screenshot(page, name, context)` | Capture screenshot with context |
| `observe(type, description, location)` | Record an observation |
| `startTask()` | Start timing a task |
| `recordTask(name, success, notes)` | Record task completion |
| `trackPageLoad()` | Track a page navigation |
| `trackClick()` | Track a click interaction |
| `trackBackNav()` | Track back navigation |
| `addConsoleError(message)` | Log a console error |
| `save()` | Save results to JSON file |

### `definePersona(config)`

Create a validated persona definition.

```typescript
const persona = definePersona({
  name: string,        // Required
  role: string,        // Required
  background: string,  // Required
  goals: string[],     // At least one required
  behaviors: string[], // At least one required
});
```

### `personaTemplates`

Pre-built persona templates you can customize:

```typescript
import { personaTemplates } from 'personaspec';

// Use defaults
const visitor = personaTemplates.firstTimeVisitor();

// Or customize
const customVisitor = personaTemplates.firstTimeVisitor({
  name: 'Jordan',
  goals: ['Find API documentation', 'Check pricing'],
});
```

Available templates:
- `firstTimeVisitor()` - New user evaluating the site
- `powerUser()` - Experienced user who values efficiency
- `accessibilityAuditor()` - Testing WCAG compliance
- `designReviewer()` - Checking visual consistency
- `skepticalEvaluator()` - Needs proof before committing
- `supportSeeker()` - Looking for help
- `mobileUser()` - Mobile-first user

## CLI Commands

### `personaspec init`

Scaffold a new PersonaSpec project.

```bash
npx personaspec init
npx personaspec init --force  # Overwrite existing files
```

Creates:
- `playwright.config.ts` - Configured for serial persona tests
- `tests/personas/first-visitor.spec.ts` - Example test
- `tests/utils/observation-collector.ts` - Re-export wrapper

### `personaspec report <file>`

Generate an HTML report from test results.

```bash
npx personaspec report test-results/alex-observations.json
npx personaspec report results.json --output my-report.html
```

### `personaspec analyze <file>`

Send results to Claude for AI-powered UX analysis.

```bash
# Set API key via environment variable
export ANTHROPIC_API_KEY=sk-ant-...
npx personaspec analyze test-results/alex-observations.json

# Or pass directly
npx personaspec analyze results.json --api-key sk-ant-...

# Options
npx personaspec analyze results.json --output analysis.md
npx personaspec analyze results.json --model claude-sonnet-4-20250514
npx personaspec analyze results.json --max-screenshots 5
```

## Test Structure

PersonaSpec tests follow this pattern:

```typescript
import { test } from '@playwright/test';
import { ObservationCollector, personaTemplates } from 'personaspec';

const persona = personaTemplates.firstTimeVisitor();
const collector = new ObservationCollector({
  outputDir: './test-results',
  persona,
});

test.describe.configure({ mode: 'serial' });

test.describe(`${persona.name} - ${persona.role}`, () => {
  test.afterAll(async () => {
    await collector.save();
  });

  test('task name here', async ({ page }) => {
    collector.startTask();
    let success = false;

    // 1. Navigate and screenshot
    await page.goto('/');
    collector.trackPageLoad();
    await collector.screenshot(page, 'initial', 'Context here');

    // 2. Attempt the task
    // ...

    // 3. Record observations
    collector.observe('success', 'What happened', 'Where');

    // 4. Final screenshot
    await collector.screenshot(page, 'result', 'After attempting task');

    // 5. Record the task
    collector.recordTask('task name here', success, 'Notes');
  });

  test('free exploration', async ({ page }) => {
    // Always end with free exploration
    collector.startTask();
    // Browse naturally, record what you find
    collector.recordTask('free exploration', true, 'Completed');
  });
});
```

## Output Format

Results are saved as JSON:

```json
{
  "persona": "Alex - Trial Evaluator",
  "background": "PM at a Series A startup...",
  "goals": ["Determine if product delivers..."],
  "behaviors": ["Skims content quickly..."],
  "session": {
    "startTime": "2024-01-15T10:30:00Z",
    "endTime": "2024-01-15T10:32:45Z",
    "pagesVisited": 4,
    "clickCount": 5,
    "backNavCount": 1,
    "consoleErrors": []
  },
  "tasks": [
    {
      "name": "understand site purpose",
      "success": true,
      "duration": 4500,
      "notes": "Clear headline"
    }
  ],
  "observations": [
    {
      "type": "success",
      "description": "Value prop clear",
      "location": "Homepage hero",
      "timestamp": "2024-01-15T10:30:15Z"
    }
  ],
  "screenshots": [
    {
      "name": "homepage-initial",
      "context": "First view of homepage",
      "url": "https://example.com/",
      "base64": "iVBORw0KGgo..."
    }
  ]
}
```

## Learn More

- [PersonaSpec Methodology](https://personaspec.dev/methodology) - Full specification
- [Persona Templates](https://personaspec.dev/personas) - Browse all templates
- [Example Results](https://personaspec.dev/example) - See real test output

## License

MIT
