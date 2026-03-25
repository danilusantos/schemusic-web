import { useEffect, useRef, useState } from 'react';
import CountryFlag from 'react-country-flag';
import { useLabels } from '../../context/LabelsContext';
import type { LanguageCode } from '../../context/LabelsContext';

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

  const options: Array<{ value: LanguageCode; label: string; countryCode: string }> = [
    { value: 'pt-BR', label: t('layout.language_pt'), countryCode: 'BR' },
    { value: 'en-US', label: t('layout.language_en'), countryCode: 'US' },
    { value: 'es-ES', label: t('layout.language_es'), countryCode: 'ES' },
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-burnt/30 hover:bg-warm-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={currentOption.label}
        title={currentOption.label}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center">
          <CountryFlag
            countryCode={currentOption.countryCode}
            svg
            style={{ width: '1.3rem', height: '1.3rem' }}
            title={currentOption.label}
          />
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 max-w-[calc(100vw-1rem)] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl sm:w-56">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {t('layout.language_label')}
          </p>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={[
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                option.value === value ? 'bg-burnt/10 text-burnt-dark' : 'text-gray-700 hover:bg-gray-100',
              ].join(' ')}
              onClick={() => {
                void handleChange(option.value);
              }}
              disabled={isUpdating}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-lg leading-none shadow-sm ring-1 ring-gray-100">
                <CountryFlag
                  countryCode={option.countryCode}
                  svg
                  style={{ width: '1.15rem', height: '1.15rem' }}
                  title={option.label}
                />
              </span>
              <span className="font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
