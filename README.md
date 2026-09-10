# VoxGuard — AI-Powered Real-Time Voice Cloning Detection & Prevention Framework

## 1. Project Information

- **Project Title:** VoxGuard – AI-Powered Real-Time Voice Cloning Detection & Prevention
- **PS ID:** SIH2026-26104
- **PS Title:** AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks
- **Category:** Software
- **Theme:** Smart Automation / Cyber Security

## 2. Problem Statement

AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks
Existing defenses fail because:

- **Caller ID** is trivially spoofable
- **Manual call-back** verification is slow and impractical under pressure
- **Basic voice familiarity** cannot distinguish high-quality AI clones
- **Post-hoc forensics** means the damage is done before analysis completes
- **No existing tool provides real-time risk scoring** during a live conversation

## 3. Proposed Solution

VoxGuard is an **end-to-end security framework** that:

1. Analyzes incoming voice streams in **near real time**
2. Determines the **likelihood** that the caller is using a cloned or AI-generated voice
3. Computes a **dynamic impersonation risk score** (0–100) that updates continuously
4. Provides **timely alerts** before sensitive actions (fund transfers, confidential disclosures) are taken
5. Exposes **REST APIs** for integration with banking, enterprise, and telecom systems

The system uses a multi-layer deep learning approach — combining MFCC feature extraction with a lightweight neural network classifier trained on the ASVspoof 2019 dataset — to detect synthesis artifacts, prosody anomalies, and spectral inconsistencies in speech.

## 4. Key Features

- **Real-time voice cloning detection** — Core ML models for detecting synthetic/cloned speech
- **Dynamic risk scoring** — Continuous risk score computation (0–100 scale) during analysis
- **Web dashboard** — Real-time monitoring UI with live call feed, risk gauges, and activity timeline
- **Call analysis view** — Detailed per-call analysis with spectrograms, waveform playback, and feature breakdowns
- **Alert management** — Flagged call list with severity levels (low/medium/high/critical), filtering, and action workflows (acknowledge, resolve, false positive)
- **Uploaded audio analysis** — Drag-and-drop audio file upload with automated verdict generation
- **Settings & configuration** — Threshold tuning sliders, notification preferences, webhook config, API key management
- **REST API with docs** — Documented API endpoints with code samples (cURL, Python, Node.js) for third-party integration
- **Privacy-preserving design** — Feature-only logging, minimal audio retention

## 5. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (React 19), TypeScript, Tailwind CSS v4 |
| State Management | Zustand |
| Real-Time | WebSocket (native) |
| Charts & Visualization | Recharts, Chart.js, WaveSurfer.js |
| Backend API | Python, FastAPI |
| ML Service | Python, FastAPI (separate microservice) |
| ML Framework | PyTorch (lightweight MLP classifier) |
| Audio Processing | librosa, torchaudio, ffmpeg |
| Database | PostgreSQL (Aiven Cloud) |
| Cache | Valkey / Redis (Aiven Cloud) |
| ORM | SQLAlchemy (async) |
| Migrations | Alembic |
| Authentication | JWT (PyJWT) with access/refresh token pattern |
| Containerization | Docker + Docker Compose |

## 6. Architecture

See [docs/architecture.md](context/architecture.md) for the full technical architecture document.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        VOXGUARD SYSTEM                              │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │              │    │                  │    │                  │  │
│  │   Frontend   │◄──►│   Backend API    │◄──►│   ML Service     │  │
│  │   (Next.js)  │    │   (FastAPI)      │    │   (FastAPI)      │  │
│  │              │    │                  │    │                  │  │
│  │   Port 3000  │    │   Port 8000      │    │   Port 8001      │  │
│  │              │    │                  │    │                  │  │
│  └──────────────┘    └────────┬─────────┘    └──────────────────┘  │
│         ▲                     │                       ▲             │
│         │                     ▼                       │             │
│         │              ┌──────────────┐               │             │
│         │              │  PostgreSQL   │               │             │
│         │              │  (Aiven)      │               │             │
│         │              └──────────────┘               │             │
│         │                                             │             │
│         └─────────── WebSocket ──────────────────────┘             │
│                    (via Backend)                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow — Uploaded File Analysis

