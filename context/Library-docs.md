# Library Documentation — VoxGuard

> This document specifies every library used in the project, **why** it was chosen, and **how** it should be used. Read this before adding any new dependency.

---

## Frontend Libraries (Next.js)

### Core Framework

#### `next` (v14+)

- **Why**: React meta-framework with built-in SSR/SSG, App Router, file-based routing, API routes, and image optimization. Eliminates boilerplate for routing, code splitting, and deployment.
- **How we use it**:
  - App Router (`src/app/`) for all page routing
  - `layout.tsx` for persistent layouts (sidebar, navbar)
  - `loading.tsx` for page-level loading states
  - `error.tsx` for page-level error boundaries
  - `next/image` for optimized image rendering (spectrograms, logos)
  - `next/font` for optimized font loading
- **Do NOT**: Use Pages Router (`pages/`). We use App Router exclusively.

#### `react` + `react-dom` (v18+)

- **Why**: Core UI library. Comes with Next.js.
- **How we use it**:
  - Functional components with hooks exclusively (no class components)
  - `useState`, `useEffect`, `useCallback`, `useMemo` for state and side effects
  - `useRef` for DOM references (audio elements, canvas)
  - `Suspense` for data fetching boundaries

#### `typescript` (v5+)

- **Why**: Type safety, better IDE support, catch bugs at compile time.
- **How we use it**:
  - Strict mode enabled in `tsconfig.json`
  - All component props must have explicit TypeScript interfaces
  - All API response types defined in `src/types/`
  - No `any` type unless absolutely unavoidable (document with `// eslint-disable-next-line` + reason)

---

### Styling

#### `tailwindcss` (v3+)

- **Why**: Utility-first CSS framework. Rapid development, consistent spacing/colors, small bundle via purging, great dark mode support.
- **How we use it**:
  - All styling done via Tailwind utility classes in JSX
  - Custom design tokens defined in `tailwind.config.ts` (colors, fonts, spacing)
  - `globals.css` for CSS custom properties and base styles only
  - Use `@apply` sparingly — only in `globals.css` for truly reusable base styles
- **Do NOT**: Write custom CSS files per component. Do NOT use inline `style={{}}` attributes. Do NOT hardcode color hex values in JSX — use Tailwind token classes.

#### `tailwind-merge`

- **Why**: Intelligently merge Tailwind classes, resolving conflicts (e.g., `px-2 px-4` → `px-4`).
- **How we use it**:
  - Wrap all dynamic class concatenation with `twMerge()`
  - Used inside the `cn()` utility function in `lib/utils.ts`

#### `clsx`

- **Why**: Conditional class joining. Cleaner than template literal ternaries.
- **How we use it**:
  - Combined with `tailwind-merge` in the `cn()` utility:
    ```typescript
    import { clsx, type ClassValue } from "clsx";
    import { twMerge } from "tailwind-merge";
    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }
    ```
  - Use `cn()` for all conditional styling:
    ```tsx
    <div className={cn("p-4 rounded", isActive && "bg-green-500", isError && "bg-red-500")} />
    ```

---

### State Management

#### `zustand` (v4+)

- **Why**: Lightweight state management (< 1KB). No boilerplate compared to Redux. Works seamlessly with React hooks.
- **How we use it**:
  - One store per domain: `authStore`, `callStore`, `alertStore`, `settingsStore`
  - Stores defined in `src/stores/` directory
  - Pattern:
    ```typescript
    import { create } from 'zustand';

    interface AuthState {
      user: User | null;
      token: string | null;
      login: (email: string, password: string) => Promise<void>;
      logout: () => void;
    }

    export const useAuthStore = create<AuthState>((set) => ({
      user: null,
      token: null,
      login: async (email, password) => { /* ... */ },
      logout: () => set({ user: null, token: null }),
    }));
    ```
  - Use `persist` middleware for token persistence (localStorage)
- **Do NOT**: Use React Context for global state. Context is for theme/locale only.

---

### Data Fetching

#### `axios` (v1+)

- **Why**: HTTP client with interceptors (auto-attach JWT, auto-refresh on 401), request/response transforms, and better error handling than fetch.
- **How we use it**:
  - Single axios instance in `src/lib/api.ts` with base URL and interceptors
  - Request interceptor: attach `Authorization: Bearer <token>` header
  - Response interceptor: on 401 → attempt token refresh → retry original request
  - All API calls go through this instance — never use raw `fetch()` or create new axios instances
  - Pattern:
    ```typescript
    import api from '@/lib/api';

    // In a service or hook
    const calls = await api.get('/api/calls', { params: { page: 1, limit: 20 } });
    const result = await api.post('/api/analysis/upload', formData);
    ```

