# UI Tokens — VoxGuard

> **Design Philosophy**: Minimalist monochrome (black, white, and their shades). Clean, professional, distraction-free. Color is used **only** for semantic meaning — risk levels, status indicators, and actionable elements.

## How to Use This File

1. **Read this before writing any component.** All visual values must come from tokens.
2. **Never hardcode colors, font sizes, spacing, or shadows** in component JSX or inline styles.
3. **Use Tailwind classes that reference these tokens** — e.g., `bg-surface`, `text-primary`, `border-border`.
4. **All tokens are defined as CSS custom properties** in `globals.css` and mapped to Tailwind in `tailwind.config.ts`.
5. **If a value you need doesn't exist here**, add it to this document first, then implement.

---

## Color Tokens

### Core Palette (Monochrome)

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| `--background` | `background` | `#000000` | Page background |
| `--foreground` | `foreground` | `#FAFAFA` | Primary text |
| `--surface` | `surface` | `#0A0A0A` | Card and panel backgrounds |
| `--surface-hover` | `surface-hover` | `#141414` | Hovered cards/rows |
| `--surface-active` | `surface-active` | `#1A1A1A` | Active/selected surfaces |
| `--surface-elevated` | `surface-elevated` | `#1E1E1E` | Modals, dropdowns, popovers |
| `--border` | `border` | `#262626` | Default borders |
| `--border-hover` | `border-hover` | `#404040` | Hovered borders |
| `--ring` | `ring` | `#525252` | Focus rings |

### Text Colors

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| `--text-primary` | `text-primary` | `#FAFAFA` | Primary headings and body text |
| `--text-secondary` | `text-secondary` | `#A3A3A3` | Secondary labels, descriptions |
| `--text-tertiary` | `text-tertiary` | `#737373` | Placeholder text, disabled text |
| `--text-muted` | `text-muted` | `#525252` | Very subtle text, timestamps |
| `--text-inverse` | `text-inverse` | `#0A0A0A` | Text on light backgrounds (e.g., white badges) |

### Semantic Colors (Risk & Status)

> These are the **only** colors beyond black/white. Used exclusively for risk levels and status indicators.

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| `--genuine` | `genuine` | `#22C55E` | Genuine verdict, low risk, safe |
| `--genuine-muted` | `genuine-muted` | `#22C55E1A` | Genuine background tint (10% opacity) |
| `--suspicious` | `suspicious` | `#EAB308` | Suspicious verdict, medium risk, warning |
| `--suspicious-muted` | `suspicious-muted` | `#EAB3081A` | Suspicious background tint |
| `--cloned` | `cloned` | `#EF4444` | Cloned verdict, high risk, danger |
| `--cloned-muted` | `cloned-muted` | `#EF44441A` | Cloned background tint |
| `--critical` | `critical` | `#DC2626` | Critical alerts, system errors |
| `--critical-muted` | `critical-muted` | `#DC26261A` | Critical background tint |
| `--info` | `info` | `#3B82F6` | Informational badges, links |
| `--info-muted` | `info-muted` | `#3B82F61A` | Info background tint |

### Risk Score Color Mapping

| Score Range | Label | Color Token | Background Token |
|-------------|-------|-------------|-----------------|
| 0 – 25 | Low Risk | `genuine` | `genuine-muted` |
| 26 – 50 | Medium Risk | `suspicious` | `suspicious-muted` |
| 51 – 75 | High Risk | `cloned` | `cloned-muted` |
| 76 – 100 | Critical Risk | `critical` | `critical-muted` |

---

## Typography Tokens

### Font Family

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Inter', system-ui, -apple-system, sans-serif` | All UI text |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Code snippets, API docs, risk scores |

### Font Sizes

