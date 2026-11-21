import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/logo';
import { Typography } from '@/constants/app-theme';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type BrandLockupProps = {
  /** Show the "Psycho-Cybernetics" line under the name. Hide it where space is tight. */
  showTagline?: boolean;
};

/** Logo with the app name, read by screen readers as one element. */
export function BrandLockup({ showTagline = true }: BrandLockupProps) {
  const theme = useAppTheme();

  return (
    <View
      accessible
      accessibilityLabel={showTagline ? 'Habit Tracker, Psycho-Cybernetics' : 'Habit Tracker'}
      style={styles.lockup}>
      <Logo size={showTagline ? 40 : 32} />
      <View>
        <Text style={[styles.name, { color: theme.textHigh }]}>Habit Tracker</Text>
        {showTagline && (
          <Text style={[styles.tagline, { color: theme.textMedium }]}>Psycho-Cybernetics</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
  },
  name: {
    ...Typography.headline,
  },
  tagline: {
    ...Typography.caption,
    // Small all-caps text needs extra tracking to stay legible.
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
