# 🛰️ SatLens

**Geospatial change-detection dashboard for satellite imagery analysis.**

![Build](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-0.0.0-lightgrey)

---

## Overview

SatLens is a React-based frontend dashboard built for analysts working with bi-temporal satellite imagery. It provides a structured workflow to configure detection inputs, submit processing jobs, and inspect change-detection results on an interactive GIS map — all without leaving the browser.

**Who it's for:** Remote sensing analysts, GIS engineers, and geospatial application developers who need a UI layer on top of a satellite change-detection pipeline.

**Problem it solves:** Bridging the gap between raw satellite scene data and actionable visual output. Lens handles input configuration, job lifecycle management, and map-based result inspection in a single, cohesive interface.

---

## Key Features

- **Dual input modes** — select scenes from a server-side directory or drag-and-drop upload local GeoTIFF/PNG/JPG files directly
- **Before/After swipe map** — Leaflet-powered side-by-side comparison of T1 (pre) and T2 (post) imagery with a draggable divider
- **Layer control panel** — toggle base map, pre/post imagery, village boundary polygons, and detection overlays independently
- **GIS toolbar** — zoom controls, fit-to-AOI, swipe on/off toggle, fullscreen mode, and a layer visibility popover, all composited inside the map
- **Job management** — submit, inspect, search, delete, and reset jobs; state persists across sessions via `localStorage`
- **Detection results panel** — stat cards surface area change, confidence score, object count, and processing time post-run
- **CSS design system** — zinc-palette dark theme with semantic CSS custom properties (`--bg-base`, `--accent`, `--success`, etc.) and a full light mode toggle
- **No external state library** — all shared state is composed from two custom hooks (`useDetection`, `useJobs`) surfaced through React Context
- **Zero backend required** — fully functional with mock data; seed jobs load from `/public/jobs.json` and all state lives in memory + localStorage

---

## Architecture & Project Structure

```
lens/
├── public/
│   ├── jobs.json           # Seed job data loaded on first launch
│   ├── icons.svg           # App icon sprites
│   └── favicon.svg
├── src/
│   ├── main.jsx            # React DOM entry point
│   ├── App.jsx             # Root layout, tab navigation, toast notification
│   ├── index.css           # Full design system: tokens, components, utilities
│   ├── App.css
│   │
│   ├── context/
│   │   ├── SceneContext.jsx # Global state provider — composes useJobs + useDetection
│   │   └── ThemeContext.jsx # Dark/light theme toggle; syncs tokens to :root CSS vars
│   │
│   ├── hooks/
│   │   ├── useDetection.js  # Detection lifecycle: validation, status, job submission
│   │   └── useJobs.js       # Job CRUD, localStorage persistence, selection state
│   │
│   ├── services/
│   │   └── jobService.js    # Fetches /public/jobs.json; swap for real API here
│   │
│   └── components/
│       ├── layout/
│       │   ├── TopBar.jsx   # App header, sidebar toggle, theme switcher
│       │   └── Sidebar.jsx  # Collapsible panel: model settings, RGB sliders, path config
│       │
│       ├── input/
│       │   ├── InputSelection.jsx    # Mode switcher (directory vs upload)
│       │   ├── VillageSelector.jsx   # AOI village dropdown
│       │   ├── SceneDropdown.jsx     # T1/T2 scene selectors (directory mode)
│       │   ├── FileDropzone.jsx      # Drag-and-drop T1/T2 upload with preview
│       │   ├── RunDetectionButton.jsx# Validates inputs, triggers detection run
│       │   └── InfoBanner.jsx        # Contextual usage instructions
│       │
│       ├── jobs/
│       │   ├── JobSelection.jsx      # Job list view with search/filter
│       │   ├── JobCard.jsx           # Individual job row with expand/collapse
│       │   ├── JobDetails.jsx        # Expanded job metadata grid
│       │   ├── JobActions.jsx        # Inspect / Delete button group
│       │   ├── JobStatusBadge.jsx    # Status pill (Submitted / Pending)
│       │   └── JobQueryBar.jsx       # Search input + reset-to-defaults button
│       │
│       ├── map/
│       │   ├── MapViewer.jsx         # Leaflet map container, layer orchestration
│       │   ├── SwipeControl.jsx      # Custom before/after swipe divider control
│       │   ├── GisToolbar.jsx        # Zoom, fullscreen, swipe toggle, layers popover
│       │   └── map-tools.css         # Map-specific component styles
│       │
│       └── results/
│           └── ResultsSection.jsx    # Stat card grid (area, confidence, objects, time)
│
├── vite.config.js          # Vite + React plugin config
├── eslint.config.js        # ESLint flat config
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or compatible package manager)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd lens

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Environment Variables

No `.env` file is required for the mock-data configuration. The app runs fully self-contained out of the box.

When connecting Lens to a real backend, create a `.env` file at the project root:

```env
# .env.example