| Token | CSS Variable | Size | Line Height | Usage |
|-------|-------------|------|-------------|-------|
| `--text-xs` | `text-xs` | `0.75rem` (12px) | `1rem` | Timestamps, fine print |
| `--text-sm` | `text-sm` | `0.875rem` (14px) | `1.25rem` | Secondary labels, table cells |
| `--text-base` | `text-base` | `1rem` (16px) | `1.5rem` | Body text, input fields |
| `--text-lg` | `text-lg` | `1.125rem` (18px) | `1.75rem` | Card titles, section headers |
| `--text-xl` | `text-xl` | `1.25rem` (20px) | `1.75rem` | Page section titles |
| `--text-2xl` | `text-2xl` | `1.5rem` (24px) | `2rem` | Page titles |
| `--text-3xl` | `text-3xl` | `1.875rem` (30px) | `2.25rem` | Dashboard stat numbers |
| `--text-4xl` | `text-4xl` | `2.25rem` (36px) | `2.5rem` | Risk score display (large) |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `font-normal` | `400` | Body text, descriptions |
| `font-medium` | `500` | Labels, table headers, nav items |
| `font-semibold` | `600` | Card titles, section headers |
| `font-bold` | `700` | Page titles, stat numbers, verdicts |

---

## Spacing Tokens

> Use Tailwind's default spacing scale. These are the **most commonly used values** in VoxGuard.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `0.25rem` (4px) | Tight internal padding (badge padding) |
| `space-2` | `0.5rem` (8px) | Small gaps, inline spacing |
| `space-3` | `0.75rem` (12px) | Input padding, compact card padding |
| `space-4` | `1rem` (16px) | Standard card padding, gap between elements |
| `space-5` | `1.25rem` (20px) | Section spacing within cards |
| `space-6` | `1.5rem` (24px) | Card padding, gap between cards |
| `space-8` | `2rem` (32px) | Section spacing on pages |
| `space-10` | `2.5rem` (40px) | Large section gaps |
| `space-12` | `3rem` (48px) | Page top/bottom padding |
| `space-16` | `4rem` (64px) | Sidebar width base unit |

### Standard Patterns

| Context | Spacing |
|---------|---------|
| Card padding | `p-6` |
| Card gap (in grid) | `gap-6` |
| Section vertical gap | `space-y-8` |
| Input padding | `px-3 py-2` |
| Button padding | `px-4 py-2` |
| Badge padding | `px-2 py-0.5` |
| Table cell padding | `px-4 py-3` |
| Page content padding | `p-8` |
| Sidebar width (collapsed) | `w-16` (64px) |
| Sidebar width (expanded) | `w-64` (256px) |

---

## Border & Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | `0.25rem` (4px) | Badges, small tags |
| `rounded` | `0.375rem` (6px) | Buttons, inputs |
| `rounded-md` | `0.5rem` (8px) | Cards, dropdowns |
| `rounded-lg` | `0.75rem` (12px) | Modals, large cards |
| `rounded-xl` | `1rem` (16px) | Hero sections, feature cards |
| `rounded-full` | `9999px` | Avatars, status dots, circular badges |

| Border | Value | Usage |
|--------|-------|-------|
| `border` | `1px solid var(--border)` | Card borders, input borders |
| `border-2` | `2px solid` | Focus states |
| `border-0` | none | Flat style elements |

---

## Shadow Tokens

> Minimal shadows — the dark theme relies on borders and surface elevation, not shadows.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-none` | `none` | Default for most elements |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.5)` | Subtle lift for dropdowns |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.5)` | Modals, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | Toast notifications |

---

## Component Tokens

### Button Variants

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| **Primary** | `#FAFAFA` | `#0A0A0A` | none | `#E5E5E5` bg |
| **Secondary** | `transparent` | `#FAFAFA` | `var(--border)` | `var(--surface-hover)` bg |
| **Ghost** | `transparent` | `#A3A3A3` | none | `var(--surface-hover)` bg |
| **Danger** | `var(--cloned)` | `#FFFFFF` | none | darker red |
| **Genuine** | `var(--genuine)` | `#FFFFFF` | none | darker green |

