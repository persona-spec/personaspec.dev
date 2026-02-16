import { Command } from 'commander';
import * as fs from 'node:fs/promises';
import type { PersonaTestResults } from '../../core/types.js';

interface MessageContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

interface ApiResponse {
  content: Array<{ type: string; text: string }>;
  error?: { message: string };
}

/**
 * Build persona context section for the system prompt.
 * Includes all focus-group fidelity attributes when available.
 */
function buildPersonaContext(results: PersonaTestResults): string {
  const persona = results.personaDefinition;
  if (!persona) {
    // Fallback for older results format
    return `**Name:** ${results.persona}
**Background:** ${results.background}
**Goals:** ${results.goals.join(', ')}
**Behaviors:** ${results.behaviors.join(', ')}`;
  }

  let context = `**Name:** ${persona.name} - ${persona.role}
**Background:** ${persona.background}
**Goals:** ${persona.goals.join(', ')}
**Behaviors:** ${persona.behaviors.join(', ')}`;

  // Add emotional baseline if available
  if (persona.emotionalBaseline) {
    const eb = persona.emotionalBaseline;
    context += `

### Emotional Profile
- **Starting Frustration:** ${eb.frustrationLevel}/100
- **Escalation Pattern:** ${eb.frustrationEscalation} (${
      eb.frustrationEscalation === 'volatile'
        ? 'frustration compounds quickly'
        : eb.frustrationEscalation === 'moderate'
          ? 'frustration builds at normal rate'
          : 'very patient, slow to frustrate'
    })
- **Trust Level:** ${eb.trustLevel}
- **Urgency:** ${eb.urgency}`;
  }

  // Add interaction patterns if available
  if (persona.interactionPatterns) {
    const ip = persona.interactionPatterns;
    context += `

### Interaction Patterns (Human-Scale Timing)
- **Scan Time:** ${ip.scanTime?.min ?? 1000}-${ip.scanTime?.max ?? 3000}ms before acting
- **Retry Delay:** ${ip.retryDelay?.min ?? 2000}-${ip.retryDelay?.max ?? 5000}ms between attempts
- **Max Retries:** ${ip.maxRetries ?? 3} before giving up
- **Reading Pace:** ${ip.readingPace ?? 3000}ms per 100 words

**CRITICAL:** This persona does NOT interact at machine speed. Even if impatient, they wait ${ip.retryDelay?.min ?? 2000}+ ms between retry clicks.`;
  }

  // Add cognition profile if available
  if (persona.cognition) {
    const cog = persona.cognition;
    context += `

### Cognitive Profile
- **Reading Speed:** ${cog.readingSpeed}
- **Decision Style:** ${cog.decisionStyle}
- **Focus Duration:** ${cog.focusDuration} minutes before fatigue
- **When Uncertain:** ${cog.uncertaintyResponse}
- **Visual Scan Pattern:** ${cog.scanPattern}`;
  }

  // Add prior experience if available
  if (persona.priorExperience) {
    const pe = persona.priorExperience;
    context += `

### Prior Experience (Comparative Context)
- **Reference Products:** ${pe.referenceProducts.join(', ')}
- **Expects:** ${pe.expectedPatterns.join(', ')}
- **Delighters:** ${pe.delighters.join(', ')}
- **Pet Peeves:** ${pe.petPeeves.join(', ')}

Use these to compare: Is this experience better, similar, or worse than their reference products?`;
  }

  // Add session context if available
  if (persona.sessionContext) {
    const sc = persona.sessionContext;
    context += `

### Session Context
- **Returning User:** ${sc.isReturning ? 'Yes' : 'No (first visit)'}
- **Prior Activity:** ${sc.priorActivity ?? 'None'}
- **Distraction Level:** ${sc.distractionLevel}
- **Time of Day:** ${sc.timeContext ?? 'Unknown'}`;
  }

  return context;
}

/**
 * Build emotional journey summary if available.
 */
