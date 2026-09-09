# Build Plan — VoxGuard

## Skill Usage During Build

> [!IMPORTANT]
> The AI agent MUST use these skills at the specified points during development. These are not optional.

| Skill | When to Use | Trigger Point |
|-------|-------------|---------------|
| `/architect` | **Before** starting any complex feature (ML pipeline, WebSocket, analysis pipeline) | Before Features 2.3, 2.4, 2.7, 3.2, 3.3 |
| `/imprint` | **After** building any new UI component | After every component in Phase 3 |
| `/review` | **Before** demo preparation, or when something feels off | Before Phase 4, after Phase 3 completion |
| `/recover` | **When** a bug persists after one corrective attempt | Any phase — if the same error shows up twice, STOP and `/recover` |
| `/remember save` | **At the end** of each work session if a feature spans sessions | End of any day during Phase 2 or 3 |
| `/remember restore` | **At the start** of a session when resuming multi-session work | Start of any day continuing Phase 2 or 3 |

### Additional Rules
- Before using any third-party library, **load its installed skill first**, then read `context/Library-docs.md`
- Before writing any Next.js code, **read the relevant guide** in `node_modules/next/dist/docs/` — APIs may differ from training data
- **Update `context/Progress-tracker.md`** after every completed feature
- **Update `context/UI-registry.md`** after every built component

---

## Overview

| Parameter | Value |
|-----------|-------|
| **Total Phases** | 4 |
| **Timeline** | ~2 weeks (hackathon sprint) |
| **Team Size** | 2–3 active developers |
| **Parallel Work** | Yes — ML training runs concurrently with platform development |

## Phase Summary

| Phase | Name | Duration | Features | Focus |
|-------|------|----------|----------|-------|
| **Phase 1** | Foundation & Setup | Days 1–2 | 5 | Project scaffolding, DB, auth, model training kickoff |
| **Phase 2** | Backend API + ML Model | Days 3–6 | 7 | Core API endpoints, ML inference service, analysis pipeline |
| **Phase 3** | Frontend Dashboard | Days 7–10 | 6 | All UI pages, real-time WebSocket integration, visualizations |
| **Phase 4** | Integration, Polish & Demo | Days 11–14 | 5 | End-to-end integration, demo prep, API docs, bug fixing |

---

## Phase 1 — Foundation & Setup (Days 1–2)

> **Goal**: Get all three services running, database set up, basic auth working, and ML training kicked off.

### Feature 1.1: Project Scaffolding

- **Scope**: Initialize all three project directories with dependencies and configuration
- **Logic**:
  - Create `frontend/` with `npx create-next-app@latest` (TypeScript, App Router, Tailwind CSS)
  - Create `backend/` with FastAPI boilerplate (`main.py`, `config.py`, `database.py`)
  - Create `ml-service/` with FastAPI boilerplate
  - Create `docker-compose.yml` with services: frontend, backend, ml-service, postgres
  - Create `.env.example` with all environment variables
  - Verify all three services start and respond to health checks

### Feature 1.2: Database Setup

- **Scope**: PostgreSQL running in Docker, SQLAlchemy models defined, Alembic migrations working
- **Logic**:
  - Define all SQLAlchemy models: `User`, `Call`, `AnalysisResult`, `Alert`, `Configuration`, `ApiKey`
  - Configure async SQLAlchemy with `asyncpg` driver
  - Initialize Alembic and generate initial migration
  - Run migration to create all tables
  - Seed database with a default admin user and default configuration

### Feature 1.3: Authentication System

- **Scope**: JWT-based login/register with role-based access
- **Logic**:
  - `POST /auth/register` — validate email uniqueness, hash password with bcrypt, create user, return JWT pair
  - `POST /auth/login` — validate credentials, return access token (15 min) + refresh token (7 days)
  - `POST /auth/refresh` — validate refresh token, issue new access token
  - Auth middleware: extract JWT from `Authorization: Bearer <token>`, decode, attach user to request
  - Role-based dependency: `require_role("admin")`, `require_role("analyst")`
  - Password hashing with `passlib[bcrypt]`

### Feature 1.4: ML Model Training Kickoff

- **Scope**: Download ASVspoof 2019 LA dataset, set up training pipeline, start fine-tuning
- **Logic**:
  - Download ASVspoof 2019 LA subset (train + dev + eval partitions)
  - Create `dataset.py`: PyTorch Dataset class that loads audio files, resamples to 16kHz, applies padding/truncation
  - Create `train.py`:
    - Load `facebook/wav2vec2-base` from Hugging Face
    - Freeze lower encoder layers (layers 0–8), fine-tune upper layers + classification head
    - Classification head: `Linear(768, 256) → ReLU → Dropout(0.3) → Linear(256, 2)`
    - Loss: Cross-entropy with class weights (genuine samples are fewer than spoofed)
    - Optimizer: AdamW, lr=1e-5, weight_decay=0.01
    - Train for 10–15 epochs, validate on dev set each epoch
    - Save best model checkpoint by EER metric
  - Create `evaluate.py`: compute EER, accuracy, precision, recall, F1 on eval set
  - **This runs in parallel on a GPU machine while team builds the platform**

