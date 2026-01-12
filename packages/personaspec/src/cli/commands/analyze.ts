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

      // Build the system prompt with persona context
      const systemPrompt = `You are a UX analyst reviewing screenshots from a persona-driven user journey test.

## The Persona

**Name:** ${results.persona}
**Background:** ${results.background}
**Goals:** ${results.goals.join(', ')}
**Behaviors:** ${results.behaviors.join(', ')}

## Your Task

Analyze each screenshot from the perspective of this specific persona. Consider their background, goals, and typical behaviors when identifying issues.

For each screenshot, identify:
1. **UX Issues** - Things that would frustrate or confuse this persona specifically
2. **Accessibility Problems** - Visual accessibility issues (contrast, text size, etc.)
3. **Design Inconsistencies** - Layout, spacing, or styling issues
4. **Goal Achievement** - Whether the persona could accomplish their goals from this screen
5. **Specific Recommendations** - Concrete, actionable improvements

## Output Format

Structure your analysis as markdown with:
1. An executive summary (2-3 sentences)
2. Analysis of each screenshot
3. Prioritized recommendations (Critical / Important / Nice-to-have)
4. Overall score (A/B/C/D/F) with justification`;

      // Build message content with images
      const messageContent: MessageContent[] = [
        {
          type: 'text',
          text: `I have ${screenshotsToAnalyze.length} screenshots from a persona-driven test session. Please analyze each one from the perspective of the persona described in your instructions.\n\n`,
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

      // Add existing observations for context
      if (results.observations.length > 0) {
        messageContent.push({
          type: 'text',
          text: `\n## Observations Already Captured During Testing\n\nThe automated tests already identified these observations:\n\n${results.observations
            .map((o) => `- **[${o.type.toUpperCase()}]** ${o.description} (at ${o.location})`)
            .join('\n')}\n\nPlease validate these observations and identify anything they may have missed.`,
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

        // Build the output markdown
        const outputMd = `# PersonaSpec AI Analysis

## Persona: ${results.persona}

**Background:** ${results.background}

**Goals:**
${results.goals.map((g) => `- ${g}`).join('\n')}

**Behaviors:**
${results.behaviors.map((b) => `- ${b}`).join('\n')}

---

## Session Summary

- **Pages Visited:** ${results.session.pagesVisited}
- **Clicks:** ${results.session.clickCount}
- **Back Navigations:** ${results.session.backNavCount}
- **Console Errors:** ${results.session.consoleErrors.length}
- **Screenshots Analyzed:** ${screenshotsToAnalyze.length}

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
