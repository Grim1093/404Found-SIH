"""MFCC-based lightweight voice cloning classifier."""
import torch
import torch.nn as nn


class VoiceCloningClassifier(nn.Module):
    """Binary classifier for detecting cloned/spoofed speech.
    
    Architecture matching asvspoof_model.pth:
        Input: 40 MFCCs (mean pooled over time)
        Hidden 1: Linear(40, 64) -> ReLU -> Dropout
        Hidden 2: Linear(64, 32) -> ReLU -> Dropout
        Hidden 3: Linear(32, 16) -> ReLU -> Dropout
        Output: Linear(16, 2) [genuine, spoofed]
    """

    def __init__(self, input_dim: int = 40, num_classes: int = 2, dropout: float = 0.3):
        super().__init__()
        
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(16, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass returning raw logits."""
        return self.network(x)

    @torch.no_grad()
    def predict(self, x: torch.Tensor) -> torch.Tensor:
        """Return class probabilities via softmax."""
        self.eval()
        logits = self.forward(x)
        return torch.softmax(logits, dim=-1)
