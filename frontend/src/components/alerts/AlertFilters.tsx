'use client';

import React from 'react';
import { SearchInput } from '../common/SearchInput';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Filter } from 'lucide-react';

interface AlertFiltersProps {
  filters: {
    status: string;
    severity: string;
    search: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function AlertFilters({ filters, onChange, onClear }: AlertFiltersProps) {
  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-end">
      <div className="w-full md:w-1/3">
        <SearchInput 
          placeholder="Search alerts..." 
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </div>
      
      <div className="w-full md:w-1/4">
        <Select 
          label="Status"
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          options={[
            { label: 'All Statuses', value: '' },
            { label: 'Open', value: 'open' },
            { label: 'Acknowledged', value: 'acknowledged' },
            { label: 'Resolved', value: 'resolved' }
          ]}
        />
      </div>

      <div className="w-full md:w-1/4">
        <Select 
          label="Severity"
          value={filters.severity}
          onChange={(e) => onChange('severity', e.target.value)}
          options={[
            { label: 'All Severities', value: '' },
            { label: 'Critical', value: 'critical' },
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' }
          ]}
        />
      </div>

      <div className="w-full md:w-auto shrink-0 flex gap-2">
        <Button variant="ghost" onClick={onClear} className="w-full md:w-auto">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
