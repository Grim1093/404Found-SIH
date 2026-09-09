import React from 'react';
import { Button } from '../common/Button';
import { CheckSquare } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onAcknowledgeAll: () => void;
  onResolveAll: () => void;
  onClearSelection: () => void;
}

export function BulkActions({ selectedCount, onAcknowledgeAll, onResolveAll, onClearSelection }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-text-inverse px-4 py-3 rounded-lg shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-10">
      <div className="flex items-center gap-2">
        <CheckSquare size={18} />
        <span className="font-medium">{selectedCount} selected</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onAcknowledgeAll} className="border-text-inverse/20 hover:bg-background/20">
          Acknowledge
        </Button>
        <Button variant="secondary" size="sm" onClick={onResolveAll} className="border-text-inverse/20 hover:bg-background/20">
          Resolve
        </Button>
        <div className="w-px h-4 bg-text-inverse/20 mx-2"></div>
        <button onClick={onClearSelection} className="text-sm hover:underline opacity-80 hover:opacity-100">
          Cancel
        </button>
      </div>
    </div>
  );
}
