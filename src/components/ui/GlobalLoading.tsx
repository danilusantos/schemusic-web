import { useEffect, useRef, useState } from 'react';
import { useUiLoadingStore } from '../../stores/uiLoadingStore';

const MIN_LOADING_MS = 1000;

export const GlobalLoading = () => {
  const isLoading = useUiLoadingStore((state) => state.isLoading);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (hideTimeoutRef.current) {
        globalThis.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (!shouldRender) {
        setShouldRender(true);
      }

      if (!isVisible) {
        setIsVisible(true);
        startedAtRef.current = Date.now();
      }
      return;
    }

    if (!shouldRender) {
      return;
    }

    const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

    hideTimeoutRef.current = globalThis.setTimeout(() => {
      setIsVisible(false);
      globalThis.setTimeout(() => {
        setShouldRender(false);
        startedAtRef.current = null;
      }, 220);
      hideTimeoutRef.current = null;
    }, remaining);

    return () => {
      if (hideTimeoutRef.current) {
        globalThis.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isLoading, isVisible, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
        isVisible ? 'bg-white/70 opacity-100' : 'pointer-events-none bg-white/0 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="inline-block h-20 w-20 animate-spin rounded-full border-8 border-warm-300 border-t-burnt" />
      </div>
    </div>
  );
};
