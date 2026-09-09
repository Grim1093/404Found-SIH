import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AudioUploader } from '@/components/analysis/AudioUploader';
import { RiskGauge } from '@/components/analysis/RiskGauge';
import { VerdictCard } from '@/components/analysis/VerdictCard';
import { FeatureScores } from '@/components/analysis/FeatureScores';
import { SpectrogramViewer } from '@/components/analysis/SpectrogramViewer';
import { WaveformPlayer } from '@/components/analysis/WaveformPlayer';
import { CallMetadata } from '@/components/analysis/CallMetadata';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';
import { api } from '@/lib/api';
import { Call, AnalysisResult } from '@/types/call';
import { Metadata } from 'next';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Call Analysis — VoxGuard',
  description: 'Upload and analyze audio for voice cloning',
};

async function getCallDetails(callId: string) {
  try {
    // In server components, we need to pass the cookie/auth header 
    // Wait, we can't easily use Axios with the zustand store on the server.
    // For simplicity in Phase 3 demo, we might fetch client-side if we need auth.
    // Let's refactor this to be a Client Component or use a client wrapper for the data fetching
    // so we can use our `api` axios instance.
    return null;
  } catch (err) {
    return null;
  }
}

// Client wrapper to handle the state and fetching
import AnalysisClient from './AnalysisClient';

export default async function AnalysisPage(props: { searchParams: Promise<{ callId?: string }> }) {
  const searchParams = await props.searchParams;
  const callId = searchParams.callId;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <PageHeader 
        title="Call Analysis" 
        description="Upload audio recordings for manual Deepfake analysis or review past results."
      />
      
      <AnalysisClient initialCallId={callId} />
    </div>
  );
}
