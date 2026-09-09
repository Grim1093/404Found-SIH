"""Model initialization, checkpoint loading, and device management."""
import torch
from pathlib import Path
from app.config import settings
from app.models.wav2vec_classifier import VoiceCloningClassifier
from app.utils.logging import log


def get_device() -> torch.device:
    """Auto-detect the best available compute device."""
    if settings.DEVICE == "auto":
        if torch.cuda.is_available():
            device = torch.device("cuda")
            log("info", "Using CUDA GPU", device_name=torch.cuda.get_device_name(0))
        else:
            device = torch.device("cpu")
            log("info", "Using CPU (no GPU detected)")
    else:
        device = torch.device(settings.DEVICE)
        log("info", f"Using configured device: {settings.DEVICE}")
    return device


def load_model(device: torch.device | None = None) -> tuple[VoiceCloningClassifier, torch.device]:
    """Load the voice cloning classifier model.
    
    If a trained checkpoint exists, load its weights.
    Otherwise, initialize with pre-trained wav2vec 2.0 (untrained classifier head).
    """
    if device is None:
        device = get_device()

    model = VoiceCloningClassifier()
    
    checkpoint_path = Path(settings.MODEL_PATH)
    if checkpoint_path.exists():
        log("info", "Loading friend's pre-trained checkpoint", path=str(checkpoint_path))
        # The provided model is just a state dict, not a wrapped checkpoint
        state_dict = torch.load(checkpoint_path, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
        log("info", "Checkpoint loaded successfully")
    else:
        log("warning", "No trained checkpoint found — using untrained classifier",
            expected_path=str(checkpoint_path))

    model = model.to(device)
    model.eval()
    log("info", "Model loaded and ready for inference", 
        device=str(device), 
        param_count=sum(p.numel() for p in model.parameters()))
    return model, device
