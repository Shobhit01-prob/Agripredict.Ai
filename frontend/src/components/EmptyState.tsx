import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There is currently no data matching your criteria or the dataset is empty.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300/80 bg-stone-50/50 p-10 text-center transition-colors dark:border-stone-800 dark:bg-stone-900/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-walnut dark:text-cream">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-stone-600 dark:text-stone-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-warm-white shadow-xs transition-colors hover:bg-sage-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