function buildEmotionalJourneySummary(results: PersonaTestResults): string {
  const journey = results.session.emotionalJourney;
  if (!journey || journey.length < 2) {
    return '';
  }

  const start = journey[0]!;
  const end = journey[journey.length - 1]!;
  const frustrationDelta = end.frustration - start.frustration;
  const confidenceDelta = end.confidence - start.confidence;

  let summary = `

## Emotional Journey Summary

| Metric | Start | End | Change |
|--------|-------|-----|--------|
| Frustration | ${start.frustration} | ${end.frustration} | ${frustrationDelta > 0 ? '+' : ''}${frustrationDelta} |
| Confidence | ${start.confidence} | ${end.confidence} | ${confidenceDelta > 0 ? '+' : ''}${confidenceDelta} |

### Key Emotional Events:
`;

  // Find significant emotional changes
  for (let i = 1; i < journey.length; i++) {
    const prev = journey[i - 1]!;
    const curr = journey[i]!;
    const frustrationChange = curr.frustration - prev.frustration;
    if (Math.abs(frustrationChange) >= 10) {
      summary += `- **${curr.trigger ?? 'Unknown'}**: Frustration ${frustrationChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(frustrationChange)}\n`;
    }
  }

  if (end.frustration > 80) {
    summary += `\n**WARNING:** Frustration exceeded 80 - this persona would likely abandon.`;
  }

  return summary;
}

