import { createContext, useContext, useMemo, useState } from 'react';
import labelsPtBr from '../locales/pt-BR.json';
import labelsEnUs from '../locales/en-US.json';
import labelsEsEs from '../locales/es-ES.json';

type Labels = typeof labelsPtBr;
export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

interface LabelsContextType {
  labels: Labels;
  language: LanguageCode;
  availableLanguages: LanguageCode[];
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, defaultValue?: string) => string;
  tf: (key: string, values: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'schemusic_language';
const FALLBACK_LANGUAGE: LanguageCode = 'pt-BR';
const AVAILABLE_LANGUAGES: LanguageCode[] = ['pt-BR', 'en-US', 'es-ES'];

const localeByLanguage: Record<LanguageCode, Labels> = {
  'pt-BR': labelsPtBr,
  'en-US': labelsEnUs,
  'es-ES': labelsEsEs,
};

const LabelsContext = createContext<LabelsContextType | undefined>(undefined);

const getStoredLanguage = (): LanguageCode => {
  const storedLanguage = localStorage.getItem(STORAGE_KEY);
  if (!storedLanguage) {
    return FALLBACK_LANGUAGE;
  }

  return AVAILABLE_LANGUAGES.includes(storedLanguage as LanguageCode)
    ? (storedLanguage as LanguageCode)
    : FALLBACK_LANGUAGE;
};

const getNestedValue = (source: unknown, key: string): string | undefined => {
  const keys = key.split('.');
  let value: any = source;

  for (const currentKey of keys) {
    value = value?.[currentKey];
  }

  return typeof value === 'string' ? value : undefined;
};

export const LabelsProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>(getStoredLanguage);

  const changeLanguage = (newLanguage: LanguageCode) => {
    if (!AVAILABLE_LANGUAGES.includes(newLanguage)) {
      return;
    }

    setLanguage(newLanguage);
    localStorage.setItem(STORAGE_KEY, newLanguage);
  };

  const contextValue = useMemo<LabelsContextType>(() => {
    const currentLabels = localeByLanguage[language] ?? localeByLanguage[FALLBACK_LANGUAGE];

    return {
      labels: currentLabels,
      language,
      availableLanguages: AVAILABLE_LANGUAGES,
      setLanguage: changeLanguage,
      t: (key: string, defaultValue = key) => {
        const translatedValue = getNestedValue(currentLabels, key);
        if (translatedValue) {
          return translatedValue;
        }

        const fallbackValue = getNestedValue(localeByLanguage[FALLBACK_LANGUAGE], key);
        return fallbackValue ?? defaultValue;
      },
      tf: (key: string, values: Record<string, string | number>) => {
        const translatedValue = getNestedValue(currentLabels, key)
          ?? getNestedValue(localeByLanguage[FALLBACK_LANGUAGE], key)
          ?? key;

        return Object.entries(values).reduce(
          (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
          translatedValue,
        );
      },
    };
  }, [language]);

  return (
    <LabelsContext.Provider value={contextValue}>
      {children}
    </LabelsContext.Provider>
  );
};

export const useLabels = () => {
  const context = useContext(LabelsContext);
  if (!context) {
    throw new Error('useLabels must be used within LabelsProvider');
  }
  return context;
};
