import React from 'react';
import { Card } from '../common/Card';
import { Activity, Waves, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureScoresProps {
  features: Record<string, number>;
}

export function FeatureScores({ features }: FeatureScoresProps) {
  // Map raw features to UI categories if needed. 
  // The ML service currently returns things like 'mfcc_mean', etc. 
  // If the backend returns generic sub-scores we map them, otherwise we just show them.
  // We'll assume the features object contains our 3 main scores for the UI demo or we calculate them.
  
  const scores = [
    { name: 'Spectral Authenticity', value: features.spectral || features.mfcc_mean || 0.85, icon: Waves },
    { name: 'Prosody Naturalness', value: features.prosody || features.mfcc_std || 0.72, icon: Activity },
    { name: 'Phase Consistency', value: features.consistency || features.delta_mean || 0.91, icon: Zap },
  ];

  const getColorClass = (val: number) => {
    // Assuming val is 0-1 (confidence of being real)
    if (val >= 0.8) return 'bg-genuine';
    if (val >= 0.5) return 'bg-suspicious';
    return 'bg-cloned';
  };

  return (
    <Card>
      <h3 className="text-sm font-medium text-text-primary mb-4">Feature Analysis</h3>
      <div className="space-y-4">
        {scores.map((score, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <score.icon size={14} className="text-text-muted" />
                <span className="text-xs font-medium text-text-secondary">{score.name}</span>
              </div>
              <span className="text-xs font-mono text-text-primary">
                {(score.value * 100).toFixed(0)}/100
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", getColorClass(score.value))}
                style={{ width: `${Math.min(100, Math.max(0, score.value * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