### Feature 1.5: Context Files

- **Scope**: Create all project context files in `context/` directory
- **Logic**:
  - Create all 9 context files as defined in the workflow diagram
  - These files guide all subsequent development

---

## Phase 2 — Backend API + ML Inference Service (Days 3–6)

> **Goal**: All backend CRUD endpoints working, ML service running inference, analysis pipeline producing risk scores.
>
> ⚡ **Skills**: Run `/architect` before Features 2.3 (ML Inference), 2.4 (Pipeline Integration), and 2.7 (WebSocket). Run `/remember save` at end of each session.

### Feature 2.1: Call Management API

- **Scope**: CRUD endpoints for call records
- **Logic**:
  - `POST /api/calls` — create a new call record (live or uploaded)
  - `GET /api/calls` — list calls with pagination, filtering (by status, type, date range)
  - `GET /api/calls/{id}` — get call details with associated analysis results
  - `PATCH /api/calls/{id}` — update call status
  - `DELETE /api/calls/{id}` — soft delete a call record
  - Service layer handles all DB operations via SQLAlchemy async session

### Feature 2.2: Audio Upload & Validation

- **Scope**: File upload endpoint with format validation and temporary storage
- **Logic**:
  - `POST /api/analysis/upload` — accept audio file (multipart/form-data)
  - Validate file: allowed formats (`.wav`, `.mp3`, `.flac`, `.ogg`), max size (50MB)
  - Convert to 16kHz mono WAV using `pydub` or `ffmpeg` subprocess
  - Store temporarily in `/tmp/audio/` (auto-cleaned after analysis)
  - Create call record with `call_type='uploaded'`
  - Forward to ML service for analysis (async)
  - Return analysis ID for polling or WebSocket subscription

### Feature 2.3: ML Inference Endpoints

- **Scope**: ML service exposes analysis endpoints that accept audio and return predictions
- **Logic**:
  - `POST /ml/analyze` — accept audio file, run full analysis pipeline:
    1. Load audio with `torchaudio`, resample to 16kHz
    2. Extract wav2vec 2.0 embeddings (forward pass through frozen encoder)
    3. Run classification head → `[genuine_prob, spoofed_prob]`
    4. Extract supplementary features: MFCCs, spectral centroid, pitch contour, ZCR
    5. Compute sub-scores: spectral_score, prosody_score
    6. Compute overall risk_score: `spoofed_prob * 100`, adjusted by sub-scores
    7. Determine verdict: `genuine` (< 40), `suspicious` (40–70), `cloned` (> 70)
    8. Generate spectrogram image (matplotlib), save to temp path
    9. Return: `{ risk_score, verdict, confidence, spectral_score, prosody_score, features, spectrogram_path, processing_time_ms }`
  - `POST /ml/stream` — accept audio chunk (1–3 seconds), return quick risk estimate:
    1. Same pipeline but on smaller audio window
    2. Optimized for latency (< 500ms target)
    3. Returns: `{ risk_score, verdict, confidence }`
  - `GET /ml/health` — model loaded check, inference latency benchmark

### Feature 2.4: Analysis Pipeline Integration

- **Scope**: Backend orchestrates the full analysis flow — receives audio, calls ML service, stores results
- **Logic**:
  - `ml_client.py` — async HTTP client (httpx) to call ML service
  - `call_service.py` — orchestration:
    1. Receive audio from upload endpoint or WebSocket
    2. Call `ml_client.analyze(audio_file)` or `ml_client.stream(audio_chunk)`
    3. Parse ML response
    4. Create `AnalysisResult` record in database
    5. Evaluate alert thresholds from user's configuration
    6. If threshold exceeded → create `Alert` record
    7. Push result via WebSocket to connected frontend clients
  - Error handling: ML service timeout → retry once → return partial result with error flag

### Feature 2.5: Alert Management API

- **Scope**: CRUD for alerts with status workflow
- **Logic**:
  - `GET /api/alerts` — list alerts with pagination, filtering (severity, status, date range)
  - `GET /api/alerts/{id}` — alert details with linked call and analysis
  - `PATCH /api/alerts/{id}/acknowledge` — set status to 'acknowledged', record acknowledging user
  - `PATCH /api/alerts/{id}/resolve` — set status to 'resolved', record resolving user
  - `PATCH /api/alerts/{id}/false-positive` — mark as false positive (feeds back into model quality tracking)
  - Alert creation is automatic (triggered by analysis pipeline), not manual

