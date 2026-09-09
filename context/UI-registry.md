# UI Registry — VoxGuard

> **Living Document** — This file is updated every time a new component is built. Read this before building ANY component.

## How to Use This File

1. **Before building a new component**, check this registry. The component (or something similar) may already exist.
2. **Match existing patterns** before inventing new ones. Consistency is more important than novelty.
3. **After building a component**, run `/imprint` to capture the component's patterns.
4. **After running `/imprint`**, update this registry: mark status as `[x]` Built, add props, usage example, and dependencies.
5. **Use the exact component** from this registry. Don't create duplicates.

> [!IMPORTANT]
> The `/imprint` → update registry cycle is **mandatory** for every component. Skipping it creates pattern drift and inconsistency.

---

## Component Inventory

### Layout Components

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `AppLayout` | `src/components/layout/AppLayout.tsx` | `[x]` Built | Root layout with sidebar + top bar + content area |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | `[x]` Built | Left sidebar, collapsible (w-16 ↔ w-64) |
| `TopBar` | `src/components/layout/TopBar.tsx` | `[x]` Built | Fixed top bar with logo, notifications, user menu |
| `PageHeader` | `src/components/layout/PageHeader.tsx` | `[x]` Built | Page title + description + optional action button |

---

### Common / Shared Components

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `Button` | `src/components/common/Button.tsx` | `[x]` Built | Button with variants: primary, secondary, ghost, danger |
| `Badge` | `src/components/common/Badge.tsx` | `[x]` Built | Status badge with variants: genuine, suspicious, cloned, critical, info, default |
| `Card` | `src/components/common/Card.tsx` | `[x]` Built | Standard card container with optional title |
| `StatCard` | `src/components/common/StatCard.tsx` | `[x]` Built | Dashboard stat card with icon, value, label, change % |
| `Input` | `src/components/common/Input.tsx` | `[x]` Built | Text input with label, error state, icon support |
| `Select` | `src/components/common/Select.tsx` | `[x]` Built | Dropdown select with label |
| `Toggle` | `src/components/common/Toggle.tsx` | `[x]` Built | On/off toggle switch |
| `Slider` | `src/components/common/Slider.tsx` | `[x]` Built | Range slider for threshold configuration |
| `Modal` | `src/components/common/Modal.tsx` | `[x]` Built | Dialog/modal with backdrop, title, actions |
| `DataTable` | `src/components/common/DataTable.tsx` | `[x]` Built | Reusable table with sorting, pagination |
| `SearchInput` | `src/components/common/SearchInput.tsx` | `[x]` Built | Search input with icon |
| `EmptyState` | `src/components/common/EmptyState.tsx` | `[x]` Built | Empty state placeholder with icon and message |
| `LoadingSkeleton` | `src/components/common/LoadingSkeleton.tsx` | `[x]` Built | Skeleton loading placeholder |
| `StatusDot` | `src/components/common/StatusDot.tsx` | `[x]` Built | Small colored dot for inline status |
| `Tooltip` | `src/components/common/Tooltip.tsx` | `[x]` Built | Hover tooltip for additional info |
| `DropdownMenu` | `src/components/common/DropdownMenu.tsx` | `[x]` Built | Dropdown menu for actions and navigation |

---

### Dashboard Components

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `DashboardStats` | `src/components/dashboard/DashboardStats.tsx` | `[x]` Built | Row of 4 stat cards |
| `LiveCallFeed` | `src/components/dashboard/LiveCallFeed.tsx` | `[x]` Built | Real-time table of active calls with risk scores |
| `RecentAlerts` | `src/components/dashboard/RecentAlerts.tsx` | `[x]` Built | Last 5 alerts with quick actions |
| `RiskDistribution` | `src/components/dashboard/RiskDistribution.tsx` | `[x]` Built | Chart showing call distribution by risk level |
| `ActivityTimeline` | `src/components/dashboard/ActivityTimeline.tsx` | `[x]` Built | Chronological event feed |

---

### Analysis Components

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `AudioUploader` | `src/components/analysis/AudioUploader.tsx` | `[x]` Built | Drag-and-drop audio file upload zone |
| `RiskGauge` | `src/components/analysis/RiskGauge.tsx` | `[x]` Built | Circular gauge (0–100) for risk score |
| `VerdictCard` | `src/components/analysis/VerdictCard.tsx` | `[x]` Built | Large verdict display (Genuine/Suspicious/Cloned) |
| `FeatureScores` | `src/components/analysis/FeatureScores.tsx` | `[x]` Built | Spectral, prosody, consistency sub-score cards |
| `SpectrogramViewer` | `src/components/analysis/SpectrogramViewer.tsx` | `[x]` Built | Display spectrogram image from ML service |
| `WaveformPlayer` | `src/components/analysis/WaveformPlayer.tsx` | `[x]` Built | WaveSurfer.js waveform with playback controls |
| `CallMetadata` | `src/components/analysis/CallMetadata.tsx` | `[x]` Built | Caller info, duration, timestamp display |
| `AnalysisHistory` | `src/components/analysis/AnalysisHistory.tsx` | `[x]` Built | Searchable list of past analyzed calls |

---

### Alert Components

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `AlertTable` | `src/components/alerts/AlertTable.tsx` | `[x]` Built | Full alert list with filters, sorting, pagination |
| `AlertFilters` | `src/components/alerts/AlertFilters.tsx` | `[x]` Built | Filter bar: severity, status, date range, search |
| `AlertActions` | `src/components/alerts/AlertActions.tsx` | `[x]` Built | Action buttons: acknowledge, resolve, false positive |
| `AlertDetail` | `src/components/alerts/AlertDetail.tsx` | `[x]` Built | Alert detail modal with full analysis summary |
| `BulkActions` | `src/components/alerts/BulkActions.tsx` | `[x]` Built | Bulk select and action bar |

---

### Settings Components

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `ThresholdConfig` | `src/components/settings/ThresholdConfig.tsx` | `[x]` Built | Risk threshold sliders with visual preview |
| `NotificationConfig` | `src/components/settings/NotificationConfig.tsx` | `[x]` Built | Notification channel toggles and webhook config |
| `ApiKeyManager` | `src/components/settings/ApiKeyManager.tsx` | `[x]` Built | API key list, generate, revoke |
| `RetentionConfig` | `src/components/settings/RetentionConfig.tsx` | `[x]` Built | Data retention dropdown and feature-only toggle |

---

## Component Template

When adding a new component, use this template in the registry:

```
### ComponentName

- **Path**: `src/components/{feature}/ComponentName.tsx`
- **Status**: `[x]` Built
- **Props**:
  | Prop | Type | Required | Default | Description |
  |------|------|----------|---------|-------------|
  | ... | ... | ... | ... | ... |
- **Usage**:
  ```tsx
  <ComponentName prop="value" />
  ```
- **Dependencies**: List any other components this uses
- **Notes**: Any non-obvious behavior or gotchas
```

---

## Rules

1. **Check this file FIRST** before creating any UI component.
2. **Never duplicate** — if a similar component exists, extend it with new variants/props.
3. **Every component must accept `className`** as an optional prop for composition.
4. **Update this file immediately** after building a component — mark as `[x]` Built and add props/usage.
5. **All components must use tokens** from `UI-tokens.md` — no hardcoded styles.
6. **All components must follow patterns** from `UI-rules.md` — consistent spacing, fonts, colors.

