import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#111111',
      bgCard: '#161616',
      border: '#2a2a2a',
      textPrimary: '#f5f5f5',
      textSecondary: '#a1a1aa',
      textMuted: '#6b6b6b',
      accentSoft: '#1e1a3a',
      navBg: 'rgba(10,10,10,0.97)',
      inputBg: '#1e1e1e',
      storyBg: '#1e1e1e',
      shadow: '0 2px 12px rgba(0,0,0,0.5)',
      postBg: '#0f0f1a',
    } : {
      bgPrimary: '#fafafa',
      bgSecondary: '#ffffff',
      bgCard: '#ffffff',
      border: '#e5e7eb',
      textPrimary: '#0a0a0a',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      accentSoft: '#f0efff',
      navBg: 'rgba(255,255,255,0.97)',
      inputBg: '#f9fafb',
      storyBg: '#f3f4f6',
      shadow: '0 2px 12px rgba(108,99,255,0.08)',
      postBg: '#f8f7ff',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}