import { Command } from 'commander';
import * as fs from 'node:fs/promises';
import type { PersonaTestResults } from '../../core/types.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHtml(results: PersonaTestResults): string {
  // Count observation types
  const counts = {
    success: results.observations.filter((o) => o.type === 'success').length,
    note: results.observations.filter((o) => o.type === 'note').length,
    confusion: results.observations.filter((o) => o.type === 'confusion').length,
    frustration: results.observations.filter((o) => o.type === 'frustration').length,
  };

  // Calculate task success rate
  const successfulTasks = results.tasks.filter((t) => t.success).length;
  const taskSuccessRate = results.tasks.length
    ? Math.round((successfulTasks / results.tasks.length) * 100)
    : 0;

  // Generate metrics HTML
  const metricsHtml = `
    <div class="metric">
      <div class="metric-value">${results.session.pagesVisited}</div>
      <div class="metric-label">Pages Visited</div>
    </div>
    <div class="metric">
      <div class="metric-value">${results.session.clickCount}</div>
      <div class="metric-label">Clicks</div>
    </div>
    <div class="metric">
      <div class="metric-value">${results.session.backNavCount}</div>
      <div class="metric-label">Back Navigations</div>
    </div>
    <div class="metric">
      <div class="metric-value">${results.session.consoleErrors.length}</div>
      <div class="metric-label">Console Errors</div>
    </div>
    <div class="metric">
      <div class="metric-value">${taskSuccessRate}%</div>
      <div class="metric-label">Task Success Rate</div>
    </div>
  `;

  // Generate observation counts HTML
  const observationCountsHtml = `
    <div class="obs-counts">
      <span class="obs-count obs-count--success">${counts.success} success</span>
      <span class="obs-count obs-count--note">${counts.note} notes</span>
      <span class="obs-count obs-count--confusion">${counts.confusion} confusion</span>
      <span class="obs-count obs-count--frustration">${counts.frustration} frustration</span>
    </div>
  `;

  // Generate tasks HTML
  const tasksHtml = results.tasks
    .map(
      (task) => `
    <div class="card task">
      <div class="task-header">
        <span class="task-status ${task.success ? 'task-status--success' : 'task-status--failure'}">
          ${task.success ? '✓' : '✗'}
        </span>
        <span class="task-name">${escapeHtml(task.name)}</span>
        <span class="task-duration">${(task.duration / 1000).toFixed(1)}s</span>
      </div>
      ${task.notes ? `<p class="task-notes">${escapeHtml(task.notes)}</p>` : ''}
    </div>
  `
    )
    .join('');

  // Generate observations HTML
  const observationsHtml = results.observations
    .map(
      (obs) => `
    <div class="card observation observation--${obs.type}">
      <div class="observation-header">
        <span class="badge badge--${obs.type}">${obs.type}</span>
        <span class="observation-location">${escapeHtml(obs.location)}</span>
      </div>
      <p class="observation-description">${escapeHtml(obs.description)}</p>
      ${obs.recommendation ? `<p class="observation-recommendation">Recommendation: ${escapeHtml(obs.recommendation)}</p>` : ''}
    </div>
  `
    )
    .join('');

  // Generate screenshots HTML
  const screenshotsHtml = results.screenshots
    .map(
      (ss) => `
    <div class="screenshot">
      <img src="data:image/png;base64,${ss.base64}" alt="${escapeHtml(ss.name)}" loading="lazy">
      <div class="screenshot-info">
        <strong>${escapeHtml(ss.name)}</strong>
        <p>${escapeHtml(ss.context)}</p>
        <span class="screenshot-url">${escapeHtml(ss.url)}</span>
      </div>
    </div>
  `
    )
    .join('');

  // Generate goals list
  const goalsHtml = results.goals.map((g) => `<li>${escapeHtml(g)}</li>`).join('');

  // Generate behaviors list
  const behaviorsHtml = results.behaviors.map((b) => `<li>${escapeHtml(b)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PersonaSpec Report: ${escapeHtml(results.persona)}</title>
  <style>
    :root {
      --bg-base: #0D0F14;
      --bg-surface: #161922;
      --bg-elevated: #1E222D;
      --text-primary: #F0F2F5;
      --text-secondary: #9BA3B5;
      --text-muted: #6B7280;
      --accent-primary: #7C5CFF;
      --accent-success: #5CFFB4;
      --accent-warning: #FFC75C;
      --accent-error: #FF5C7C;
      --border-subtle: rgba(255, 255, 255, 0.08);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-base);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--accent-primary), #FF7C5C);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: var(--text-primary);
    }

    .subtitle {
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .persona-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .persona-section h3 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .persona-section ul {
      list-style: none;
      padding: 0;
    }

    .persona-section li {
      padding: 0.25rem 0;
      padding-left: 1rem;
      position: relative;
      color: var(--text-secondary);
    }

    .persona-section li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--accent-primary);
    }

    .card {
      background: var(--bg-surface);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 0.75rem;
      border: 1px solid var(--border-subtle);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .metric {
      background: var(--bg-surface);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      border: 1px solid var(--border-subtle);
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-primary);
    }

    .metric-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .obs-counts {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .obs-count {
      padding: 0.5rem 1rem;
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .obs-count--success { background: rgba(92, 255, 180, 0.15); color: var(--accent-success); }
    .obs-count--note { background: rgba(124, 92, 255, 0.15); color: var(--accent-primary); }
    .obs-count--confusion { background: rgba(255, 199, 92, 0.15); color: var(--accent-warning); }
    .obs-count--frustration { background: rgba(255, 92, 124, 0.15); color: var(--accent-error); }

    .task {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .task-status {
      font-size: 1.25rem;
      width: 1.5rem;
    }

    .task-status--success { color: var(--accent-success); }
    .task-status--failure { color: var(--accent-error); }

    .task-name {
      font-weight: 500;
      flex: 1;
    }

    .task-duration {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .task-notes {
      color: var(--text-secondary);
      font-size: 0.875rem;
      padding-left: 2.25rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge--success { background: rgba(92, 255, 180, 0.15); color: var(--accent-success); }
    .badge--note { background: rgba(124, 92, 255, 0.15); color: var(--accent-primary); }
    .badge--confusion { background: rgba(255, 199, 92, 0.15); color: var(--accent-warning); }
    .badge--frustration { background: rgba(255, 92, 124, 0.15); color: var(--accent-error); }

    .observation-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .observation-location {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .observation-description {
      color: var(--text-secondary);
    }

    .observation-recommendation {
      color: var(--accent-primary);
      font-size: 0.875rem;
      margin-top: 0.5rem;
      font-style: italic;
    }

    .screenshot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .screenshot {
      background: var(--bg-surface);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border-subtle);
    }

    .screenshot img {
      width: 100%;
      display: block;
      border-bottom: 1px solid var(--border-subtle);
    }

    .screenshot-info {
      padding: 1rem;
    }

    .screenshot-info strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .screenshot-info p {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .screenshot-url {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: monospace;
    }

    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-subtle);
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .footer a {
      color: var(--accent-primary);
      text-decoration: none;
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .persona-details {
        grid-template-columns: 1fr;
      }

      .screenshot-grid {
        grid-template-columns: 1fr;
      }

      .obs-counts {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(results.persona)}</h1>
    <p class="subtitle">${escapeHtml(results.background)}</p>

    <div class="persona-details">
      <div class="persona-section">
        <h3>Goals</h3>
        <ul>${goalsHtml}</ul>
      </div>
      <div class="persona-section">
        <h3>Behaviors</h3>
        <ul>${behaviorsHtml}</ul>
      </div>
    </div>

    <h2>Session Metrics</h2>
    <div class="metrics">
      ${metricsHtml}
    </div>

    <h2>Observations</h2>
    ${observationCountsHtml}
    ${observationsHtml}

    <h2>Tasks</h2>
    ${tasksHtml}

    <h2>Screenshots</h2>
    <div class="screenshot-grid">
      ${screenshotsHtml}
    </div>

    <div class="footer">
      Generated by <a href="https://personaspec.dev">PersonaSpec</a> on ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;
}

export const reportCommand = new Command('report')
  .description('Generate an HTML report from test results')
  .argument('<results>', 'Path to results JSON file')
  .option('-o, --output <file>', 'Output HTML file', 'report.html')
  .action(async (resultsPath: string, options: { output: string }) => {
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

    // Validate results structure
    if (!results.persona || !results.observations) {
      console.error('Error: Invalid PersonaSpec results file format');
      process.exit(1);
    }

    console.log(`Generating report for: ${results.persona}`);
    console.log(`  - ${results.tasks.length} tasks`);
    console.log(`  - ${results.observations.length} observations`);
    console.log(`  - ${results.screenshots.length} screenshots`);

    const html = generateHtml(results);

    await fs.writeFile(options.output, html);
    console.log(`\nReport generated: ${options.output}`);
  });
