import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLockup } from '@/components/brand-lockup';
import { ThemeToggle } from '@/components/theme-toggle';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

/** Scroll distance over which the divider fades in. */
const DIVIDER_FADE_DISTANCE = 24;

type AppHeaderProps = {
  /** Scroll offset of the screen's content; the divider fades in as content scrolls underneath. */
  scrollY: SharedValue<number>;
};

/** Top app bar: brand on the left, actions on the right. Stays fixed while content scrolls. */
export function AppHeader({ scrollY }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const dividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.get(),
      [0, DIVIDER_FADE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + Spacing.two, backgroundColor: theme.background },
      ]}>
      <View style={styles.row}>
        <BrandLockup />
        <ThemeToggle />
      </View>
      <Animated.View
        style={[styles.divider, { backgroundColor: theme.cardBorder }, dividerStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    zIndex: 1,
  },
  row: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
});