export const analyzeCommand = new Command('analyze')
  .description('Analyze test results with Claude AI vision')
  .argument('<results>', 'Path to results JSON file')
  .option('-k, --api-key <key>', 'Anthropic API key (or set ANTHROPIC_API_KEY env var)')
  .option('-o, --output <file>', 'Output file for analysis', 'analysis-report.md')
  .option('--model <model>', 'Claude model to use', 'claude-sonnet-4-20250514')
  .option('--max-screenshots <n>', 'Maximum screenshots to include', '10')
  .action(
    async (
      resultsPath: string,
      options: {
        apiKey?: string;
        output: string;
        model: string;
        maxScreenshots: string;
      }
    ) => {
      const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        console.error('Error: Anthropic API key required.');
        console.error('');
        console.error('Set the ANTHROPIC_API_KEY environment variable:');
        console.error('  export ANTHROPIC_API_KEY=sk-ant-...');
        console.error('');
        console.error('Or use the --api-key flag:');
        console.error('  npx personaspec analyze results.json --api-key sk-ant-...');
        process.exit(1);
      }

      console.log(`Loading results from ${resultsPath}...`);

      let results: PersonaTestResults;
      try {
        const content = await fs.readFile(resultsPath, 'utf-8');
        results = JSON.parse(content);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          console.error(`Error: File not found: ${resultsPath}`);
        } else if (error instanceof SyntaxError) {
          console.error(`Error: Invalid JSON in ${resultsPath}`);
        } else {
          console.error(`Error reading results file: ${error}`);
        }
        process.exit(1);
      }

      // Validate results
      if (!results.persona || !results.screenshots) {
        console.error('Error: Invalid PersonaSpec results file format');
        process.exit(1);
      }

      const maxScreenshots = parseInt(options.maxScreenshots, 10);
      const screenshotsToAnalyze = results.screenshots.slice(0, maxScreenshots);

      console.log(`Analyzing ${screenshotsToAnalyze.length} screenshots for persona: ${results.persona}`);

      const testMode = results.testMode ?? 'exploration';
      const personaContext = buildPersonaContext(results);

      // Build the system prompt with enhanced persona context
      const systemPrompt = `You are a UX analyst reviewing screenshots from a persona-driven user journey test.

## The Persona

${personaContext}

## Your Task

Analyze each screenshot from the perspective of this specific persona. Consider their background, goals, behaviors, and emotional state when identifying issues.

For each screenshot, identify:
1. **UX Issues** - Things that would frustrate or confuse this persona specifically
2. **Accessibility Problems** - Visual accessibility issues (contrast, text size, etc.)
3. **Design Inconsistencies** - Layout, spacing, or styling issues
4. **Goal Achievement** - Whether the persona could accomplish their goals from this screen
5. **Emotional Impact** - How this screen affects their frustration/confidence
6. **Comparative Assessment** - If prior experience is available, how does this compare?
7. **Specific Recommendations** - Concrete, actionable improvements

## Critical: Distinguishing Real Issues from Test Artifacts

These observations were collected during ${testMode === 'validation' ? 'human-paced validation' : 'automated exploration'} testing.

### Mark as TEST ARTIFACT (not a real UX issue) if:
- The issue only occurs under rapid automated testing (< 1 second between actions)
- Rate limiting, throttling, or timeout errors from fast repeated requests
- The observation is marked \`humanRealistic: false\` in the context
- Issues triggered by machine-speed interaction that wouldn't occur for humans

**IMPORTANT:** Rate limiting is almost NEVER a real UX issue for individual users. Even "impatient" users like frustrated customers wait 2-4 seconds between clicks. If you see rate limiting observations, flag them as test artifacts unless the test was run in validation mode.

### Mark as REAL UX ISSUE if:
- The issue would occur under human-realistic timing (2+ seconds between actions)
- The observation is marked \`humanRealistic: true\` in the context
- The issue is about visual design, copy, information architecture, or accessibility
- The test was run in \`validation\` mode (all issues are human-realistic)

### When inferring issues:
- State clearly: "Observed: [fact]" vs "Inferred: [interpretation]"
- Don't assume frustrated users click faster than ~1 click per 2 seconds
- Consider the persona's emotional baseline when interpreting behavior
- Reference prior experience when making comparative assessments

## Output Format

Structure your analysis as markdown with:
1. An executive summary (2-3 sentences)
2. Test Methodology Note (exploration vs validation mode, artifact disclaimer)
3. Analysis of each screenshot
4. Emotional Journey Assessment (if journey data available)
5. Prioritized recommendations:
   - **Critical** (blocks goal completion, causes abandonment)
   - **Important** (significant friction, frustration)
   - **Nice-to-have** (polish, delight opportunities)
6. Test Artifacts (issues to ignore, explained)
7. Overall score (A/B/C/D/F) with justification`;

      // Build message content with images
      const messageContent: MessageContent[] = [
        {
          type: 'text',
          text: `I have ${screenshotsToAnalyze.length} screenshots from a persona-driven test session run in **${testMode} mode**. Please analyze each one from the perspective of the persona described in your instructions.\n\n`,
        },
      ];

      for (const screenshot of screenshotsToAnalyze) {
        if (screenshot.base64) {
          messageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: screenshot.base64,
            },
          });
          messageContent.push({
            type: 'text',
            text: `\n**Screenshot: "${screenshot.name}"**\nContext: ${screenshot.context}\nURL: ${screenshot.url}\n\n`,
          });
        }
      }

      // Add existing observations for context with humanRealistic flags
      if (results.observations.length > 0) {
        const observationsText = results.observations
          .map((o) => {
            const humanRealistic = o.context?.humanRealistic ?? 'unknown';
            const emotionalState = o.context?.emotionalState
              ? ` (frustration: ${o.context.emotionalState.frustration})`
              : '';
            return `- **[${o.type.toUpperCase()}]** ${o.description} (at ${o.location}) [humanRealistic: ${humanRealistic}]${emotionalState}`;
          })
          .join('\n');

        messageContent.push({
          type: 'text',
          text: `\n## Observations Already Captured During Testing\n\nThe automated tests already identified these observations:\n\n${observationsText}\n\nPlease validate these observations, noting which are test artifacts vs real UX issues.`,
        });
      }

      // Add emotional journey summary
      const emotionalSummary = buildEmotionalJourneySummary(results);
      if (emotionalSummary) {
        messageContent.push({
          type: 'text',
          text: emotionalSummary,
        });
      }

      // Add task results
      if (results.tasks.length > 0) {
        messageContent.push({
          type: 'text',
          text: `\n## Task Results\n\n${results.tasks
            .map((t) => `- ${t.success ? '✓' : '✗'} **${t.name}** (${(t.duration / 1000).toFixed(1)}s) - ${t.notes}`)
            .join('\n')}`,
        });
      }

      console.log('Sending to Claude for analysis...');
      console.log(`  Model: ${options.model}`);
      console.log(`  Screenshots: ${screenshotsToAnalyze.length}`);
      console.log(`  Test Mode: ${testMode}`);

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: options.model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: 'user', content: messageContent }],
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage = `API request failed with status ${response.status}`;

          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.error?.message) {
              errorMessage = errorJson.error.message;
            }
          } catch {
            // Use default error message
          }

          console.error(`Error: ${errorMessage}`);

          if (response.status === 401) {
            console.error('Hint: Check that your API key is valid and has not expired.');
          } else if (response.status === 429) {
            console.error('Hint: You may have hit rate limits. Try again in a few seconds.');
          }

          process.exit(1);
        }

        const result = (await response.json()) as ApiResponse;

        if (!result.content || !result.content[0]?.text) {
          console.error('Error: Unexpected API response format');
          process.exit(1);
        }

        const analysis = result.content[0].text;

        // Build methodology note
        const methodologyNote = testMode === 'validation'
          ? `> **Test Mode:** Validation (human-paced) - All observations reflect realistic user behavior.`
          : `> **Test Mode:** Exploration (fast) - Some observations may be test artifacts. See "Test Artifacts" section for issues to ignore.`;

        // Build persona attributes section
        let personaAttributes = '';
        const persona = results.personaDefinition;
        if (persona) {
          if (persona.interactionPatterns) {
            personaAttributes += `\n### Interaction Patterns\n- Scan Time: ${persona.interactionPatterns.scanTime?.min}-${persona.interactionPatterns.scanTime?.max}ms\n- Retry Delay: ${persona.interactionPatterns.retryDelay?.min}-${persona.interactionPatterns.retryDelay?.max}ms\n- Max Retries: ${persona.interactionPatterns.maxRetries}\n`;
          }
          if (persona.emotionalBaseline) {
            personaAttributes += `\n### Emotional Baseline\n- Starting Frustration: ${persona.emotionalBaseline.frustrationLevel}/100\n- Escalation: ${persona.emotionalBaseline.frustrationEscalation}\n- Trust: ${persona.emotionalBaseline.trustLevel}\n- Urgency: ${persona.emotionalBaseline.urgency}\n`;
          }
          if (persona.priorExperience) {
            personaAttributes += `\n### Prior Experience\n- Reference Products: ${persona.priorExperience.referenceProducts.join(', ')}\n`;
          }
        }

        // Build the output markdown
        const outputMd = `# PersonaSpec AI Analysis

## Persona: ${results.persona}

**Background:** ${results.background}

**Goals:**
${results.goals.map((g) => `- ${g}`).join('\n')}

**Behaviors:**
${results.behaviors.map((b) => `- ${b}`).join('\n')}
${personaAttributes}
---

## Session Summary

${methodologyNote}

- **Pages Visited:** ${results.session.pagesVisited}
- **Clicks:** ${results.session.clickCount}
- **Back Navigations:** ${results.session.backNavCount}
- **Console Errors:** ${results.session.consoleErrors.length}
- **Screenshots Analyzed:** ${screenshotsToAnalyze.length}
${emotionalSummary}
---

${analysis}

---

*Generated by [PersonaSpec](https://personaspec.dev) using ${options.model} on ${new Date().toLocaleString()}*
`;

        await fs.writeFile(options.output, outputMd);
        console.log(`\nAnalysis saved to: ${options.output}`);
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('Error: Network request failed. Check your internet connection.');
        } else {
          console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        process.exit(1);
      }
    }
  );