#### `swr` or `@tanstack/react-query` (optional)

- **Why**: Data fetching hooks with caching, revalidation, and deduplication.
- **How we use it**:
  - Use `useSWR` for GET requests that need caching and auto-revalidation (dashboard stats, alert list)
  - Use plain axios for mutations (POST, PUT, DELETE)
  - If not adopted, use custom hooks with `useEffect` + `useState` for data fetching

---

### Charts & Visualization

#### `recharts` (v2+)

- **Why**: React-first charting library. Declarative, composable, good for dashboards. Simpler API than Chart.js for React.
- **How we use it**:
  - Dashboard page: risk distribution bar/pie chart, activity timeline
  - Call analysis: feature score comparison bar chart
  - Pattern: always wrap in `ResponsiveContainer` for responsive sizing
    ```tsx
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Bar dataKey="value" fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
    ```

#### `react-chartjs-2` + `chart.js`

- **Why**: More chart types and customization options than Recharts. Used for specialized visualizations.
- **How we use it**:
  - Risk score gauge: Doughnut chart configured as a gauge
  - Analytics page: line charts for trend data, radar charts for feature comparison
  - Register chart components explicitly (tree-shaking):
    ```typescript
    import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
    Chart.register(ArcElement, Tooltip, Legend);
    ```

---

### Audio

#### `wavesurfer.js` (v7+)

- **Why**: Purpose-built for audio waveform visualization in the browser. Supports zoom, regions, markers, and playback.
- **How we use it**:
  - Call Analysis page: render waveform of uploaded/analyzed audio
  - Create a reusable `<WaveformPlayer />` React component
  - Features used:
    - Waveform rendering with customizable colors
    - Playback controls (play, pause, seek)
    - Region highlighting for suspicious segments
    - Zoom in/out for detailed inspection
  - Pattern:
    ```typescript
    import WaveSurfer from 'wavesurfer.js';

    const waveformRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const ws = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: 'var(--color-waveform)',
        progressColor: 'var(--color-primary)',
        height: 128,
      });
      ws.load(audioUrl);
      return () => ws.destroy();
    }, [audioUrl]);
    ```

---

### UI Utilities

#### `react-hot-toast`

- **Why**: Lightweight toast notification library. Clean API, customizable, accessible.
- **How we use it**:
  - Success toasts: "Analysis complete", "Settings saved"
  - Error toasts: "Upload failed", "Network error"
  - Alert toasts: triggered by WebSocket alert events
  - Place `<Toaster />` in root layout
  - Pattern: `toast.success("Analysis complete")`, `toast.error("Upload failed")`

#### `lucide-react`

- **Why**: Modern icon library (continuation of Feather icons). Tree-shakeable, consistent style, TypeScript support.
- **How we use it**:
  - Import individual icons: `import { Shield, AlertTriangle, Phone } from 'lucide-react'`
  - Use in navigation, buttons, stat cards, badges
  - Consistent size: default `size={20}` for inline, `size={24}` for standalone

#### `date-fns`

- **Why**: Lightweight date utility library. Tree-shakeable (unlike moment.js). Immutable.
- **How we use it**:
  - Format timestamps: `format(date, 'MMM dd, yyyy HH:mm')`
  - Relative time: `formatDistanceToNow(date, { addSuffix: true })` → "5 minutes ago"
  - Date range filtering on alerts and calls

#### `react-dropzone`

- **Why**: Drag-and-drop file upload with accessibility support.
- **How we use it**:
  - Call Analysis page: audio file upload zone
  - Configured with accepted MIME types: `audio/wav`, `audio/mpeg`, `audio/flac`, `audio/ogg`
  - Max file size: 50MB

---

## Backend Libraries (FastAPI)

### Core Framework

#### `fastapi`

- **Why**: High-performance async Python web framework. Auto-generated OpenAPI docs, Pydantic validation, dependency injection, WebSocket support built-in.
- **How we use it**:
  - Main app in `app/main.py` with CORS middleware, exception handlers
  - Route handlers in `app/routers/` — thin controllers that delegate to services
  - Dependency injection for DB sessions, current user, auth
  - Pydantic models for all request/response validation
  - WebSocket endpoints for real-time communication

#### `uvicorn`

- **Why**: ASGI server for FastAPI. Production-grade, supports HTTP/2 and WebSocket.
- **How we use it**:
  - Development: `uvicorn app.main:app --reload --port 8000`
  - Production (Docker): `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`

#### `pydantic` (v2+)

