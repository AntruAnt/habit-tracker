import * as SystemUI from 'expo-system-ui';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

import { AppThemes } from '@/constants/app-theme';

export type ColorScheme = 'light' | 'dark';

type ColorSchemeContextValue = {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

/**
 * Holds the app's light/dark choice, which overrides the system setting. Defaults to dark.
 * The choice is not persisted yet, so the app starts in dark mode on every launch.
 */
export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');

  useEffect(() => {
    // Keep native UI (tab bar, alerts, keyboard) in step with the in-app choice.
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(colorScheme);
    }
    // The root view shows during launch (including in Expo Go) and behind screen transitions.
    void SystemUI.setBackgroundColorAsync(AppThemes[colorScheme].background);
  }, [colorScheme]);

  const toggleColorScheme = () =>
    setColorScheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeContext value={{ colorScheme, toggleColorScheme }}>{children}</ColorSchemeContext>
  );
}

function useColorSchemeContext() {
  const context = use(ColorSchemeContext);
  if (!context) {
    throw new Error('Color scheme hooks must be used inside <ColorSchemeProvider>.');
  }
  return context;
}

export function useColorScheme() {
  return useColorSchemeContext().colorScheme;
}

export function useToggleColorScheme() {
  return useColorSchemeContext().toggleColorScheme;
}
