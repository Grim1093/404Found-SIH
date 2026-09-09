'use client';

import React, { useState } from 'react';
import { Card } from '../common/Card';
import { DataTable } from '../common/DataTable';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { ApiKey } from '@/stores/settingsStore';
import { format } from 'date-fns';
import { Copy, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyManagerProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  onCreateKey: (name: string) => Promise<string | null>;
  onRevokeKey: (id: string) => Promise<void>;
}

export function ApiKeyManager({ apiKeys, isLoading, onCreateKey, onRevokeKey }: ApiKeyManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required');
      return;
    }
    
    setIsCreating(true);
    try {
      const key = await onCreateKey(newKeyName);
      if (key) {
        setRawKey(key);
      }
    } catch (err) {
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setNewKeyName('');
    setRawKey(null);
  };

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as keyof ApiKey,
      className: 'font-medium'
    },
    {
      header: 'Prefix',
      cell: (item: ApiKey) => <span className="font-mono">{item.key_prefix}...</span>
    },
    {
      header: 'Created',
      cell: (item: ApiKey) => format(new Date(item.created_at), 'MMM d, yyyy')
    },
    {
      header: 'Last Used',
      cell: (item: ApiKey) => item.last_used_at ? format(new Date(item.last_used_at), 'MMM d, yyyy') : 'Never'
    },
    {
      header: '',
      cell: (item: ApiKey) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-text-muted hover:text-cloned hover:bg-cloned/10"
            onClick={() => onRevokeKey(item.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-text-primary">API Keys</h2>
          <p className="text-sm text-text-secondary mt-1">Manage API keys for programmatic access.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Generate Key
        </Button>
      </div>

      <DataTable
        data={apiKeys}
        columns={columns}
        keyExtractor={(k) => k.id}
        isLoading={isLoading}
        emptyMessage="No API keys found. Generate one to get started."
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        title={rawKey ? "API Key Generated" : "Generate New API Key"}
        maxWidth="md"
        footer={
          rawKey ? (
            <Button onClick={closeModal}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Generating...' : 'Generate'}
              </Button>
            </>
          )
        }
      >
        {rawKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-info-muted/30 border border-info/20 rounded-lg">
              <p className="text-sm text-text-primary mb-2">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Your Secret Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={rawKey}
                  className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring"
                />
                <Button variant="secondary" onClick={() => copyToClipboard(rawKey)}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Key Name"
              placeholder="e.g. Production CI/CD"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </Modal>
    </Card>
  );
}
