# Persona-Driven Playwright Testing

A methodology for writing end-to-end tests that simulate real user journeys by creating fictional personas with specific backgrounds, goals, and behaviors.

## The Core Idea

Traditional E2E tests ask: "Does feature X work?"
Persona-driven tests ask: "Can user type Y accomplish their goal?"

Instead of testing isolated features, you validate entire user workflows from different perspectives. Each persona represents a distinct user archetype who would use your application differently.

The key innovation is capturing screenshots throughout the journey and then using a vision-capable AI model to analyze them for UX issues, accessibility problems, and design feedback that automated tests cannot detect.

---

## The Persona Definition

Every persona has four attributes:

1. **Name and Role**: A memorable identifier (e.g., "Maria - Campaign Researcher")
2. **Background**: Who they are, their context, experience level
3. **Goals**: What they're specifically trying to accomplish on your site
4. **Behaviors**: How they typically interact with software (heavy searcher, skimmer, keyboard user, etc.)

---

## Test Structure

### File Organization

Create one test file per persona in a dedicated `personas/` directory within your tests folder. Also create a shared utility for collecting observations and metrics.

### Test File Anatomy

Each persona test file contains:

1. **Persona definition** at the top as a JSDoc comment and exported object
2. **A serial test suite** (tests run in order, simulating a continuous session)
3. **Shared observation collector** instantiated once for all tests
4. **Lifecycle hooks**:
   - `beforeAll`: Start the observation session
   - `beforeEach`: Attach console error listeners and page load trackers
   - `afterAll`: End session and save observations to JSON file
5. **4-6 task-based tests** representing realistic user goals
6. **One free exploration test** at the end simulating open-ended browsing

---

## Task Tests

Each task test follows this pattern:

