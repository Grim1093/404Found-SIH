"""Audio loading, resampling, and normalization utilities."""
import io
import numpy as np
import torch
import torchaudio
from pathlib import Path
from app.config import settings
from app.utils.logging import log


def load_audio(file_path: str | Path, target_sr: int | None = None) -> tuple[torch.Tensor, int]:
    """Load an audio file and resample to target sample rate.
    
    Returns:
        Tuple of (waveform tensor [1, samples], sample_rate)
    """
    target_sr = target_sr or settings.SAMPLE_RATE
    waveform, sr = torchaudio.load(str(file_path))
    
    # Convert to mono if stereo
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    
    # Resample if needed
    if sr != target_sr:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
        waveform = resampler(waveform)
    
    # Normalize amplitude
    waveform = waveform / (waveform.abs().max() + 1e-8)
    
    return waveform, target_sr


def load_audio_from_bytes(audio_bytes: bytes, target_sr: int | None = None) -> tuple[torch.Tensor, int]:
    """Load audio from raw bytes (for file uploads)."""
    target_sr = target_sr or settings.SAMPLE_RATE
    buffer = io.BytesIO(audio_bytes)
    waveform, sr = torchaudio.load(buffer)
    
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    
    if sr != target_sr:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
        waveform = resampler(waveform)
    
    waveform = waveform / (waveform.abs().max() + 1e-8)
    
    return waveform, target_sr


def truncate_or_pad(waveform: torch.Tensor, max_length_sec: float, sr: int) -> torch.Tensor:
    """Truncate or zero-pad waveform to a fixed length."""
    max_samples = int(max_length_sec * sr)
    current_length = waveform.shape[-1]
    
    if current_length > max_samples:
        waveform = waveform[..., :max_samples]
    elif current_length < max_samples:
        padding = max_samples - current_length
        waveform = torch.nn.functional.pad(waveform, (0, padding))
    
    return waveform
