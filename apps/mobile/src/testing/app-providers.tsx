import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ColorSchemeProvider } from '@/hooks/use-color-scheme';

/** iPhone 15-sized safe-area metrics, so screens can lay out without native code. */
const metrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

/** The app-level providers a screen expects, as an RNTL `wrapper`. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <ColorSchemeProvider>{children}</ColorSchemeProvider>
    </SafeAreaProvider>
  );
}