```text
User uploads .wav/.mp3
        ↓
   [Frontend] ──HTTP POST──► [Backend API]
                                   │
                                   ├─ Validate file format/size
                                   ├─ Forward to ML Service
                                   ▼
                              [ML Service]
                                   │
                                   ├─ Extract 40 MFCCs (mean-pooled)
                                   ├─ Run 4-layer MLP classifier
                                   ├─ Generate spectrogram
                                   ├─ Compute risk score + verdict
                                   ▼
                             Analysis Result
                                   │
                              [Backend API]
                                   │
                                   ├─ Store in PostgreSQL
                                   ├─ Evaluate alert thresholds
                                   ├─ Return report to frontend
                                   ▼
                              [Frontend]
                                   │
                                   ├─ Render spectrogram & waveform
                                   ├─ Display feature scores
                                   └─ Show verdict (Genuine / Suspicious / Cloned)
```

## 7. Repository Structure

```text
sih/
├── README.md                          # This file
├── docker-compose.yml                 # Multi-service orchestration
├── .env.example                       # Environment variable template
├── .gitignore
│
├── frontend/                          # Next.js 16 frontend application
│   ├── src/
│   │   ├── app/                       # Next.js App Router pages
│   │   │   ├── layout.tsx             # Root layout (Inter + JetBrains Mono fonts)
│   │   │   ├── (dashboard)/           # Authenticated route group
│   │   │   │   ├── page.tsx           # Dashboard (home)
│   │   │   │   ├── analysis/          # Call analysis page
│   │   │   │   ├── alerts/            # Alert management page
│   │   │   │   ├── settings/          # Settings & configuration page
│   │   │   │   └── api-docs/          # API documentation page
│   │   │   └── auth/                  # Login & registration pages
│   │   ├── components/                # Reusable UI components
│   │   │   ├── layout/               # AppLayout, Sidebar, TopBar
│   │   │   ├── dashboard/            # StatCards, LiveCallFeed, RiskDistribution
│   │   │   ├── analysis/             # AudioUploader, RiskGauge, WaveformPlayer
│   │   │   ├── alerts/               # AlertTable, AlertFilters, AlertDetail
│   │   │   ├── settings/             # ThresholdConfig, ApiKeyManager
│   │   │   └── common/               # Button, Badge, Card, Modal, DataTable, etc.
│   │   ├── stores/                    # Zustand state stores (auth, calls, alerts, settings)
│   │   ├── lib/                       # API client (Axios), WebSocket client
│   │   └── types/                     # TypeScript type definitions
│   ├── tailwind.config.ts             # Token-mapped Tailwind configuration
│   ├── Dockerfile
│   └── package.json
│
├── backend/                           # FastAPI backend API server
│   ├── app/
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── config.py                  # Environment configuration
│   │   ├── database.py                # Async SQLAlchemy session management
│   │   ├── models/                    # ORM models (User, Call, Alert, Configuration, ApiKey)
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── routers/                   # API route handlers (auth, calls, alerts, analysis, settings, websocket)
│   │   ├── services/                  # Business logic layer
│   │   ├── middleware/                # JWT auth middleware
│   │   └── utils/                     # Structured logging
│   ├── alembic/                       # Database migrations
│   ├── seed.py                        # Database seeding script
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml-service/                        # ML inference microservice
│   ├── app/
│   │   ├── main.py                    # FastAPI app for ML endpoints
│   │   ├── config.py                  # Model paths, thresholds, device config
│   │   ├── models/                    # Model loading (4-layer MLP: 40→64→32→16→2)
│   │   ├── features/                  # MFCC extraction, audio processing, spectrogram generation
│   │   ├── analysis/                  # Analysis pipeline & risk scoring
│   │   └── routers/                   # /analyze and /stream endpoints
│   ├── models/                        # Saved model weights (.pth)
│   ├── requirements.txt
│   └── Dockerfile
│
├── context/                           # Project documentation & context files
│   ├── project-overview.md
│   ├── architecture.md
│   ├── build-plan.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   └── progress-tracker.md
│
├── submission/
│   ├── PRESENTATION.md
│   └── DEMO.md
│
└── assets/
    └── screenshots/
        └── README.md
```

### What goes where?

