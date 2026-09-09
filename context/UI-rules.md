# UI Rules — VoxGuard

> This document defines the UI behaviour, layout patterns, and component specifications. Read this before building any UI component. All values reference tokens from `UI-tokens.md`.

---

## Layout

### Overall Structure

```
┌────────────────────────────────────────────────────────────────┐
│ Top Bar (h-14, fixed top, full width)                          │
├──────────┬─────────────────────────────────────────────────────┤
│          │                                                     │
│ Sidebar  │              Main Content Area                      │
│ (left,   │              (scrollable, padded)                   │
│ fixed,   │                                                     │
│ full     │                                                     │
│ height)  │                                                     │
│          │                                                     │
│ w-16     │                                                     │
│ (icon)   │                                                     │
│ or       │                                                     │
│ w-64     │                                                     │
│ (full)   │                                                     │
│          │                                                     │
└──────────┴─────────────────────────────────────────────────────┘
```

### Top Bar

| Property | Value |
|----------|-------|
| Height | `h-14` (56px) |
| Position | `fixed top-0 left-0 right-0 z-50` |
| Background | `bg-background` with `border-b border-border` |
| Padding | `px-4` |
| Content alignment | `flex items-center justify-between` |
| Left side | VoxGuard logo + name (collapsible with sidebar) |
| Right side | Notification bell (with badge count), user avatar + name, logout button |

### Sidebar (Left, Collapsible)

| Property | Collapsed | Expanded |
|----------|-----------|----------|
| Width | `w-16` (64px) | `w-64` (256px) |
| Position | `fixed left-0 top-14 bottom-0 z-40` | Same |
| Background | `bg-background` | `bg-background` |
| Border | `border-r border-border` | `border-r border-border` |
| Toggle | Click the collapse/expand icon at the bottom | Same |
| Nav items | Icon only (centered) | Icon + label |
| Active indicator | Left border accent `border-l-2 border-foreground` | Same + `bg-surface-hover` |
| Hover | `bg-surface-hover` | `bg-surface-hover` |
| Transition | `transition-all duration-200 ease-in-out` | Same |

#### Sidebar Navigation Items

| Item | Icon | Route |
|------|------|-------|
| Dashboard | `LayoutDashboard` | `/` |
| Call Analysis | `AudioWaveform` | `/analysis` |
| Alerts | `AlertTriangle` | `/alerts` |
| Settings | `Settings` | `/settings` |
| API Docs | `FileCode` | `/api-docs` |
| Collapse Toggle | `ChevronsLeft` / `ChevronsRight` | — |

### Main Content Area

| Property | Value |
|----------|-------|
| Margin | `ml-16` (sidebar collapsed) or `ml-64` (expanded) |
| Margin top | `mt-14` (below top bar) |
| Padding | `p-8` |
| Max width | `max-w-7xl` (optional — or full width for dashboard) |
| Scroll | `overflow-y-auto` on this container |
| Transition | `transition-all duration-200` (synced with sidebar) |

---

## Font Usage

### Typography Hierarchy

| Element | Size | Weight | Color | Class |
|---------|------|--------|-------|-------|
| Page title | `text-2xl` | `font-bold` | `text-text-primary` | `text-2xl font-bold text-text-primary` |
| Section title | `text-xl` | `font-semibold` | `text-text-primary` | `text-xl font-semibold text-text-primary` |
| Card title | `text-lg` | `font-semibold` | `text-text-primary` | `text-lg font-semibold text-text-primary` |
| Body text | `text-sm` | `font-normal` | `text-text-primary` | `text-sm text-text-primary` |
| Secondary text | `text-sm` | `font-normal` | `text-text-secondary` | `text-sm text-text-secondary` |
| Label | `text-sm` | `font-medium` | `text-text-secondary` | `text-sm font-medium text-text-secondary` |
| Caption / timestamp | `text-xs` | `font-normal` | `text-text-muted` | `text-xs text-text-muted` |
| Stat number | `text-3xl` | `font-bold` | `text-text-primary` | `text-3xl font-bold text-text-primary font-mono` |
| Risk score (large) | `text-4xl` | `font-bold` | dynamic | `text-4xl font-bold font-mono` |

### Font Rules

1. **Body text is always `text-sm` (14px)** — not `text-base`. This keeps the monitoring UI dense and information-rich.
2. **Stat numbers and risk scores use `font-mono`** — monospaced digits align visually in tables and gauges.
3. **Never go below `text-xs` (12px)** — readability floor.
4. **Never go above `text-4xl` (36px)** — reserved for the large risk score display only.

---

## Cards

### Standard Card

```tsx
<div className="bg-surface border border-border rounded-md p-6">
  <h3 className="text-lg font-semibold text-text-primary mb-4">Card Title</h3>
  <p className="text-sm text-text-secondary">Card content here.</p>
</div>
```

