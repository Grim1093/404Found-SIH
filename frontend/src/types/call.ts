export type CallType = 'live' | 'uploaded';
export type CallStatus = 'active' | 'completed' | 'flagged';
export type Verdict = 'genuine' | 'suspicious' | 'cloned';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'false_positive';
export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Call {
  id: string;
  caller_id: string | null;
  caller_name: string | null;
  call_type: CallType;
  status: CallStatus;
  duration_seconds: number | null;
  language: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
  created_by: string;
}

export interface AnalysisResult {
  id: string;
  call_id: string;
  risk_score: number;
  verdict: Verdict;
  confidence: number;
  spectral_score: number | null;
  prosody_score: number | null;
  consistency_score: number | null;
  features: Record<string, unknown> | null;
  spectrogram_path: string | null;
  processing_time_ms: number | null;
  model_version: string;
  created_at: string;
}

export interface Alert {
  id: string;
  call_id: string;
  analysis_id: string;
  severity: Severity;
  status: AlertStatus;
  risk_score: number;
  message: string;
  recommended_action: string | null;
  acknowledged_by: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Configuration {
  id: string;
  user_id: string;
  threshold_low: number;
  threshold_medium: number;
  threshold_high: number;
  threshold_critical: number;
  notify_in_app: boolean;
  notify_email: boolean;
  notify_sms: boolean;
  webhook_url: string | null;
  auto_escalate: boolean;
}
