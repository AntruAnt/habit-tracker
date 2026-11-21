/**
 * App design tokens: Flat UI palette colors on solid surfaces (elevation is shown by a lighter
 * tone), a platform-native type scale, and shape values.
 */

import { Platform } from 'react-native';

export const FlatUI = {
  turquoise: '#1abc9c',
  greenSea: '#16a085',
  emerald: '#2ecc71',
  peterRiver: '#3498db',
  amethyst: '#9b59b6',
  sunFlower: '#f1c40f',
  carrot: '#e67e22',
  alizarin: '#e74c3c',
  clouds: '#ecf0f1',
  midnightBlue: '#2c3e50',
} as const;

/** Tints and shades of Flat UI Midnight Blue (500 is the base color). */
export const MidnightBlue = {
  50: '#eaecee',
  100: '#d5d8dc',
  200: '#abb2b9',
  300: '#808b96',
  400: '#566573',
  500: '#2c3e50',
  600: '#273746',
  700: '#212f3d',
  800: '#1c2833',
  900: '#17202a',
} as const;

/** Converts a `#rrggbb` color to `rgba()` with the given alpha. */
export function withAlpha(hex: string, alpha: number) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

export const AppThemes = {
  dark: {
    background: MidnightBlue[900],
    /** Cards sit one tone above the background. */
    card: MidnightBlue[600],
    cardBorder: MidnightBlue[500],
    cardShadow: '0px 1px 2px rgba(0, 0, 0, 0.24)',
    cardText: '#ffffff',
    textHigh: '#ffffff',
    textMedium: MidnightBlue[100],
    accent: FlatUI.turquoise,
  },
  light: {
    background: FlatUI.clouds,
    card: '#ffffff',
    cardBorder: MidnightBlue[100],
    cardShadow: `0px 1px 3px ${withAlpha(MidnightBlue[500], 0.1)}`,
    cardText: MidnightBlue[900],
    textHigh: MidnightBlue[900],
    textMedium: MidnightBlue[500],
    /** Darker Green Sea shade so small accent text meets WCAG AA on the light background. */
    accent: '#117a65',
  },
};

/**
 * Text styles by role. iOS and web use Apple's Dynamic Type sizes (at the default text size)
 * with no added letter spacing, since SF Pro and browser system fonts handle their own
 * tracking. Android uses the Material 3 type scale, which is tuned for Roboto. Fonts still
 * scale with the user's text-size setting.
 */
export const Typography = Platform.select({
  // Material 3 displaySmall, headlineMedium, titleLarge, a 20 pt step between titleLarge and
  // titleMedium, then titleMedium, bodyLarge, bodyMedium, labelSmall. Headings are heavier.
  android: {
    largeTitle: { fontSize: 36, lineHeight: 44, fontWeight: 600 },
    title1: { fontSize: 28, lineHeight: 36, fontWeight: 600 },
    title2: { fontSize: 22, lineHeight: 28, fontWeight: 600 },
    title3: { fontSize: 20, lineHeight: 28, fontWeight: 500 },
    headline: { fontSize: 16, lineHeight: 24, fontWeight: 600, letterSpacing: 0.15 },
    body: { fontSize: 16, lineHeight: 24, fontWeight: 400, letterSpacing: 0.5 },
    subheadline: { fontSize: 14, lineHeight: 20, fontWeight: 400, letterSpacing: 0.25 },
    caption: { fontSize: 11, lineHeight: 16, fontWeight: 500, letterSpacing: 0.5 },
  } as const,
  default: {
    largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: 700 },
    title1: { fontSize: 28, lineHeight: 34, fontWeight: 700 },
    title2: { fontSize: 22, lineHeight: 28, fontWeight: 700 },
    title3: { fontSize: 20, lineHeight: 25, fontWeight: 600 },
    headline: { fontSize: 17, lineHeight: 22, fontWeight: 600 },
    body: { fontSize: 17, lineHeight: 22, fontWeight: 400 },
    subheadline: { fontSize: 15, lineHeight: 20, fontWeight: 400 },
    caption: { fontSize: 11, lineHeight: 13, fontWeight: 500 },
  } as const,
});

export const Shape = {
  medium: 12,
  large: 16,
  largeIncreased: 20,
  full: 9999,
} as const;
