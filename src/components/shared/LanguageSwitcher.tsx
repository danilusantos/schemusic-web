import { useEffect, useRef, useState } from 'react';
import { useLabels } from '../../context/LabelsContext';
import type { LanguageCode } from '../../context/LabelsContext';
import { ChevronDownIcon } from '../../icons';

interface LanguageSwitcherProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => Promise<void> | void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const LanguageSwitcher = ({ value, onChange, isOpen, onOpenChange, className }: LanguageSwitcherProps) => {
  const { t } = useLabels();
  const [isUpdating, setIsUpdating] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuOpen = isOpen ?? internalOpen;
  const setMenuOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const options: Array<{ value: LanguageCode; label: string; flag: string }> = [
    { value: 'pt-BR', label: t('layout.language_pt'), flag: '🇧🇷' },
    { value: 'en-US', label: t('layout.language_en'), flag: '🇺🇸' },
    { value: 'es-ES', label: t('layout.language_es'), flag: '🇪🇸' },
  ];

  const currentOption = options.find((option) => option.value === value) ?? options[0];

  const handleChange = async (nextLanguage: LanguageCode) => {
    setIsUpdating(true);

    try {
      await onChange(nextLanguage);
      setMenuOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div ref={containerRef} className={className ?? 'relative inline-flex'}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={isUpdating}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-base leading-none shadow-sm">
          {currentOption.flag}
        </span>
        <span className="hidden sm:inline">{currentOption.label}</span>
        <span className="sm:hidden">{currentOption.label.slice(0, 2).toUpperCase()}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 bg-white p-2 shadow-lg sm:w-56">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {t('layout.language_label')}
          </p>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                option.value === value ? 'bg-burnt/10 text-burnt-dark' : 'text-gray-700 hover:bg-gray-100',
              ].join(' ')}
              onClick={() => {
                void handleChange(option.value);
              }}
              disabled={isUpdating}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-lg leading-none shadow-sm ring-1 ring-gray-100">
                {option.flag}
              </span>
              <span className="font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