### Feature 2.6: Settings & Configuration API

- **Scope**: User-specific configuration management
- **Logic**:
  - `GET /api/settings` — get current user's configuration
  - `PUT /api/settings` — update configuration (thresholds, notifications, webhook)
  - `POST /api/settings/api-keys` — generate new API key (hash stored, raw returned once)
  - `GET /api/settings/api-keys` — list API keys (show prefix only, never full key)
  - `DELETE /api/settings/api-keys/{id}` — revoke API key
  - Default configuration created on user registration

### Feature 2.7: WebSocket Server

- **Scope**: Real-time bidirectional communication for live monitoring
- **Logic**:
  - `WS /ws/monitor` — authenticated WebSocket connection for dashboard
    - On connect: validate JWT from query param, register client
    - Server → Client messages: `risk_update`, `alert_created`, `call_status_changed`
    - Client → Server messages: `start_stream` (begin live audio analysis), `stop_stream`, `audio_chunk` (raw audio data)
    - Heartbeat: ping every 30s, disconnect on 3 missed pongs
  - Connection manager: track active connections per user, broadcast to relevant clients
  - Audio streaming: client sends audio chunks → backend forwards to ML `/ml/stream` → result pushed back

---

## Phase 3 — Frontend Dashboard (Days 7–10)

> **Goal**: All 5 pages built and functional, connected to backend API, WebSocket live updates working.
>
> ⚡ **Skills**: Run `/architect` before Features 3.2 (Dashboard) and 3.3 (Call Analysis). Run `/imprint` after EVERY component built. Run `/remember save` at end of each session. Read `node_modules/next/dist/docs/` before writing any Next.js code.

### Feature 3.1: Layout & Navigation

- **Scope**: App shell with sidebar navigation, top bar, responsive layout
- **Logic**:
  - Root layout (`layout.tsx`): sidebar (collapsible) + main content area + top bar
  - Sidebar: navigation links to Dashboard, Call Analysis, Alerts, Settings, API Docs
  - Top bar: VoxGuard logo, user avatar/name, notification bell (alert count badge), logout
  - Auth guard: redirect unauthenticated users to `/auth/login`
  - API client (`lib/api.ts`): axios instance with JWT interceptor, auto-refresh on 401
  - WebSocket client (`lib/websocket.ts`): connect on login, reconnect on disconnect
  - Zustand stores: `authStore`, `callStore`, `alertStore`, `settingsStore`

### Feature 3.2: Dashboard Page

- **Scope**: Real-time command center showing live call activity and system overview
- **Logic**:
  - **Stats cards row**: Total Calls Today, Active Calls, Flagged Calls, Avg Risk Score — fetched from `GET /api/calls/stats`
  - **Live call feed**: table/list of active calls with columns: Caller, Duration, Risk Score (animated gauge), Status
    - Updates in real-time via WebSocket `risk_update` events
    - Risk score cell: color-coded (green/yellow/orange/red) based on thresholds
  - **Recent alerts panel**: last 5 alerts with severity badge, timestamp, and quick-acknowledge button
  - **Risk distribution chart**: Recharts pie/bar chart showing call distribution by risk level
  - **Activity timeline**: chronological feed of recent events (calls started, alerts triggered, actions taken)
  - Auto-refresh interval: 30 seconds for stats, real-time for WebSocket events

### Feature 3.3: Call Analysis Page

- **Scope**: Deep-dive analysis view for individual calls + audio upload
- **Logic**:
  - **Upload section** (top of page):
    - Drag-and-drop zone + file browser for audio upload
    - Accepted formats: `.wav`, `.mp3`, `.flac`, `.ogg`
    - Upload progress bar
    - On upload: `POST /api/analysis/upload`, then poll or subscribe for results
  - **Analysis results** (shown after upload or when navigating from dashboard):
    - **Verdict card**: large, prominent display of GENUINE/SUSPICIOUS/CLONED with confidence %
    - **Risk score gauge**: animated circular gauge (0–100), color-coded
    - **Feature breakdown cards**: spectral score, prosody score, consistency score — each with mini gauge
    - **Spectrogram visualization**: rendered from spectrogram image returned by ML service
    - **Waveform display**: rendered using WaveSurfer.js or canvas-based visualization
    - **Timeline markers**: if specific suspicious segments detected, highlight on waveform
    - **Call metadata**: caller info, duration, timestamp, language detected
  - **Call history**: searchable list of past analyzed calls with quick-select

### Feature 3.4: Alert Management Page