- **Why**: Data validation and serialization. Core of FastAPI's request/response handling.
- **How we use it**:
  - Request schemas: `CreateCallRequest`, `UploadAudioRequest`, `UpdateSettingsRequest`
  - Response schemas: `CallResponse`, `AnalysisResultResponse`, `AlertResponse`
  - Config/settings: `pydantic-settings` for environment variable loading
  - Pattern:
    ```python
    class AnalysisResultResponse(BaseModel):
        id: UUID
        risk_score: float = Field(ge=0, le=100)
        verdict: Literal["genuine", "suspicious", "cloned"]
        confidence: float = Field(ge=0, le=1)
        model_config = ConfigDict(from_attributes=True)
    ```

---

### Database

#### `sqlalchemy` (v2+, async)

- **Why**: Industry-standard Python ORM. Async support, type-safe queries, relationship management.
- **How we use it**:
  - Async engine with `asyncpg` driver
  - Declarative models in `app/models/`
  - Async session via dependency injection
  - Pattern:
    ```python
    from sqlalchemy.ext.asyncio import AsyncSession
    
    async def get_calls(db: AsyncSession, skip: int, limit: int):
        result = await db.execute(
            select(Call).offset(skip).limit(limit).order_by(Call.created_at.desc())
        )
        return result.scalars().all()
    ```

#### `asyncpg`

- **Why**: High-performance async PostgreSQL driver for SQLAlchemy async engine.
- **How we use it**: Configured as the SQLAlchemy async driver. Not used directly.

#### `alembic`

- **Why**: Database migration tool for SQLAlchemy. Version-controlled schema changes.
- **How we use it**:
  - `alembic revision --autogenerate -m "description"` to generate migrations
  - `alembic upgrade head` to apply migrations
  - All migrations stored in `alembic/versions/`
  - Never modify the database schema manually — always through Alembic

---

### Authentication & Security

#### `PyJWT`

- **Why**: JWT token encoding/decoding. Lightweight, well-maintained.
- **How we use it**:
  - Encode: `jwt.encode({"sub": user_id, "exp": expiry}, SECRET_KEY, algorithm="HS256")`
  - Decode: `jwt.decode(token, SECRET_KEY, algorithms=["HS256"])`
  - Access tokens: 15-minute expiry
  - Refresh tokens: 7-day expiry

#### `passlib[bcrypt]`

- **Why**: Password hashing with bcrypt. Secure, industry-standard.
- **How we use it**:
  - Hash: `pwd_context.hash(password)`
  - Verify: `pwd_context.verify(password, hashed)`
  - CryptContext configured with bcrypt scheme

#### `python-multipart`

- **Why**: Required by FastAPI for file upload (multipart/form-data) support.
- **How we use it**: Installed as dependency. Used implicitly by FastAPI's `UploadFile`.

---

### HTTP & Communication

#### `httpx`

- **Why**: Async HTTP client for Python. Used for backend → ML service communication.
- **How we use it**:
  - `ml_client.py`: async HTTP client to call ML service endpoints
  - Pattern:
    ```python
    async with httpx.AsyncClient(base_url=ML_SERVICE_URL) as client:
        response = await client.post("/ml/analyze", files={"audio": audio_file})
        return response.json()
    ```

#### `websockets`

