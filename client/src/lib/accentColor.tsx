import { createContext, useContext, useEffect } from 'react';
import { usePublicData } from '../hooks/useApi';
import { DEFAULT_ACCENT, DEFAULT_ACCENT_LIGHT, lightenColor } from './color';

interface AccentColorContextValue {
  accent: string;
  accentLight: string;
}

const AccentColorContext = createContext<AccentColorContextValue>({
  accent: DEFAULT_ACCENT,
  accentLight: DEFAULT_ACCENT_LIGHT,
});

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = usePublicData<Record<string, string>>('settings', '/settings');

  const accent = settings?.accentColor || DEFAULT_ACCENT;
  const accentLight = lightenColor(accent);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', accent);
    document.documentElement.style.setProperty('--color-accent-light', accentLight);
  }, [accent, accentLight]);

  return (
    <AccentColorContext.Provider value={{ accent, accentLight }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  return useContext(AccentColorContext);
}
