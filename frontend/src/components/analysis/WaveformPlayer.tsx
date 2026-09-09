'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Play, Pause, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaveformPlayerProps {
  audioUrl: string;
  suspiciousRegions?: { start: number; end: number }[];
}

export function WaveformPlayer({ audioUrl, suspiciousRegions = [] }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'var(--text-secondary)',
      progressColor: 'var(--info)',
      cursorColor: 'var(--foreground)',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
      normalize: true,
    });

    wavesurfer.current.load(audioUrl);

    wavesurfer.current.on('ready', () => {
      setDuration(wavesurfer.current?.getDuration() || 0);
      
      // Draw suspicious regions if any
      // For this simple version, we don't have regions plugin installed, 
      // but in a full implementation we'd use wavesurfer regions plugin.
    });

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
    });

    wavesurfer.current.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(wavesurfer.current.isPlaying());
    }
  };

  const stopAndReset = () => {
    if (wavesurfer.current) {
      wavesurfer.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const toggleMute = () => {
    if (wavesurfer.current) {
      const currentlyMuted = wavesurfer.current.getMuted();
      wavesurfer.current.setMuted(!currentlyMuted);
      setIsMuted(!currentlyMuted);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Audio Playback</h3>
        <div className="text-xs font-mono text-text-secondary">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="relative w-full bg-surface-hover/50 rounded-md p-4">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={stopAndReset} aria-label="Stop">
            <SkipBack size={16} />
          </Button>
          <Button variant="primary" size="sm" onClick={togglePlay} className="w-24">
            {isPlaying ? (
              <><Pause size={16} className="mr-2" /> Pause</>
            ) : (
              <><Play size={16} className="mr-2" /> Play</>
            )}
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" onClick={toggleMute} aria-label="Mute/Unmute">
          {isMuted ? <VolumeX size={18} className="text-cloned" /> : <Volume2 size={18} />}
        </Button>
      </div>
    </Card>
  );
}
