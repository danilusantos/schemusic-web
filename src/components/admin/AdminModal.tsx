import type { ReactNode } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  isLoading?: boolean;
  error?: string;
}

export const AdminModal = ({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  isLoading = false,
  error,
}: AdminModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <button
        type="button"
        aria-label="Fechar modal"
        className="fixed inset-0 z-0 bg-slate-900/45"
        onClick={onClose}
        disabled={isLoading}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-theme-md">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-warm-900">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-warm-600">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-warm-100 text-warm-700 transition hover:bg-warm-200 disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            <p>{error}</p>
          </div>
        )}

        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          {children}
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-white/55 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-warm-300 border-t-burnt" />
              <p className="text-sm font-semibold text-warm-700">Processando...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
