import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import AppTabs from '@/components/app-tabs';
import { SplashOverlay } from '@/components/splash-overlay';
import { ColorSchemeProvider, useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ColorSchemeProvider>
      <ThemedTabs />
    </ColorSchemeProvider>
  );
}

function ThemedTabs() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
