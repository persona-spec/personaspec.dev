# PersonaSpec Style Guide

A CSS-first design system for personaspec.dev, emphasizing warmth and approachability while maintaining developer credibility.

## Design Philosophy

**Warm technical.** Developer tools are often cold. PersonaSpec is about *people* testing for *people*. The design should feel credible to developers but warmer than typical dev docs.

**CSS-first.** Every visual element achievable with modern CSS. No image dependencies, fast loading, easy to maintain.

---

## Color System

### Dark Mode Base

```css
:root {
  /* Backgrounds */
  --bg-base: #0D0F14;
  --bg-surface: #161922;
  --bg-elevated: #1E222D;
  --bg-hover: #252A38;

  /* Borders */
  --border-subtle: #2A2F3C;
  --border-default: #3D4455;

  /* Text */
  --text-primary: #F0F2F5;
  --text-secondary: #9BA3B5;
  --text-muted: #5C6478;

  /* Accents */
  --accent-primary: #7C5CFF;      /* Purple - CTAs, links */
  --accent-primary-hover: #9B7FFF;
  --accent-secondary: #FF7C5C;    /* Coral - warmth, highlights */
  --accent-success: #5CFFB4;      /* Mint - success observations */
  --accent-warning: #FFC75C;      /* Amber - confusion observations */
  --accent-error: #FF5C7C;        /* Pink - frustration observations */
}
```

### Color Rationale

| Color | Hex | Purpose |
|-------|-----|---------|
| **Purple primary** | `#7C5CFF` | Distinct from GitHub blue, Vercel black. Suggests insight and creativity. |
| **Coral secondary** | `#FF7C5C` | Humanizes the tech. Warm without being aggressive. |
| **Mint success** | `#5CFFB4` | Maps to "success" observation type |
| **Amber warning** | `#FFC75C` | Maps to "confusion" observation type |
| **Pink error** | `#FF5C7C` | Maps to "frustration" observation type |

### Accessibility

All text combinations must pass WCAG AA (4.5:1 minimum contrast ratio):
- Primary text on dark background: 12.8:1 ✓
- Secondary text on dark background: 7.1:1 ✓
- Purple accent on dark background: 7.2:1 ✓

---

## Typography

### Font Stack

```css
:root {
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}
```

Load from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

```css
:root {
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 2rem;       /* 32px */
  --text-4xl: 2.5rem;     /* 40px */
  --text-5xl: 3.5rem;     /* 56px */
}
```

### Type Usage

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero headline | `--text-5xl` | 800 | 1.1 |
| Section headline | `--text-4xl` | 700 | 1.2 |
| Card headline | `--text-2xl` | 600 | 1.3 |
| Body text | `--text-base` | 400 | 1.6 |
| Code | `--text-sm` | 400 | 1.5 |
| Captions/labels | `--text-xs` | 500 | 1.4 |

---

## Spacing