- **Why**: WebSocket support for FastAPI (used internally by FastAPI's WebSocket handling).
- **How we use it**: Installed as dependency. FastAPI handles WebSocket connections natively.

---

### Utilities

#### `python-dotenv`

- **Why**: Load environment variables from `.env` file in development.
- **How we use it**: Used by `pydantic-settings` to load config from `.env`.

#### `pydantic-settings`

- **Why**: Typed configuration management from environment variables.
- **How we use it**:
  - `config.py`:
    ```python
    class Settings(BaseSettings):
        DATABASE_URL: str
        JWT_SECRET: str
        ML_SERVICE_URL: str = "http://ml-service:8001"
        model_config = SettingsConfigDict(env_file=".env")
    ```

---

## ML Service Libraries

### Deep Learning

#### `torch` (PyTorch v2+)

- **Why**: Primary deep learning framework. Flexible, great ecosystem, excellent for research and production inference.
- **How we use it**:
  - Model definition: classification head on top of wav2vec 2.0
  - Inference: `model.eval()` + `torch.no_grad()` for prediction
  - Device management: auto-detect CUDA/CPU, move model and tensors accordingly
  - Model loading: `torch.load(checkpoint_path, map_location=device)`

#### `torchaudio`

- **Why**: Audio loading and transformation, integrated with PyTorch. Consistent tensor format.
- **How we use it**:
  - Load audio: `torchaudio.load(file_path)` → returns waveform tensor + sample rate
  - Resample: `torchaudio.transforms.Resample(orig_sr, 16000)`
  - Feature extraction: MFCC, MelSpectrogram transforms
  - Always convert to 16kHz mono before processing

#### `transformers` (Hugging Face)

- **Why**: Access to pre-trained wav2vec 2.0 model and feature extractor.
- **How we use it**:
  - Load model: `Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base")`
  - Load feature extractor: `Wav2Vec2FeatureExtractor.from_pretrained("facebook/wav2vec2-base")`
  - Extract embeddings: pass raw audio through feature extractor → model → hidden states
  - During training: `Wav2Vec2ForSequenceClassification` or custom head on base model
  - Cache models in `ml-service/models/` directory (git-ignored)

---

### Audio Processing

#### `librosa`

- **Why**: Comprehensive audio analysis library. Excellent for feature extraction (MFCCs, spectral features, pitch).
- **How we use it**:
  - MFCC extraction: `librosa.feature.mfcc(y=audio, sr=16000, n_mfcc=13)`
  - Spectral centroid: `librosa.feature.spectral_centroid(y=audio, sr=16000)`
  - Pitch estimation: `librosa.pyin(y=audio, fmin=65, fmax=2093, sr=16000)`
  - Zero crossing rate: `librosa.feature.zero_crossing_rate(audio)`
  - Spectrogram: `librosa.stft(audio)` → `librosa.amplitude_to_db()`
  - Always use `sr=16000` consistently

#### `soundfile`

- **Why**: Audio file I/O. Fast, supports WAV, FLAC, OGG. Required by librosa and torchaudio backends.
- **How we use it**: Used as backend for librosa and torchaudio. Not called directly.

#### `pydub`

- **Why**: Audio format conversion (MP3 → WAV, stereo → mono). Simple API.
- **How we use it**:
  - Convert uploaded audio to 16kHz mono WAV before processing:
    ```python
    from pydub import AudioSegment
    audio = AudioSegment.from_file(uploaded_file)
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(output_path, format="wav")
    ```
  - Requires `ffmpeg` installed in Docker image

---

### Visualization (Server-Side)

#### `matplotlib`

- **Why**: Generate spectrogram images server-side for display on frontend.
- **How we use it**:
  - Generate spectrogram:
    ```python
    import matplotlib.pyplot as plt
    import librosa.display

    fig, ax = plt.subplots(figsize=(12, 4))
    S_db = librosa.amplitude_to_db(np.abs(librosa.stft(audio)), ref=np.max)
    librosa.display.specshow(S_db, sr=16000, ax=ax, x_axis='time', y_axis='hz')
    fig.savefig(output_path, bbox_inches='tight', dpi=100)
    plt.close(fig)
    ```
  - Use `Agg` backend (non-interactive) for server-side rendering

#### `numpy`

- **Why**: Numerical computing. Required by all ML and audio libraries.
- **How we use it**: Array operations for feature processing. Not used directly in most cases — consumed by librosa, torch, etc.

---

### ML Service Framework

#### `fastapi` + `uvicorn`

- **Why**: Same framework as backend for consistency. Lightweight, async, fast.
- **How we use it**:
  - ML endpoints: `/ml/analyze`, `/ml/stream`, `/ml/health`
  - Model loaded on startup (lifespan event), cached in memory
  - File upload handling for audio analysis

---

## DevOps & Tooling

#### `docker` + `docker-compose`

- **Why**: Consistent development and demo environment. All services containerized.
- **How we use it**:
  - `docker-compose.yml` defines 4 services: frontend, backend, ml-service, postgres
  - Each service has its own `Dockerfile`
  - Shared network for inter-service communication
  - Volumes for PostgreSQL data persistence and model weights

#### `eslint` + `prettier` (Frontend)

- **Why**: Code quality and consistent formatting for TypeScript/React.
- **How we use it**:
  - ESLint: Next.js default config + TypeScript rules
  - Prettier: auto-format on save, consistent code style

#### `ruff` (Backend + ML)

- **Why**: Extremely fast Python linter and formatter. Replaces flake8 + black + isort.
- **How we use it**:
  - Lint: `ruff check .`
  - Format: `ruff format .`
  - Config in `pyproject.toml`

---

## Adding New Libraries — Rules

> [!IMPORTANT]
> Before adding any new library to the project:

1. **Load the library's installed skill first** — check `C:\Users\ACER\.agents\skills\` for any relevant skill and read it before using the library
2. **Check this document** — the library you need might already be covered by an existing dependency
3. **Justify the addition** — document why the existing libraries can't solve the problem
4. **Prefer lightweight options** — smaller bundle = faster load = better demo
5. **Update this document** — add a new entry with Why and How sections
6. **Never install competing libraries** — e.g., don't add moment.js when we have date-fns, don't add Redux when we have Zustand

## Next.js Specific Rule

> [!CAUTION]
> Before writing ANY Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. This version may have breaking changes — APIs, conventions, and file structure may differ from the AI's training data. Heed deprecation notices.
