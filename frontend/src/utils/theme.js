import React from 'react';

const STORAGE_KEY = 'momentumTheme';

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export function useTheme() {
  const [theme, setTheme] = React.useState(() => {
    const stored = getStoredTheme();
    applyTheme(stored);
    return stored;
  });

  const toggle = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
