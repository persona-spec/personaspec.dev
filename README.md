# PersonaSpec

**Persona-driven testing validates user journeys, not just features.**

PersonaSpec is a methodology for E2E testing that simulates real users with specific backgrounds, goals, and behaviors. Combined with AI vision analysis, it catches UX issues that traditional automation misses.

## Live Site

Visit **[personaspec.dev](https://persona-spec.github.io/personaspec.dev/)** to learn more.

## The Core Idea

Traditional E2E tests verify features work. PersonaSpec tests verify *users succeed*.

| Traditional E2E | Persona-Driven |
|-----------------|----------------|
| Login form submits successfully | Can a trial user find the key feature before giving up? |
| Search returns results | Is the value proposition clear within 10 seconds? |
| Filter applies correctly | Can keyboard users complete the signup flow? |
| Data displays in table | What makes power users switch to a competitor? |

## How It Works

1. **Define Personas** - Create fictional users with specific backgrounds, goals, and behaviors
2. **Run Journeys** - Execute task-based tests as each persona would naturally use your app
3. **AI Analyzes** - A vision model reviews screenshots in context of the persona and task

## Documentation

- [Methodology](https://persona-spec.github.io/personaspec.dev/methodology.html) - Full specification
- [Personas](https://persona-spec.github.io/personaspec.dev/personas.html) - Example persona library
- [Example](https://persona-spec.github.io/personaspec.dev/example.html) - Real findings from testing this site
- [Get Started](https://persona-spec.github.io/personaspec.dev/getting-started.html) - Quick start guide

## Running Locally

This is a static HTML/CSS/JS site. To run locally:

```bash
# Clone the repository
git clone https://github.com/persona-spec/personaspec.dev.git
cd personaspec.dev

# Start a local server (Python)
python -m http.server 8080

# Or use any static file server
npx serve .
```

Then open http://localhost:8080 in your browser.

## Project Structure

```
personaspec.dev/
├── index.html              # Homepage
├── methodology.html        # Full methodology documentation
├── personas.html           # Example personas library
├── example.html            # Real test findings showcase
├── getting-started.html    # Quick start guide
├── favicon.svg             # Site favicon
├── css/
│   ├── variables.css       # Design tokens
│   ├── base.css            # Global styles
│   ├── components.css      # Reusable components
│   └── pages/              # Page-specific styles
├── js/
│   └── main.js             # Progressive enhancements
└── test-results/           # Example persona test outputs
```

## The Three Pillars

### 1. Personas
Fictional users with specific backgrounds, goals, and behaviors. Each represents a distinct archetype who would use your app differently.

### 2. Journeys
Task-based tests that simulate real user sessions, plus free exploration to catch issues that goal-focused tests miss.

### 3. Vision Analysis
AI reviews screenshots in context of persona and task, catching UX issues, accessibility problems, and design inconsistencies.

## Observation Types

| Type | Meaning | Example |
|------|---------|---------|
| `success` | Goal achieved smoothly | "Search returned relevant results immediately" |
| `note` | Room for improvement | "Filter options work but could be more discoverable" |
| `confusion` | Unclear what to do | "Clicked 'Submit' but no confirmation appeared" |
| `frustration` | Goal blocked | "Back button returned to wrong page, lost data" |

## License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with persona-driven testing. We used PersonaSpec to test this very site.
