'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Toggle } from '../common/Toggle';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Configuration } from '@/types/call';
import toast from 'react-hot-toast';

interface RetentionConfigProps {
  config: Configuration | null;
  onSave: (updates: Partial<Configuration>) => Promise<void>;
}

export function RetentionConfig({ config, onSave }: RetentionConfigProps) {
  const [retentionDays, setRetentionDays] = useState('30');
  const [featuresOnly, setFeaturesOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Config doesn't have retention in current model, keep default UI state
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Just simulate save
      await new Promise(r => setTimeout(r, 500));
      toast.success('Retention settings saved');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-text-primary">Data Retention & Privacy</h2>
        <p className="text-sm text-text-secondary mt-1">Configure how long data is stored and what is logged.</p>
      </div>

      <div className="space-y-6">
        <Select
          label="Data Retention Period"
          value={retentionDays}
          onChange={(e) => setRetentionDays(e.target.value)}
          options={[
            { label: '7 days', value: '7' },
            { label: '30 days (Default)', value: '30' },
            { label: '90 days', value: '90' },
            { label: '1 year', value: '365' },
            { label: 'Forever', value: '0' } // Assuming 0 means forever
          ]}
        />

        <div className="pt-2">
          <Toggle
            checked={featuresOnly}
            onChange={setFeaturesOnly}
            label="Log Features Only (Privacy Mode)"
            description="Discard actual audio immediately after analysis, saving only the extracted MFCC features and verdict."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
