'use client';

import React, { useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThresholdConfig } from '@/components/settings/ThresholdConfig';
import { NotificationConfig } from '@/components/settings/NotificationConfig';
import { ApiKeyManager } from '@/components/settings/ApiKeyManager';
import { RetentionConfig } from '@/components/settings/RetentionConfig';
import { useSettingsStore } from '@/stores/settingsStore';

export default function SettingsPage() {
  const { 
    config, 
    apiKeys, 
    isLoading, 
    fetchSettings, 
    updateSettings, 
    fetchApiKeys, 
    createApiKey, 
    revokeApiKey 
  } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
    fetchApiKeys();
  }, [fetchSettings, fetchApiKeys]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <PageHeader 
        title="Settings" 
        description="Configure system parameters, thresholds, and integrations."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <ThresholdConfig config={config} onSave={updateSettings} />
        <NotificationConfig config={config} onSave={updateSettings} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="xl:col-span-1">
          <RetentionConfig config={config} onSave={updateSettings} />
        </div>
        <div className="xl:col-span-1">
          <ApiKeyManager 
            apiKeys={apiKeys} 
            isLoading={isLoading} 
            onCreateKey={createApiKey} 
            onRevokeKey={revokeApiKey} 
          />
        </div>
      </div>
    </div>
  );
}
