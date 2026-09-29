# Lens — Technical Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Application Architecture](#application-architecture)
4. [State Management](#state-management)
5. [Component Reference](#component-reference)
6. [Custom Hooks](#custom-hooks)
7. [Services](#services)
8. [Context API](#context-api)
9. [Design System](#design-system)
10. [Data Flow](#data-flow)
11. [Mock Data & Backend Integration](#mock-data--backend-integration)

---

## Introduction

Lens is a single-page React application that provides a structured UI workflow for satellite imagery change detection. It allows an analyst to:

- Configure detection inputs (village, T1/T2 scenes or uploaded files)
- Submit and manage processing jobs
- Inspect detection results on an interactive GIS map with a before/after swipe viewer

The application is fully functional in its current state using mock/static data. It is designed so that the mock layer can be swapped for real API calls with minimal changes to the codebase.

---

## Tech Stack

| Concern | Technology |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Map Engine | Leaflet 1.9 + react-leaflet 5 |
| State | React Context API + custom hooks |
| Persistence | Browser `localStorage` |
| Styling | Plain CSS with CSS custom properties |
| Linting | ESLint 10 (flat config) |
| Language | JavaScript (JSX) |

No external state management library (Redux, Zustand, Jotai) is used. No CSS framework (Tailwind, MUI) is used.

---

## Application Architecture

```
Browser
  └── main.jsx                    React root entry
        └── App.jsx               Layout shell + tab router
              ├── ThemeProvider   CSS token sync (dark/light)
              └── SceneProvider   Global state (scenes, jobs, detection)
                    ├── TopBar              App header
                    ├── Sidebar             Config panel (collapsible)
                    └── DashboardContent    Main working area
                          ├── Tab: Input Selection
                          │     ├── InputSelection
                          │     │     ├── VillageSelector
                          │     │     ├── SceneDropdown      (directory mode)
                          │     │     ├── FileDropzone       (upload mode)
                          │     │     ├── RunDetectionButton
                          │     │     └── InfoBanner
                          │     └── ──────────────────────
                          ├── Tab: Job Selection
                          │     └── JobSelection
                          │           ├── JobQueryBar
                          │           └── JobCard (× n)
                          │                 ├── JobStatusBadge
                          │                 ├── JobActions
                          │                 └── JobDetails    (expanded)
                          ├── MapViewer
                          │     ├── SwipeControl
                          │     └── GisToolbar
                          └── ResultsSection
```

---

## State Management

All shared application state lives in **`SceneContext`**. It is composed from two custom hooks and exposes a single context value consumed everywhere via `useScene()`.

```
SceneProvider
  ├── useJobs()       → jobs, selectedJob, inspectJob, deleteJob, resetToDefaultJobs, setJobs
  └── useDetection()  → detectionStatus, canRunDetection, runDetection, resetDetection, showSuccessPopup
```

Local component state (e.g., drag-active in dropzone, search term in job list) stays inside the component that owns it and is never lifted unless shared.

### State shape (SceneContext)

| Field | Type | Description |
|---|---|---|
| `inputMode` | `"directory" \| "upload"` | Which input method is active |
| `selectedVillage` | `string` | Currently selected village name |
| `t1Scene` | `string` | Selected baseline scene filename |
| `t2Scene` | `string` | Selected analysis scene filename |
| `uploadedFiles` | `string[]` | Array of uploaded file names (upload mode) |
| `sceneDirectory` | `string` | Directory path configured in sidebar |
| `modelSettings` | `object` | `{ modelPath, tileSize, overlap, threshold }` |
| `detectionStatus` | `"idle" \| "running" \| "complete"` | Current detection lifecycle state |
| `canRunDetection` | `boolean` | Whether inputs satisfy minimum validation |
| `jobs` | `Job[]` | All jobs in the current session |
| `selectedJob` | `Job \| null` | Job currently being inspected |
| `activeTab` | `"input" \| "jobs"` | Active dashboard tab |
| `overlays` | `{ detection: boolean, boundaries: boolean }` | Map overlay visibility |
| `showSuccessPopup` | `boolean` | Controls toast notification display |

---

## Component Reference

### Layout

#### `TopBar`
App-level header. Contains the sidebar toggle button, centered brand name, and the theme toggle button. Reads `isDark` / `toggleTheme` from `ThemeContext`.

#### `Sidebar`
Collapsible left panel (240px wide, collapses to 0). Contains accordion sections for:
- **Model Settings** — directory path, tile size, overlap, threshold inputs
- **RGB Enhancement** — lower/upper percentile range sliders
- **Boundary Style** — color pickers for boundary and detection overlays

---

### Input

#### `InputSelection`
Top-level input configuration section. Renders the mode radio group (directory vs upload), then conditionally renders `SceneDropdown` or `FileDropzone` based on `inputMode`. Always renders `VillageSelector`, `RunDetectionButton`, and `InfoBanner`.

#### `VillageSelector`
A styled `<select>` dropdown populated from the `villages` array in `SceneContext`. Selecting a village calls `setSelectedVillage()`, which also resets detection status.

#### `SceneDropdown`
Renders two side-by-side `ScenePanel` components (T1 and T2). Only visible when `inputMode === "directory"` and a village is selected. Each panel is a styled `<select>` populated from the `scenes` array in `SceneContext`.

#### `FileDropzone`
Renders two independent `SingleDropzone` instances for T1 and T2 upload. Only visible when `inputMode === "upload"`.

Each `SingleDropzone`:
- Accepts `.tif`, `.tiff`, `.png`, `.jpg`, `.jpeg`
- Validates file extension before accepting
- Generates an `object URL` for preview, revoked on unmount via `useEffect` cleanup
- Supports drag-and-drop and click-to-browse
- Shows an image preview with a clear (×) button once a file is loaded

#### `RunDetectionButton`
Reads `detectionStatus`, `canRunDetection`, and `runDetection` from context. Button is disabled when inputs are invalid or detection is already running. Icon and label update to reflect `idle` → `running` → `complete` states.

#### `InfoBanner`
Static instructional component. Displays usage guidance for both input modes and RGB enhancement controls.

---

### Jobs

#### `JobSelection`
Manages the job list view. Holds local `searchTerm` state. Filters `jobs` from context against Job ID and village name. Renders `JobQueryBar` and a scrollable list of `JobCard` components.

#### `JobCard`
Displays a single job row. Shows Job ID, village, T1→T2 scene pair, status badge, and action buttons. When `isSelected`, the card highlights green and expands `JobDetails` below.

#### `JobDetails`
Expanded metadata grid shown inside a selected `JobCard`. Displays target village, baseline scene (T1), analysis scene (T2), and execution status in a responsive auto-fit grid.

#### `JobActions`
Button group with **View Details** (toggles inspect) and **Delete** (removes job). The inspect button inverts its style when the job is selected.

#### `JobStatusBadge`
Pill badge component. Renders green for `"Submitted"` status, yellow for anything else.

#### `JobQueryBar`
Search input + **Reset Defaults** button. `searchTerm` state lives in `JobSelection`. Reset calls `resetToDefaultJobs()` from context, which re-fetches `jobs.json` and clears `localStorage`.

---

### Map

#### `MapViewer`
The core GIS component. Renders a placeholder when detection is not complete. Once `detectionStatus === "complete"` and inputs are valid, renders a full Leaflet `MapContainer`.

Layer rendering order inside the map:
1. `SwipePanes` — creates named Leaflet panes (`before-pane`, `after-pane`) before any layers mount
2. Base map `TileLayer` (CartoDB Voyager)
3. T1 image — `ImageOverlay` (upload mode) or fallback OSM `TileLayer` — routed to `before-pane`
4. T2 image — `ImageOverlay` (upload mode) or fallback Esri satellite `TileLayer` — routed to `after-pane`
5. Village boundary `Polygon` (no pane, renders on both sides)
6. Detection `Polygon`s — routed to `after-pane` so they wipe in with the swipe divider
7. `SwipeControl` — before/after divider
8. `GisToolbar` — zoom, fullscreen, swipe toggle, layers popover

**Fullscreen** is implemented by listening to the native `fullscreenchange` event and toggling map height between `540px` and `100vh`.

#### `SwipeControl`
Custom Leaflet control implementing the before/after swipe interaction. Renders a draggable vertical divider over the map. T1 and T2 imagery are clipped to their respective panes using CSS `clip-path` calculations as the divider moves. PRE/POST labels float adjacent to the divider handle.

#### `GisToolbar`
Composited toolbar rendered as a Leaflet control in the top-right corner. Provides:
- Zoom in / Zoom out
- Fit to AOI (flies map to `aoiBounds`)
- Swipe toggle (on/off)
- Fullscreen toggle (calls `requestFullscreen` on the map container)
- Layers popover — checkbox list for each layer (`baseMap`, `preImage`, `postImage`, `boundary`, `detectedAreas`)

---

### Results

#### `ResultsSection`
Renders a row of `StatCard` components once detection is complete. Currently uses static mock values. Cards display: Total Area, Changed Area, Change %, Confidence, Detected Objects, Processing Time.

`StatCard` accepts a `variant` prop (`"accent"`, `"success"`, `"warning"`) which changes the value text color via CSS modifier classes.

---

## Custom Hooks

### `useDetection(options)`

Manages the full lifecycle of a detection run.

**Parameters:**

| Option | Type | Description |
|---|---|---|
| `inputMode` | `string` | `"directory"` or `"upload"` |
| `selectedVillage` | `string` | Selected village |
| `t1Scene` | `string` | T1 scene filename |
| `t2Scene` | `string` | T2 scene filename |
| `uploadedFiles` | `string[]` | Uploaded file names |
| `setJobs` | `function` | Jobs state setter from `useJobs` |

**Returns:**

| Value | Type | Description |
|---|---|---|
| `detectionStatus` | `string` | `"idle"`, `"running"`, or `"complete"` |
| `canRunDetection` | `boolean` | True when minimum inputs are satisfied |
| `runDetection` | `function` | Triggers detection for the current mode |
| `resetDetection` | `function` | Resets status back to `"idle"` |
| `showSuccessPopup` | `boolean` | True for 2 seconds after job submission |

**Validation logic:**
- Directory mode: requires `selectedVillage`, `t1Scene`, and `t2Scene` to all be non-empty strings
- Upload mode: requires `uploadedFiles.length >= 2`

**Current implementation:** Uses a `setTimeout` to simulate a 2-second processing delay, then creates a new job object with a random 4-digit ID and prepends it to the jobs array.

**To wire to a real API:** Replace the `setTimeout` block inside `runDirectoryDetection` and `runUploadDetection` with a real `fetch`/`axios` call. Update `detectionStatus` based on the API response.

---

### `useJobs()`

Manages the job list with localStorage persistence.

**Returns:**

| Value | Type | Description |
|---|---|---|
| `jobs` | `Job[]` | Current job list |
| `setJobs` | `function` | Direct state setter (used by `useDetection`) |
| `selectedJob` | `Job \| null` | Currently inspected job |
| `inspectJob(job)` | `function` | Selects a job, or deselects if already selected |
| `deleteJob(jobId, e)` | `function` | Removes job from state and localStorage |
| `resetToDefaultJobs()` | `function` | Re-fetches `jobs.json`, resets localStorage |

**Persistence strategy:**
1. On mount: checks `localStorage` for `encroachment_jobs`. If found, hydrates state. If not, calls `fetchJobs()` to load from `public/jobs.json` and writes to localStorage.
2. On every `jobs` state change: writes the updated array back to `localStorage`.

---

## Services

### `jobService.js`

```js
export async function fetchJobs(): Promise<Job[]>
```

Fetches `/jobs.json` (served from `/public`). Returns an empty array on failure. This is the primary integration point for replacing mock data with a real jobs API endpoint.

**To integrate a real API:**

```js
// src/services/jobService.js
export async function fetchJobs() {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
```

---

## Context API

### `SceneContext` / `useScene()`

The single source of truth for all shared application state. Must be consumed inside `SceneProvider`.

```jsx
import { useScene } from '../context/SceneContext';

function MyComponent() {
  const { selectedVillage, detectionStatus, jobs } = useScene();
  // ...
}
```

Throws if called outside of `SceneProvider`.

---

### `ThemeContext` / `useTheme()`

Manages dark/light mode. On every theme change, syncs the active theme's color values directly to CSS custom properties on `:root`, which propagates instantly to the entire design system.

```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { isDark, toggleTheme, theme } = useTheme();
  // theme.accent, theme.background, etc.
}
```

---

## Design System

The design system lives entirely in `src/index.css`. It uses CSS custom properties (no preprocessor).

### Color tokens

```css
/* Backgrounds */
--bg-base        /* #09090b — page background */
--bg-surface     /* #18181b — card/panel background */
--bg-elevated    /* #27272a — raised elements, dropdowns */

/* Text */
--text-primary   /* #f4f4f5 */
--text-secondary /* #d4d4d8 */
--text-muted     /* #a1a1aa */
--text-dim       /* #71717a */

/* Borders */
--border-default /* #27272a */
--border-subtle  /* rgba(63,63,70,0.5) */

/* Accent & Status */
--accent         /* #3b82f6 — blue */
--success        /* #22c55e — green */
--warning        /* #eab308 — yellow */
--error          /* #ef4444 — red */
--info           /* #0ea5e9 — sky */
```

### Typography

```css
--font-sans: 'Inter', system-ui, ...
--font-mono: 'JetBrains Mono', 'Fira Code', ...
```

Monospace is used for job IDs, stat values, model path inputs, and coordinate readouts.

### Spacing & radius

```css
--radius-xs: 2px
--radius-sm: 3px
--radius-md: 4px
--radius-lg: 6px
```

### Component CSS classes (key patterns)

| Class | Element |
|---|---|
| `.section` | Content block wrapper with bottom margin |
| `.section__header` | Icon + title row |
| `.stat-card` | Result metric card |
| `.stat-card--accent/success/warning` | Variant value color |
| `.run-detection-btn` | Detection trigger button |
| `.run-detection-btn--running` | Running state style |
| `.dropzone` | File drop target |
| `.dropzone--active` | Drag-over highlight |
| `.file-badge` | Selected file confirmation chip |
| `.layer-panel` | Map layers popover |
| `.swipe-label` | PRE/POST labels on map |
| `.toggle` | Custom checkbox toggle switch |

---

## Data Flow

```
User Action
    │
    ▼
Component calls setter from useScene()
    │
    ▼
SceneContext state updates
    │
    ├─→ useDetection re-evaluates canRunDetection
    │
    └─→ Re-render of subscribed components

User clicks "Run AI Detection"
    │
    ▼
runDetection() called
    │
    ▼
detectionStatus = "running"
    │
    ▼
[API call / setTimeout simulation]
    │
    ▼
detectionStatus = "complete"
New job prepended to jobs[]
showSuccessPopup = true (auto-clears after 2s)
    │
    ▼
MapViewer unlocks → renders Leaflet map
ResultsSection renders stat cards
Job appears in JobSelection tab
localStorage updated
```

---

## Mock Data & Backend Integration

### Current mock surfaces

| File | What to replace |
|---|---|
| `public/jobs.json` | Seed job list → real `/api/jobs` endpoint |
| `src/services/jobService.js` | `fetch("/jobs.json")` → real API call |
| `src/hooks/useDetection.js` | `setTimeout` blocks → real detection API call |
| `SceneContext` — `MOCK_VILLAGES` | Static array → `GET /api/villages` |
| `SceneContext` — `MOCK_SCENES` | Static array → `GET /api/scenes?village=X` |
| `ResultsSection` — `MOCK_RESULTS` | Static object → real detection response payload |

### Job object shape

```ts
interface Job {
  id: string;        // 4-digit string e.g. "1042"
  village: string;   // Village name or "Custom Upload"
  t1: string;        // T1 scene filename or uploaded file name
  t2: string;        // T2 scene filename or uploaded file name
  status: string;    // "Submitted" | "Pending" | ...
}
```

### Adding a real detection endpoint

1. Update `useDetection.js` — replace the `setTimeout` with an API call:

```js
// Inside runDirectoryDetection or runUploadDetection
setDetectionStatus("running");

try {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ village: selectedVillage, t1: t1Scene, t2: t2Scene }),
  });
  const job = await response.json();
  setJobs((prev) => [job, ...prev]);
  setDetectionStatus("complete");
} catch (err) {
  console.error(err);
  setDetectionStatus("idle");
}
```

2. Replace `MOCK_RESULTS` in `ResultsSection.jsx` with values from the job response.
3. Replace `MOCK_VILLAGES` and `MOCK_SCENES` in `SceneContext.jsx` with `useEffect` API fetches.

---

*Built by Tanisha*