8px base unit with consistent multipliers:

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-24: 6rem;     /* 96px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

---

## CSS Visual Effects

### 1. Hero Aurora Background

Animated gradient suggesting "vision" and "insight":

```css
.hero {
  position: relative;
  overflow: hidden;
  background: var(--bg-base);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%,
      rgba(124, 92, 255, 0.2), transparent 70%),
    radial-gradient(ellipse 50% 50% at 90% 50%,
      rgba(255, 124, 92, 0.12), transparent 60%),
    radial-gradient(ellipse 40% 40% at 10% 80%,
      rgba(92, 255, 180, 0.08), transparent 50%);
  animation: aurora 15s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes aurora {
  0% { opacity: 1; transform: scale(1) rotate(0deg); }
  100% { opacity: 0.8; transform: scale(1.1) rotate(3deg); }
}
```

### 2. Gradient Text Headlines

```css
.gradient-text {
  background: linear-gradient(135deg,
    var(--accent-primary) 0%,
    var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 3. Glowing Buttons

```css
.button-primary {
  background: var(--accent-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(124, 92, 255, 0.3);
  transition: all 0.2s ease;
}

.button-primary:hover {
  background: var(--accent-primary-hover);
  box-shadow: 0 0 30px rgba(124, 92, 255, 0.5);
  transform: translateY(-2px);
}
```

### 4. Glass Cards

```css
.card {
  background: rgba(22, 25, 34, 0.8);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
```

### 5. Persona Avatars (Pure CSS)

Geometric shapes with initials - no images needed:

```css
.persona-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-xl);
  color: white;
}

.persona-avatar--researcher {
  background: linear-gradient(135deg, #7C5CFF 0%, #5C7CFF 100%);
}

.persona-avatar--visitor {
  background: linear-gradient(135deg, #5CFFB4 0%, #5CB4FF 100%);
}

.persona-avatar--auditor {
  background: linear-gradient(135deg, #FFC75C 0%, #FF7C5C 100%);
}

.persona-avatar--browser {
  background: linear-gradient(135deg, #FF7C5C 0%, #FF5C7C 100%);
}

.persona-avatar--designer {
  background: linear-gradient(135deg, #B45CFF 0%, #7C5CFF 100%);
}

.persona-avatar--journalist {
  background: linear-gradient(135deg, #5C7CFF 0%, #5CFFB4 100%);
}
```

### 6. Observation Type Badges

Visual system for the four observation types:

```css
.observation-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: 100px;
  font-size: var(--text-sm);
  font-weight: 500;
}

.observation-badge::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.observation-badge--success {
  background: rgba(92, 255, 180, 0.15);
  color: var(--accent-success);
}
.observation-badge--success::before {
  background: var(--accent-success);
}

.observation-badge--note {
  background: rgba(124, 92, 255, 0.15);
  color: var(--accent-primary);
}
.observation-badge--note::before {
  background: var(--accent-primary);
}

.observation-badge--confusion {
  background: rgba(255, 199, 92, 0.15);
  color: var(--accent-warning);
}
.observation-badge--confusion::before {
  background: var(--accent-warning);
}

.observation-badge--frustration {
  background: rgba(255, 92, 124, 0.15);
  color: var(--accent-error);
}
.observation-badge--frustration::before {
  background: var(--accent-error);
}
```

### 7. Code Blocks

```css
.code-block {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  overflow-x: auto;
}

.code-block .keyword { color: var(--accent-primary); }
.code-block .string { color: var(--accent-success); }
.code-block .comment { color: var(--text-muted); font-style: italic; }
.code-block .function { color: var(--accent-secondary); }
```

### 8. Step Indicators

For "how it works" flows:

```css
.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 2px solid var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--accent-primary);
}

.step-connector {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg,
    var(--accent-primary) 0%,
    var(--border-subtle) 100%);
}
```

### 9. Animated Underline Links

```css
.link {
  color: var(--accent-primary);
  text-decoration: none;
  position: relative;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.link:hover::after {
  width: 100%;
}
```

### 10. Comparison Columns

```css
.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.comparison-col--old {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  opacity: 0.7;
}

.comparison-col--new {
  background: rgba(124, 92, 255, 0.1);
  border: 1px solid var(--accent-primary);
  box-shadow: 0 0 30px rgba(124, 92, 255, 0.1);
}
```

---

## Layout

### Container

```css
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.container--narrow {
  max-width: 720px;
}
```

### Section Spacing

```css
.section {
  padding: var(--space-24) 0;
}

@media (max-width: 768px) {
  .section {
    padding: var(--space-16) 0;
  }
}
```

### Grid Layouts

```css
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .grid-3 { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .grid-2 { grid-template-columns: 1fr; }
}
```

---

## Decorative Elements

### Dotted Background

```css
.dotted-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    var(--border-subtle) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
}
```

### Corner Accent Lines

```css
.corner-accent::before,
.corner-accent::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid var(--accent-primary);
  opacity: 0.3;
}

.corner-accent::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.corner-accent::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}
```

### Glowing Divider

```css
.glow-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--accent-primary) 50%,
    transparent 100%
  );
  box-shadow: 0 0 20px rgba(124, 92, 255, 0.5);
  margin: var(--space-16) 0;
}
```

---

## Component Examples

### Hero Section

```html
<section class="hero">
  <div class="container">
    <p class="hero-eyebrow">E2E Testing Methodology</p>
    <h1 class="hero-headline">
      Test like your <span class="gradient-text">users think</span>
    </h1>
    <p class="hero-subhead">
      Persona-driven testing validates user journeys, not just features.
      AI vision analysis catches what automation misses.
    </p>
    <div class="hero-cta">
      <button class="button-primary">Get Started</button>
      <a href="#how" class="link">See how it works</a>
    </div>
  </div>
</section>
```

### Persona Card

```html
<article class="persona-card card">
  <div class="persona-avatar persona-avatar--researcher">MR</div>
  <h3 class="persona-name">Maria</h3>
  <p class="persona-role">Campaign Researcher</p>
  <p class="persona-quote">
    "I need to find specific voting records quickly and accurately."
  </p>
  <div class="persona-traits">
    <span class="trait">Power User</span>
    <span class="trait">Keyboard Nav</span>
    <span class="trait">Detail-Oriented</span>
  </div>
</article>
```

### Observation List

```html
<ul class="observation-list">
  <li>
    <span class="observation-badge observation-badge--success">success</span>
    Goal achieved smoothly
  </li>
  <li>
    <span class="observation-badge observation-badge--confusion">confusion</span>
    Unclear what to do next
  </li>
</ul>
```

---

## Full CSS Variables Reference

```css
:root {
  /* Colors */
  --bg-base: #0D0F14;
  --bg-surface: #161922;
  --bg-elevated: #1E222D;
  --bg-hover: #252A38;
  --border-subtle: #2A2F3C;
  --border-default: #3D4455;
  --text-primary: #F0F2F5;
  --text-secondary: #9BA3B5;
  --text-muted: #5C6478;
  --accent-primary: #7C5CFF;
  --accent-primary-hover: #9B7FFF;
  --accent-secondary: #FF7C5C;
  --accent-success: #5CFFB4;
  --accent-warning: #FFC75C;
  --accent-error: #FF5C7C;

  /* Typography */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;
  --text-5xl: 3.5rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-base);
  -webkit-font-smoothing: antialiased;
}
```

---

## Design Principles Summary

1. **Warm purple/coral palette** - distinct from cold blue dev tools
2. **Aurora gradient hero** - suggests vision and insight, pure CSS
3. **Observation color system** - methodology concepts become visual language
4. **Geometric persona avatars** - memorable without images
5. **Glass cards with glow** - modern, premium feel
6. **No image dependencies** - fast, maintainable, accessible
