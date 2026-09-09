"""Analysis pipeline service — orchestrates ML inference, DB storage, and alert creation."""
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis_result import AnalysisResult, Verdict
from app.models.alert import Alert, AlertStatus, Severity
from app.models.call import Call, CallStatus
from app.models.configuration import Configuration
from app.services import ml_client
from app.utils.logging import log


async def run_analysis(
    db: AsyncSession,
    call: Call,
    audio_bytes: bytes,
    filename: str,
    user_config: Configuration,
) -> AnalysisResult:
    """Full analysis orchestration:
    1. Call ML service
    2. Store AnalysisResult in DB
    3. Evaluate thresholds → create Alert if exceeded
    4. Update call status if flagged
    """
    # 1. Call ML service
    ml_response = await ml_client.analyze_audio(audio_bytes, filename)

    risk_score = ml_response.get("risk_score", 0.0)
    verdict_str = ml_response.get("verdict", "genuine")
    confidence = ml_response.get("confidence", 0.0)

    # 2. Store analysis result
    analysis = AnalysisResult(
        call_id=call.id,
        risk_score=risk_score,
        verdict=Verdict(verdict_str),
        confidence=confidence,
        spectral_score=ml_response.get("spectral_score"),
        prosody_score=ml_response.get("prosody_score"),
        consistency_score=ml_response.get("consistency_score"),
        features=ml_response.get("features"),
        spectrogram_path=ml_response.get("spectrogram_path"),
        processing_time_ms=ml_response.get("processing_time_ms"),
        model_version=ml_response.get("model_version", "mfcc-mlp-v1"),
    )
    db.add(analysis)
    await db.flush()

    log("info", "Analysis stored",
        call_id=str(call.id), analysis_id=str(analysis.id),
        risk_score=risk_score, verdict=verdict_str)

    # 3. Evaluate thresholds and create alert if needed
    severity = _evaluate_severity(risk_score, user_config)
    if severity is not None:
        alert = Alert(
            call_id=call.id,
            analysis_id=analysis.id,
            severity=severity,
            status=AlertStatus.OPEN,
            risk_score=risk_score,
            message=_build_alert_message(risk_score, verdict_str, severity),
            recommended_action=_build_recommendation(severity),
        )
        db.add(alert)

        # 4. Flag the call
        call.status = CallStatus.FLAGGED
        log("warning", "Alert created",
            call_id=str(call.id), severity=severity.value, risk_score=risk_score)

    return analysis


def _evaluate_severity(risk_score: float, config: Configuration) -> Severity | None:
    """Determine alert severity based on user-configured thresholds."""
    if risk_score >= config.threshold_critical:
        return Severity.CRITICAL
    elif risk_score >= config.threshold_high:
        return Severity.HIGH
    elif risk_score >= config.threshold_medium:
        return Severity.MEDIUM
    elif risk_score >= config.threshold_low:
        return Severity.LOW
    return None


def _build_alert_message(risk_score: float, verdict: str, severity: Severity) -> str:
    """Generate a human-readable alert message."""
    return (
        f"Voice cloning risk detected: {verdict.upper()} verdict with "
        f"risk score {risk_score:.1f}/100 ({severity.value} severity)"
    )


def _build_recommendation(severity: Severity) -> str:
    """Suggest a verification action based on severity level."""
    recommendations = {
        Severity.LOW: "Monitor the call and review analysis details.",
        Severity.MEDIUM: "Verify caller identity through security questions.",
        Severity.HIGH: "Escalate to supervisor. Initiate caller verification protocol.",
        Severity.CRITICAL: "IMMEDIATE ACTION: Suspend the transaction. Escalate to fraud team.",
    }
    return recommendations[severity]