# Base URL for the detection API
VITE_API_BASE_URL=https://your-api.example.com

# Optional: tile server endpoint for real scene imagery
VITE_TILE_SERVER_URL=https://your-tile-server.example.com
```

Access these in the codebase via `import.meta.env.VITE_API_BASE_URL`.

The primary integration point is `src/services/jobService.js` (job fetching) and `src/hooks/useDetection.js` (detection submission).

---

## Usage

### 1. Directory Mode — select scenes from a configured path

1. Open the **sidebar** and set the scenes directory path under **Model Settings**
2. On the **Input Selection** tab, choose **Select from Directory**
3. Pick a **Village** from the dropdown
4. Select a **T1 (Before)** and **T2 (After)** scene
5. Click **Run AI Detection**

### 2. Upload Mode — use local image files

1. Switch input mode to **Upload Files**
2. Drag and drop (or click to browse) a T1 image into the Before dropzone
3. Drag and drop a T2 image into the After dropzone
4. Click **Run AI Detection**

### 3. Inspect Results

Once detection completes:
- The **GIS Map** unlocks and renders T1/T2 imagery with a swipe divider
- **Detected encroachment areas** appear as red polygons on the POST pane
- The **Detection Results** panel below the map shows area change, confidence score, object count, and processing time
- Switch to the **Job Selection** tab to view, search, or inspect submitted jobs

```
Input Selection tab  →  Configure inputs  →  Run Detection
                                                    ↓
                                          GIS Map + Results unlock
                                                    ↓
                                          Job Selection tab  →  Manage history
```

---

## Development & Testing

```bash
# Start dev server with hot module replacement
npm run dev

# Production build (outputs to /dist)
npm run build

# Preview production build locally
npm run preview

# Run ESLint across all source files
npm run lint
```

> No test suite is configured in the current version. See the Roadmap below.

### Adding mock data

To modify seed jobs, edit `public/jobs.json`. Each entry follows this shape:

```json
[
  {
    "id": "1001",
    "village": "Indore",
    "t1": "20230801.tif",
    "t2": "20231013.tif",
    "status": "Submitted"
  }
]
```

Jobs are loaded once on first launch and stored in `localStorage` under the key `encroachment_jobs`. To reset to seed data, click **Reset Defaults** in the Job Selection tab or clear `localStorage`.

---

## Roadmap & Contributing

**Planned work:**

- Wire `jobService.js` to a real REST/WebSocket API for live detection status polling
- Replace mock village/scene lists in `SceneContext` with API-backed selectors
- Add Vitest + React Testing Library unit test coverage for hooks and key components
- Export detection results as GeoJSON or CSV
- Add date-range filtering to the job query bar

**Contributing:**

1. Fork the repository and create a feature branch from `main`
2. Follow the existing component patterns — context via `useScene()`, no prop-drilling beyond one level
3. Keep new components small and single-responsibility
4. Run `npm run lint` before opening a pull request
5. Open a PR with a clear description of what changed and why

---

## License

This project is licensed under the **MIT License**.

---

Built by Tanisha