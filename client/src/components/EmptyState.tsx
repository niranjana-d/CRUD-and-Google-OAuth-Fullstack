import React from 'react';
import { FiInbox } from 'react-icons/fi';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-dashed border-slate-700/60 my-6">
      <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
        {icon || <FiInbox className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/25"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