- **Scope**: Full alert list with filtering, actions, and bulk operations
- **Logic**:
  - **Filters bar**: severity dropdown, status dropdown, date range picker, search by caller
  - **Alerts table**: columns — Severity (badge), Caller, Risk Score, Time, Status, Actions
    - Severity badges: Low (blue), Medium (yellow), High (orange), Critical (red)
    - Status badges: Open (red dot), Acknowledged (yellow), Resolved (green), False Positive (gray)
  - **Action buttons per row**: Acknowledge, Resolve, Mark False Positive, View Details
  - **Alert detail modal**: full analysis summary, linked call details, action history
  - **Bulk actions**: select multiple → acknowledge all, resolve all
  - Pagination: 20 alerts per page, total count shown
  - Real-time: new alerts appear at top via WebSocket `alert_created` event

### Feature 3.5: Settings Page

- **Scope**: Configuration UI for thresholds, notifications, and API keys
- **Logic**:
  - **Risk Thresholds section**:
    - Range sliders for low/medium/high/critical boundaries
    - Visual preview: colored bar showing threshold zones
    - Save button → `PUT /api/settings`
  - **Notifications section**:
    - Toggles: in-app, email (simulated), SMS (simulated)
    - Webhook URL input field
    - Test webhook button
  - **API Keys section**:
    - List of existing keys: name, prefix, created date, last used, status
    - Generate new key button → modal with key name input → shows key once (copy to clipboard)
    - Revoke key button with confirmation
  - **Data Retention section**:
    - Dropdown: retention period (7 days, 30 days, 90 days)
    - Toggle: feature-only logging mode

### Feature 3.6: API Documentation Page

- **Scope**: Interactive API reference for developers
- **Logic**:
  - Render the FastAPI auto-generated OpenAPI spec in a clean UI
  - Option A: embed Swagger UI / Redoc via iframe pointing at backend `/docs`
  - Option B: use `swagger-ui-react` component with fetched OpenAPI JSON
  - Sections: Authentication, Calls, Analysis, Alerts, Settings, WebSocket
  - Code samples in Python, JavaScript, and cURL for each endpoint
  - Copy-to-clipboard for all code samples

---

## Phase 4 — Integration, Polish & Demo (Days 11–14)

> **Goal**: Everything wired end-to-end, polished UI, demo-ready with simulated scenarios.
>
> ⚡ **Skills**: Run `/review` at the START of this phase (full system audit). Run `/review` again before the final demo. If bugs persist after one fix attempt, run `/recover` immediately.

### Feature 4.1: End-to-End Integration Testing

- **Scope**: Verify all flows work seamlessly across all three services
- **Logic**:
  - Test Flow 1: Login → Upload audio → See analysis → Risk score → Alert generated → Acknowledge
  - Test Flow 2: Login → Start live monitoring → Simulate audio stream → See real-time risk updates → Alert pops
  - Test Flow 3: Change thresholds in Settings → Upload audio → Verify alert respects new thresholds
  - Test Flow 4: Generate API key → Use key to call REST API externally → Verify response
  - Fix any integration bugs, data mismatches, or WebSocket connection issues
  - Load test: verify ML service handles concurrent requests gracefully

### Feature 4.2: Demo Scenario Preparation

- **Scope**: Prepare curated audio samples and demo scripts for SIH presentation
- **Logic**:
  - Collect/prepare demo audio samples:
    - 3–4 genuine speech samples (different Indian accents/languages)
    - 3–4 AI-cloned speech samples (generated using publicly available TTS tools)
    - 1–2 edge cases (noisy audio, partial speech)
  - Create a demo script: step-by-step walkthrough of VoxGuard features
  - Pre-populate database with realistic call history and alert data for demo
  - Ensure all visualizations (spectrograms, gauges, charts) look compelling
  - Prepare a "live" demo: simulate a call, show real-time detection in action

### Feature 4.3: UI Polish & Responsive Design

- **Scope**: Visual refinements, animations, and responsive layout
- **Logic**:
  - Ensure all pages work on tablet (1024px) and laptop (1440px) viewports
  - Add loading skeletons for all data-fetching states
  - Add smooth transitions: page transitions, risk gauge animations, alert slide-ins
  - Error states: empty states, error boundaries, network error toasts
  - Favicon, meta tags, page titles for each page
  - Dark mode (if time permits — Tailwind's `dark:` classes)

### Feature 4.4: API Documentation Finalization

- **Scope**: Ensure API docs are complete and accurate
- **Logic**:
  - Verify all endpoints are documented with examples
  - Add request/response examples for each endpoint
  - Document WebSocket event types and payloads
  - Add authentication guide with step-by-step instructions
  - Add rate limit information and error code reference

### Feature 4.5: Deployment & Demo Environment

- **Scope**: Ensure the entire stack runs reliably for demo
- **Logic**:
  - Verify `docker-compose up` brings up all services cleanly
  - Optimize Docker images (multi-stage builds, minimal base images)
  - Create `seed.py` script to populate demo data
  - Test on a clean machine to verify reproducibility
  - Prepare backup: recorded video of demo in case of live demo failure
  - Document setup instructions in `README.md`
