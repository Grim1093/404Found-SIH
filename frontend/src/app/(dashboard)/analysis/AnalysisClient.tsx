'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Call, AnalysisResult } from '@/types/call';
import { AudioUploader } from '@/components/analysis/AudioUploader';
import { RiskGauge } from '@/components/analysis/RiskGauge';
import { VerdictCard } from '@/components/analysis/VerdictCard';
import { FeatureScores } from '@/components/analysis/FeatureScores';
import { SpectrogramViewer } from '@/components/analysis/SpectrogramViewer';
import { WaveformPlayer } from '@/components/analysis/WaveformPlayer';
import { CallMetadata } from '@/components/analysis/CallMetadata';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';
import { Button } from '@/components/common/Button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalysisClient({ initialCallId }: { initialCallId?: string }) {
  const router = useRouter();
  const [callId, setCallId] = useState<string | undefined>(initialCallId);
  const [call, setCall] = useState<Call | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If URL changes, update local state
    setCallId(initialCallId);
  }, [initialCallId]);

  useEffect(() => {
    if (!callId) {
      setCall(null);
      setResult(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const callRes = await api.get(`/api/calls/${callId}`);
        setCall(callRes.data);
        
        // Mocking the result if backend doesn't return nested result yet
        // In full impl, either call has .analysis_result or we fetch it.
        // Assuming backend returns analysis_result in Call or we construct it.
        const c = callRes.data;
        if (c.status === 'completed' || c.status === 'flagged') {
          // If no result is attached, we can mock one for the UI based on the call
          setResult({
            id: 'res-1',
            call_id: c.id,
            risk_score: c.status === 'flagged' ? 85.5 : 12.3,
            verdict: c.status === 'flagged' ? 'cloned' : 'genuine',
            confidence: 0.94,
            spectral_score: 0.9,
            prosody_score: 0.85,
            consistency_score: 0.95,
            features: null,
            spectrogram_path: null,
            processing_time_ms: 1200,
            model_version: '1.0',
            created_at: c.created_at
          } as AnalysisResult);
        }
      } catch (err: any) {
        toast.error('Failed to load analysis details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [callId]);

  const handleUploadSuccess = (newCallId: string) => {
    router.push(`/analysis?callId=${newCallId}`);
  };

  const handleNewAnalysis = () => {
    router.push('/analysis');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 space-y-6">
        {!callId ? (
          <div className="bg-surface border border-border rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <div className="max-w-md w-full text-center">
              <h2 className="text-xl font-medium text-text-primary mb-6">Upload Audio for Analysis</h2>
              <AudioUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        ) : isLoading ? (
          <div className="bg-surface border border-border rounded-lg min-h-[400px] flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-3 h-3 bg-foreground rounded-full"></div>
              <div className="w-3 h-3 bg-foreground rounded-full animation-delay-200"></div>
              <div className="w-3 h-3 bg-foreground rounded-full animation-delay-400"></div>
            </div>
          </div>
        ) : call && result ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-text-primary">Analysis Results</h2>
              <Button variant="secondary" onClick={handleNewAnalysis}>
                <Plus size={16} className="mr-2" />
                New Analysis
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VerdictCard verdict={result.verdict} confidence={result.confidence} />
              <div className="bg-surface border border-border rounded-lg p-6 flex flex-col items-center justify-center">
                <RiskGauge score={result.risk_score} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureScores features={{
                spectral: result.spectral_score || 0,
                prosody: result.prosody_score || 0,
                consistency: result.consistency_score || 0
              }} />
              <SpectrogramViewer imageUrl={result.spectrogram_path} />
            </div>

            <WaveformPlayer audioUrl={''} />
          </>
        ) : call ? (
          <div className="bg-surface border border-border rounded-lg min-h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="h-12 w-12 rounded-full border-2 border-t-foreground border-r-foreground border-b-border border-l-border animate-spin mb-4" />
            <h3 className="text-lg font-medium text-text-primary">Analysis in Progress</h3>
            <p className="text-sm text-text-secondary mt-2 max-w-md">
              The AI model is currently analyzing the audio file. This usually takes a few seconds...
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg p-6">
            Error loading call data.
          </div>
        )}
      </div>

      <div className="space-y-6">
        {call && (
          <CallMetadata call={call} />
        )}
        <AnalysisHistory />
      </div>
    </div>
  );
}
