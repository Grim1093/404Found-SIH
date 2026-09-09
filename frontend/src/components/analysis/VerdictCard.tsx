import React from 'react';
import { Card } from '../common/Card';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Verdict } from '@/types/call';

interface VerdictCardProps {
  verdict: Verdict;
  confidence: number;
}

export function VerdictCard({ verdict, confidence }: VerdictCardProps) {
  const config = {
    genuine: {
      icon: ShieldCheck,
      color: 'text-genuine',
      bg: 'bg-genuine-muted',
      borderColor: 'border-genuine/20',
      text: 'Genuine Audio',
      desc: 'No signs of voice cloning or deepfake detected.'
    },
    suspicious: {
      icon: Shield,
      color: 'text-suspicious',
      bg: 'bg-suspicious-muted',
      borderColor: 'border-suspicious/20',
      text: 'Suspicious Audio',
      desc: 'Minor anomalies detected. Further review recommended.'
    },
    cloned: {
      icon: ShieldAlert,
      color: 'text-cloned',
      bg: 'bg-cloned-muted',
      borderColor: 'border-cloned/20',
      text: 'Cloned Audio',
      desc: 'High probability of synthetic or AI-generated voice.'
    }
  };

  const style = config[verdict];
  const Icon = style.icon;

  return (
    <Card className={cn("flex flex-col items-center justify-center text-center p-8", style.bg, style.borderColor)}>
      <div className={cn("p-4 rounded-full bg-background/50 mb-4", style.color)}>
        <Icon size={48} />
      </div>
      
      <h2 className={cn("text-2xl font-bold mb-2", style.color)}>
        {style.text}
      </h2>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-text-secondary">Confidence:</span>
        <span className="text-lg font-bold font-mono text-text-primary">
          {(confidence * 100).toFixed(1)}%
        </span>
      </div>
      
      <p className="text-sm text-text-secondary max-w-sm">
        {style.desc}
      </p>
    </Card>
  );
}
