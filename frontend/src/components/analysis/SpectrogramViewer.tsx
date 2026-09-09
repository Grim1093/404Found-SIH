import React from 'react';
import { Card } from '../common/Card';
import Image from 'next/image';

interface SpectrogramViewerProps {
  imageUrl?: string | null;
}

export function SpectrogramViewer({ imageUrl }: SpectrogramViewerProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-primary">Spectrogram Analysis</h3>
        <span className="text-xs text-text-muted">Mel-frequency cepstral coefficients</span>
      </div>
      
      <div className="flex-1 bg-surface-elevated border border-border rounded-md overflow-hidden relative min-h-[200px] flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Audio Spectrogram"
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <p className="text-sm text-text-secondary">Spectrogram rendering not available</p>
            <p className="text-xs text-text-muted mt-1">Image data was not returned by the ML service.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
