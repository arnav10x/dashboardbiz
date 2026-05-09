"use client"
import * as React from 'react';

const STORAGE_KEY = 'accent-color';
const DEFAULT_ACCENT = '#10b981';

interface AccentContextValue {
  accent: string;
  setAccent: (color: string) => void;
}

const AccentContext = React.createContext<AccentContextValue>({
  accent: DEFAULT_ACCENT,
  setAccent: () => {},
});

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = React.useState(DEFAULT_ACCENT);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) applyAccent(stored);
  }, []);

  function applyAccent(color: string) {
    setAccentState(color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-muted', `rgba(${r},${g},${b},0.15)`);
    document.documentElement.style.setProperty('--accent-border', `rgba(${r},${g},${b},0.3)`);
  }

  function setAccent(color: string) {
    localStorage.setItem(STORAGE_KEY, color);
    applyAccent(color);
  }

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  return React.useContext(AccentContext);
}
