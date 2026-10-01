import React, { useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDangerous = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${
              isDangerous ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            <FiAlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 id="modal-title" className="text-lg font-semibold text-slate-100">
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl transition border border-slate-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition disabled:opacity-50 flex items-center gap-2 ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/30'
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