| Property | Value |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-md` |
| Padding | `p-6` |
| Hover (if clickable) | `hover:border-border-hover hover:bg-surface-hover transition-colors` |
| Title | `text-lg font-semibold text-text-primary` |
| Description | `text-sm text-text-secondary` |

### Stat Card (Dashboard)

```tsx
<div className="bg-surface border border-border rounded-md p-6">
  <div className="flex items-center justify-between">
    <p className="text-sm font-medium text-text-secondary">Total Calls Today</p>
    <Phone className="h-4 w-4 text-text-muted" />
  </div>
  <p className="text-3xl font-bold text-text-primary font-mono mt-2">1,247</p>
  <p className="text-xs text-text-muted mt-1">+12% from yesterday</p>
</div>
```

### Elevated Card (Modals, Popovers)

| Property | Value |
|----------|-------|
| Background | `bg-surface-elevated` |
| Border | `border border-border` |
| Shadow | `shadow-md` |
| Border radius | `rounded-lg` |

---

## Navbar / Top Bar Behaviour

| Behaviour | Implementation |
|-----------|---------------|
| Always visible | `fixed` position, never scrolls away |
| Notification bell | `lucide-react Bell` icon with red dot badge if unread alerts exist |
| Badge count | Show count (max "99+") in a `bg-cloned text-white` circle |
| User menu | Click avatar → dropdown with: Profile, Settings, Logout |
| Dropdown | `bg-surface-elevated border border-border rounded-md shadow-md` |
| Logo | VoxGuard text in `font-bold text-lg` or a minimal shield icon |

---

## Tables (Dense Style)

### Table Structure

```tsx
<div className="bg-surface border border-border rounded-md overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-border">
        <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-surface-hover transition-colors">
        <td className="px-4 py-3 text-sm text-text-primary">Cell content</td>
      </tr>
    </tbody>
  </table>
</div>
```

| Property | Value |
|----------|-------|
| Container | `bg-surface border border-border rounded-md overflow-hidden` |
| Header row | `border-b border-border` |
| Header cell | `px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider` |
| Body row | `hover:bg-surface-hover transition-colors` |
| Body cell | `px-4 py-3 text-sm text-text-primary` |
| Row divider | `divide-y divide-border` |
| Selected row | `bg-surface-active` |
| Row height | Compact — `py-3` (not `py-4`) |

### Table Pagination

| Property | Value |
|----------|-------|
| Position | Below table, right-aligned |
| Style | `flex items-center gap-2` |
| Page info | `text-sm text-text-secondary` → "Showing 1–20 of 150" |
| Buttons | Ghost buttons for Previous/Next, current page highlighted |

---

## Buttons

### Button Variants

#### Primary Button

```tsx
<button className="bg-foreground text-text-inverse px-4 py-2 rounded text-sm font-medium hover:bg-foreground/90 transition-colors">
  Analyze
</button>
```

#### Secondary Button

```tsx
<button className="border border-border text-text-primary px-4 py-2 rounded text-sm font-medium hover:bg-surface-hover transition-colors">
  Cancel
</button>
```

#### Ghost Button

```tsx
<button className="text-text-secondary px-4 py-2 rounded text-sm font-medium hover:bg-surface-hover hover:text-text-primary transition-colors">
  Reset
</button>
```

#### Danger Button

```tsx
<button className="bg-cloned text-white px-4 py-2 rounded text-sm font-medium hover:bg-cloned/90 transition-colors">
  Delete
</button>
```

### Button Sizes

| Size | Padding | Text | Icon Size |
|------|---------|------|-----------|
| `sm` | `px-3 py-1.5` | `text-xs` | `h-3.5 w-3.5` |
| `default` | `px-4 py-2` | `text-sm` | `h-4 w-4` |
| `lg` | `px-6 py-2.5` | `text-base` | `h-5 w-5` |

### Button Rules

1. **One primary action per view** — don't have multiple primary buttons competing for attention.
2. **Icon + text for important actions** — `<Shield className="h-4 w-4 mr-2" /> Analyze`
3. **Icon-only for toolbar actions** — use `rounded-md p-2` square buttons.
4. **Disabled state**: `opacity-50 cursor-not-allowed pointer-events-none`
5. **Loading state**: replace text with spinner icon, disable interaction.

---

## Badges

### Status Badges

```tsx
// Verdict badges
<span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-genuine-muted text-genuine">
  Genuine
</span>
<span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-suspicious-muted text-suspicious">
  Suspicious
</span>
<span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-cloned-muted text-cloned">
  Cloned