### Input Fields

| Property | Value |
|----------|-------|
| Background | `var(--surface)` |
| Border | `1px solid var(--border)` |
| Text | `var(--text-primary)` |
| Placeholder | `var(--text-tertiary)` |
| Focus border | `var(--text-secondary)` |
| Focus ring | `2px solid var(--ring)` |
| Padding | `px-3 py-2` |
| Border radius | `rounded` |
| Font size | `text-sm` |

### Badge / Status Indicator

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| **Genuine** | `var(--genuine-muted)` | `var(--genuine)` | none |
| **Suspicious** | `var(--suspicious-muted)` | `var(--suspicious)` | none |
| **Cloned** | `var(--cloned-muted)` | `var(--cloned)` | none |
| **Critical** | `var(--critical-muted)` | `var(--critical)` | none |
| **Info** | `var(--info-muted)` | `var(--info)` | none |
| **Default** | `var(--surface-hover)` | `var(--text-secondary)` | none |

---

## globals.css — Complete Token Definition

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Core Palette */
    --background: #000000;
    --foreground: #FAFAFA;
    --surface: #0A0A0A;
    --surface-hover: #141414;
    --surface-active: #1A1A1A;
    --surface-elevated: #1E1E1E;
    --border: #262626;
    --border-hover: #404040;
    --ring: #525252;

    /* Text */
    --text-primary: #FAFAFA;
    --text-secondary: #A3A3A3;
    --text-tertiary: #737373;
    --text-muted: #525252;
    --text-inverse: #0A0A0A;

    /* Semantic — Risk & Status */
    --genuine: #22C55E;
    --genuine-muted: rgba(34, 197, 94, 0.1);
    --suspicious: #EAB308;
    --suspicious-muted: rgba(234, 179, 8, 0.1);
    --cloned: #EF4444;
    --cloned-muted: rgba(239, 68, 68, 0.1);
    --critical: #DC2626;
    --critical-muted: rgba(220, 38, 38, 0.1);
    --info: #3B82F6;
    --info-muted: rgba(59, 130, 246, 0.1);

    /* Typography */
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  }

  /* Base resets */
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: var(--background);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--border-hover);
  }
}
```

## tailwind.config.ts — Token Mapping

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
          elevated: 'var(--surface-elevated)',
        },
        border: {
          DEFAULT: 'var(--border)',
          hover: 'var(--border-hover)',
        },
        ring: 'var(--ring)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        genuine: {
          DEFAULT: 'var(--genuine)',
          muted: 'var(--genuine-muted)',
        },
        suspicious: {
          DEFAULT: 'var(--suspicious)',
          muted: 'var(--suspicious-muted)',
        },
        cloned: {
          DEFAULT: 'var(--cloned)',
          muted: 'var(--cloned-muted)',
        },
        critical: {
          DEFAULT: 'var(--critical)',
          muted: 'var(--critical-muted)',
        },
        info: {
          DEFAULT: 'var(--info)',
          muted: 'var(--info-muted)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Rules — Non-Negotiable

> [!CAUTION]
> Violating these rules creates visual inconsistency and makes the UI unmaintainable.

1. **NEVER hardcode hex colors in JSX.** Use `bg-surface`, `text-text-secondary`, `border-genuine`, etc.
2. **NEVER use raw Tailwind color classes** like `bg-gray-800`, `text-red-500`. Use the semantic tokens.
3. **NEVER use inline `style={{}}` for colors, fonts, or spacing.** Tailwind classes only.
4. **NEVER create new CSS files per component.** All base styles go in `globals.css`.
5. **ALWAYS use the `cn()` utility** for conditional classes.
6. **ALWAYS use CSS variables** for any dynamic color values (e.g., risk score colors in charts).
7. **If a token doesn't exist for your use case**, add it to this document AND `globals.css` — don't work around it.
