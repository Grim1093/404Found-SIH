# Code Standards — VoxGuard

## Engineering Mindset

> **Balanced**: Write clean, readable, well-structured code. Follow good practices but don't over-engineer. This is a hackathon — prioritize working software with clean architecture. Test critical paths, not every utility function.

### Guiding Principles

1. **Clarity over cleverness** — Code should be readable by a teammate who didn't write it. No clever one-liners that require a comment to explain.
2. **Consistency over preference** — Follow the patterns in this document and existing code. Don't invent new patterns when one already exists.
3. **Working over perfect** — Ship the feature first, refactor later if time permits. Don't spend 2 hours debating architecture for a utility function.
4. **Single responsibility** — Each file, function, and component should do one thing well.
5. **Fail loudly** — Never swallow errors. Log them, handle them, and return meaningful error responses.
6. **English only** — All code, comments, variable names, commit messages, and documentation must be in English.

### Skill-Driven Development Rules

> [!IMPORTANT]
> These rules govern how the AI agent approaches development. They are non-negotiable.

7. **Think before building** — Run `/architect` before any complex feature (ML pipeline, WebSocket, real-time dashboard).
8. **One failure = stop** — If a bug persists after **one** corrective attempt, run `/recover` immediately. Do NOT keep trying the same approach.
9. **Capture patterns** — After building any UI component, run `/imprint` to capture its patterns for future consistency.
10. **Save session state** — When a feature spans multiple sessions, run `/remember save` at the end and `/remember restore` at the start.
11. **Review before demo** — Run `/review` before Phase 4 and before the final SIH presentation.
12. **Load skills before libraries** — Before using ANY third-party library, load its installed skill first, then read `context/Library-docs.md` for project rules.
13. **Read Next.js docs** — Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. APIs may differ from training data.

---

## Naming Conventions

### Python (Backend + ML Service)

| Element | Convention | Example |
|---------|-----------|---------|
| Files & modules | `snake_case.py` | `auth_service.py`, `risk_scorer.py` |
| Classes | `PascalCase` | `AnalysisResult`, `CallService` |
| Functions & methods | `snake_case` | `get_calls()`, `compute_risk_score()` |
| Variables | `snake_case` | `risk_score`, `audio_path` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `JWT_EXPIRY_MINUTES` |
| Private methods | `_leading_underscore` | `_validate_audio()`, `_hash_password()` |
| Pydantic schemas | `PascalCase` + suffix | `CreateCallRequest`, `CallResponse` |
| SQLAlchemy models | `PascalCase` (singular) | `User`, `Call`, `Alert` |
| Enum members | `UPPER_SNAKE_CASE` | `CallType.LIVE`, `Severity.HIGH` |
| Router prefixes | `/api/{resource}` (plural) | `/api/calls`, `/api/alerts` |
| Environment variables | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |

### TypeScript / React (Frontend)

| Element | Convention | Example |
|---------|-----------|---------|
| Files (components) | `PascalCase.tsx` | `RiskGauge.tsx`, `AlertTable.tsx` |
| Files (utilities) | `camelCase.ts` | `apiClient.ts`, `formatDate.ts` |
| Files (hooks) | `camelCase.ts` with `use` prefix | `useAuth.ts`, `useWebSocket.ts` |
| Files (stores) | `camelCase.ts` with `Store` suffix | `authStore.ts`, `callStore.ts` |
| Files (types) | `camelCase.ts` | `call.ts`, `alert.ts` |
| Components | `PascalCase` | `<DashboardStats />`, `<AlertBadge />` |
| Functions | `camelCase` | `formatRiskScore()`, `handleUpload()` |
| Variables | `camelCase` | `riskScore`, `isLoading` |
| Constants | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_UPLOAD_SIZE` |
| Interfaces / Types | `PascalCase` | `Call`, `AnalysisResult`, `AlertProps` |
| Enums | `PascalCase` members | `Severity.High`, `CallType.Live` |
| CSS classes | Tailwind utilities only | `className="text-sm font-medium"` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleFileUpload` |
| Boolean variables | `is/has/should` prefix | `isLoading`, `hasError`, `shouldRefresh` |

### General Rules