</span>
```

### Severity Badges

| Severity | Class |
|----------|-------|
| Low | `bg-info-muted text-info` |
| Medium | `bg-suspicious-muted text-suspicious` |
| High | `bg-cloned-muted text-cloned` |
| Critical | `bg-critical-muted text-critical` |

### Alert Status Badges

| Status | Class |
|--------|-------|
| Open | `bg-cloned-muted text-cloned` |
| Acknowledged | `bg-suspicious-muted text-suspicious` |
| Resolved | `bg-genuine-muted text-genuine` |
| False Positive | `bg-surface-hover text-text-secondary` |

### Badge Rules

1. **Always use the muted background + solid text color** combination for readability.
2. **Consistent sizing**: `px-2 py-0.5 text-xs font-medium rounded-sm`
3. **No borders on badges** — the colored background is sufficient contrast on dark surfaces.
4. **Status dots**: for inline status, use a `h-2 w-2 rounded-full bg-{color}` circle before text.

---

## Input Fields

### Text Input

```tsx
<div>
  <label className="block text-sm font-medium text-text-secondary mb-1.5">
    Email Address
  </label>
  <input
    type="email"
    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors"
    placeholder="Enter your email"
  />
</div>
```

### Select / Dropdown

```tsx
<select className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring appearance-none">
  <option>Option 1</option>
</select>
```

### Search Input

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
  <input
    type="search"
    className="w-full bg-surface border border-border rounded pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring"
    placeholder="Search alerts..."
  />
</div>
```

### Toggle / Switch

```tsx
<button
  className={cn(
    "relative w-10 h-5 rounded-full transition-colors",
    isOn ? "bg-foreground" : "bg-border"
  )}
>
  <span
    className={cn(
      "absolute top-0.5 h-4 w-4 rounded-full transition-transform",
      isOn ? "translate-x-5 bg-background" : "translate-x-0.5 bg-text-secondary"
    )}
  />
</button>
```

### Slider (for Thresholds)

```tsx
<input
  type="range"
  min="0"
  max="100"
  className="w-full h-1 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:appearance-none"
/>
```

### Input Rules

1. **Labels above inputs**, not inline or floating.
2. **Always include placeholder text** with `placeholder:text-text-tertiary`.
3. **Focus state**: `focus:border-border-hover focus:ring-1 focus:ring-ring`
4. **Error state**: `border-cloned focus:border-cloned focus:ring-cloned/30` with error message below in `text-xs text-cloned`.
5. **Disabled state**: `opacity-50 cursor-not-allowed bg-surface-hover`.

---

## Modals / Dialogs

| Property | Value |
|----------|-------|
| Backdrop | `fixed inset-0 bg-black/60 z-50` with `backdrop-blur-sm` |
| Container | `bg-surface-elevated border border-border rounded-lg shadow-md` |
| Width | `max-w-md` (small), `max-w-lg` (medium), `max-w-2xl` (large) |
| Padding | `p-6` |
| Title | `text-lg font-semibold text-text-primary` |
| Close button | Ghost icon button (`X` icon) in top-right corner |
| Actions | Right-aligned, `flex gap-3` with Secondary + Primary buttons |
| Animation | `animate-in fade-in-0 zoom-in-95` (subtle scale + fade) |

---

## Toasts / Notifications

| Property | Value |
|----------|-------|
| Position | Top-right (`react-hot-toast` default) |
| Background | `bg-surface-elevated border border-border` |
| Text | `text-sm text-text-primary` |
| Duration | 4 seconds default, 6 seconds for errors |
| Dismiss | Click to dismiss, auto-dismiss after duration |
| Types | Success (with ✓ in genuine), Error (with ✕ in cloned), Info (with ℹ in info) |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Adjustment |
|-----------|-------|-------------------|
| `sm` | 640px | Stack cards vertically |
| `md` | 768px | 2-column card grid |
| `lg` | 1024px | Sidebar visible, 3-column grid |
| `xl` | 1280px | Full layout, 4-column stat cards |
| `2xl` | 1536px | Max content width, comfortable spacing |

### Responsive Rules

1. **Sidebar hides below `lg`** — show a hamburger menu in top bar.
2. **Tables scroll horizontally below `md`** — wrap in `overflow-x-auto`.
3. **Stat cards stack vertically below `md`** — use `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`.
4. **Never design for mobile-first** — this is a desktop monitoring tool. Tablet is the minimum.

---

## Animations & Transitions

| Element | Transition |
|---------|-----------|
| Hover states | `transition-colors duration-150` |
| Sidebar collapse | `transition-all duration-200 ease-in-out` |
| Modal open/close | `transition-all duration-200` with scale + fade |
| Page transitions | None (instant, no page transition animations) |
| Risk gauge needle | CSS animation, `transition-all duration-500 ease-out` |
| Alert slide-in | `animate-in slide-in-from-right` |
| Loading spinners | `animate-spin` (Tailwind built-in) |
| Skeleton loading | `animate-pulse` (Tailwind built-in) |

### Animation Rules

1. **Keep animations subtle and fast** — max 200ms for UI feedback, 500ms for data animations.
2. **No decorative animations** — every animation should communicate state change.
3. **Prefer CSS transitions over JS animations** — smoother, better performance.
4. **Disable animations for `prefers-reduced-motion`** — accessibility.
