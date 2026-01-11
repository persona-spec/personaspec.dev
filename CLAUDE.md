# PersonaSpec Project Instructions

## Project Overview

PersonaSpec (personaspec.dev) is a static website evangelizing "Persona-Driven Development" - a testing methodology that uses fictional personas to validate user journeys rather than isolated features, combined with AI vision analysis of screenshots.

The site will be hosted on GitHub Pages (static HTML/CSS/JS only).

## Key Documents

- `persona-driven-playwright-testing.md` - The full methodology specification
- `STYLE_GUIDE.md` - Design system and CSS patterns (MUST follow)

## Design Requirements

**Always follow `STYLE_GUIDE.md` when writing CSS or HTML.**

Key constraints:
- CSS-first design - no external images except a logo if needed
- Dark mode with warm purple/coral accents
- All visual effects must be achievable with pure CSS
- Mobile responsive (breakpoints at 900px and 600px)

### Color Palette (Quick Reference)

```css
--bg-base: #0D0F14;
--accent-primary: #7C5CFF;    /* Purple - CTAs, links */
--accent-secondary: #FF7C5C;  /* Coral - warmth */
--accent-success: #5CFFB4;    /* Success observations */
--accent-warning: #FFC75C;    /* Confusion observations */
--accent-error: #FF5C7C;      /* Frustration observations */
```

### Typography

- Sans-serif: Inter (Google Fonts)
- Monospace: JetBrains Mono
- Hero headlines: 3.5rem, weight 800
- Body: 1rem, weight 400, line-height 1.6

## Site Structure

Target pages:
1. **Home/Landing** - Hero, problem/solution, how it works overview
2. **Methodology** - Full spec from the markdown, formatted nicely
3. **Personas** - Interactive showcase of example personas
4. **Getting Started** - Quick start guide with code examples

## Code Standards

### HTML
- Semantic HTML5 elements
- Accessibility: proper heading hierarchy, alt text, ARIA labels where needed
- BEM-style class naming: `.block__element--modifier`

### CSS
- Use CSS custom properties defined in STYLE_GUIDE.md
- Mobile-first responsive design
- No CSS frameworks - vanilla CSS only
- Organize styles by component

### JavaScript
- Vanilla JS only (no frameworks for a static site)
- Progressive enhancement - site must work without JS
- Use for: navigation toggles, tab interactions, copy-to-clipboard

## Content Tone

- Approachable expert - like a senior dev explaining a better approach
- Not salesy, not dry
- Technical accuracy over hype
- Show don't tell - use code examples liberally

## File Organization

```
persona-spec/
├── index.html
├── methodology.html
├── personas.html
├── getting-started.html
├── css/
│   ├── variables.css
│   ├── base.css
│   └── components.css
├── js/
│   └── main.js
├── CLAUDE.md
├── STYLE_GUIDE.md
└── persona-driven-playwright-testing.md
```

## Do NOT

- Use CSS frameworks (Tailwind, Bootstrap, etc.)
- Add images unless absolutely necessary
- Over-engineer with build tools - keep it simple static files
- Use placeholder content - write real copy based on the methodology doc
- Deviate from the color palette in STYLE_GUIDE.md
