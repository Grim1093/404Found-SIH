import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import type { Call } from '@/types/call';
import { format } from 'date-fns';

interface CallMetadataProps {
  call: Call;
}

export function CallMetadata({ call }: CallMetadataProps) {
  // Try to extract language or other info from metadata JSON
  let metadataObj: any = {};
  try {
    if (typeof call.metadata === 'string') {
      metadataObj = JSON.parse(call.metadata);
    } else if (call.metadata) {
      metadataObj = call.metadata;
    }
  } catch (e) {
    // Ignore parse errors
  }

  const language = metadataObj.language || 'English (US)';
  const location = metadataObj.location || 'Unknown';

  const formatDuration = (seconds: number | null) => {
    if (seconds == null) return 'Live / Unknown';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-text-primary">Call Metadata</h3>
        <Badge variant="info">{call.status}</Badge>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-text-muted mb-1">Caller ID / Name</p>
          <p className="text-sm font-medium text-text-primary">
            {call.caller_id || 'Unknown'} {call.caller_name ? `(${call.caller_name})` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Duration</p>
            <p className="text-sm font-medium text-text-primary">
              {formatDuration(call.duration_seconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Language</p>
            <p className="text-sm font-medium text-text-primary">{language}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Started At</p>
            <p className="text-sm font-medium text-text-primary">
              {format(new Date(call.created_at), 'MMM d, yyyy HH:mm:ss')}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Completed At</p>
            <p className="text-sm font-medium text-text-primary">
              {call.completed_at ? format(new Date(call.completed_at), 'HH:mm:ss') : 'Ongoing'}
            </p>
          </div>
        </div>

        {location !== 'Unknown' && (
          <div>
            <p className="text-xs text-text-muted mb-1">Origin Location</p>
            <p className="text-sm font-medium text-text-primary">{location}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