| Item | Location |
|------|----------|
| Frontend source code | `frontend/src/` |
| Backend source code | `backend/app/` |
| ML service source code | `ml-service/app/` |
| Architecture / technical documentation | `context/` |
| Project screenshots | `assets/screenshots/` |
| Final PPT / presentation | `submission/` |
| Demo video link | `submission/DEMO.md` |
| Project overview | `README.md` |

## 8. Final Presentation

See [submission/PRESENTATION.md](submission/PRESENTATION.md) for the required format.

If the PPT is too large for GitHub, use Google Drive/OneDrive and put the accessible viewer link in `submission/PRESENTATION.md`.

## 9. Demo Video

See [submission/DEMO.md](submission/DEMO.md) for the demo video link.

## 10. Screenshots

Add screenshots to `assets/screenshots/`. See [assets/screenshots/README.md](assets/screenshots/README.md) for naming conventions.

## 11. Installation

### Prerequisites

- **Node.js** v20+ and npm
- **Python** 3.11+
- **Docker** and Docker Compose (optional, for containerized setup)
- **ffmpeg** (required by the ML service for audio format conversion)

### Option A: Docker Compose (Recommended)

```bash
git clone <YOUR_REPOSITORY_URL>
cd sih

# Copy environment variables
cp .env.example .env
# Edit .env with your database and Valkey credentials

# Build and start all services
docker-compose up --build
```

The frontend will be available at `http://localhost:3000`, the backend API at `http://localhost:8000`, and the ML service at `http://localhost:8001`.

### Option B: Local Development

**Terminal 1 — ML Service:**

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate        # On Windows
# source venv/bin/activate   # On Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**Terminal 2 — Backend API:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed the database with admin user and sample data
python seed.py

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

### Default Admin Credentials

After running the seed script, you can log in with:

- **Email:** `admin@voxguard.com`
- **Password:** `admin123`

## 12. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate and receive JWT tokens |
| POST | `/api/auth/register` | Register a new user account |
| POST | `/api/auth/refresh` | Refresh an expired access token |
| GET | `/api/calls` | List calls with pagination and filtering |
| POST | `/api/calls` | Create a new call record |
| GET | `/api/calls/stats` | Get aggregate call statistics |
| GET | `/api/calls/{id}` | Get a single call by ID |
| POST | `/api/analysis/upload` | Upload audio file for analysis |
| GET | `/api/alerts` | List alerts with pagination and filtering |
| PATCH | `/api/alerts/{id}/acknowledge` | Acknowledge an alert |
| PATCH | `/api/alerts/{id}/resolve` | Resolve an alert |
| GET | `/api/settings` | Get user configuration |
| PUT | `/api/settings` | Update configuration (thresholds, notifications) |
| POST | `/api/settings/api-keys` | Generate a new API key |
| DELETE | `/api/settings/api-keys/{id}` | Revoke an API key |
| GET | `/health` | Health check endpoint |

Full interactive API documentation is available at `http://localhost:8000/docs` (Swagger UI) when the backend is running.

## 13. Future Scope

- **Actual telecom / VoIP integration** — Connect with SIP gateways and carrier-level APIs for live call interception
- **wav2vec 2.0 fine-tuning** — Upgrade from the lightweight MLP to a fine-tuned wav2vec 2.0 encoder for significantly improved detection accuracy
- **Multi-language accent models** — Train specialized models for diverse Indian languages and regional accents
- **Edge / on-device inference** — Deploy lightweight ONNX models on edge devices for latency-sensitive environments
- **Mobile application** — Native iOS/Android app for on-the-go call monitoring
- **Banking system integration** — Direct API integration with core banking systems for pre-transaction verification
- **Speaker enrollment & verification** — Enroll known genuine voices and perform cross-session consistency checks
- **Real SMS/email alerting** — Integrate with Twilio/SendGrid for actual multi-channel alert delivery
- **Production-scale deployment** — Kubernetes orchestration with horizontal auto-scaling for enterprise workloads

## Important

> Before submission, make sure the repository is accessible to reviewers. Do **not** upload passwords, API keys, access tokens, `.env` files containing secrets, or other confidential credentials.

---

**Built for SIH 2026** | Theme: Smart Automation / Cyber Security
