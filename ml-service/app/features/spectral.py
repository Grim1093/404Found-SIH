"""Spectral feature extraction: spectrogram, MFCC, spectral centroid."""
import numpy as np
import librosa
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server-side rendering
import matplotlib.pyplot as plt
import librosa.display
from pathlib import Path
from app.config import settings


def extract_mfccs(audio: np.ndarray, sr: int | None = None, n_mfcc: int = 13) -> np.ndarray:
    """Extract Mel-frequency cepstral coefficients."""
    sr = sr or settings.SAMPLE_RATE
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
    return mfccs


def extract_spectral_centroid(audio: np.ndarray, sr: int | None = None) -> np.ndarray:
    """Extract spectral centroid — indicates where the center of mass of the spectrum is."""
    sr = sr or settings.SAMPLE_RATE
    centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)
    return centroid


def extract_zero_crossing_rate(audio: np.ndarray) -> np.ndarray:
    """Extract zero crossing rate — discriminates speech from noise."""
    zcr = librosa.feature.zero_crossing_rate(audio)
    return zcr


def compute_spectral_score(audio: np.ndarray, sr: int | None = None) -> float:
    """Compute a composite spectral analysis score (0-100).
    
    Combines MFCC statistics, spectral centroid variance, and ZCR patterns
    to produce a score indicating synthesis artifacts.
    """
    sr = sr or settings.SAMPLE_RATE
    
    mfccs = extract_mfccs(audio, sr)
    centroid = extract_spectral_centroid(audio, sr)
    zcr = extract_zero_crossing_rate(audio)
    
    # Compute statistics that differ between genuine and cloned speech
    mfcc_var = float(np.mean(np.var(mfccs, axis=1)))
    centroid_var = float(np.var(centroid))
    zcr_mean = float(np.mean(zcr))
    
    # Normalize to 0-100 range (heuristic — will be calibrated with real data)
    score = min(100.0, max(0.0, 50.0 + (mfcc_var - 20) * 0.5 + (centroid_var - 1e6) * 1e-5))
    return round(score, 2)


def generate_spectrogram(audio: np.ndarray, sr: int, output_path: str | Path) -> str:
    """Generate and save a spectrogram image."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    fig, ax = plt.subplots(figsize=(12, 4))
    S_db = librosa.amplitude_to_db(np.abs(librosa.stft(audio)), ref=np.max)
    librosa.display.specshow(S_db, sr=sr, ax=ax, x_axis="time", y_axis="hz", cmap="magma")
    ax.set_title("Spectrogram", color="white", fontsize=12)
    ax.tick_params(colors="white")
    fig.patch.set_facecolor("#0A0A0A")
    ax.set_facecolor("#0A0A0A")
    plt.colorbar(ax.collections[0], ax=ax, format="%+2.0f dB")
    fig.savefig(str(output_path), bbox_inches="tight", dpi=100, facecolor="#0A0A0A")
    plt.close(fig)
    
    return str(output_path)
