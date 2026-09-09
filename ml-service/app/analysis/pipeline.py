"""End-to-end analysis pipeline orchestration."""
import time
import uuid
import numpy as np
import torch
from pathlib import Path

from app.config import settings
from app.features.audio_processor import load_audio, load_audio_from_bytes
from app.features.spectral import compute_spectral_score, generate_spectrogram
from app.features.prosody import compute_prosody_score
from app.analysis.risk_scorer import compute_risk_score, determine_verdict
from app.utils.logging import log


class AnalysisResult:
    """Container for analysis pipeline output."""
    def __init__(
        self,
        risk_score: float,
        verdict: str,
        confidence: float,
        spectral_score: float | None,
        prosody_score: float | None,
        consistency_score: float | None,
        spectrogram_path: str | None,
        processing_time_ms: int,
        model_version: str,
    ):
        self.risk_score = risk_score
        self.verdict = verdict
        self.confidence = confidence
        self.spectral_score = spectral_score
        self.prosody_score = prosody_score
        self.consistency_score = consistency_score
        self.spectrogram_path = spectrogram_path
        self.processing_time_ms = processing_time_ms
        self.model_version = model_version

    def to_dict(self) -> dict:
        return {
            "risk_score": self.risk_score,
            "verdict": self.verdict,
            "confidence": self.confidence,
            "spectral_score": self.spectral_score,
            "prosody_score": self.prosody_score,
            "consistency_score": self.consistency_score,
            "spectrogram_path": self.spectrogram_path,
            "processing_time_ms": self.processing_time_ms,
            "model_version": self.model_version,
        }


def analyze_audio(
    file_path: str | None = None,
    audio_bytes: bytes | None = None,
    model: torch.nn.Module | None = None,
    device: torch.device | None = None,
    generate_spectro: bool = True,
) -> AnalysisResult:
    """Run full analysis pipeline on an audio file or raw bytes."""
    start_time = time.time()
    
    # Load audio
    if file_path:
        waveform, sr = load_audio(file_path)
    elif audio_bytes:
        waveform, sr = load_audio_from_bytes(audio_bytes)
    else:
        raise ValueError("Either file_path or audio_bytes must be provided")
    
    audio_numpy = waveform.squeeze().numpy()
    
    # 1. Model inference (if model available)
    spoofed_prob = 0.5  # Default when no model loaded
    confidence = 0.5
    
    if model is not None and device is not None:
        import librosa
        # Extract 40 MFCCs and mean pool over time dimension
        mfccs = librosa.feature.mfcc(y=audio_numpy, sr=sr, n_mfcc=40)
        mfccs_mean = np.mean(mfccs, axis=1) # shape (40,)
        
        # Prepare input tensor
        input_tensor = torch.tensor(mfccs_mean, dtype=torch.float32).unsqueeze(0).to(device)
        
        with torch.no_grad():
            probs = model.predict(input_tensor)
            spoofed_prob = float(probs[0, 1])  # Index 1 = spoofed class
            confidence = float(probs.max())
    
    # 2. Feature extraction
    spectral_score = compute_spectral_score(audio_numpy, sr)
    prosody_score = compute_prosody_score(audio_numpy, sr)
    
    # 3. Risk score computation
    risk_score = compute_risk_score(spoofed_prob, spectral_score, prosody_score)
    verdict = determine_verdict(risk_score)
    
    # 4. Generate spectrogram
    spectrogram_path = None
    if generate_spectro:
        spectro_filename = f"{uuid.uuid4().hex}.png"
        spectro_dir = Path("tmp/spectrograms")
        spectrogram_path = generate_spectrogram(
            audio_numpy, sr, spectro_dir / spectro_filename
        )
    
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    log("info", "Analysis complete",
        risk_score=risk_score,
        verdict=verdict,
        confidence=confidence,
        processing_time_ms=processing_time_ms)
    
    return AnalysisResult(
        risk_score=risk_score,
        verdict=verdict,
        confidence=confidence,
        spectral_score=spectral_score,
        prosody_score=prosody_score,
        consistency_score=None,  # Requires enrolled voice — future feature
        spectrogram_path=spectrogram_path,
        processing_time_ms=processing_time_ms,
        model_version="0.1.0-dev",
    )


def analyze_chunk(
    audio_bytes: bytes,
    model: torch.nn.Module | None = None,
    device: torch.device | None = None,
) -> dict:
    """Quick analysis of a short audio chunk for real-time streaming."""
    start_time = time.time()
    
    waveform, sr = load_audio_from_bytes(audio_bytes)
    
    spoofed_prob = 0.5
    confidence = 0.5
    
    if model is not None and device is not None:
        import librosa
        import numpy as np
        audio_numpy = waveform.squeeze().numpy()
        mfccs = librosa.feature.mfcc(y=audio_numpy, sr=sr, n_mfcc=40)
        mfccs_mean = np.mean(mfccs, axis=1)
        input_tensor = torch.tensor(mfccs_mean, dtype=torch.float32).unsqueeze(0).to(device)
        
        with torch.no_grad():
            probs = model.predict(input_tensor)
            spoofed_prob = float(probs[0, 1])
            confidence = float(probs.max())
    
    risk_score = spoofed_prob * 100
    verdict = determine_verdict(risk_score)
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    return {
        "risk_score": round(risk_score, 2),
        "verdict": verdict,
        "confidence": round(confidence, 4),
        "processing_time_ms": processing_time_ms,
    }
