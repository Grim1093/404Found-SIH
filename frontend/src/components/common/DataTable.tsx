import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
  };
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No results found",
  pagination,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="bg-surface border border-border rounded-md overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider border-b border-border bg-surface-hover/50",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-secondary text-sm">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-secondary text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-surface-hover" : "hover:bg-surface-hover/50"
                  )}
                >
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={cn("px-4 py-3 text-sm text-text-primary whitespace-nowrap", col.className)}
                    >
                      {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-text-muted">
            {pagination.totalItems !== undefined && (
              <span>Total: {pagination.totalItems} items</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || isLoading}
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-sm text-text-secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || isLoading}
            >
              <ChevronRight size={16} />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
