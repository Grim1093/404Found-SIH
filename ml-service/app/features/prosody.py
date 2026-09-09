"""Prosody feature extraction: pitch, rhythm, pause analysis."""
import numpy as np
import librosa
from app.config import settings


def extract_pitch_contour(
    audio: np.ndarray, sr: int | None = None
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Extract pitch contour using pYIN algorithm.
    
    Returns:
        Tuple of (f0, voiced_flag, voiced_probs)
    """
    sr = sr or settings.SAMPLE_RATE
    f0, voiced_flag, voiced_probs = librosa.pyin(
        audio, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr
    )
    return f0, voiced_flag, voiced_probs


def compute_prosody_score(audio: np.ndarray, sr: int | None = None) -> float:
    """Compute a prosody-based authenticity score (0-100).
    
    Analyzes pitch variation, micro-intonation patterns, and rhythm consistency
    to detect unnatural speech patterns typical of AI-generated voice.
    """
    sr = sr or settings.SAMPLE_RATE
    
    f0, voiced_flag, voiced_probs = extract_pitch_contour(audio, sr)
    
    # Filter out unvoiced frames
    voiced_f0 = f0[voiced_flag]
    
    if len(voiced_f0) < 10:
        # Not enough voiced frames for meaningful analysis
        return 50.0
    
    # Pitch variation metrics
    pitch_std = float(np.std(voiced_f0))
    pitch_range = float(np.ptp(voiced_f0))
    
    # Micro-variation: frame-to-frame pitch changes
    pitch_diff = np.diff(voiced_f0)
    micro_variation = float(np.std(pitch_diff))
    
    # Voiced ratio (proportion of voiced frames)
    voiced_ratio = float(np.sum(voiced_flag) / len(voiced_flag))
    
    # Natural speech has more pitch variation than synthetic
    # Heuristic scoring (will be calibrated with training data)
    score = min(100.0, max(0.0,
        50.0
        + (pitch_std - 30) * 0.3
        + (micro_variation - 5) * 0.5
        + (voiced_ratio - 0.6) * 20
    ))
    
    return round(score, 2)
