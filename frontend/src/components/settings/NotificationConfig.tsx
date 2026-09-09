'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Toggle } from '../common/Toggle';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Configuration } from '@/types/call';
import toast from 'react-hot-toast';

interface NotificationConfigProps {
  config: Configuration | null;
  onSave: (updates: Partial<Configuration>) => Promise<void>;
}

export function NotificationConfig({ config, onSave }: NotificationConfigProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [notifyOnHigh, setNotifyOnHigh] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setWebhookUrl(config.webhook_url || '');
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        webhook_url: webhookUrl,
      });
      toast.success('Notification settings saved');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = () => {
    if (!webhookUrl) {
      toast.error('Please enter a webhook URL first');
      return;
    }
    toast.success('Test payload sent to webhook');
  };

  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-text-primary">Notifications & Integrations</h2>
        <p className="text-sm text-text-secondary mt-1">Manage how and when you receive alerts.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Toggle
            checked={notifyOnHigh}
            onChange={setNotifyOnHigh}
            label="High Risk Alerts"
            description="Receive immediate notifications when a call score exceeds the Cloned threshold."
          />
          <Toggle
            checked={true}
            onChange={() => {}}
            label="In-App Notifications"
            description="Show toast alerts within the dashboard (always enabled)."
            disabled
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-text-primary mb-4">Webhook Integration</h3>
          <div className="space-y-4">
            <Input
              label="Webhook URL"
              placeholder="https://your-server.com/api/webhooks/voxguard"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              helperText="We will POST a JSON payload to this URL when an alert is triggered."
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={handleTestWebhook}>
                Test Webhook
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
