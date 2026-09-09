"""Risk score computation from model predictions and feature scores."""
from app.config import settings


def compute_risk_score(
    spoofed_probability: float,
    spectral_score: float | None = None,
    prosody_score: float | None = None,
) -> float:
    """Compute overall risk score (0-100) from model output and feature scores.
    
    The primary signal is the model's spoofed probability.
    Feature scores provide secondary confirmation.
    """
    # Primary: model prediction (70% weight)
    base_score = spoofed_probability * 100
    
    if spectral_score is not None and prosody_score is not None:
        # Weighted combination: model (70%), spectral (15%), prosody (15%)
        risk_score = (
            base_score * 0.70
            + spectral_score * 0.15
            + prosody_score * 0.15
        )
    else:
        risk_score = base_score
    
    return round(min(100.0, max(0.0, risk_score)), 2)


def determine_verdict(risk_score: float) -> str:
    """Map risk score to verdict label."""
    if risk_score < settings.GENUINE_THRESHOLD:
        return "genuine"
    elif risk_score < settings.SUSPICIOUS_THRESHOLD:
        return "suspicious"
    else:
        return "cloned"
