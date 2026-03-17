import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEMES = {
  light: {
    background: '#F5F5F8',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F0F4',
    border: '#E8E8EE',
    borderLight: '#F0F0F4',
    text: '#1A1A2E',
    textSecondary: '#5A5A72',
    textMuted: '#9A9AB0',
    primary: '#F26B3A',
    primaryLight: '#F26B3A18',
    primaryDark: '#E85D2C',
    accent: '#4A6BF5',
    accentLight: '#4A6BF518',
    destructive: '#EF4444',
    destructiveLight: '#EF444418',
    warning: '#F59E0B',
    card: '#FFFFFF',
    shadow: 'rgba(0,0,0,0.06)',
    headerGradientStart: '#F26B3A',
    headerGradientEnd: '#E85D2C',
    cardGradientStart: '#F26B3A',
    cardGradientEnd: '#F7954A',
    chatUserBubble: '#F26B3A',
    chatAiBubble: '#F0F0F4',
    tabBarBg: '#FFFFFF',
    isDark: false,
  },
  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceAlt: '#25253A',
    border: '#2F2F45',
    borderLight: '#25253A',
    text: '#F5F5F8',
    textSecondary: '#A0A0B8',
    textMuted: '#6A6A82',
    primary: '#F26B3A',
    primaryLight: '#F26B3A22',
    primaryDark: '#E85D2C',
    accent: '#6C8AFF',
    accentLight: '#6C8AFF22',
    destructive: '#EF4444',
    destructiveLight: '#EF444422',
    warning: '#F59E0B',
    card: '#1A1A2E',
    shadow: 'rgba(0,0,0,0.4)',
    headerGradientStart: '#F26B3A',
    headerGradientEnd: '#D14E20',
    cardGradientStart: '#F26B3A',
    cardGradientEnd: '#D14E20',
    chatUserBubble: '#F26B3A',
    chatAiBubble: '#25253A',
    tabBarBg: '#1A1A2E',
    isDark: true,
  },
};

const ThemeContext = createContext({
  theme: THEMES.light,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((saved) => {
      if (saved === 'dark') setIsDark(true);
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
