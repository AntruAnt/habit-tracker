import { StyleSheet, View, type ViewProps } from 'react-native';

import { Shape } from '@/constants/app-theme';
import { useAppTheme } from '@/hooks/use-app-theme';

/** Solid surface card, one tone above the screen background. */
export function Card({ style, ...rest }: ViewProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder, boxShadow: theme.cardShadow },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Shape.largeIncreased,
    // iOS-style squircle corners; ignored on other platforms.
    borderCurve: 'continuous',
    borderWidth: 1,
  },
});
