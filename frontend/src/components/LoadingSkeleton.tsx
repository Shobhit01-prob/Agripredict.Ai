import React from 'react';

export const CardSkeleton: React.FC<{ height?: string; className?: string }> = ({ 
  height = 'h-48', 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse rounded-2xl bg-stone-200/70 p-6 dark:bg-stone-800/60 ${height} ${className}`}>
      <div className="h-5 w-1/3 rounded-md bg-stone-300/80 dark:bg-stone-700/80" />
      <div className="mt-4 h-4 w-2/3 rounded-md bg-stone-300/60 dark:bg-stone-700/60" />
      <div className="mt-6 flex gap-3">
        <div className="h-8 w-24 rounded-lg bg-stone-300/60 dark:bg-stone-700/60" />
        <div className="h-8 w-20 rounded-lg bg-stone-300/60 dark:bg-stone-700/60" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-72' }) => {
  return (
    <div className={`animate-pulse rounded-2xl border border-stone-200/80 bg-warm-white p-6 dark:border-stone-800 dark:bg-walnut-dark ${height}`}>
      <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
        <div className="h-5 w-44 rounded-md bg-stone-200 dark:bg-stone-800" />
        <div className="h-4 w-24 rounded-md bg-stone-200 dark:bg-stone-800" />
      </div>
      <div className="mt-6 flex h-44 items-end gap-3 px-2">
        <div className="h-28 w-full rounded-t-md bg-stone-200/70 dark:bg-stone-800/70" />
        <div className="h-36 w-full rounded-t-md bg-stone-200/70 dark:bg-stone-800/70" />
        <div className="h-20 w-full rounded-t-md bg-stone-200/70 dark:bg-stone-800/70" />
        <div className="h-40 w-full rounded-t-md bg-stone-200/70 dark:bg-stone-800/70" />
        <div className="h-32 w-full rounded-t-md bg-stone-200/70 dark:bg-stone-800/70" />
        <div className="h-48 w-full rounded-t-md bg-stone-200/70 dark:bg-stone-800/70" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 rounded-xl bg-stone-200/80 dark:bg-stone-800/80" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-stone-200/50 dark:bg-stone-800/50" />
      ))}
    </div>
  );
};