1. **Track start time** for duration measurement
2. **Initialize success flag** as false (prove success, don't assume it)
3. **Navigate to starting point** and capture a screenshot
4. **Attempt the task** as the persona would naturally try it
5. **Evaluate outcomes**:
   - If goal achieved: mark success, note what worked
   - If partially achieved: mark success with observations about friction
   - If blocked: keep failure, add frustration observation
6. **Capture result screenshot** with context
7. **Record the task** with success/failure, duration, and notes

Tasks should represent things users actually want to do:
- "Search for housing-related meetings"
- "Find how a council member voted on a topic"
- "Understand site purpose within 10 seconds"
- "Navigate the site using only keyboard"

---

## Free Exploration Tests

Every persona ends with a free exploration test that simulates realistic browsing without a specific goal. This catches issues that task-focused tests miss.

Structure:
1. Start on the main page
2. Define a series of actions the persona would naturally take (scroll, click interesting things, try different sections, navigate back)
3. Execute each action with error handling so one failure doesn't stop the exploration
4. Capture screenshots at interesting moments
5. Always mark as successful (the observations matter more than pass/fail)

---

## The Observation Collector

A shared utility class that captures everything during test execution:

### What It Tracks

**Session metrics:**
- Start and end timestamps
- Page load count
- Click count
- Search count
- Back navigation count (high numbers indicate confusion)
- Console errors

**Screenshots:**
- PNG file saved to disk
- Base64 encoding for vision model analysis
- Associated URL, page title, name, and context description

**Task results:**
- Task name
- Success boolean
- Duration in milliseconds
- Free-form notes

**Observations:**
- Type: `confusion`, `frustration`, `success`, or `note`
- Description of what was observed
- Location (page or element where it occurred)
- Timestamp

### Output

The collector saves a JSON file per persona containing:
- All metrics and counts
- All task results with success/duration/notes
- All observations categorized by type
- All screenshots with metadata and base64 data

---

## Vision Model Analysis

The most powerful aspect of this methodology is using a vision-capable AI model (like Claude with vision) to analyze the captured screenshots. The observation collector stores screenshots as base64-encoded data specifically for this purpose.

### How It Works

After tests complete, feed the observations.json file (which contains base64 screenshots) to a vision model along with:
- The persona definition (background, goals, behaviors)
- The task that was being attempted when each screenshot was taken
- The context description for each screenshot
- Any observations already recorded by the test

### What the Vision Model Can Identify

**UX Issues:**
- Confusing layouts or information hierarchy
- Missing or unclear call-to-action buttons
- Form fields without proper labels or feedback
- Unclear navigation paths
- Overwhelming amount of information

**Accessibility Problems:**
- Insufficient color contrast
- Text that's too small
- Missing visual focus indicators
- Poor heading structure visible in the UI
- Icons without labels

**Design Feedback:**
- Inconsistent spacing or alignment
- Typography issues (line length, font choices)
- Color palette problems
- Mobile responsiveness issues
- Visual clutter

**Persona-Specific Insights:**
- Would this specific persona find what they need?
- Does the interface match their technical skill level?
- Are their stated goals achievable based on what's visible?
- What friction points would frustrate this particular user type?

### Prompting the Vision Model

When asking a vision model to analyze the screenshots, provide context:

"Here are screenshots from a user journey test. The persona is [name], who [background]. Their goal was to [goal]. They typically [behaviors]. Analyze each screenshot and identify:
1. UX issues that would frustrate this specific persona
2. Accessibility problems visible in the interface
3. Design inconsistencies
4. Whether the user's goal appears achievable from what's shown
5. Specific recommendations for improvement"

The combination of automated test observations + vision model analysis provides much richer feedback than either approach alone.

---

## Observation Types

Use these consistently across all tests:

| Type | When to Use |
|------|-------------|
| **success** | Goal achieved smoothly, good UX discovered |
| **note** | Neutral observation, suggestion for improvement |
| **confusion** | Unclear what to do next, feedback ambiguous |
| **frustration** | Goal blocked, feature missing, error encountered |

---

## Example Personas

### First-Time Visitor
Tests whether the site's purpose is clear, navigation is intuitive, and new users can orient themselves quickly. Tasks include understanding what the site does within seconds, finding help/about information, browsing without a specific goal.

### Power User / Researcher
Tests deep functionality for users who know what they want. Tasks include complex searches, finding specific records, filtering by date ranges, extracting precise information.

### Accessibility Auditor
Tests WCAG compliance and keyboard/screen reader usability. Tasks include keyboard-only navigation, checking focus states, verifying heading hierarchy, checking alt text on images, verifying link text is descriptive.

### Casual Browser
Tests the experience for users with moderate goals. Tasks include filtering content, scanning summaries, understanding recent activity, following links to external resources.

### UI/UX Designer
Tests visual design, consistency, and responsiveness. Tasks include evaluating visual hierarchy, analyzing color and typography, checking spacing consistency, testing mobile and tablet viewports.

### Journalist / Fact-Checker
Tests accuracy and source verification workflows. Tasks include phrase searches for quote verification, finding exact data points, verifying dates and metadata, cross-referencing with external sources.

---

## Key Implementation Details

### Serial Execution
Tests must run in serial order (not parallel) to simulate a continuous user session where state carries over.

### Console Error Capture
Attach a listener for console errors in beforeEach so technical problems are captured even when they don't cause test failures.

### Screenshot Strategy
Capture screenshots at:
- Start of each task
- Key decision points
- Results/outcomes
- Anything confusing or problematic

Name screenshots descriptively with context so they tell a story when reviewed later. The context description should explain what the user was trying to do at that moment.

### Base64 Encoding
Screenshots are saved both as PNG files on disk and as base64-encoded strings in the JSON output. The base64 format allows the observations file to be self-contained and directly processable by vision models without additional file handling.

### Flexible Selectors
Use realistic selectors that a user would conceptually understand. If searching for a "Votes" section, look for headings containing "Vote" rather than relying on test IDs that users can't see.

### Graceful Failures
Wrap actions in try/catch so one failure doesn't cascade. Record what went wrong and continue the exploration.

### Timing
Use realistic timeouts. If a user would give up after 3 seconds of waiting, set that as your timeout. This catches performance issues that pass/fail tests miss.

---

## Analyzing Results

### Automated Analysis
Review the observations.json files for each persona. Look for:

| Pattern | Indicates |
|---------|-----------|
| High back navigation count | Users getting lost |
| Multiple frustration observations | Critical UX problems |
| Multiple confusion observations | Information architecture issues |
| Failed tasks | Broken critical paths |
| Long task durations | Performance or complexity issues |

### Vision Model Analysis
Feed the observations.json (with embedded base64 screenshots) to a vision-capable AI model. Ask it to:

1. Review each screenshot in the context of the persona and their task
2. Identify issues the automated tests may have missed
3. Provide specific, actionable recommendations
4. Prioritize findings by severity and impact on the persona's goals

The qualitative observations from both the automated tests and vision model analysis are often more valuable than the pass/fail results. A test might "pass" while recording significant user friction that only becomes apparent when a vision model sees the actual interface.

---

## When to Use This Approach

Best for:
- Public-facing websites and applications
- Products with multiple distinct user types
- UX-focused teams wanting to surface usability issues
- Validating that changes don't break user workflows
- Getting design feedback without manual review
- Supplementing traditional feature-based E2E tests

Less suited for:
- API testing
- Unit/integration testing
- Very simple single-purpose applications
- Performance benchmarking (use dedicated tools instead)

---

## Prompting Claude to Create Persona Tests

When asking Claude to create persona tests for a new project, provide:

1. Brief description of the application and its purpose
2. List of main features/pages
3. Description of target user types
4. Any existing test infrastructure (Playwright config, utilities)

Ask Claude to:
- Define 4-6 distinct personas with backgrounds, goals, and behaviors
- Create task tests representing real user goals for each persona
- Include free exploration tests
- Use the observation collector pattern with the four observation types
- Capture screenshots at key moments with descriptive context
- Store screenshots as base64 for vision model analysis
- Save results to JSON for both automated and AI-powered analysis

The resulting tests should read like user journey documentation while also being executable Playwright tests that produce analyzable output for vision models.
