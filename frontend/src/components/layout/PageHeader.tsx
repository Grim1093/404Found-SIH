import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary mt-1 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
