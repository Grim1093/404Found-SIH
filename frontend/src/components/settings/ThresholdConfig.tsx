'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Slider } from '../common/Slider';
import { Button } from '../common/Button';
import { Configuration } from '@/types/call';

interface ThresholdConfigProps {
  config: Configuration | null;
  onSave: (updates: Partial<Configuration>) => Promise<void>;
}

export function ThresholdConfig({ config, onSave }: ThresholdConfigProps) {
  const [thresholds, setThresholds] = useState({
    suspicious: 25,
    cloned: 50,
    critical: 75,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setThresholds({
        suspicious: config.threshold_medium || 25,
        cloned: config.threshold_high || 50,
        critical: config.threshold_critical || 75,
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        threshold_medium: thresholds.suspicious,
        threshold_high: thresholds.cloned,
        threshold_critical: thresholds.critical,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-text-primary">Risk Thresholds</h2>
        <p className="text-sm text-text-secondary mt-1">Configure severity boundaries based on risk scores (0-100).</p>
      </div>

      <div className="space-y-6">
        <div className="w-full h-4 rounded-full overflow-hidden flex" title="Spectrum preview">
          <div style={{ width: `${thresholds.suspicious}%` }} className="h-full bg-genuine"></div>
          <div style={{ width: `${thresholds.cloned - thresholds.suspicious}%` }} className="h-full bg-suspicious"></div>
          <div style={{ width: `${thresholds.critical - thresholds.cloned}%` }} className="h-full bg-cloned"></div>
          <div style={{ width: `${100 - thresholds.critical}%` }} className="h-full bg-critical"></div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <Slider
            label="Suspicious Threshold"
            value={thresholds.suspicious}
            onChange={(v) => setThresholds(prev => ({ ...prev, suspicious: Math.min(v, prev.cloned - 1) }))}
          />
          <Slider
            label="Cloned Threshold"
            value={thresholds.cloned}
            onChange={(v) => setThresholds(prev => ({ ...prev, cloned: Math.min(Math.max(v, prev.suspicious + 1), prev.critical - 1) }))}
          />
          <Slider
            label="Critical Threshold"
            value={thresholds.critical}
            onChange={(v) => setThresholds(prev => ({ ...prev, critical: Math.max(v, prev.cloned + 1) }))}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
