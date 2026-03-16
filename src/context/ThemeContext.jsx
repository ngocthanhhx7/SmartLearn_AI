import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Kokonut UI Design System ─── //
// Translated faithfully from Kokonut's Zinc-based palette
const THEMES = {
  dark: {
    background: '#09090B',       // zinc-950
    surface: '#18181B',          // zinc-900
    surfaceAlt: '#27272A',       // zinc-800
    border: '#3F3F46',           // zinc-700
    borderLight: '#27272A',      // zinc-800
    text: '#FAFAFA',             // zinc-50
    textSecondary: '#A1A1AA',    // zinc-400
    textMuted: '#71717A',        // zinc-500
    primary: '#6C63FF',          // brand purple
    primaryLight: '#6C63FF20',
    accent: '#2ED573',
    accentLight: '#2ED57322',
    destructive: '#EF4444',
    destructiveLight: '#EF444422',
    warning: '#F59E0B',
    card: '#18181B',
    shadow: 'rgba(0,0,0,0.5)',
    isDark: true,
  },
  light: {
    background: '#FAFAFA',       // zinc-50
    surface: '#FFFFFF',          // white
    surfaceAlt: '#F4F4F5',       // zinc-100
    border: '#E4E4E7',           // zinc-200
    borderLight: '#E4E4E7',      // zinc-200
    text: '#09090B',             // zinc-950
    textSecondary: '#52525B',    // zinc-600
    textMuted: '#A1A1AA',        // zinc-400
    primary: '#5B53F5',          // brand purple darkened for contrast
    primaryLight: '#5B53F520',
    accent: '#16A34A',           // darker green for readability
    accentLight: '#16A34A22',
    destructive: '#DC2626',
    destructiveLight: '#DC262622',
    warning: '#D97706',
    card: '#FFFFFF',
    shadow: 'rgba(0,0,0,0.08)',
    isDark: false,
  },
};

const ThemeContext = createContext({
  theme: THEMES.dark,
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((saved) => {
      if (saved === 'light') setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem('app_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const theme = isDark ? THEMES.dark : THEMES.light;
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