- **No abbreviations** unless universally understood (`id`, `url`, `api`, `db`, `auth`, `ws`)
- **No single-letter variables** except loop counters (`i`, `j`) and lambda params
- **No Hungarian notation** (`strName`, `intCount` — don't do this)
- **Plural for collections**: `calls`, `alerts`, `users` — not `callList`, `alertArray`

---

## File and Folder Naming

### Directory Structure Rules

```
# Python (backend, ml-service)
app/
├── routers/         # API route handlers (thin controllers)
├── services/        # Business logic (called by routers)
├── models/          # SQLAlchemy ORM models / ML model classes
├── schemas/         # Pydantic request/response schemas
├── middleware/       # FastAPI middleware (auth, CORS, logging)
├── utils/           # Pure utility functions (no side effects)
├── main.py          # App entry point
├── config.py        # Settings and configuration
└── database.py      # DB connection setup

# TypeScript (frontend)
src/
├── app/             # Next.js App Router pages
├── components/      # React components (grouped by feature)
│   ├── common/      # Shared/reusable components
│   ├── layout/      # Layout components (Sidebar, Navbar)
│   ├── dashboard/   # Dashboard-specific components
│   ├── analysis/    # Call analysis components
│   ├── alerts/      # Alert components
│   └── settings/    # Settings components
├── hooks/           # Custom React hooks
├── lib/             # Utilities, API client, WebSocket client
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
└── styles/          # Global CSS
```

### File Naming Rules

| Rule | Good | Bad |
|------|------|-----|
| Python files are `snake_case` | `auth_service.py` | `authService.py`, `AuthService.py` |
| React components are `PascalCase` | `RiskGauge.tsx` | `riskGauge.tsx`, `risk-gauge.tsx` |
| Utility files are `camelCase` | `formatDate.ts` | `FormatDate.ts`, `format-date.ts` |
| Test files mirror source | `auth_service_test.py` | `test_auth.py` (too vague) |
| Index files for barrel exports | `components/common/index.ts` | — |
| One component per file | `AlertBadge.tsx` has `AlertBadge` | Two components in one file |
| Group by feature, not type | `components/dashboard/StatsCard.tsx` | `components/cards/DashboardStatsCard.tsx` |

---

## Logging Standard

### Approach: Console-based structured JSON logging

> Simple, readable in Docker logs, parseable by log aggregators if ever needed.

### Python (Backend + ML Service)

```python
import logging
import json
from datetime import datetime

# Configure once in main.py
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',  # We'll format as JSON ourselves
)

logger = logging.getLogger("voxguard")


def log(level: str, message: str, **kwargs):
    """Structured JSON log entry."""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        "service": "backend",  # or "ml-service"
        **kwargs
    }
    logger.log(
        getattr(logging, level.upper()),
        json.dumps(entry)
    )


# Usage examples:
log("info", "Call analysis started", call_id="abc-123", call_type="uploaded")
log("warning", "Risk threshold exceeded", call_id="abc-123", risk_score=87.5)
log("error", "ML service unavailable", endpoint="/ml/analyze", status_code=503)
```

### Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `DEBUG` | Detailed debugging info (disabled in production) | Feature vector shapes, model layer outputs |
| `INFO` | Normal operations, request flows | "Call analysis started", "User logged in" |
| `WARNING` | Something unexpected but handled | "Risk threshold exceeded", "Slow ML response" |
| `ERROR` | Something failed, needs attention | "ML service unreachable", "DB connection failed" |
| `CRITICAL` | System is unusable | "Model failed to load", "Database corrupted" |

### What to Log

- ✅ Request method, path, status code, response time
- ✅ Analysis start/completion with call_id and processing_time_ms
- ✅ Alert creation with severity and risk_score
- ✅ Authentication events (login success/failure — no passwords)
- ✅ ML model loading and inference timing
- ✅ WebSocket connections/disconnections
- ❌ **NEVER log**: passwords, JWT tokens, raw audio data, PII (names, emails, phone numbers)

### TypeScript (Frontend)

```typescript
// Use console methods — these are visible in browser DevTools
console.log("[VoxGuard]", "Dashboard loaded", { callCount: 42 });
console.warn("[VoxGuard]", "WebSocket reconnecting", { attempt: 3 });
console.error("[VoxGuard]", "API request failed", { endpoint: "/api/calls", error: err.message });
```

- Prefix all logs with `[VoxGuard]` for easy filtering
- Remove `console.log` debug statements before demo (keep `warn` and `error`)

---

## Error Handling

### Python (Backend)

#### HTTP Exception Pattern

```python
from fastapi import HTTPException, status

# In services — raise HTTPException with clear messages
async def get_call(db: AsyncSession, call_id: UUID) -> Call:
    call = await db.get(Call, call_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call {call_id} not found"
        )
    return call
```

#### Global Exception Handler

```python
# In main.py
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log("error", "Unhandled exception", 
        path=str(request.url), 
        error=str(exc),
        error_type=type(exc).__name__)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

#### Standard Error Response Format

```json
{
  "detail": "Human-readable error message",
  "error_code": "CALL_NOT_FOUND",
  "timestamp": "2026-08-27T10:30:00Z"
}
```

#### Error Handling Rules

| Rule | Do | Don't |
|------|-----|-------|
| Use specific HTTP codes | `404` for not found, `422` for validation | `500` for everything |
| Include helpful messages | `"Call abc-123 not found"` | `"Error"` |
| Catch specific exceptions | `except httpx.TimeoutException` | `except Exception` (bare) |
| Log before re-raising | Log the error, then raise HTTPException | Raise without logging |
| Return consistent format | Always use `{"detail": "..."}` | Mix different error shapes |

### TypeScript (Frontend)

#### API Error Handling Pattern

```typescript
// In lib/api.ts — centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — attempt refresh
      return refreshAndRetry(error);
    }
    if (error.response?.status === 403) {
      toast.error("You don't have permission for this action");
    }
    if (error.response?.status >= 500) {
      toast.error("Server error. Please try again.");
    }
    return Promise.reject(error);
  }
);
```

#### Component Error Handling

```tsx
// Use try-catch in async handlers
const handleUpload = async (file: File) => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await api.post("/api/analysis/upload", formData);
    setAnalysis(result.data);
    toast.success("Analysis complete");
  } catch (err) {
    const message = err instanceof AxiosError 
      ? err.response?.data?.detail || "Upload failed"
      : "An unexpected error occurred";
    setError(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};
```

#### Frontend Error Rules

| Rule | Do | Don't |
|------|-----|-------|
| Show user-friendly messages | "Unable to connect. Check your network." | Show raw error stack traces |
| Handle loading states | `isLoading`, `isError`, `isEmpty` states for every data fetch | Show a blank page while loading |
| Use error boundaries | `error.tsx` in Next.js App Router for page-level crashes | Let the whole app crash |
| Toast for transient errors | `toast.error("Upload failed")` for retryable actions | Alert dialogs for every error |
| Inline for form errors | Show validation errors next to the field | Toast for form validation |

---

## Code Organization Rules

### Import Order

**Python:**
```python
# 1. Standard library
import os
import json
from datetime import datetime
from uuid import UUID

# 2. Third-party
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import torch

# 3. Local application
from app.config import settings
from app.models.call import Call
from app.schemas.call import CallResponse
from app.services.call_service import CallService
```

**TypeScript:**
```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// 3. Local imports — components
import { RiskGauge } from '@/components/common/RiskGauge';
import { AlertBadge } from '@/components/alerts/AlertBadge';

// 4. Local imports — hooks, stores, utils
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// 5. Local imports — types
import type { Call, AnalysisResult } from '@/types/call';
```

### Function Length

- **Maximum 40 lines** per function. If longer, extract sub-functions.
- **Maximum 200 lines** per file. If longer, split by responsibility.
- **Exception**: ML pipeline functions and training scripts can be longer if well-commented.

### Comments

- Write comments for **why**, not **what**. The code shows what; the comment explains why.
- Every file should have a 1-line docstring at the top explaining its purpose.
- Functions with non-obvious logic should have a brief docstring.
- Don't comment out code — delete it. Git has history.

```python
# Good: explains WHY
# Freeze lower encoder layers to prevent catastrophic forgetting on small dataset
for param in model.wav2vec2.encoder.layers[:8].parameters():
    param.requires_grad = False

# Bad: restates WHAT the code does
# Set learning rate to 0.00001
lr = 1e-5
```
