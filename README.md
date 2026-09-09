# VoxGuard

**AI-Powered Real-Time Voice Cloning Detection & Prevention Framework**

VoxGuard analyzes live and recorded voice streams in real time, detects AI-generated or cloned speech using multi-layer deep learning, and provides actionable risk scores and alerts to prevent impersonation-based fraud.

## Architecture

| Service | Technology | Port | Description |
|---------|-----------|------|-------------|
| **Frontend** | Next.js + TypeScript + Tailwind | 3000 | Dashboard UI, real-time monitoring |
| **Backend API** | FastAPI (Python) | 8000 | REST API, auth, business logic |
| **ML Service** | FastAPI + PyTorch | 8001 | Voice analysis inference |
| **Database** | PostgreSQL (Aiven) | — | Cloud-hosted, shared instance |

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- Docker & Docker Compose (optional)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed default admin user
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### ML Service Setup

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Start server (will run in demo mode without trained model)
uvicorn app.main:app --reload --port 8001
```

### Docker Compose (All Services)

```bash
cp .env.example .env
docker-compose up --build
```

## Default Credentials

| User | Email | Password |
|------|-------|----------|
| Admin | admin@voxguard.com | admin123 |

## ML Model Training

The model uses **wav2vec 2.0** fine-tuned on **ASVspoof 2019 LA** dataset.

```bash
cd ml-service

# Download ASVspoof 2019 LA dataset (manual step)
# Place files in training/data/ASVspoof2019_LA/

# Train
python -m training.train

# Evaluate
python -m training.evaluate
```

## Project Structure

```
sih/
├── frontend/          # Next.js dashboard
├── backend/           # FastAPI REST API
├── ml-service/        # ML inference service
├── context/           # Project documentation
├── docker-compose.yml # Service orchestration
└── .env               # Environment variables
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

Private — SIH 2026 Hackathon Project
