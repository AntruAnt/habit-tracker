import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { Shape } from '@/constants/app-theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme, useToggleColorScheme } from '@/hooks/use-color-scheme';

/** Smallest comfortable touch target (Apple HIG). Smaller buttons get the difference as hit slop. */
const MIN_TOUCH_TARGET = 44;

type ThemeToggleProps = {
  size?: number;
};

/** Round button that switches between light and dark mode. Shows the mode it switches to. */
export function ThemeToggle({ size = MIN_TOUCH_TARGET }: ThemeToggleProps) {
  const colorScheme = useColorScheme();
  const toggleColorScheme = useToggleColorScheme();
  const theme = useAppTheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleColorScheme();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      hitSlop={Math.max(0, (MIN_TOUCH_TARGET - size) / 2)}
      onPress={handlePress}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card style={[styles.button, { width: size, height: size }]}>
        <SymbolView
          name={
            isDark
              ? { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' }
              : { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }
          }
          size={Math.round(size / 2)}
          tintColor={theme.cardText}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  button: {
    borderRadius: Shape.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
