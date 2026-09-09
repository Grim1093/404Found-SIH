"""ASVspoof 2019 LA PyTorch Dataset."""
import os
import torch
import torchaudio
from torch.utils.data import Dataset
from pathlib import Path

class ASVspoofDataset(Dataset):
    """ASVspoof 2019 Logical Access dataset."""

    def __init__(self, data_dir: str, protocol_file: str, max_length_sec: float = 4.0, sample_rate: int = 16000):
        self.data_dir = Path(data_dir)
        self.protocol_file = Path(protocol_file)
        self.max_length_sec = max_length_sec
        self.sample_rate = sample_rate
        self.data = []

        with open(self.protocol_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 5:
                    speaker = parts[0]
                    filename = parts[1]
                    env = parts[2]
                    attack = parts[3]
                    label_str = parts[4]
                    label = 0 if label_str == "bonafide" else 1
                    file_path = self.data_dir / f"{filename}.flac"
                    self.data.append((file_path, label))

    def __len__(self) -> int:
        return len(self.data)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, int]:
        file_path, label = self.data[idx]
        
        try:
            waveform, sr = torchaudio.load(file_path)
            if waveform.shape[0] > 1:
                waveform = waveform.mean(dim=0, keepdim=True)
            if sr != self.sample_rate:
                resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=self.sample_rate)
                waveform = resampler(waveform)
                
            waveform = waveform / (waveform.abs().max() + 1e-8)
            
            max_samples = int(self.max_length_sec * self.sample_rate)
            current_length = waveform.shape[-1]
            if current_length > max_samples:
                waveform = waveform[..., :max_samples]
            elif current_length < max_samples:
                padding = max_samples - current_length
                waveform = torch.nn.functional.pad(waveform, (0, padding))
                
        except Exception:
            # Fallback to zero tensor if file not found or load fails
            waveform = torch.zeros((1, int(self.max_length_sec * self.sample_rate)))

        return waveform, label
